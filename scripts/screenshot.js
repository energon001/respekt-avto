const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL = process.env.PREVIEW_URL || 'https://energon001.github.io/respekt-avto/';
const OUT = path.join(process.cwd(), 'docs', 'preview.jpg');

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view'));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT, fullPage: false, type: 'jpeg', quality: 85 });
  await browser.close();
  console.log('saved', OUT);
})();