import puppeteer from 'puppeteer';

// Helper: extract emails from text using a regex
function extractEmails(text) {
  if (!text) return [];
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(re);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * scrapeBusinesses(query)
 * Basic Puppeteer scraper that navigates to Google Maps search results and
 * extracts simple business details. This is a starter stub — Google Maps DOM
 * classes change often, and scraping may require additional handling.
 */
export async function scrapeBusinesses(query, options = {}) {
  // options: { onlyGmail: boolean, maxResults: number }
  if (!query) return [];
  const onlyGmail = !!options.onlyGmail;
  const maxResults = typeof options.maxResults === 'number' ? options.maxResults : 20;

  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Give Maps a moment to render results and progressively load cards
  await page.waitForTimeout(2000);

  // Try to scroll results container and window a few times so lazy-loaded cards appear
  try {
    await page.evaluate(async () => {
      // scroll main window a bit
      for (let i = 0; i < 6; i++) {
        window.scrollBy(0, 800);
        await new Promise(r => setTimeout(r, 300));
      }

      // try to find a scrollable results container and scroll it
      const cand = document.querySelector('[role="feed"]') || document.querySelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf');
      if (cand) {
        for (let i = 0; i < 8; i++) {
          cand.scrollTop = cand.scrollHeight;
          await new Promise(r => setTimeout(r, 300));
        }
      }
    });
  } catch (e) {
    // ignore scroll errors
  }

  // Collect place links from the search results pane (broader matching)
  const results = await page.evaluate((max) => {
    const items = [];
    const seen = new Set();
    const anchors = Array.from(document.querySelectorAll('a'));
    for (const a of anchors) {
      try {
        const href = a.href || '';
        // Accept various maps/place link forms
        if (!href) continue;
        if (href.includes('/place/') || href.includes('/maps/place') || href.includes('/maps?cid=') || href.includes('/maps/preview/place')) {
          const name = (a.innerText || '').trim();
          const key = href + '|' + name;
          if (!seen.has(key) && (name || href)) {
            seen.add(key);
            items.push({ name: name || '', link: href });
          }
        }
      } catch (e) {
        // ignore
      }
      if (items.length >= max) break;
    }
    return items.slice(0, max);
  }, maxResults);

  // For each result, open its Maps link and try to extract website, then visit website to find emails
  const enriched = [];
  for (const item of results) {
    const entry = { name: item.name, link: item.link, phone: '', address: '', website: '', emails: [] };
    try {
      const p = await browser.newPage();
      await p.setViewport({ width: 1200, height: 800 });
      await p.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await p.goto(item.link, { waitUntil: 'networkidle2', timeout: 45000 });
      await p.waitForTimeout(2000);

      // Try to read address/phone/website from the place panel. Use multiple fallbacks.
      const info = await p.evaluate(() => {
        const getText = (sel) => document.querySelector(sel)?.innerText || '';
        const address = getText('[data-tooltip="Address"], button[data-item-id="address"], .rogA2c, .Io6YTe');
        const phone = getText('button[data-item-id="phone"], [data-tooltip="Phone"], .LrzXr.zdqRlf.kno-fv');

        // website anchors: aria-label 'Website', innerText 'Website', or any external http(s) anchor not pointing to google
        let website = '';
        const anchors = Array.from(document.querySelectorAll('a'));
        for (const a of anchors) {
          try {
            const href = a.href || '';
            const aria = (a.getAttribute('aria-label') || '').toLowerCase();
            const text = (a.innerText || '').toLowerCase();
            if (aria.includes('website') || text === 'website' || text.includes('website')) {
              if (href && !href.includes('google.com')) { website = href; break; }
            }
            if (href && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes('google.com') && !href.includes('/maps/')) {
              // prefer anchors that look like external site links
              website = href; break;
            }
          } catch (e) {}
        }
        return { address, phone, website };
      });

      entry.address = info.address || '';
      entry.phone = info.phone || '';
      entry.website = info.website || '';

      // If no website found in anchors, try to click the website button (if present)
      if (!siteUrl) {
        try {
          const websiteHandle = await p.$x("//a[contains(@href,'http') and not(contains(@href,'google.com'))]");
          if (websiteHandle && websiteHandle.length) {
            const href = await (await websiteHandle[0].getProperty('href')).jsonValue();
            siteUrl = href;
          }
        } catch (e) {
          // ignore
        }
      }

      // If we have a website, visit it and try to extract mailto links or emails in text
      if (siteUrl) {
        try {
          const sitePage = await browser.newPage();
          await sitePage.setViewport({ width: 1200, height: 900 });
          await sitePage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          // normalize URL: sometimes Google adds redirect wrappers; try to open directly
          try {
            await sitePage.goto(siteUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          } catch (e) {
            // fallback: try to open with a GET to the link without referrer
            await sitePage.goto(siteUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          }
          await sitePage.waitForTimeout(1500);

          const emails = await sitePage.evaluate(() => {
            const emailsFound = [];
            // collect mailto links
            document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
              const m = a.getAttribute('href').replace(/^mailto:/i, '').split('?')[0];
              if (m) emailsFound.push(m.trim());
            });
            // also scan visible text for email-like patterns
            const txt = document.body.innerText || '';
            return { emailsFound, txt }; // return text to post-process with regex
          });

          const combined = [];
          if (emails && emails.emailsFound && emails.emailsFound.length) combined.push(...emails.emailsFound);
          if (emails && emails.txt) combined.push(...extractEmails(emails.txt));
          let uniq = Array.from(new Set(combined)).slice(0, 20);
          // Optionally filter to gmail addresses only (user requested gmail extraction)
          if (onlyGmail) uniq = uniq.filter(e => /@gmail\.com$/i.test(e));
          entry.emails = uniq.slice(0, 5);
          await sitePage.close();
        } catch (e) {
          // visiting website failed; ignore and continue
        }
      }

      await p.close();
    } catch (err) {
      // ignore per-item errors and continue
    }
    enriched.push(entry);
  }

  await browser.close();
  return enriched;
}
