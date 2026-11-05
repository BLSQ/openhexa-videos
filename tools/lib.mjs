// Shared helpers for the tools: repo paths, video manifests, ffmpeg, headless Chrome, static server.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);

export function videoDir(id) {
  const dir = path.join(ROOT, 'videos', id);
  if (!id || !fs.existsSync(path.join(dir, 'video.json'))) {
    const ids = fs.readdirSync(path.join(ROOT, 'videos')).filter((d) => !d.startsWith('_') && fs.existsSync(path.join(ROOT, 'videos', d, 'video.json')));
    throw new Error(`unknown video "${id}". Videos: ${ids.join(', ')}`);
  }
  return dir;
}

export function loadVideo(id) {
  const dir = videoDir(id);
  const man = JSON.parse(fs.readFileSync(path.join(dir, 'video.json'), 'utf8'));
  return { id, dir, langs: man.langs || ['en'], ...man };
}

export function langOf(video, argv) {
  const i = argv.indexOf('--lang');
  const lang = i >= 0 ? argv[i + 1] : video.langs[0];
  if (!video.langs.includes(lang)) throw new Error(`${video.id} has no "${lang}" version (langs: ${video.langs.join(', ')})`);
  return lang;
}

// `--key value` pairs and bare positionals.
export function parseArgs(argv) {
  const opts = {}, rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) opts[k] = argv[++i];
      else opts[k] = true;
    } else rest.push(argv[i]);
  }
  return { opts, rest };
}

// ffmpeg: $FFMPEG, else the npm ffmpeg-static binary, else whatever is on PATH.
export const FFMPEG = process.env.FFMPEG || (() => {
  try { return require('ffmpeg-static'); } catch { return 'ffmpeg'; }
})();

export const outDir = (video, lang) => {
  const d = path.join(video.dir, 'out', lang);
  fs.mkdirSync(d, { recursive: true });
  return d;
};

export function readTimeline(video, lang) {
  const f = path.join(video.dir, 'out', lang, 'timeline.json');
  if (!fs.existsSync(f)) throw new Error(`no timeline for ${video.id}/${lang}: run "npm run v -- ${video.id} score --lang ${lang}" first`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

// Headless Chrome: puppeteer-core with a local Chrome (macOS default or $CHROME), else Playwright
// Chromium (cloud sandboxes). Returns { newPage(), close() } with a common page API.
export async function launchBrowser() {
  const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const args = ['--hide-scrollbars', '--disable-gpu-vsync', '--force-color-profile=srgb'];
  if (fs.existsSync(chrome)) {
    const puppeteer = (await import('puppeteer-core')).default;
    const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args });
    return {
      async newPage() {
        const p = await b.newPage();
        await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
        return { raw: p, goto: (u) => p.goto(u, { waitUntil: 'networkidle0' }), evaluate: (fn, arg) => p.evaluate(fn, arg), cdp: () => p.createCDPSession(), screenshot: (o) => p.screenshot(o), on: (e, f) => p.on(e, f) };
      },
      close: () => b.close(),
    };
  }
  const { chromium } = require('playwright');
  const b = await chromium.launch({ args });
  return {
    async newPage() {
      const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
      return { raw: p, goto: (u) => p.goto(u, { waitUntil: 'networkidle' }), evaluate: (fn, arg) => p.evaluate(fn, arg), cdp: () => p.context().newCDPSession(p), screenshot: (o) => p.screenshot(o), on: (e, f) => p.on(e, f) };
    },
    close: () => b.close(),
  };
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };

// Static server for the repo root (the player at /index.html?video=<id>).
export function serve(port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` }));
  });
}

export const playerUrl = (base, video, lang, extra = '') => `${base}/index.html?video=${video.id}&lang=${lang}${extra}`;
