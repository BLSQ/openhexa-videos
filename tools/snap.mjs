// Renders chosen frames to PNG, plus a labelled contact sheet when there are several.
//   node tools/snap.mjs <video> [--lang en] [--out dir] [--sheet-width 640] t1 t2 ...
// Cheap way to review a video: look at the sheet, not the full-size frames.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadVideo, langOf, parseArgs, launchBrowser, serve, playerUrl, FFMPEG } from './lib.mjs';

const { opts, rest } = parseArgs(process.argv.slice(2));
const video = loadVideo(rest[0]);
const lang = langOf(video, process.argv);
const times = rest.slice(1).map(Number);
const outDir = path.resolve(opts.out || path.join(video.dir, 'out', lang, 'snaps'));
fs.mkdirSync(outDir, { recursive: true });

const { srv, url } = await serve();
const browser = await launchBrowser();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(playerUrl(url, video, lang, '&render=1'));
await page.evaluate(() => window.stageReady);
const files = [];
for (const t of times) {
  await page.evaluate((a) => window.renderAt(a.t, Math.floor(a.t * 60)), { t });
  const f = path.join(outDir, `t${t.toFixed(2).padStart(7, '0')}.png`);
  await page.screenshot({ path: f });
  files.push(f);
}
await browser.close();
srv.close();
if (files.length > 1) {
  const w = Number(opts['sheet-width'] || 640), h = Math.round(w * 9 / 16);
  const cols = Math.min(3, files.length);
  const scaled = files.map((f, i) => `[${i}]scale=${w}:${h}[s${i}]`).join(';');
  const layout = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join('|');
  execFileSync(FFMPEG, ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', `${scaled};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${layout}:fill=black`, path.join(outDir, 'sheet.png')]);
  console.log('sheet', path.relative(process.cwd(), path.join(outDir, 'sheet.png')), '(frames in reading order:', times.join(', ') + ')');
} else console.log('wrote', files.join(' '));
process.exit(0);
