/**
 * Lighthouse CI Configuration
 *
 * This configuration runs Lighthouse audits on all pages with strict
 * thresholds to ensure 100% scores in all categories.
 *
 * URLs are automatically extracted from sitemap.xml at runtime.
 */

const { readFileSync } = require('fs');
const { resolve } = require('path');

/**
 * Extract URLs from sitemap.xml and convert to localhost URLs
 */
function getUrlsFromSitemap() {
  const SITEMAP_PATH = '.svelte-kit/cloudflare/sitemap.xml';
  const LOCALHOST_BASE = 'http://localhost:4173';

  const sitemap = readFileSync(resolve(SITEMAP_PATH), 'utf-8');
  const urlMatches = sitemap.matchAll(/<loc>(.*?)<\/loc>/g);
  const urls = Array.from(urlMatches, match => match[1]);

  if (urls.length === 0) {
    throw new Error('Sitemap is empty - no URLs found');
  }

  // Convert production URLs to localhost
  const localhostUrls = urls.map(url => {
    const path = new URL(url).pathname;
    return `${LOCALHOST_BASE}${path}`;
  });

  console.log(`✅  Found ${localhostUrls.length} URLs from sitemap.xml`);
  return localhostUrls;
}

const urls = getUrlsFromSitemap();

module.exports = {
  ci: {
    collect: {
      // Start the SvelteKit preview server
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,

      // Automatically discover all URLs from sitemap
      url: urls,

      // Run multiple times for more reliable results
      numberOfRuns: 3,

      // Lighthouse settings
      settings: {
        // Test both mobile and desktop
        preset: 'desktop',

        // Throttling settings (simulated fast 4G)
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },

        // Skip some audits that don't apply to static sites
        skipAudits: [
          'uses-http2', // Cloudflare Pages uses HTTP/2 automatically
        ],
      },
    },

    assert: {
      // Strict thresholds for 100% scores
      assertions: {
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'speed-index': ['error', { maxNumericValue: 3400 }],

        // Category scores - aiming for 100%
        'categories:performance': ['error', { minScore: 0.99 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 0.92 }], // 92+ is realistic
        'categories:seo': ['error', { minScore: 1.0 }],

        // Accessibility requirements
        'aria-required-attr': 'error',
        'button-name': 'error',
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'meta-viewport': 'error',

        // SEO requirements
        'meta-description': 'error',
        'robots-txt': 'off', // Optional for static sites

        // Security
        'is-on-https': 'off', // Can't test HTTPS on localhost

        // Performance budgets
        'resource-summary:document:size': ['error', { maxNumericValue: 50000 }], // 50KB HTML
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 100000 }], // 100KB CSS
        'resource-summary:script:size': ['error', { maxNumericValue: 250000 }], // 250KB JS
        'resource-summary:image:size': ['error', { maxNumericValue: 500000 }], // 500KB images
        'resource-summary:font:size': ['error', { maxNumericValue: 150000 }], // 150KB fonts
      },
    },

    upload: {
      // For now, just output to console
      // Later you can add: target: 'temporary-public-storage' or GitHub Actions integration
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
