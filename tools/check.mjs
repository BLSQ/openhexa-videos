// Cheap, text-only sanity check of one language of a video. Run it before rendering anything.
//   node tools/check.mjs <video> --lang en
// Reports: missing or placeholder clips, narration lines that overlap, sync cues that matched no
// transcribed word (they fall back to an estimate), scene cuts, duration and Eden AI spend.
import fs from 'node:fs';
import path from 'node:path';
import { loadVideo, langOf } from './lib.mjs';
import { computeTimeline } from './export-timeline.mjs';

const video = loadVideo(process.argv[2]);
const lang = langOf(video, process.argv);
const script = JSON.parse(fs.readFileSync(path.join(video.dir, 'script.json'), 'utf8'))[lang].lines;
const problems = [];
const vo = path.join(video.dir, 'vo', lang);

const durs = {};
for (const l of script) {
  const mp3 = path.join(vo, 'raw', `${l.id}.mp3`), aiff = path.join(vo, 'raw', `${l.id}.aiff`), wav = path.join(vo, 'trim', `${l.id}.wav`);
  if (!fs.existsSync(mp3) && !fs.existsSync(aiff)) problems.push(`${l.id}: no voice clip (tts)`);
  else if (!fs.existsSync(mp3)) problems.push(`${l.id}: placeholder voice only (tts without --placeholder)`);
  if (fs.existsSync(wav)) durs[l.id] = (fs.statSync(wav).size - 44) / 96000;
  else problems.push(`${l.id}: not trimmed (prep)`);
}

let ctx;
try { ctx = computeTimeline(video, lang); } catch (e) { problems.push(`timeline failed: ${e.message}`); }
if (ctx) {
  const TL = ctx.TL;
  const ids = script.map((l) => l.id).filter((id) => TL.vo && id in TL.vo);
  ids.forEach((id, i) => {
    const next = ids[i + 1];
    if (next && durs[id] != null && TL.vo[id] + durs[id] > TL.vo[next] - 0.1) problems.push(`${id} overlaps ${next} by ${(TL.vo[id] + durs[id] - TL.vo[next]).toFixed(2)}s`);
  });
  const cues = ctx.I18N && ctx.I18N[lang] && ctx.I18N[lang].cues;
  if (cues && TL.word) {
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
    for (const [name, [id, needle, nth]] of Object.entries(cues)) {
      const words = (ctx.VO_DATA && ctx.VO_DATA[id] && ctx.VO_DATA[id].words) || [];
      if (words.filter(([w]) => norm(w).startsWith(norm(needle))).length <= (nth || 0)) problems.push(`cue "${name}" (${id}: "${needle}") matched no spoken word; it uses an estimate`);
    }
  }
  const sc = Object.entries(TL.scenes || {}).map(([k, v]) => `${k} ${(typeof v === 'number' ? v : 0).toFixed(1)}`).join(' | ');
  console.log(`${video.id}/${lang}: ${TL.duration.toFixed(1)}s, ${script.length} lines\nscenes: ${sc}`);
}
const ledger = path.join(video.dir, 'vo', 'cost-ledger.json');
if (fs.existsSync(ledger)) console.log(`Eden AI spend: $${JSON.parse(fs.readFileSync(ledger, 'utf8')).reduce((a, b) => a + (b.cost || 0), 0).toFixed(3)}`);
console.log(problems.length ? `${problems.length} problem(s):\n  - ${problems.join('\n  - ')}` : 'no problems found');
process.exit(problems.length ? 1 : 0);
