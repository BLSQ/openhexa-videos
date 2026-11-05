# Playbook: a new OpenHEXA video

From brief to rendered EN/FR videos with the least back-and-forth. Each step names the command
and what to check before moving on.

## 0. Branch and scaffold

```sh
git switch -c video/<id>
npm run v -- new <id> --title "OpenHEXA: <feature>" --langs en,fr
```

`videos/<id>/` now holds a working three-scene video: intro, feature in the real app UI, end
card. Edit it rather than starting from a blank page.

| File | What you change |
| --- | --- |
| `video.json` | title, languages, voices (EN Matilda and FR Caroline are the house voices), script order |
| `script.json` | narration: `{ "<lang>": { "lines": [{ id, scene, text, say? }] } }` |
| `i18n.js` | on-screen copy per language and `cues` (narration words the visuals sync to) |
| `timeline.js` | gaps between lines, sound effects; scenes and timing come from the voiceover |
| `scenes/*.js` | one file per scene (`E.scene({ name, from, to, build, update })`) |
| `music.py` | `song.render(energy={scene: 0..3})`, or a custom arrangement |
| `stage.js` (optional) | background mood, persistent layers (see `videos/getting-started/stage.js`) |
| `README.md` | story table, accuracy table (claim → source file), what is illustrative |

## 1. Facts first

List the claims the video makes, then confirm each one:
- **UI labels, flows, sample data, doc links:** `docs/app-facts.md`.
- **Anything new:** check it in openhexa-app (`frontend/src`, `frontend/public/locales/fr/messages.json`,
  `backend/hexa`), then append it to `docs/app-facts.md` with its source path.

The README's accuracy table maps each claim to its source.

## 2. Script

- Keep lines to one or two sentences each, one line per visual beat; each line gets its own clip.
- A minute of narration is about 150 words in EN, and FR runs about 20% longer.
- `scene` groups lines; a scene starts 0.6 s before its first line (`lead` in `timeline.js`).
- Use `say` for pronunciation, e.g. "Open Hexa" or "docs dot open hexa dot com". For French, see
  `docs/lessons.md` (SQL as "esse-ku-elle", notebook as "notbouk").
- Write FR from the app's French labels: the button says « Créer un espace de travail », and the
  dialog title is « Créer un workspace ».

## 3. Timing with a placeholder voice (free)

```sh
npm run v -- <id> tts --placeholder && npm run v -- <id> prep && npm run v -- <id> score
npm run v -- <id> check
```

macOS `say` gives realistic durations, so the scenes can be built before spending anything.
Placeholder clips sound robotic; never ship them (`check` flags them).

## 4. Scenes

- Start from `docs/components.md`: core components (`E`, `UI`, `AppUI`) and reusable scenes in
  other videos (consent screen, pipeline canvas, tool-call log, partner logos, docs browser...).
- Sync visuals to words: `TL.cue('name')` (declared in `i18n.js`), `TL.word('s04', 'upload')`,
  `TL.vo.s04`, `TL.end('s04')`, `TL.scenes.feature`.
- Review with `npm run v -- <id> snap 2 6 10 14 ...`, then look at `out/<lang>/snaps/sheet.png`.

## 5. Real voice

```sh
npm run v -- <id> tts            # only missing lines; or: tts --lang fr s08 s11 to redo some
npm run v -- <id> prep && npm run v -- <id> score && npm run v -- <id> check
```

- `check` must report no problems. It catches clips that overlap, sync cues that matched no
  spoken word, and missing or placeholder clips.
- Re-snap the tight moments, because the real voice is faster or slower than the placeholder.
- Use Whisper as a proxy for pronunciation: if it transcribes a garbled phrase, regenerate that line.

## 6. Render

```sh
npm run v -- <id> preview        # 30 fps + 720p copy, ~1 min of render per minute of video
npm run v -- <id> render         # 1080p60 final, ~3 min per language
npm run v -- <id> srt            # captions for YouTube
```

Outputs land in `videos/<id>/out/<lang>/`, which is gitignored. Before shipping:
- Scan a contact sheet of the final file for blank frames, glitches at segment joins, and
  text overflowing cards:
  `ffmpeg -i out.mp4 -vf "fps=1/3.5,scale=480:270,tile=6x6" -frames:v 1 sheet.png`
- Listen to the result yourself. The levels are measured (-14 LUFS, ducking), but taste is not.

## 7. Wrap up

- Update the video's README: story, accuracy, illustrative content, Eden AI cost.
- Commit `vo/` (raw clips, words, cost ledger) and `gen/`. They are small, and they let anyone
  rebuild without paying for the voice again.
- Never commit `out/` or `.env`.

## Regression check after core changes

```sh
npm run v -- getting-started snap --out /tmp/before 3 22 40 72   # on main, before your change
npm run v -- getting-started snap --out /tmp/after 3 22 40 72    # after
for f in /tmp/before/t*.png; do cmp -s $f /tmp/after/$(basename $f) || echo "differs: $f"; done
npm run v -- getting-started score --lang en && md5 videos/getting-started/out/en/mix.wav   # compare before/after
```

Chrome can differ by 1/255 on a few anti-aliased pixels, which is not a change. Anything
larger is a change.
