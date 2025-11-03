#!/usr/bin/env node
/**
 * Extract URLs from sitemap.xml for Lighthouse CI testing
 *
 * This script reads the built sitemap.xml and outputs all URLs
 * converted to localhost URLs for local Lighthouse testing.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const SITEMAP_PATH = '.svelte-kit/cloudflare/sitemap.xml';
const LOCALHOST_BASE = 'http://localhost:4173';

try {
  const sitemap = readFileSync(resolve(SITEMAP_PATH), 'utf-8');

  // Extract all <loc> URLs using regex
  const urlMatches = sitemap.matchAll(/<loc>(.*?)<\/loc>/g);
  const urls = Array.from(urlMatches, match => match[1]);

  // Convert production URLs to localhost
  const localhostUrls = urls.map(url => {
    const path = new URL(url).pathname;
    return `${LOCALHOST_BASE}${path}`;
  });

  // Output as JSON array for easy copying to lighthouserc.js
  console.log(JSON.stringify(localhostUrls, null, 2));

  console.error(`\n✅ Found ${localhostUrls.length} URLs from sitemap`);
  console.error('📋 Copy the JSON array above to lighthouserc.js -> ci.collect.url\n');

} catch (error) {
  console.error('❌ Error reading sitemap:', error.message);
  console.error('💡 Make sure to run "npm run build" first!\n');
  process.exit(1);
}
