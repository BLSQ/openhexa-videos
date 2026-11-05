# OpenHEXA — Getting started video (EN + FR)

A short onboarding video for new OpenHEXA users, meant for the in-app welcome pop-up and YouTube.
Built the same way as the marketing video: plain JavaScript (DOM + SVG) animation, AI voiceover
(Eden AI), a score synthesized from scratch, rendered frame by frame to MP4.

**Outputs** (`out/`): `openhexa-getting-started-en.mp4`, `openhexa-getting-started-fr.mp4`
(1920×1080, 60 fps, AAC 48 kHz, -14 LUFS) and matching `.srt` captions for YouTube.

## Story

| Chapter | What the viewer sees | Narration (EN) |
| --- | --- | --- |
| Welcome | Logo build, "Welcome to OpenHEXA" | "Welcome to OpenHEXA! Here's a quick tour to get you started." |
| Concept | Organization → workspaces; a workspace holds data, code and results | "In OpenHEXA, everything lives in workspaces…" |
| 1 · Create a workspace | Organization page → **Create Workspace** → dialog (name, country, *Add tutorial content*) → database + storage provisioned | "Let's create your first one…" |
| 2 · Explore the modules | The workspace sidebar, module by module: Files, Database, Data Studio, Datasets, Connections, Pipelines, JupyterHub, Apps, Settings. Each has a callout with its docs link | One line per module |
| 3 · Learn more | docs.openhexa.com (live captures) and the in-app **?** help button | "Every module has a step-by-step guide at docs.openhexa.com…" |
| Outro | "Create your first workspace" | "Now it's your turn…" |

## Accuracy

Everything on screen is taken from the OpenHEXA app source (`openhexa-app` main, Oct 2026):

- The sidebar order, labels, icons (Heroicons) and colors come from `WorkspaceLayout/Sidebar.tsx`.
- Every button, column, tab and dialog label comes from the page components, and the French
  strings come from `frontend/public/locales/fr/messages.json`. Some app strings are
  intentionally left untranslated, as in the app ("workspace", connection type names,
  "Static"/"Superset", the default workspace homepage text).
- The create-workspace flow matches `CreateWorkspaceDialog.tsx`. A new organization with no
  workspace lands on the organization page, and the creator becomes the workspace Admin.
- The Files, Database and JupyterHub views show the real tutorial content:
  - files: `README.MD`, `covid_data.csv`, `demo.ipynb`;
  - table: `covid_data`, 1,502 rows;
  - notebook cells and histogram: computed from that data.
- Help-topic links come from the pages' `helpLinks`. The docs URLs were checked live, in EN and
  under `/fr/`.

Illustrative content (not from a real workspace):
- the other workspace and dataset names;
- the connections, pipeline cards and members;
- the provisioning overlay.

## Build (repo root; see `docs/playbook.md`)

```sh
npm run v -- getting-started score --lang fr      # timeline + score + mix from the committed clips (no API calls)
npm run v -- getting-started render --lang fr     # 1080p60 -> videos/getting-started/out/<lang>/
npm run v -- getting-started srt --lang fr        # captions
npm run serve                     # live: /index.html?video=getting-started
```

Files: `video.json` (manifest, voices), `script.json` (narration), `timeline.js`, `scenes/`,
`stage.js` (background hooks), `music.py` (arrangement; DSP in `tools/audio/synth.py`),
`vo/<lang>/raw` (Eden AI clips), `vo/cost-ledger.json`.
