/**
 * get-hamper.js — Vercel Serverless Function
 * 
 * Fetches a single product by URL slug from Airtable.
 * Returns the full product payload plus algorithmically related products.
 *
 * Related Product Algorithm (Priority order):
 * 1. Same Collections
 * 2. Same Occasion
 * 3. Same Category
 * 4. Same Product Tags
 *
 * Max 4 related products. Never returns the current product.
 * Ties are randomised.
 *
 * A product can belong to multiple Categories, Collections, and Occasions
 * at once (Airtable's linked-record fields are many-to-many) — the website
 * shows all of them, not just the first.
 *
 * Required Airtable fields (exact names, case-sensitive — these have been
 * renamed at least twice during development, so double-check against
 * list_tables_for_base before assuming a mismatch is a permissions issue):
 *   website URL Slug, Product Website Name, Product Website Description, Product Images
 *
 * Taxonomy fields (Category/Sub Category/Occasion/Collections are linked-record
 * fields — Airtable's REST API returns these as bare record ID arrays, not names,
 * so the paired "Name (from X)" / "Slug (from X)" lookup fields are read instead):
 *   Category, Category Name (from Category), Category Slug (from Category), Category Image (from Category),
 *   Sub Category, Sub Category Name (from Sub Category),
 *   Occasion, Name (from Occasion), Slug (from Occasion), Occasion Image (from Occasion Tags Linked),
 *   Collections, Name (from Collections), Slug (from Collections), Collection Image (from Collections Linked)
 *
 * Optional Airtable fields (gracefully handled when missing):
 *   SEO Title, SEO Description, TBG Product Code, Website Image Alt Text,
 *   Product Tags, MOQ, Product Type, USP, Material, Branding Option,
 *   Product Contents, FAQ, CTA Title, CTA Description, CTA Image,
 *   CTA Background, CTA Button Label, Lead Time, Delivery, Response Time,
 *   Production Workflow
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = 'Products';
const applyCors = require('./_lib/cors').applyCors;

// Helper: safe array access
function asArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

// Helper: extract first image URL from Airtable attachment array
function extractImageUrl(images) {
  if (!images || !Array.isArray(images) || images.length === 0) return null;
  return images[0].url || images[0].thumbnails?.large?.url || null;
}

// Helper: extract all image URLs. Airtable only has one Image Alt Text field
// per product (not per-attachment), so it's applied to the first/primary
// image; the rest fall back to the filename.
function extractAllImageUrls(images, primaryAlt) {
  if (!images || !Array.isArray(images)) return [];
  return images.map(function (img, i) {
    return {
      url: img.url,
      alt: (i === 0 && primaryAlt) || img.filename || 'Product image'
    };
  });
}

// Helper: parse Product Contents (comma-separated JSON or direct array from Airtable)
function parseItems(contents) {
  if (!contents) return [];
  // Airtable may return as JSON string or as array of objects
  if (typeof contents === 'string') {
    try { return JSON.parse(contents); }
    catch (e) { return []; }
  }
  if (Array.isArray(contents)) return contents;
  return [];
}

// Helper: parse FAQ (comma-separated JSON or direct array)
function parseFAQ(faq) {
  if (!faq) return [];
  if (typeof faq === 'string') {
    try { return JSON.parse(faq); }
    catch (e) { return []; }
  }
  if (Array.isArray(faq)) return faq;
  return [];
}

// Helper: zip parallel lookup arrays (Name/Slug/Image) into an array of
// { name, slug, image } objects, keyed by index. A product can belong to
// several Categories/Collections/Occasions at once (Airtable's linked-record
// fields are many-to-many), so every linked entry is kept, not just the first.
// Airtable lookups return values in the same order as the source link field,
// so parallel lookups off the same link field line up positionally. image is
// null until Hero Image attachments are uploaded on the taxonomy tables.
function zipTaxonomy(names, slugs, images) {
  var arr = asArray(names);
  return arr.map(function (name, i) {
    var imgArr = asArray(images)[i];
    var image = Array.isArray(imgArr) && imgArr.length > 0 ? imgArr[0].url : null;
    return {
      name: name,
      slug: asArray(slugs)[i] || null,
      image: image
    };
  });
}

// Helper: parse Branding Options into structured array
function parseBranding(branding) {
  if (!branding) return [];
  var arr = asArray(branding);
  return arr.map(function (b) {
    if (typeof b === 'string') {
      return {
        name: b,
        description: null,
        image: null
      };
    }
    return b;
  });
}

// Format a single Airtable record into our frontend-friendly schema
function formatProduct(record) {
  var f = record.fields || {};

  return {
    id: record.id,
    slug: f['website URL Slug'] || 'unknown',
    name: f['Product Website Name'] || 'Curated Experience',
    description: f['Product Website Description'] || 'A thoughtfully curated gifting experience.',

    // SEO
    seoTitle: f['SEO Title'] || null,
    seoDescription: f['SEO Description'] || null,

    // Reference
    productCode: f['TBG Product Code'] || null,

    // Taxonomy — a product can have multiple Categories, Collections, and
    // Occasions at once. Category/Sub Category/Occasion/Collections are
    // linked-record fields; names/slugs/images come from their paired lookup
    // fields, not the raw link field itself (which only holds record IDs).
    categories: zipTaxonomy(
      f['Category Name (from Category)'],
      f['Category Slug (from Category)'],
      f['Category Image (from Category)']
    ),
    subCategory: asArray(f['Sub Category Name (from Sub Category)'])[0] || null,
    collections: zipTaxonomy(
      f['Name (from Collections)'],
      f['Slug (from Collections)'],
      f['Collection Image (from Collections Linked)']
    ),
    occasions: zipTaxonomy(
      f['Name (from Occasion)'],
      f['Slug (from Occasion)'],
      f['Occasion Image (from Occasion Tags Linked)']
    ),
    productTags: asArray(f['Product Tags']),
    
    // Media
    images: extractAllImageUrls(f['Product Images'], f['Website Image Alt Text']),
    
    // Editorial
    whyTitle: f['Editorial Title'] || 'Why This Gift Exists',
    whyParagraphs: f['Editorial Paragraphs'] 
      ? (Array.isArray(f['Editorial Paragraphs']) ? f['Editorial Paragraphs'] : [f['Editorial Paragraphs']])
      : ['This gifting experience was thoughtfully curated for meaningful corporate moments.'],
    whyImage: extractImageUrl(f['Editorial Image']),
    
    // Contents
    items: parseItems(f['Product Contents']),
    
    // Procurement
    moq: f['MOQ'] || null,
    productType: f['Product Type'] || null,
    usp: f['USP'] || null,
    material: f['Material'] || null,
    leadTime: f['Lead Time'] || null,
    delivery: f['Delivery'] || null,
    responseTime: f['Response Time'] || null,
    productionWorkflow: f['Production Workflow'] || null,
    
    // Branding
    branding: parseBranding(f['Branding Option']),
    
    // FAQ
    faq: parseFAQ(f['FAQ']),
    
    // Lead Gen
    ctaTitle: f['CTA Title'] || null,
    ctaDescription: f['CTA Description'] || null,
    ctaImage: extractImageUrl(f['CTA Image']),
    ctaBackground: f['CTA Background'] || null,
    ctaButtonLabel: f['CTA Button Label'] || null,
    
    // Related (will be populated by algorithm)
    related: [],
    
    // Raw data for algorithm matching — these are now linked-record IDs
    // (Airtable REST API returns bare record ID strings for link fields),
    // so matching is by true taxonomy record identity, not display name.
    _rawOccasionTags: asArray(f['Occasion']),
    _rawCategories: asArray(f['Category']),
    _rawCollectionTags: asArray(f['Collections']),
    _rawProductTags: asArray(f['Product Tags'])
  };
}

// Algorithm: find related products
function findRelated(currentProduct, allProducts) {
  var MAX_RELATED = 4;
  var scored = [];
  var currentId = currentProduct.id;
  var currentSlug = currentProduct.slug;

  allProducts.forEach(function (other) {
    if (other.id === currentId || other.slug === currentSlug) return;

    var score = 0;

    // Priority 1: Same Collection (+4)
    var currentCollection = currentProduct._rawCollectionTags || [];
    var otherCollection = other._rawCollectionTags || [];
    currentCollection.forEach(function (c) {
      if (otherCollection.indexOf(c) !== -1) score += 4;
    });

    // Priority 2: Same Occasion (+3)
    var currentOccasion = currentProduct._rawOccasionTags || [];
    var otherOccasion = other._rawOccasionTags || [];
    currentOccasion.forEach(function (c) {
      if (otherOccasion.indexOf(c) !== -1) score += 3;
    });

    // Priority 3: Same Category (+2)
    var currentCategory = currentProduct._rawCategories || [];
    var otherCategory = other._rawCategories || [];
    currentCategory.forEach(function (c) {
      if (otherCategory.indexOf(c) !== -1) score += 2;
    });

    // Priority 4: Same Product Tags (+1)
    var currentTags = currentProduct._rawProductTags || [];
    var otherTags = other._rawProductTags || [];
    currentTags.forEach(function (c) {
      if (otherTags.indexOf(c) !== -1) score += 1;
    });

    if (score > 0) {
      scored.push({
        product: other,
        score: score,
        // Random tiebreaker
        random: Math.random()
      });
    }
  });

  // Sort by score descending, then random for ties
  scored.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.random - b.random;
  });

  return scored.slice(0, MAX_RELATED).map(function (item) {
    var p = item.product;
    var firstImage = p.images && p.images.length > 0 ? p.images[0].url : null;
    return {
      name: p.name,
      slug: p.slug,
      image: firstImage,
      description: p.description ? p.description.substring(0, 120) + '...' : null,
      collections: p.collections,
      moq: p.moq
    };
  });
}

// ─── Vercel Serverless Handler ──────────────────────────────────────────────

module.exports = async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract slug from query
  var slug = req.query.slug;
  if (!slug) {
    res.status(400).json({ error: 'Missing slug parameter' });
    return;
  }

  // Validate environment
  if (!AIRTABLE_API_KEY || !BASE_ID) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    // Fetch ALL products (needed for related algorithm)
    // Published is the source of truth for live visibility (Website Ready is a
    // stricter completeness gate that under-counts otherwise-complete products).
    var filterFormula = encodeURIComponent('{Published}=TRUE()');
    var url = 'https://api.airtable.com/v0/' + BASE_ID + '/' + TABLE_NAME +
              '?filterByFormula=' + filterFormula + '&maxRecords=200';

    var response = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + AIRTABLE_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Airtable connection failed: ' + response.status);
    }

    var data = await response.json();
    if (!data.records || data.records.length === 0) {
      res.status(404).json({ error: 'No products found' });
      return;
    }

    // Format all products
    var allProducts = data.records.map(formatProduct);

    // Find the requested product
    var requestedProduct = null;
    var requestedIndex = -1;
    allProducts.forEach(function (p, i) {
      if (p.slug === slug) {
        requestedProduct = p;
        requestedIndex = i;
      }
    });

    if (!requestedProduct) {
      res.status(404).json({ error: 'Product not found with slug: ' + slug });
      return;
    }

    // Find related products
    requestedProduct.related = findRelated(requestedProduct, allProducts);

    // Remove internal raw fields before sending
    var cleanProduct = {};
    Object.keys(requestedProduct).forEach(function (key) {
      if (key.indexOf('_raw') !== 0) {
        cleanProduct[key] = requestedProduct[key];
      }
    });

    res.status(200).json(cleanProduct);

  } catch (error) {
    console.error('get-hamper error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product data.',
      details: error.message
    });
  }
};