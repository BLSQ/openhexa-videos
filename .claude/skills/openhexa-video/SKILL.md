---
name: openhexa-video
description: Make, edit, translate or re-render OpenHEXA videos — product explainers, feature-launch videos, onboarding and tutorial walkthroughs, in-app or YouTube clips — as narrated, animated 1080p MP4s with AI voiceover (English and French), faithful mock-ups of the real OpenHEXA app, a synthesized score and captions. Use this whenever someone asks for a video, animation, demo, explainer, promo or walkthrough about OpenHEXA or one of its features (pipelines, datasets, files, database, Data Studio, connections, web apps, MCP connector, AI assistant, workspaces), or wants to change the script, voice, language or visuals of an existing OpenHEXA video, even if they don't mention this skill or the openhexa-videos repo.
---

# OpenHEXA videos

The openhexa-videos kit renders a video from code. A video folder holds:
- deterministic JavaScript scenes (DOM + SVG, every frame a pure function of time t);
- a script, voiced through Eden AI (ElevenLabs);
- a Python-synthesized score.

Headless Chrome renders it frame by frame. Three finished videos (marketing, mcp-connector,
getting-started EN/FR) and a working template are included. Most new videos are mostly reuse:
facts, components and whole scenes already exist.

## 1. Set up (every session, first)

```sh
bash <this skill's folder>/scripts/setup.sh        # add --no-whisper in a slow or restricted sandbox
```

The script finds the kit:
- a checkout of BLSQ/openhexa-videos;
- else a clone of it;
- else the copy bundled with this skill, unpacked into `./openhexa-videos`.

It then installs what's missing and prints a capability report. Its last line is `KIT=<path>`:
`cd` there; every command below runs from it.

The report shows what's possible:
- No Chrome means no frames: you can still write the script, voice and score, but say clearly
  that rendering must happen elsewhere.
- No Eden AI network access or no key means placeholder voice only.
- No local Whisper means word timings come from Eden AI, which costs a few cents.

[references/cloud.md](references/cloud.md) covers each environment (claude.ai, Claude Code
cloud, local): long renders, where to save outputs, getting the work back into git.

**Eden AI key.** It's needed only for new voiceover.
- If `EDEN_AI_API_KEY` is neither set nor in `$KIT/.env`, ask the user for it.
- Write it with `printf 'EDEN_AI_API_KEY=%s\n' "<key>" > .env`.
- Never echo it, log it or put it in a file that gets committed or delivered.

## 2. Read only what the task needs

The docs live in the kit's `docs/` folder. The same files are also in this skill's `references/`.

| Task | Read |
| --- | --- |
| any new video, or a big change | `docs/playbook.md`: the whole loop with checkpoints |
| showing the app (labels, sidebar, pages, flows, EN/FR strings, sample data, doc URLs) | `docs/app-facts.md`, verified against openhexa-app. Use it instead of exploring the app code; only check the code for something it doesn't cover, then add your finding to it |
| visuals | `docs/components.md`: core APIs (`E`, `UI`, `AppUI`, `TLKit`) and reusable scenes in the three videos |
| something breaks or sounds wrong (TTS spelling, timing, render) | `docs/lessons.md` |

Open a specific scene file only when `components.md` points you to it. Reading whole videos wastes context.

## 3. The loop

```sh
npm run v -- new <id> --title "OpenHEXA: <feature>" --langs en,fr   # working 3-scene video in videos/<id>/
# edit videos/<id>/script.json (narration), i18n.js (copy + cues), scenes/, timeline.js
npm run v -- <id> tts --placeholder && npm run v -- <id> prep && npm run v -- <id> score   # free timing pass
npm run v -- <id> check                       # text-only; fix what it reports before rendering
npm run v -- <id> snap 2 6 10 14              # frames + out/<lang>/snaps/sheet.png: look at the sheet
npm run v -- <id> tts && npm run v -- <id> prep && npm run v -- <id> score && npm run v -- <id> check   # real voice
npm run v -- <id> preview                     # 30 fps render + 720p copy
npm run v -- <id> render && npm run v -- <id> deliver --to <dir>   # 1080p60 master, then shareable mp4 + 720p + .srt
```

`--lang fr` limits any step to one language. Before writing anything, agree with the user on:
- audience;
- languages;
- target length (about 150 spoken words a minute in EN; FR runs ~20% longer);
- the key claims;
- the call to action.

## 4. What makes these videos good (and why)

- **Accurate to the product.** People will click what they saw. Every label, button and flow
  comes from `docs/app-facts.md` or the openhexa-app code, in each language. French uses the app's
  real French strings, even the untranslated ones. Anything illustrative (sample names,
  numbers) goes in the video's README.
- **Synced to the voice.** Visual beats hang off narration words (`TL.cue('name')` from
  `i18n.js`), and the timeline derives from the clips. A FR voice 20% slower then still lands every
  beat. After the real voice arrives, re-snap the tight moments: real clips run faster or slower
  than the placeholder.
- **Deterministic.** `build()` creates the DOM once and `update(t)` only sets styles from `t`.
  No transitions, timers or `Math.random()`; use `E.rand(seed)`. Parallel render workers each
  start mid-video, so state carried between frames produces glitches at the segment joins.
- **Cheap review.** Each step gives more confidence for more cost: `check` (text), one
  contact sheet, then a preview, then the final render. Contact sheets cost far fewer tokens than
  full-size frames.
- **Cost-aware.** Voice clips are committed and only missing lines are generated. Regenerate
  only the lines you changed (`tts --lang fr s08`). Spend is logged in `vo/cost-ledger.json` and
  capped at $10 per video.

## 5. Finish

- Run `check` clean, then scan a contact sheet of the final file for blank frames, text
  overflowing cards and glitches.
- Deliver the mp4 (with its 720p copy) and the `.srt` captions. Say what you couldn't verify,
  for example that you can't listen to the mix.
- Update `videos/<id>/README.md`: story, accuracy table (claim → source), illustrative content,
  cost.
- Get the source back to the team: push a `video/<id>` branch when git access works, otherwise
  hand over a zip of `videos/<id>` and any core change. See [references/cloud.md](references/cloud.md).
