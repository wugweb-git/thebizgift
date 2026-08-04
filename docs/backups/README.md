# Backup and Restore Architecture

## Status: no backup files present

The dated snapshots this directory used to hold (2026-07-12, created during
a buffer-corruption incident) were deleted on 2026-08-04 — restoring from
them today would have rolled live Airtable-synced data back several weeks.
The restore machinery below (`scripts/restore-kv-cache.js` etc.) is kept
intentionally and fails gracefully with a "Missing backup" warning per table
when no file is present at the paths in `BACKUP_FILES`. To make it usable
again, generate a fresh self-describing backup per table (see "Migration
Process" below, or extend `api/cron/refresh-cache.js` to write one) and
drop it at the corresponding path.

## Overview

The Buffer layer (Redis + Vercel Blob) is the **only** data source for the frontend. Airtable is the authoritative CMS but is never queried directly by frontend API routes.

This document describes the backup, restore, and migration pipeline that keeps the Buffer layer resilient and independent of Airtable.

## Canonical Schema

There is exactly **one** canonical schema. Everything entering Redis must be converted into it.

### Canonical Record Shape

```json
{
  "id": "recXXXXXXXX",
  "fields": {
    "Human Readable Name": "value",
    "Product Images": [{ "id": "...", "url": "...", "filename": "..." }]
  }
}
```

### Canonical Field Definitions

Defined in `scripts/lib/canonicalSchema.js`:

| Table | Required Fields | Key Optional Fields |
|-------|----------------|-------------------|
| Products | `website URL Slug`, `Product Website Name`, `Product Images` | `SEO Title`, `MOQ`, `Material`, `Branding Option`, `Category Name (from Category)`, etc. |
| Category | `Name`, `Slug` | `Description`, `Image`, `Published`, `Order` |
| Occasions | `Name`, `Slug` | `Description`, `Hero Image`, `Published`, `Order` |
| Collections | `Name`, `Slug` | `Description`, `Published`, `Order` |

## Self-Describing Backup Format

Every backup file must be in the self-describing format:

```json
{
  "schemaVersion": 2,
  "baseId": "appXXXXXXXX",
  "tableId": "tblXXXXXXXX",
  "tableName": "Products",
  "generatedAt": "2026-07-12T00:00:00.000Z",
  "fieldMap": {
    "fldXXXXX": "Name",
    "fldYYYYY": "Slug",
    "fldZZZZZ": "Image"
  },
  "records": [
    {
      "id": "recXXXXXXXX",
      "fields": {
        "Name": "Office Accessories",
        "Slug": "office-accessories"
      }
    }
  ]
}
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `schemaVersion` | Yes | Must be `2` (current). Incremented when the canonical schema changes. |
| `baseId` | Yes | The Airtable base ID. For traceability. |
| `tableId` | Yes | The Airtable table ID. For traceability. |
| `tableName` | Yes | One of: `Products`, `Category`, `Occasions`, `Collections`. |
| `generatedAt` | Yes | ISO 8601 timestamp of when the backup was created. |
| `fieldMap` | Yes | Mapping of Airtable field IDs (`fldXXXXX`) to canonical field names. |
| `records` | Yes | Array of records in any Airtable format (`fields`, `cellValuesByFieldId`). |

## Restore Process

### Prerequisites

```bash
export UPSTASH_REDIS_REST_URL="your-upstash-url"
export UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

### Restore Command

```bash
node scripts/restore-kv-cache.js
```

### What Happens During Restore

1. **Load** each backup file from `docs/backups/`.
2. **Validate** the backup format using `scripts/lib/backupValidator.js`.
   - Rejects legacy formats with a descriptive error.
   - Validates `schemaVersion`, required metadata, and record integrity.
3. **Normalize** records using `scripts/lib/canonicalSchema.js`.
   - Converts `cellValuesByFieldId` → `fields` with human-readable names.
   - Converts field ID keys → human-readable names using `fieldMap`.
   - Fills missing canonical fields with `null`.
   - Validates required fields exist.
4. **Write** only validated canonical records to Redis via `airtableCache.setTable()`.

### Error Handling

- If a backup is in a legacy format, the restore **fails immediately** with instructions to migrate.
- If normalization produces errors (missing required fields), the table is **skipped** with a detailed error report.
- No corrupted or partially-normalized data ever enters Redis.

## Migration Process

### When to Migrate

Migrate when you have legacy backup files that don't have the `schemaVersion`, `fieldMap`, and other metadata fields.

### Migration Command

```bash
export AIRTABLE_API_KEY="your-airtable-token"
export AIRTABLE_BASE_ID="appXXXXXXXX"

node scripts/migrate-backup.js \
  docs/backups/airtable-category-backup-2026-07-12.json \
  Category \
  docs/backups/category-v2.json
```

### What Migration Does

1. Reads the legacy backup file.
2. Detects the format (`cellValuesByFieldId`, `fields` with IDs, `fields` with names).
3. Fetches the Airtable table schema via the Metadata API (offline tool only).
4. Builds a `fieldMap` (field ID → human-readable name).
5. Wraps the records in the self-describing format.
6. Writes the new backup file.

### Important

- Migration **requires Airtable access** because it needs the field ID → name mapping.
- After migration, the new backup file is **fully self-contained** and can be restored without Airtable.
- The original legacy file is **not modified** — a new file is created with a `-v2` suffix.

## Schema Versioning

### Current Version: 2

Version 2 introduced:
- Self-describing backup format with embedded `fieldMap`.
- Canonical schema with required/optional field validation.
- Separation of migration (offline, Airtable-dependent) from restore (online, Airtable-independent).

### Future Upgrades

When the canonical schema changes:

1. Increment `CURRENT_SCHEMA_VERSION` in `scripts/lib/canonicalSchema.js`.
2. Update `SUPPORTED_SCHEMA_VERSIONS` in `scripts/lib/backupValidator.js`.
3. Update `CANONICAL_SCHEMA` with new/removed fields.
4. Migrate existing backups using `scripts/migrate-backup.js`.
5. Regenerate new backups from Airtable.

## Data Flow Architecture

```
Airtable (authoritative CMS)
    ↓  (webhook/cron sync)
refresh-cache.js
    ↓  (normalizes to canonical schema)
Redis (metadata cache)
    ↓
Blob (image URLs)
    ↓
API Routes (get-categories, get-featured-hampers, etc.)
    ↓
Frontend (static HTML)
```

### Disaster Recovery Flow

```
Airtable backup JSON (legacy)
    ↓  (migrate-backup.js, one-time, Airtable-dependent)
Self-describing backup JSON (v2)
    ↓  (restore-kv-cache.js, offline, Airtable-independent)
Redis (canonical schema)
    ↓
API Routes → Frontend
```

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/lib/canonicalSchema.js` | Canonical schema definition and normalization layer |
| `scripts/lib/backupValidator.js` | Backup format validation and format detection |
| `scripts/migrate-backup.js` | Legacy backup migration tool (Airtable-dependent) |
| `scripts/restore-kv-cache.js` | Restore pipeline (Airtable-independent) |
| `scripts/seed-*-from-csv.js` | CSV-based seeding (alternative recovery path) |
| `api/_lib/airtableCache.js` | Redis cache layer (read/write) |
| `api/cron/refresh-cache.js` | Airtable sync and image mirroring |

## Why This Architecture is Resilient

1. **No schema inference** — field names are explicitly mapped, never guessed.
2. **Offline restore** — once migrated, backups are fully self-contained.
3. **Fail-fast validation** — invalid backups are rejected before touching Redis.
4. **Single canonical schema** — one source of truth for all data entering Redis.
5. **Separation of concerns** — migration (Airtable-dependent) is separate from restore (Airtable-independent).
6. **Version tracking** — schema changes are tracked via `schemaVersion`.