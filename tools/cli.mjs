// One entry point for every step:  npm run v -- <video> <step> [--lang xx] [step options]
//   npm run v -- list                      videos, languages, durations
//   npm run v -- new <id> [--title "..."]  scaffold videos/<id> from videos/_template
//   npm run v -- <video> tts      [ids]    voiceover via Eden AI (--placeholder: macOS say)
//   npm run v -- <video> prep              trim clips, word timings, gen/ data
//   npm run v -- <video> score             export timeline, synth score + mix, mix.m4a
//   npm run v -- <video> check             timeline sanity: missing cues, tight beats, spend
//   npm run v -- <video> snap t1 t2 ...    frames + contact sheet (cheap visual review)
//   npm run v -- <video> preview           30 fps render + 720p copy
//   npm run v -- <video> render            final 1080p60 render
//   npm run v -- <video> srt               YouTube captions
//   npm run v -- <video> deliver [--to d]  shareable 1080p (CRF 20) + 720p + .srt from the render
//   npm run v -- <video> build             prep, score, render, srt (every language unless --lang)
// Secrets: EDEN_AI_API_KEY in .env at the repo root (loaded automatically).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, loadVideo, langOf, FFMPEG } from './lib.mjs';
import { exportTimeline } from './export-timeline.mjs';

const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const [first, step, ...rest] = process.argv.slice(2);
const node = (script, args) => execFileSync(process.execPath, [path.join(ROOT, 'tools', script), ...args], { stdio: 'inherit' });
const python = () => (fs.existsSync(path.join(ROOT, '.venv', 'bin', 'python')) ? path.join(ROOT, '.venv', 'bin', 'python') : 'python3');

if (!first || first === 'help' || first === '--help') {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
  process.exit(0);
}
if (first === 'list') {
  for (const id of fs.readdirSync(path.join(ROOT, 'videos')).sort()) {
    if (id.startsWith('_') || !fs.existsSync(path.join(ROOT, 'videos', id, 'video.json'))) continue;
    const v = loadVideo(id);
    const durs = v.langs.map((l) => {
      const f = path.join(v.dir, 'out', l, 'timeline.json');
      return fs.existsSync(f) ? `${l} ${JSON.parse(fs.readFileSync(f, 'utf8')).duration.toFixed(1)}s` : `${l} (no timeline yet)`;
    });
    console.log(`${id.padEnd(18)} ${durs.join(', ').padEnd(30)} ${v.title}`);
  }
  process.exit(0);
}
if (first === 'new') { node('new-video.mjs', [step, ...rest]); process.exit(0); }

const video = loadVideo(first);
const hasLang = rest.includes('--lang');
const langs = hasLang ? [langOf(video, rest)] : video.langs;
const L = (l) => ['--lang', l];
const strip = rest.filter((a, i) => a !== '--lang' && rest[i - 1] !== '--lang');

function score(l) {
  const { file, TL } = exportTimeline(video, l);
  console.log(`timeline ${path.relative(ROOT, file)} (${TL.duration}s)`);
  execFileSync(python(), [path.join(video.dir, 'music.py'), '--video', video.dir, '--lang', l], { stdio: 'inherit' });
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', path.join(video.dir, 'out', l, 'mix.wav'), '-c:a', 'aac', '-b:a', '256k', path.join(video.dir, 'out', l, 'mix.m4a')]);
}

// Shareable copies of a finished render: 1080p at CRF 20 (a quarter of the master's size, visually
// the same), a 720p preview and the captions, in --to (default out/<lang>/deliver).
function deliver(l) {
  const od = path.join(video.dir, 'out', l);
  let master = path.join(od, `openhexa-${video.id}-${l}.mp4`);
  if (!fs.existsSync(master)) {
    const preview = path.join(od, `openhexa-${video.id}-${l}-preview.mp4`);
    if (!fs.existsSync(preview)) throw new Error(`no render at ${path.relative(ROOT, master)}: run render (or preview) first`);
    console.warn('no final render: delivering the 30 fps preview');
    master = preview;
  }
  const ti = strip.indexOf('--to');
  const to = path.resolve(ti >= 0 ? strip[ti + 1] : path.join(od, 'deliver'));
  fs.mkdirSync(to, { recursive: true });
  const base = path.join(to, `openhexa-${video.id}-${l}`);
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', master, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-c:a', 'copy', '-movflags', '+faststart', `${base}.mp4`]);
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', master, '-vf', 'scale=1280:720', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', `${base}-720p.mp4`]);
  node('srt.mjs', [video.id, ...L(l)]);
  fs.copyFileSync(path.join(od, `openhexa-${video.id}-${l}.srt`), `${base}.srt`);
  for (const f of [`${base}.mp4`, `${base}-720p.mp4`, `${base}.srt`]) console.log(`${(fs.statSync(f).size / 1e6).toFixed(1).padStart(6)} MB  ${f}`);
}

const steps = {
  deliver: () => langs.forEach(deliver),
  tts: () => langs.forEach((l) => node('tts.mjs', [video.id, ...L(l), ...strip])),
  prep: () => langs.forEach((l) => node('prep.mjs', [video.id, ...L(l), ...strip])),
  score: () => langs.forEach(score),
  check: () => langs.forEach((l) => node('check.mjs', [video.id, ...L(l)])),
  snap: () => node('snap.mjs', [video.id, ...L(langs[0]), ...strip]),
  preview: () => langs.forEach((l) => node('render.mjs', [video.id, ...L(l), '--preview', ...strip])),
  render: () => langs.forEach((l) => node('render.mjs', [video.id, ...L(l), ...strip])),
  srt: () => langs.forEach((l) => node('srt.mjs', [video.id, ...L(l)])),
  build: () => langs.forEach((l) => { node('prep.mjs', [video.id, ...L(l)]); score(l); node('render.mjs', [video.id, ...L(l)]); node('srt.mjs', [video.id, ...L(l)]); }),
};
if (!steps[step]) { console.error(`unknown step "${step}". Steps: ${Object.keys(steps).join(', ')}`); process.exit(1); }
try {
  steps[step]();
} catch (e) {
  // A failing child already printed its own error; exit with its status instead of a stack trace.
  if (typeof e.status === 'number') process.exit(e.status);
  throw e;
}
