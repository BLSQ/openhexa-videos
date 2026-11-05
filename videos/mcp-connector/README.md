# OpenHEXA MCP connector: 60-second explainer (pure JavaScript animation)

A marketing video for the OpenHEXA MCP connector: bring the AI agent you already use, with
governance built in. Built in plain JavaScript (DOM + SVG, no frameworks) with a synthesized
score and an AI voiceover. The engine, renderer and mixer come from the general OpenHEXA video
(`BLSQ/openhexa-marketing-video`); the script, scenes and score arrangement are new.

**Watch:** `out/en/openhexa-mcp-connector-en.mp4` once rendered (1920×1080, 60 fps, AAC 48 kHz, -14 LUFS), or
open the live version in a browser (see below).

## Story

| Time | Scene | Narration |
| --- | --- | --- |
| 0:00 | **Hook**: an ungoverned agent reaches for patient records, credentials, pipelines and the warehouse | "AI agents can now do real data work. But would you hand one the keys to your health data? What can it see? What can it change?" |
| 0:08 | **Connect**: logo reveal; Claude, ChatGPT and Gemini CLI plug into OpenHEXA through MCP; a governance shield closes | "With the OpenHEXA MCP connector, bring the agent you already use. Claude, ChatGPT, Gemini... with governance built in." |
| 0:17 | **Scope**: the real consent screen: pick workspaces, then Read & Write / Read / No access per resource | "You choose exactly which workspaces it can reach, which resources it can use, and whether it can only read, or also write." |
| 0:25 | **Ceiling**: the agent's grant sits inside your own access; a workspace you cannot open stays closed; secrets are masked | "It acts with your permissions, never more. If you can't open a workspace, neither can your agent. And connection secrets stay out of reach." |
| 0:33 | **Work**: real MCP tool calls build a dashboard; the tool call log records successes and a refusal; the pipeline is plain Python | "Then it gets real work done. Exploring datasets, building pipelines, publishing web apps. Every call is logged, and every result is code you can read." |
| 0:44 | **Control**: Account → MCP connections; Pipelines narrowed to Read; the agent's next `run_pipeline` is refused | "Change your mind? Narrow or revoke access at any time. It applies on the very next call." |
| 0:50 | **Vision**: least privilege, secrets never exposed, every call logged, open standard | "Responsible AI, by design." |
| 0:52 | **CTA**: lockup, "Bring your agents. Keep control.", "Start your free trial" | "OpenHEXA. Bring your agents. Keep control. Start your free trial today." |

## Accuracy

Every claim on screen is traceable to the code in this repository:

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
| Clients: Claude, ChatGPT, Gemini CLI | `frontend/src/pages/mcp/wiki.tsx` |

Vision copy follows [Responsible AI in health data](https://www.openhexa.com/responsible-ai-in-health-data-building-trust-through-design/)
and [OpenHEXA connector permissions](https://www.openhexa.com/mcp-server-openhexa-connector-choose-permissions/).
Workspaces, datasets, figures and the `you@health.org` account are illustrative.

## Cost

Eden AI spend: see `vo/cost-ledger.json` (about $0.16 for TTS and word timings), well
under the $10 budget.

## Build (repo root; see `docs/playbook.md`)

```sh
npm run v -- mcp-connector score      # timeline + score + mix from the committed clips (no API calls)
npm run v -- mcp-connector render     # 1080p60 -> videos/mcp-connector/out/<lang>/
npm run v -- mcp-connector srt        # captions
npm run serve                     # live: /index.html?video=mcp-connector
```

Files: `video.json` (manifest, voices), `script.json` (narration), `timeline.js`, `scenes/`,
`stage.js` (background hooks), `music.py` (arrangement; DSP in `tools/audio/synth.py`),
`vo/<lang>/raw` (Eden AI clips), `vo/cost-ledger.json`.
