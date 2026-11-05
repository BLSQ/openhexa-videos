// Voiceover: one clip per script line, via Eden AI (OpenAI-compatible /v3/audio/speech).
//   node tools/tts.mjs <video> --lang en [lineId ...]     only missing lines, or the ids given
//   node tools/tts.mjs <video> --lang fr --placeholder     macOS `say` stand-in for timing work
// Voices live in video.json ("voices": {lang: {model, voice}}); `say` in script.json overrides
// the spoken text (pronunciation). Spend is logged to vo/cost-ledger.json and capped per video.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadVideo, langOf, parseArgs, FFMPEG } from './lib.mjs';

const { opts, rest } = parseArgs(process.argv.slice(2));
const video = loadVideo(rest[0]);
const lang = langOf(video, process.argv);
const only = rest.slice(1);
const BUDGET = Number(process.env.VIDEO_BUDGET_USD || 10);
const script = JSON.parse(fs.readFileSync(path.join(video.dir, 'script.json'), 'utf8'))[lang];
const voice = (video.voices || {})[lang];
if (!voice) throw new Error(`${video.id}: no voices.${lang} in video.json`);
const dir = path.join(video.dir, 'vo', lang, 'raw');
fs.mkdirSync(dir, { recursive: true });
const ledgerFile = path.join(video.dir, 'vo', 'cost-ledger.json');
const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : [];
const drop = (f) => fs.existsSync(f) && fs.unlinkSync(f);
const has = (bin) => { try { execFileSync('which', [bin], { stdio: 'ignore' }); return true; } catch { return false; } };

// Free stand-in voice for timing work: macOS `say`, else espeak-ng (Linux), else a quiet noise
// clip as long as the line would take to speak (~15 characters per second), so timing still works
// in a bare cloud sandbox. Placeholder clips are never .mp3, which is how `check` spots them.
function placeholder(id, text) {
  if (has('say')) {
    execFileSync('say', ['-v', voice.placeholder || 'Samantha', '-r', '185', '-o', path.join(dir, `${id}.aiff`), text]);
    return 'say';
  }
  const espeak = ['espeak-ng', 'espeak'].find(has);
  if (espeak) {
    execFileSync(espeak, ['-v', lang, '-s', '165', '-w', path.join(dir, `${id}.wav`), text]);
    return espeak;
  }
  const secs = Math.max(1.2, text.length / 15).toFixed(2);
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `anoisesrc=color=pink:amplitude=0.03:duration=${secs}`, '-ar', '48000', '-ac', '1', path.join(dir, `${id}.wav`)]);
  return `noise ${secs}s`;
}

for (const line of script.lines) {
  if (only.length && !only.includes(line.id)) continue;
  const text = line.say || line.text;
  if (opts.placeholder) {
    for (const ext of ['mp3', 'aiff', 'wav']) drop(path.join(dir, `${line.id}.${ext}`));
    const how = placeholder(line.id, text);
    console.log(lang, line.id, 'placeholder', how);
    continue;
  }
  const out = path.join(dir, `${line.id}.mp3`);
  if (!only.length && fs.existsSync(out)) continue;
  const key = process.env.EDEN_AI_API_KEY || process.env.EDEN_API;
  if (!key) throw new Error('EDEN_AI_API_KEY not set (put it in .env at the repo root)');
  const spent = ledger.reduce((a, b) => a + (b.cost || 0), 0);
  if (spent > BUDGET * 0.8) throw new Error(`${video.id}: Eden AI spend $${spent.toFixed(2)} is near the $${BUDGET} budget; stopping`);
  const body = { model: voice.model, input: text, voice: voice.voice, response_format: 'mp3', ...(voice.extra || {}) };
  const res = await fetch('https://api.edenai.run/v3/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) { console.error(lang, line.id, res.status, await res.text()); process.exit(1); }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  drop(path.join(dir, `${line.id}.aiff`));
  const cost = Number(res.headers.get('x-edenai-cost') || 0);
  ledger.push({ lang, id: line.id, chars: text.length, model: voice.model, voice: voice.voice, cost, at: new Date().toISOString() });
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 1));
  console.log(lang, line.id, `${buf.length}B`, 'cost', cost);
}
if (ledger.length) console.log(`${video.id} Eden AI spend so far: $${ledger.reduce((a, b) => a + (b.cost || 0), 0).toFixed(4)}`);
