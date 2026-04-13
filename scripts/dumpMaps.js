#!/usr/bin/env node
import puppeteer from 'puppeteer';
const exe = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome';
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], executablePath: exe });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  const url = 'https://www.google.com/maps/search/cafes+in+seattle';
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e=>console.error('goto err',e));
  await page.waitForTimeout(3000);
  const html = await page.content();
  const fs = await import('fs');
  const path = '/tmp/maps_dump.html';
  fs.writeFileSync(path, html);
  console.log('Wrote page content to', path);
  await browser.close();
})();
