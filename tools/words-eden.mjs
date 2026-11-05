// Word timings through Eden AI (Deepgram nova-3), the fallback when local faster-whisper can't run,
// e.g. in a cloud sandbox that blocks the model download. Same output as tools/audio/words.py.
//   node tools/words-eden.mjs <video> --lang en      writes vo/<lang>/words/<id>.json, logs cost
import fs from 'node:fs';
import path from 'node:path';
import { loadVideo, langOf } from './lib.mjs';

const video = loadVideo(process.argv[2]);
const lang = langOf(video, process.argv);
const key = process.env.EDEN_AI_API_KEY || process.env.EDEN_API;
if (!key) throw new Error('EDEN_AI_API_KEY not set');
const script = JSON.parse(fs.readFileSync(path.join(video.dir, 'script.json'), 'utf8'))[lang];
const vo = path.join(video.dir, 'vo', lang);
const ledgerFile = path.join(video.dir, 'vo', 'cost-ledger.json');
const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : [];
fs.mkdirSync(path.join(vo, 'words'), { recursive: true });

for (const line of script.lines) {
  const form = new FormData();
  form.append('model', 'deepgram/nova-3');
  form.append('file', new Blob([fs.readFileSync(path.join(vo, 'trim', `${line.id}.wav`))], { type: 'audio/wav' }), `${line.id}.wav`);
  form.append('language', lang);
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'word');
  const res = await fetch('https://api.edenai.run/v3/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form });
  if (!res.ok) { console.error(line.id, res.status, await res.text()); process.exit(1); }
  const json = await res.json();
  const words = (json.words || []).map((w) => ({ w: w.word, t: w.start, end: w.end }));
  fs.writeFileSync(path.join(vo, 'words', `${line.id}.json`), JSON.stringify(words));
  ledger.push({ lang, id: `${line.id}-words`, model: 'deepgram/nova-3', cost: Number(json.cost || res.headers.get('x-edenai-cost') || 0), at: new Date().toISOString() });
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 1));
  console.log(lang, line.id, words.length, 'words');
}
