// Captures live web pages (light mode, 1440 css px wide at 2x) into assets/docs/ for scenes that
// show a real page, e.g. the docs site in getting-started's docs scene.
//   node tools/shoot-docs.mjs                          docs.openhexa.com home, EN and FR
//   node tools/shoot-docs.mjs name=url [name=url ...]  any pages; saved as assets/docs/<name>-full.png
import path from 'node:path';
import { ROOT, launchBrowser } from './lib.mjs';

const args = process.argv.slice(2);
const pages = args.length
  ? args.map((a) => a.split(/=(.+)/).slice(0, 2))
  : [['en-home', 'https://docs.openhexa.com/'], ['fr-home', 'https://docs.openhexa.com/fr/']];
const browser = await launchBrowser();
const page = await browser.newPage();
await page.raw.setViewport?.({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.raw.emulateMediaFeatures?.([{ name: 'prefers-color-scheme', value: 'light' }]);
for (const [name, url] of pages) {
  await page.goto(url);
  await page.screenshot({ path: path.join(ROOT, 'assets', 'docs', `${name}-full.png`), clip: { x: 0, y: 0, width: 1440, height: 2400 } });
  console.log('captured', name, url);
}
await browser.close();
