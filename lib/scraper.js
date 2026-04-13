import puppeteer from 'puppeteer';

/**
 * scrapeBusinesses(query)
 * Basic Puppeteer scraper that navigates to Google Maps search results and
 * extracts simple business details. This is a starter stub — Google Maps DOM
 * classes change often, and scraping may require additional handling.
 */
export async function scrapeBusinesses(query) {
  if (!query) return [];

  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  // Prefer a system Chrome/Chromium if provided via env var to avoid puppeteer
  // downloading its own Chromium binary during install.
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for a selector that commonly contains place cards. This might need
  // adjustment depending on region / Google markup changes.
  await page.waitForTimeout(3000);

  const results = await page.evaluate(() => {
    const items = [];
    const cards = document.querySelectorAll('.Nv2PK');
    if (!cards || cards.length === 0) {
      // fallback: try searching for place card anchors
      document.querySelectorAll('a[role=link]').forEach((a) => {
        const name = a.querySelector('.qBF1Pd')?.innerText || a.innerText || '';
        if (name) items.push({ name, link: a.href });
      });
      return items;
    }

    cards.forEach((el) => {
      const name = el.querySelector('.qBF1Pd')?.innerText || '';
      const phone = el.querySelector('.w8qArf')?.innerText || '';
      const address = el.querySelector('.rllt__details')?.innerText || '';
      const link = el.querySelector('a')?.href || '';
      items.push({ name, phone, address, link });
    });

    return items;
  });

  await browser.close();
  return results;
}
