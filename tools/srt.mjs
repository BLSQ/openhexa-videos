// YouTube-ready captions from the script and the language's timeline:
//   node tools/srt.mjs <video> --lang en   -> videos/<id>/out/<lang>/openhexa-<id>-<lang>.srt
// Long lines are split at sentence/clause boundaries into cues of at most two 42-character
// lines, timed proportionally to their length within the clip.
import fs from 'node:fs';
import path from 'node:path';
import { loadVideo, langOf, readTimeline, outDir } from './lib.mjs';

const video = loadVideo(process.argv[2]);
const lang = langOf(video, process.argv);
const script = JSON.parse(fs.readFileSync(path.join(video.dir, 'script.json'), 'utf8'))[lang].lines;
const tl = readTimeline(video, lang);
const clipDur = (id) => (tl.voDur ? tl.voDur[id] : null);
const MAX = 84;

function chunks(text) {
  if (text.length <= MAX) return [text];
  const parts = text.match(/[^.!?:;,]+[.!?:;,]?\s*/g).map((s) => s.trim());
  const out = [];
  let cur = '';
  for (const p of parts) {
    if (cur && (cur + ' ' + p).length > MAX) { out.push(cur); cur = p; } else cur = cur ? cur + ' ' + p : p;
  }
  if (cur) out.push(cur);
  return out;
}
function wrap(s) {
  if (s.length <= 42) return s;
  const mid = s.length / 2;
  let best = -1;
  for (let i = 0; i < s.length; i++) if (s[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return s.slice(0, best) + '\n' + s.slice(best + 1);
}
const ts = (x) => {
  const ms = Math.round(x * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
// Hand-timed videos have no clip durations in the timeline: fall back to the next line's start.
const ids = script.map((l) => l.id);
const durOf = (id, i) => clipDur(id) ?? Math.max(1, (i + 1 < ids.length ? tl.vo[ids[i + 1]] : tl.duration - 1) - tl.vo[id] - 0.3);

let n = 0;
const cues = [];
script.forEach((line, li) => {
  const start = tl.vo[line.id], dur = durOf(line.id, li);
  const cs = chunks(line.text);
  const total = cs.reduce((a, c) => a + c.length, 0);
  let t = start;
  cs.forEach((c, i) => {
    const d = (c.length / total) * dur;
    const endT = i === cs.length - 1 ? start + dur + 0.3 : t + d;
    cues.push(`${++n}\n${ts(t)} --> ${ts(endT)}\n${wrap(c)}\n`);
    t += d;
  });
});
const out = path.join(outDir(video, lang), `openhexa-${video.id}-${lang}.srt`);
fs.writeFileSync(out, cues.join('\n'));
console.log('wrote', path.relative(process.cwd(), out), n, 'cues');
