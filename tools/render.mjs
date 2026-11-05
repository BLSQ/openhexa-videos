// Frame-accurate render of a video to MP4, muxed with its mastered mix.
//   node tools/render.mjs <video> --lang en [--fps 60] [--workers 6] [--from 0] [--to <dur>] [--sub 1] [--preview] [--out file]
// Each worker drives its own headless Chrome over a slice of frames and encodes a segment; the
// segments are concatenated. --preview renders 30 fps and adds a small 720p copy for review.
// --sub N averages N sub-frames per frame (motion blur). Keep workers <= 6 on a laptop: more
// starves Chrome and some segments come out empty.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { loadVideo, langOf, parseArgs, launchBrowser, serve, playerUrl, readTimeline, outDir, FFMPEG } from './lib.mjs';

const { opts, rest } = parseArgs(process.argv.slice(2));
const video = loadVideo(rest[0]);
const lang = langOf(video, process.argv);
const TL = readTimeline(video, lang);
const FPS = Number(opts.fps || (opts.preview ? 30 : 60));
const WORKERS = Number(opts.workers || 6);
const SUB = Number(opts.sub || 1);
const FROM = Number(opts.from || 0);
const TO = Number(opts.to || TL.duration);
const OD = outDir(video, lang);
const OUT = path.resolve(opts.out || path.join(OD, `openhexa-${video.id}-${lang}${opts.preview ? '-preview' : ''}.mp4`));
const TMP = path.join(OD, 'segments');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const total = Math.round((TO - FROM) * FPS);
const { srv, url } = await serve();
const t0 = Date.now();
let done = 0;

async function worker(w) {
  const a = Math.floor((total * w) / WORKERS), b = Math.floor((total * (w + 1)) / WORKERS);
  const seg = path.join(TMP, `seg_${String(w).padStart(2, '0')}.mp4`);
  const browser = await launchBrowser();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log(`[w${w} pageerror]`, e.message));
  await page.goto(playerUrl(url, video, lang, '&render=1'));
  await page.evaluate(() => window.stageReady);
  const cdp = await page.cdp();

  const vf = SUB > 1 ? ['-vf', `tmix=frames=${SUB}:weights=${Array(SUB).fill(1).join(' ')},select='not(mod(n\\,${SUB}))',setpts=N/${FPS}/TB`] : [];
  const ff = spawn(FFMPEG, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-c:v', 'png', '-i', '-', ...vf,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let f = a; f < b; f++) {
    for (let s = 0; s < SUB; s++) {
      // sub-frames are centred on the frame time (shutter ~ 180°)
      const t = FROM + (f + (SUB > 1 ? (s / SUB - 0.5) * 0.5 : 0)) / FPS;
      await page.evaluate((x) => window.renderAt(Math.max(0, x.t), x.f), { t, f });
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, captureBeyondViewport: false });
      const buf = Buffer.from(data, 'base64');
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    done++;
    if (done % 60 === 0) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r${done}/${total} frames  ${(done / el).toFixed(1)} fps  eta ${Math.round((total - done) / (done / el))}s   `);
    }
  }
  ff.stdin.end();
  const code = await new Promise((r) => ff.on('close', r));
  await browser.close();
  if (code !== 0) throw new Error(`worker ${w}: ffmpeg exited with ${code}`);
  return seg;
}

const segs = await Promise.all([...Array(WORKERS).keys()].map(worker));
srv.close();
console.log(`\nrendered ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

const list = path.join(TMP, 'list.txt');
fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
const audio = path.join(OD, 'mix.wav');
const withAudio = FROM === 0 && fs.existsSync(audio);
execFileSync(FFMPEG, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list,
  ...(withAudio ? ['-i', audio, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest'] : []),
  '-c:v', 'copy', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
fs.rmSync(TMP, { recursive: true, force: true });
console.log('wrote', path.relative(process.cwd(), OUT), withAudio ? '' : '(no audio: run score first)');
if (opts.preview) {
  const small = OUT.replace(/\.mp4$/, '-720p.mp4');
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', OUT, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', small]);
  console.log('wrote', path.relative(process.cwd(), small));
}
process.exit(0);
