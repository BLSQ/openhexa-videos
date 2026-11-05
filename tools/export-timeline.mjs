// Runs a video's timeline scripts (classic browser scripts) in a sandbox and writes the resulting
// TL object to videos/<id>/out/<lang>/timeline.json for the Python mixer and the other tools.
//   node tools/export-timeline.mjs <video> [--lang en]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, loadVideo, langOf, outDir } from './lib.mjs';

export function computeTimeline(video, lang) {
  const ctx = { LANG: lang, VIDEO: { ...video, dir: `videos/${video.id}/` }, console };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  const files = [...(video.gen || []).map((f) => f.replace('{lang}', lang)), ...(video.timeline || [])];
  for (const f of files) vm.runInNewContext(fs.readFileSync(f.startsWith('core/') ? path.join(ROOT, f) : path.join(video.dir, f), 'utf8'), ctx, { filename: f });
  if (!ctx.TL) throw new Error(`${video.id}: timeline scripts did not define TL`);
  return ctx;
}

export function exportTimeline(video, lang) {
  const { TL } = computeTimeline(video, lang);
  const file = path.join(outDir(video, lang), 'timeline.json');
  fs.writeFileSync(file, JSON.stringify(TL, null, 1));
  return { file, TL };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const video = loadVideo(process.argv[2]);
  const lang = langOf(video, process.argv);
  const { file, TL } = exportTimeline(video, lang);
  console.log(`wrote ${path.relative(process.cwd(), file)} (${TL.duration}s)`);
}
