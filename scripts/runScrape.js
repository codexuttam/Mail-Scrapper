#!/usr/bin/env node
import { scrapeBusinesses } from '../lib/scraper.js';

(async () => {
  try {
    const q = process.argv[2] || 'cafes in seattle';
    console.log('Scraping for query:', q);
    const res = await scrapeBusinesses(q);
    console.log('Results:', JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('scrape script error', e);
    process.exit(1);
  }
})();
