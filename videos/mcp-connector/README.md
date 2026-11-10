# OpenHEXA MCP connector: bring your agents, keep control

A marketing video for the OpenHEXA MCP connector: bring the AI agent you already use, with
governance built in. English cut 69 s, French cut 83 s (1920×1080, 60 fps, AAC 48 kHz, -14 LUFS).

**Watch:** `out/<lang>/openhexa-mcp-connector-<lang>.mp4` once rendered, or the live player
(`npm run serve`, then `/index.html?video=mcp-connector&lang=fr`).

## Story

| Time | Scene | Narration |
| --- | --- | --- |
| 0:00 | **Hook**: an ungoverned agent reaches for patient records, credentials, pipelines and the warehouse | "AI agents can now do real data work. But would you hand one the keys to your health data? What can it see? What can it change?" |
| 0:08 | **Connect**: logo reveal; Claude, ChatGPT, Gemini CLI and any MCP agent plug into OpenHEXA; a governance shield closes | "With the OpenHEXA MCP connector, bring the agent you already use. Claude, ChatGPT, Gemini, or any agent that speaks MCP... with governance built in." |
| 0:20 | **Scope**: the real consent screen: pick workspaces, then Read & Write / Read / No access per resource | "You choose exactly which workspaces it can reach, which resources it can use, and whether it can only read, or also write." |
| 0:27 | **Ceiling**: the agent's grant sits inside your own access; a workspace you cannot open stays closed; connection credentials are masked | "It acts with your permissions, never more. If you can't open a workspace, neither can your agent. And connection secrets stay out of reach." |
| 0:36 | **Work**: real MCP tool calls build a dataset preview, a pipeline that writes and runs itself, and a dashboard, live in the workspace | "Then just ask. In minutes, your agent explores the data, writes and runs a pipeline, and publishes a dashboard." |
| 0:43 | **Payoff**: the result stays in the workspace: a versioned pipeline and a web app workspace members can open | "And the result stays in your workspace: a versioned pipeline, and a web app your team can open." |
| 0:50 | **Record**: the tool call log (successes and a refusal); the pipeline is plain Python | "Every call is logged, and every result is code you can read." |
| 0:53 | **Control**: Account → MCP connections; Pipelines narrowed to Read; the agent's next `run_pipeline` is refused | "Change your mind? Narrow or revoke access at any time. It applies on the very next call." |
| 0:59 | **Vision**: least privilege, secrets never exposed, every call logged, open standard | "Responsible AI, by design." |
| 1:01 | **CTA**: lockup, "Bring your agents. Keep control.", "Start your free trial" | "OpenHEXA. Bring your agents. Keep control. Start your free trial today." |

## Accuracy

Every claim on screen is traceable to the openhexa-app code (paths relative to that repository):

| Claim | Source |
| --- | --- |
| OAuth consent where you choose workspaces and tools; first authorization starts read-only | `frontend/src/pages/mcp/authorize.tsx` |
| Per-resource Read & Write / Read / No access; resource labels and descriptions | `frontend/src/mcp/features/MCPPermissionMatrix/MCPPermissionMatrix.tsx` |
| Read and write tools granted separately, grouped by resource | `backend/hexa/mcp/protocol.py` (`tool(write=...)`), `backend/hexa/mcp/models.py` (`MCPResource`) |
| The agent never reaches more than its person can | `backend/hexa/mcp/models.py` (`MCPUser`), `backend/hexa/mcp/tests/test_access_ceiling.py` |
| Connection field values never exposed (names only); no SQL execution | `docs/en/ai.md` (MCP server section), `backend/hexa/mcp/tools/connections.py` |
| Every tool call logged, refused ones included | `backend/hexa/mcp/protocol.py` (`call_tool` → `ToolCall`) |
| Refusal text "The OpenHEXA connection for Claude is not authorized to call run_pipeline." | `backend/hexa/mcp/protocol.py` (`_refusal_message`) |
| Narrow or revoke from Account → MCP connections, effective on the next call | `frontend/src/mcp/features/AccountMCPConnections/AccountMCPConnections.tsx`, `docs/en/ai.md` |
| "21 of 36 tools": 36 grantable tools; Pipelines read → write adds 5 | `backend/hexa/mcp/tools/*.py` |
| Clients: Claude, ChatGPT, Gemini CLI, and any MCP client (standard OAuth + JSON-RPC endpoint) | `frontend/src/pages/mcp/wiki.tsx`, `backend/hexa/mcp/views.py` |
| A created pipeline is versioned; a web app is visible to workspace members | `backend/hexa/mcp/tools/pipelines.py` (`create_pipeline`), `backend/hexa/mcp/tools/webapps.py` |

Vision copy follows [Responsible AI in health data](https://www.openhexa.com/responsible-ai-in-health-data-building-trust-through-design/)
and [OpenHEXA connector permissions](https://www.openhexa.com/mcp-server-openhexa-connector-choose-permissions/).
Workspaces, datasets, figures, people and the `you@health.org` account are illustrative. Claude, ChatGPT
(OpenAI) and Gemini marks come from [simple-icons](https://simpleicons.org) and belong to their owners.

## French version

The same animation renders in French with `?lang=fr` (83 s, narrated by the ElevenLabs voice
"Caroline" on the `eleven_v4` model, chosen over `multilingual_v2` after native-speaker review). On-screen text goes through `L(en, fr)` (`lang.js`) in each scene; the recreated app screens use
openhexa-app's French strings (see `docs/app-facts.md`), while the MCP server's refusal
message stays in English, as the server returns it. French scenes cue on the same English word keys:
`FR_ANCHORS` in `timeline.js` maps each one to the French word spoken at that moment, and
`CUTS.fr` holds the longer French scene timings.

French demo names follow French conventions: « Paludisme Burkina Faso », `indicateurs-paludisme-hebdo`,
`cas_hebdo.csv`, numbers like « 1 284 » and weeks like « S42 ». Native-speaker review asked for two
rewordings, now in the script: « peuvent » instead of « savent » in the first line, and « jamais au-delà »
instead of « jamais plus », whose silent s read as "never again".

## Cost

Eden AI spend: see `vo/cost-ledger.json` (about $0.63 for both languages, including voice samples
and the French re-voicing), well under the $10 budget.

## Build (repo root; see `docs/playbook.md`)

```sh
npm run v -- mcp-connector prep       # trim the committed clips
npm run v -- mcp-connector score      # timeline + score + mix per language (no API calls)
npm run v -- mcp-connector check
npm run v -- mcp-connector render     # 1080p60 -> videos/mcp-connector/out/<lang>/
npm run v -- mcp-connector deliver    # shareable 1080p, 720p and .srt
npm run serve                         # live: /index.html?video=mcp-connector&lang=en|fr
```

Word timings are committed (`words.js`, `words.fr.js`; `"words": "none"` in `video.json`). English
timings came from Eden AI (Deepgram nova-3); French ones from local Whisper, since Eden AI ignores the
language for Deepgram. Scenes cue on English word keys; `FR_ANCHORS` in `timeline.js` maps them to the
French words, and `CUTS` holds each language's scene timings. `music.py` derives its sections (work,
vision, CTA, click) from the timeline, so both cuts get a fitted arrangement.

Files: `video.json` (manifest, voices), `script.json` (narration, both languages), `lang.js` (`L()`),
`words*.js`, `timeline.js`, `brand.js` (assistant logos, `UI.brand`), `scenes/`, `stage.js`,
`music.py`, `vo/<lang>/raw` (Eden AI clips), `vo/<lang>/words`, `vo/cost-ledger.json`.
