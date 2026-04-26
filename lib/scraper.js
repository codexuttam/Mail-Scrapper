import puppeteer from 'puppeteer';

function extractEmails(text) {
  if (!text) return [];
  // Enhanced regex to avoid garbage catches while maintaining thoroughness
  const re = /[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]{2,}/g;
  const matches = text.match(re);
  if (!matches) return [];
  
  return Array.from(new Set(matches.map(e => e.toLowerCase())))
    .filter(e => {
      // Basic sanity filters for common garbage results
      const garbage = ['sentry.io', 'example.com', '.png', '.jpg', 'wixpress.com'];
      return !garbage.some(g => e.includes(g));
    });
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
  await new Promise(r => setTimeout(r, 2000));

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

  const results = await page.evaluate((max) => {
    const items = [];
    const seen = new Set();
    const anchors = Array.from(document.querySelectorAll('a'));
    
    for (const a of anchors) {
      try {
        const href = a.href || '';
        if (!href) continue;
        
        // Maps place links often look like this
        if (href.includes('/place/') || href.includes('/maps/place')) {
          // Try to find the name:
          // 1. In the aria-label of the anchor
          // 2. In the innerText of the anchor
          // 3. In the nearest header or bold text
          let name = a.getAttribute('aria-label') || '';
          if (!name) name = a.innerText.split('\n')[0]; // Take first line of text
          
          name = name.trim();
          if (!name) continue;

          const key = href + '|' + name;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({ name, link: href });
          }
        }
      } catch (e) {}
      if (items.length >= max) break;
    }
    return items;
  }, maxResults);

  const batchSize = 5;
  const enriched = [];
  
  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    const batchPromises = batch.map(async (item) => {
      const entry = { name: item.name, link: item.link, phone: '', address: '', website: '', emails: [] };
      let p;
      try {
        p = await browser.newPage();
        await p.setViewport({ width: 1200, height: 800 });
        await p.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Block heavy resources to speed up loading
        await p.setRequestInterception(true);
        p.on('request', (req) => {
          if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
            req.abort();
          } else {
            req.continue();
          }
        });

        await p.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1000));

        const info = await p.evaluate(() => {
          const getText = (sel) => {
            const els = document.querySelectorAll(sel);
            for (const el of els) {
              const t = el.innerText.trim();
              if (t) return t;
            }
            return '';
          };
          
          // Extensive selectors for modern Google Maps Place Panel
          const address = getText([
            '[aria-label*="Address"]', 
            '[data-item-id="address"]', 
            '.Io6YTe', 
            '.fontBodyMedium.k77Iue',
            '.rogA2c'
          ].join(','));

          const phone = getText([
            '[aria-label*="Phone"]', 
            '[data-item-id*="phone:"]', 
            '.LrzXr',
            '.fontBodyMedium'
          ].join(', '));

          let website = '';
          const anchors = Array.from(document.querySelectorAll('a'));
          for (const a of anchors) {
            try {
              const href = a.href || '';
              const aria = (a.getAttribute('aria-label') || '').toLowerCase();
              const text = (a.innerText || '').toLowerCase();
              if (aria.includes('website') || text.includes('website')) {
                if (href && !href.includes('google.com')) { website = href; break; }
              }
              if (href && (href.startsWith('http')) && !href.includes('google.com') && !href.includes('/maps/')) {
                website = href; break;
              }
            } catch (e) {}
          }
          return { address, phone, website };
        });

        entry.address = info.address || 'Address not listed';
        entry.phone = info.phone || '';
        entry.website = info.website || '';

        const coordMatch = item.link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          entry.location = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        }

        if (entry.website) {
          try {
            const sitePage = await browser.newPage();
            // Block assets on business websites too
            await sitePage.setRequestInterception(true);
            sitePage.on('request', r => ['image', 'media', 'font'].includes(r.resourceType()) ? r.abort() : r.continue());
            
            await sitePage.goto(entry.website, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            // Trigger lazy-loaded footers by scrolling
            await sitePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await new Promise(r => setTimeout(r, 1500));

            const extractPageData = async (page) => {
              return await page.evaluate(() => {
                const emailsFound = [];
                const socials = { instagram: '', facebook: '', linkedin: '', twitter: '' };
                const discoveryLinks = [];

                document.querySelectorAll('a').forEach(a => {
                  const href = a.href || '';
                  const h = href.toLowerCase();
                  
                  if (href.startsWith('mailto:')) {
                    const m = href.replace(/^mailto:/i, '').split('?')[0];
                    if (m && m.includes('@')) emailsFound.push(m.trim());
                  }

                  if (h.includes('instagram.com/')) socials.instagram = href;
                  if (h.includes('facebook.com/')) socials.facebook = href;
                  if (h.includes('linkedin.com/')) socials.linkedin = href;
                  if (h.includes('twitter.com/') || h.includes('x.com/')) socials.twitter = href;
                  
                  // Collect discovery links
                  const t = (a.innerText || '').toLowerCase();
                  if (t.includes('contact') || t.includes('about') || t.includes('legal') || t.includes('privacy') || t.includes('policy')) {
                    if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && href.includes(window.location.hostname)) {
                      discoveryLinks.push(href);
                    }
                  }
                });

                const txt = document.body.innerText || '';
                return { emailsFound, txt, socials, discoveryLinks };
              });
            };

            const homeData = await extractPageData(sitePage);
            entry.socials = homeData.socials;
            let combinedEmails = [...homeData.emailsFound, ...extractEmails(homeData.txt)];

            // DEEP CRAWL: If zero emails found on home, check discovery pages
            if (combinedEmails.length === 0 && homeData.discoveryLinks.length > 0) {
              const bestLink = homeData.discoveryLinks[0]; // Just take the best/first one for speed
              try {
                await sitePage.goto(bestLink, { waitUntil: 'domcontentloaded', timeout: 10000 });
                await new Promise(r => setTimeout(r, 1000));
                const contactData = await extractPageData(sitePage);
                combinedEmails.push(...contactData.emailsFound, ...extractEmails(contactData.txt));
              } catch (crawlErr) {}
            }

            let uniq = Array.from(new Set(combinedEmails.filter(e => typeof e === 'string' && e.includes('@'))));
            if (onlyGmail) uniq = uniq.filter(e => /@gmail\.com$/i.test(e));
            entry.emails = uniq.slice(0, 5);
            
            await sitePage.close();
          } catch (e) {}
        }
      } catch (err) {
      } finally {
        if (p) await p.close();
      }
      return entry;
    });

    const batchResults = await Promise.all(batchPromises);
    enriched.push(...batchResults);
  }

  await browser.close();
  return enriched;
}
