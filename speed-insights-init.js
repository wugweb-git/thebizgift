// Speed Insights initialization
// This script loads and initializes Vercel Speed Insights for the site
// Import and inject Speed Insights only in production (Vercel automatically sets the environment)

import { injectSpeedInsights } from './speed-insights.mjs';

// Initialize Speed Insights
// The library automatically detects the environment and only tracks in production
injectSpeedInsights();
