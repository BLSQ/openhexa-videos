// Scaffolds videos/<id> from videos/_template: a working three-scene video (intro, feature in the
// real app UI, end card) on the shared timeline kit and song-form score.
//   node tools/new-video.mjs <id> [--title "OpenHEXA: Pipeline templates"] [--langs en,fr]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, parseArgs } from './lib.mjs';

const { opts, rest } = parseArgs(process.argv.slice(2));
const id = rest[0];
if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('usage: npm run v -- new <id> [--title "..."]  (id: lowercase, digits, dashes)');
const dst = path.join(ROOT, 'videos', id);
if (fs.existsSync(dst)) throw new Error(`videos/${id} already exists`);
fs.cpSync(path.join(ROOT, 'videos', '_template'), dst, { recursive: true });
const manFile = path.join(dst, 'video.json');
const man = JSON.parse(fs.readFileSync(manFile, 'utf8'));
man.title = opts.title || `OpenHEXA: ${id.replace(/-/g, ' ')}`;
if (opts.langs) man.langs = String(opts.langs).split(',');
fs.writeFileSync(manFile, JSON.stringify(man, null, 2) + '\n');
console.log(`created videos/${id} ("${man.title}", ${man.langs.join('+')})

Next (docs/playbook.md has the whole loop):
  1. write the narration in videos/${id}/script.json and the on-screen copy + cues in i18n.js
  2. npm run v -- ${id} tts --placeholder && npm run v -- ${id} prep && npm run v -- ${id} score
  3. npm run v -- ${id} check && npm run v -- ${id} snap 2 8 14
  4. real voice: npm run v -- ${id} tts && npm run v -- ${id} prep && npm run v -- ${id} score
  5. npm run v -- ${id} preview, then render and srt`);
