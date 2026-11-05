// Live preview of every video: node tools/server.mjs [port]  ->  http://127.0.0.1:<port>/index.html?video=<id>
// Space plays/pauses, arrow keys seek, ?t=12.5 opens at a time, ?lang=fr picks a language.
// Needs the video's mix (videos/<id>/out/<lang>/mix.m4a, from the score step) for sound.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, serve } from './lib.mjs';

const { url } = await serve(Number(process.argv[2] || 8080));
for (const id of fs.readdirSync(path.join(ROOT, 'videos')).sort()) {
  if (!id.startsWith('_') && fs.existsSync(path.join(ROOT, 'videos', id, 'video.json'))) console.log(`${url}/index.html?video=${id}`);
}
