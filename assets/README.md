# Assets

Shared images, logos and fonts for every video. Reference a file from a scene with its path
relative to the repo root, for example `assets/logos/unicef.jpg`. `UI.hexTile()` loads from
`icons/`.

Sources:
- **app:** openhexa-app `main` (2026-11-18). Files from `frontend/public/` and `docs/assets/images/`
  are copied unchanged.
- **deck:** the sales deck "OpenHEXA: Turning data into actions". Images were
  extracted at their embedded resolution, with transparency kept where the deck has it.

PNGs with transparency are drawn for a dark background unless the note says otherwise. A JPG has
a white or photo background.

## `brand/`: OpenHEXA

| File | Source | Notes |
| --- | --- | --- |
| `wordmark-white.svg`, `wordmark-black.svg` | app | Logo with "OpenHEXA" text, vector. White for dark backgrounds. |
| `favicon.png` | app | Small square mark. |
| `mark-gradient.png` | deck | Hex mark with the pink gradient, 337×385. |
| `hex-gradient.png`, `hex-pink.png`, `hex-violet.png` | deck | Plain filled hexagons, for badges and bullets. |
| `hex-outline-gradient.png` | deck | Hexagon outline, pink to violet. |

Animatable versions of the logo are in `core/ui.js` (`UI.logoMark`, `UI.wordmark`). Prefer those
in motion; use these files for stills and backgrounds.

## `products/`: Bluesquare products

| File | Notes |
| --- | --- |
| `iaso-hex.png`, `iaso-wordmark.png` | IASO (the wordmark has dark text: use it on a light background). |
| `dhis2-wordmark.png` | DHIS2, dark text. |
| `dhis2-hosting-hex.png` | Blue hex that the deck pairs with DHIS2 hosting and configuration. |
| `local-hosting-hex.png` | Green hex: local (on-premises) hosting. |
| `service-packs-hex.png` | Orange hex: support service packs. |

## `logos/`: partners and funders

Existing: `who.png`, `world-bank.png`, `polio.png`, `pathways.svg`, `dpg-alliance.png`,
`dhis2-tech-partner-lg.png`.

Added from the deck: `unicef.jpg`, `itm-antwerp.jpg` (Institute of Tropical Medicine),
`gates-foundation.png`, `path.png`, `msh.png`, `quamed.png`, `ginger.png`, `aedes.png`,
`lifenet.png`, `sonder-collective.png`, `dpg-recognized-badge.png` ("Recognized by the Digital
Public Goods Alliance" pill).

Most have dark text: put them on a white card, as in `videos/marketing/scenes/07-trust.js`. Show
a partner logo only where the claim is true (the deck lists them under "OpenHEXA already
powers").

## `ai/`: AI assistants that connect through MCP

`claude.png`, `chatgpt.png`, `gemini-cli.png`, `cursor.png`, `glm.png`, `copilot.png`,
`windsurf.png`, `mistral.png`, all 256×256 with transparency. Some are dark marks (ChatGPT,
Cursor, GLM, Copilot, Windsurf): put those on a light tile. These are third-party trademarks, so
use them only to show that an assistant connects to OpenHEXA's MCP server, as the deck does.

## `personas/`

`data-engineer.png` (gear), `data-scientist.png` (chart and magnifier) and `domain-expert.png`
(brain shield), in pink. The `-red` versions are from the deck's "pain points" slide.

## `illustrations/`

| File | Shows |
| --- | --- |
| `data-silos-1.png` … `-3.png` | Scattered data dots on pink panels (the problem). |
| `platform-integrate-manage-publish.png` | Sources feeding the OpenHEXA hex, then Integrate / Manage / Publish. |
| `feature-integrate.png` | Template and custom pipelines (AI assistant) into storage. |
| `feature-store-query-share.png` | Workspace database, files and datasets, Data Studio, sharing a dataset. |
| `feature-analyze-publish.png` | Notebooks, dashboards, automated reports, web apps (AI assistant). |
| `ai-assistants-flow.png` | Prompt → AI assistant → pipeline → dataset → AI assistant → dashboard. |
| `ai-pipeline-assistant.jpg` | Screenshot: AI assistant next to the pipeline code editor. |
| `ai-webapp-assistant.jpg` | Screenshot: AI assistant building a web app. |
| `mcp-chat.jpg` | An external assistant calling OpenHEXA MCP tools. |
| `footprint-map.png` | World map with Bluesquare's countries in pink (250+ projects). |
| `email-flow.png`, `email-services.png` | Banners from the app's emails (`backend/hexa/static/img/email/`). |

The deck diagrams have semi-transparent panels drawn for the navy background. They are raster and include their text in English, so use them as quick stills or
as references for a rebuilt animated scene, not for FR videos.

## `backgrounds/`

`hex-navy.jpg` is the deck's navy background with a faint hex grid (2048×1152). `hex-overlay.png`
is the same grid on transparency, to lay over any colour. `UI.hexPattern()` draws the grid as
vector when it must move or scale.

## `photos/`

`community-health-workers-bw.jpg`, `health-worker-phone-bw.jpg` and `tablet-hands-bw.jpg`, all
black and white. They come from the deck, so check their licence before using them in a public
video.

## `reference/app-docs/`

The screenshots from docs.openhexa.com (openhexa-app `docs/assets/images/`, one folder per
module), for checking layouts and labels while building mock-ups. They are not meant to be shown
on screen: some show real names and e-mail addresses, and they are English only.

## Other folders

| Folder | Contents |
| --- | --- |
| `fonts/` | Inter variable, JetBrains Mono |
| `img/` | white logo, website tab screenshots, dengue dashboard, MCP server, AI pipelines |
| `icons/` | data sources for `UI.hexTile`: DHIS2, IASO, Kobo, ODK, OpenLMIS, Postgres, GCS, CSV, Excel, Parquet, FHIR, ERA5, WorldPop |
| `app/` | the app's connection icons and logo |
| `docs/` | full-page docs.openhexa.com captures, EN/FR |
