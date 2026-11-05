# OpenHEXA — 57-second explainer (pure JavaScript animation)

A marketing video for [OpenHEXA](https://www.openhexa.com/), built entirely in
plain JavaScript (DOM + SVG, no frameworks) with a synthesized score and an AI voiceover.

**Watch:** `out/en/openhexa-marketing-en.mp4` (1920×1080, 60 fps, AAC 48 kHz, -14 LUFS), or open the live
version in a browser (see below).

## Story

| Time | Scene | Narration |
| --- | --- | --- |
| 0:00 | **Chaos** — sources and stale files scattered everywhere, connections fail | "Your data lives everywhere. Health systems, surveys, spreadsheets, databases… and none of them talk to each other." |
| 0:07 | **The grind** — copy, clean, re-export, repeat; weeks tick by; everything collapses into one point | "So your team spends weeks copying, cleaning and re-exporting, instead of making decisions." |
| 0:15 | **Reveal** — logo bursts out, sources connect into it | "Meet OpenHEXA. The open-source data platform that brings it all together." |
| 0:20 | **1 · Integrate** — pipeline canvas, templates, Python, AI assistant | "Connect your sources and automate pipelines, from ready-made templates, your own Python, or with the built-in AI assistant." |
| 0:28 | **2 · Manage** — governed workspace, access control, cross-org sharing | "Every database, dataset and file lives in one secure workspace, shared on your terms." |
| 0:34 | **3 · Publish** — dashboard, scheduled report, web app built from a prompt | "Then turn it into dashboards, reports and web apps… with just a prompt." |
| 0:40 | **Trust** — WHO, World Bank, GPEI, Pathways, DPG, DHIS2 partner | "Trusted by the World Health Organization, the World Bank, and health programs around the world." |
| 0:46 | **CTA** — website hero headline, "Start your free trial" | "OpenHEXA. Turn your data into products your teams actually use. Start your free trial today." |

Visual language follows the new website: navy `#192041`, pink `#ff459a`, Inter 800 with tight
tracking, hexagon motifs, the Integrate / Manage / Publish tab bar, and the site's own
connector icons and partner logos (`assets/`).

## Cost

Eden AI spend: see `vo/cost-ledger.json` (≈ $0.12 for TTS, plus < $0.02 for Whisper
word-timing transcriptions) — well under the $10 budget.

## Build (repo root; see `docs/playbook.md`)

```sh
npm run v -- marketing score      # timeline + score + mix from the committed clips (no API calls)
npm run v -- marketing render     # 1080p60 -> videos/marketing/out/<lang>/
npm run v -- marketing srt        # captions
npm run serve                     # live: /index.html?video=marketing
```

Files: `video.json` (manifest, voices), `script.json` (narration), `timeline.js`, `scenes/`,
`stage.js` (background hooks), `music.py` (arrangement; DSP in `tools/audio/synth.py`),
`vo/<lang>/raw` (Eden AI clips), `vo/cost-ledger.json`.
