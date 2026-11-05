# CLAUDE.md

Monorepo for OpenHEXA videos: deterministic JavaScript animations (DOM + SVG, no framework), Eden
AI voiceover, a score synthesized in Python, rendered frame by frame to MP4. One folder per
video in `videos/`, everything shared in `core/`, `assets/` and `tools/`.

## Read only what the task needs

| You are... | Read |
| --- | --- |
| making a new video | `docs/playbook.md`, then `videos/_template/` (it already runs) |
| showing the OpenHEXA app | `docs/app-facts.md` (verified labels EN/FR, sidebar, sample data, doc URLs): do **not** re-explore the openhexa-app code unless the video covers something it doesn't list |
| looking for a visual building block | `docs/components.md` (catalog of core APIs and of reusable scenes in existing videos) |
| fixing audio, TTS or render issues | `docs/lessons.md` (known pitfalls and their fixes) |

Don't read the other videos' scenes wholesale; open the one file `docs/components.md` points to.

## Commands

```sh
npm install && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # once
npm run v -- list                         # videos, languages, durations
npm run v -- new <id> --title "..."       # scaffold from videos/_template
npm run v -- <id> tts [--placeholder]     # voiceover (Eden AI; key in .env); --lang xx for one language
npm run v -- <id> prep                    # trim clips + local Whisper word timings + gen/ data
npm run v -- <id> score                   # timeline -> synth score + master mix
npm run v -- <id> check                   # text-only sanity check: run before any render
npm run v -- <id> snap 3 12 30            # frames + contact sheet in out/<lang>/snaps/
npm run v -- <id> preview                 # 30 fps render + 720p copy
npm run v -- <id> render | srt            # final 1080p60 MP4, YouTube captions
npm run serve                             # live player: /index.html?video=<id>&lang=<xx>
```

## Rules

- **Frames are pure functions of time.** Scenes `build()` DOM once and `update(t)` sets styles
  from `t` only. No CSS transitions, timers, `Math.random()` or state carried between frames.
  Use `E.rand(seed)` for randomness. Read layout (`getBoundingClientRect`) only in `update`.
- **Accuracy is the brief.** Every UI label, flow and claim must match openhexa-app `main`.
  Use `docs/app-facts.md`; when you check something new in the app code, add it there with the
  source path, so the next video doesn't pay for it again. Mark illustrative content as such in
  the video's README.
- **Core changes affect every video.** Keep them backwards compatible. After touching `core/` or
  `tools/audio/synth.py`, snap and score one existing video and compare with its committed
  state (frames byte-identical, `mix.wav` md5 unchanged), as described in `docs/playbook.md`.
- **Cost:** Eden AI is capped at $10 per video (`VIDEO_BUDGET_USD`) and logged in
  `vo/cost-ledger.json`. Clips are committed, so only regenerate the lines you changed:
  `tts --lang fr s08 s11`.
- **Cheap review loop:** `check` (text) → `snap` contact sheet (one image) → `preview`. Look at
  sheets, not full-size frames; render at 60 fps only for the final.
- Work on a branch per video (`video/<id>`); core changes in their own PR.
- Comments explain why, not what. Keep the code style of the file you edit.
