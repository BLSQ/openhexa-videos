# OpenHEXA videos

All OpenHEXA videos in one repo: product explainers, onboarding and feature launches. Each video
is a deterministic JavaScript animation (DOM + SVG, no frameworks) with an AI voiceover (Eden AI
→ ElevenLabs), a score synthesized from scratch in Python, rendered frame by frame to 1080p60
MP4 with YouTube captions.

| Video | Languages | Length | What |
| --- | --- | --- | --- |
| [`marketing`](videos/marketing/) | EN | 0:57 | What OpenHEXA is and the problems it solves; free-trial CTA |
| [`mcp-connector`](videos/mcp-connector/) | EN | 1:00 | The MCP connector: bring your agents, keep control |
| [`getting-started`](videos/getting-started/) | EN, FR | 1:46 / 2:00 | Onboarding for new sign-ups: first workspace, the modules, where the docs are |

## Quick start

```sh
npm install                                    # puppeteer-core + ffmpeg-static
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env                           # EDEN_AI_API_KEY=... (only for new voiceover)

npm run v -- list
npm run v -- getting-started score --lang fr   # timeline + score + mix (no API calls)
npm run v -- getting-started render --lang fr  # -> videos/getting-started/out/fr/openhexa-getting-started-fr.mp4
npm run serve                                  # live player with sound: /index.html?video=getting-started&lang=fr
```

Voice clips, word timings and generated timing data are committed, so rebuilding an existing
video costs nothing. Only `tts` calls Eden AI. Its spend is logged per video and capped at $10.

## A new video

```sh
git switch -c video/pipeline-templates
npm run v -- new pipeline-templates --title "OpenHEXA: pipeline templates" --langs en,fr
```

This scaffolds a working three-scene video on the shared kit. Then follow
[`docs/playbook.md`](docs/playbook.md): facts, script, placeholder-voice timing, scenes, real
voice, render.

## Layout

```
index.html            player for every video: ?video=<id>&lang=<xx>[&render=1&t=12]
core/                 shared animation code (engine, brand UI, OpenHEXA app mock-ups, stage, timeline kit, CSS)
assets/               fonts, logos, connector icons, docs.openhexa.com captures
tools/                CLI (cli.mjs) + tts, prep, render, snap, srt, check, new-video; audio/synth.py, song.py, words.py
videos/<id>/          video.json, script.json, scenes/, timeline, music.py, vo/ (clips), gen/ (timing data), out/ (renders, ignored)
videos/_template/     what `new` copies
docs/                 playbook, app facts (verified UI labels EN/FR), component catalog, lessons learned
```

[`CLAUDE.md`](CLAUDE.md) is the short version for AI agents working in this repo.
