# Components

What already exists, so a new video reuses it instead of rebuilding it. Signatures are short;
open the file for details.

## Core (`core/`, loaded for every video)

### `engine.js`: `E`, deterministic animation

| API | Use |
| --- | --- |
| `E.scene({ name, from, to, build(root), update(t) })` | register a scene; `from` and `to` are seconds or functions returning them |
| `E.prog(t, t0, dur, ease)` | eased 0→1 progress over [t0, t0+dur] |
| `E.window(t, a, b, in, out)` | 0→1→0 over [a, b] with fade-in and fade-out times |
| `E.ease.*` | outCubic, outQuart, outBack, outBackSoft, outSpring, inOutCubic, inOutSine, outExpo... |
| `E.set(el, { x, y, s, sx, sy, r, o, blur, filter })` | transform, opacity and filter in one write; cached, so cheap every frame |
| `E.h(tag, attrs, children)` | DOM/SVG element; `attrs.style` object, `text`, `html` |
| `E.text`, `E.css`, `E.attr`, `E.show` | cached setters for text, a CSS property, an attribute, display |
| `E.headline(lines, cls)` + `E.revealWords(words, t, times)` | headline whose words rise out of a mask, timed to the narration |
| `E.hexPath(w, h, r)` | rounded hexagon path data |
| `E.rand(seed)` | deterministic PRNG |
| `E.lerp`, `E.clamp`, `E.map`, `E.noise1` | math helpers |

### `ui.js`: `UI`, website-style components

| API | Use |
| --- | --- |
| `UI.logoMark(height, id)` → `{ el, hex, glyph, outline }` | animatable logo mark |
| `UI.wordmark(height)` → `{ el, letters[] }` | "OpenHEXA" letters, for staggered reveals |
| `UI.hexTile(iconFile, size)` | white hexagon with a connector icon from `assets/icons/` |
| `UI.windowCard(url, { w, h, light })` → `{ el, body }` | browser window card |
| `UI.cursor()` | macOS arrow cursor |
| `UI.svgIcon(name, size, color)` | stroke icons |
| `UI.heroIcon(name, size, color, sw)` | Heroicons 24/outline (the app's icon set; names in `core/heroicons.js`) |
| `UI.numHex(n)` | number in a violet hexagon (website tabs) |
| `UI.hexPattern(w, h, r)` | background hex grid |
| `UI.flag(code)` | CSS flag: bf, ci, sn, ml, ne |
| `FLAGS[code]` | SVG flag: bf, sl, ci |
| `UI.typeText(el, text, t, t0, cps, caret)` | typewriter effect |

`UI.svgIcon` names: db, file, table, lock, shield, check, x, spark, chart, doc, globe, clock, send,
link, play, users, code, calendar, template, key, eye, pencil, alert, plug, flow, terminal, list,
unlock, user, ban, dataset, app, log.

### `app-ui.js` + `app-strings.js` + `css/app.css`: `AppUI`, the OpenHEXA web app

Load it by adding `"coreCss": ["app.css"], "coreJs": ["app-strings.js", "app-ui.js"]` to `video.json`.

- Mock-ups are built at the app's real CSS size: a 1000×676 window. Scale it with `E.set(win.el, { s: 1.28 })`.
- Labels come from `APP_DEFAULTS[LANG]` (EN/FR, verified), which `I18N[LANG]` keys override.
- Pages animate on named beats: `AppUI.beats[name]` if set, else `TL.cue(name)`.

| API | Beats it uses |
| --- | --- |
| `AppUI.window()` → `{ el, body, setUrl(path) }` | browser chrome with an `app.openhexa.org` URL bar |
| `AppUI.wsSidebar()` → `{ el, items, navEl, setActive(key, p) }`; `AppUI.orgSidebar()` | workspace and organization sidebars (keys in `AppUI.NAV`) |
| `AppUI.orgPage()` → `{ el, create }` | empty organization page with "Create Workspace" |
| `AppUI.createDialog()` | create-workspace dialog (name, country menu, tutorial checkbox) |
| `AppUI.homePage()` | default workspace homepage |
| `AppUI.filesPage()` → `{ upload }` | `upload` (a new file row appears) |
| `AppUI.databasePage()` | tables and connection sections |
| `AppUI.studioPage()` → `{ gen, run }` | `generateSql`, `aiSql` (question typed, SQL typed, results) |
| `AppUI.datasetsPage()` → `{ ver }` | `versioned`, `shareDs` (version menu, then the Access tab) |
| `AppUI.connectionsPage()` | `connectionsStart`, `connectionsSpan` (cards pop in) |
| `AppUI.pipelinesPage()` → `{ create, opts }` | `template`, `withAi`, `runPipeline`, `schedule` |
| `AppUI.notebooksPage()` | `explore` (histogram output) |
| `AppUI.webappsPage()` | `dashboards`, `aiAssistant` |
| `AppUI.settingsPage()` | `roleAdmin`, `roleEditor`, `roleViewer`, `settingsEnd` |
| `AppUI.btn(label, kind, icon)`, `AppUI.pill(label, color)` | buttons (primary blue, white, ...) and badges |

CSS classes for custom app screens:
- `.ox-*`: window, header, page, card, table, tabs, dialog, input, menu, help button, ring.
- `.co-panel` with `.co-title`, `.co-desc` and `.co-doc`: the navy callout beside the window.

### `stage.js`: shared stage

- Provides the background (navy, glows, hex grid), grain, vignette, fades and the player.
- A video customizes it through `window.STAGE = { build, background, overlays, update, fade, tealAlpha }`:
  - `videos/marketing/stage.js`: muted → vivid mood with a flash on the logo reveal;
  - `videos/getting-started/stage.js`: calm background under the app window, chapter stepper.

### `timeline-kit.js`: `TLKit.build(opts)`

- Builds a data-driven timeline: scenes and cues come from the voiceover.
- Gives `TL.cue`, `TL.word`, `TL.end`, `TL.fx`, `TL.blip`, and `TL.outroHit` (the music downbeat on the end card).

## Tools (`tools/`)

- `audio/synth.py`: DSP, instruments, sound effects and mastering.
  - Sound-effect types for `TL.sfx`: whoosh, riser (dur), impact, shimmer, swell, click, blip (note, pan), error, key, tick, pop.
- `audio/song.py`: `song.render(energy={scene: 0..3}, music_db=-25, motif_scenes=[...])`, a complete score and mix.
- Everything else is reached through `npm run v -- ...` (see `CLAUDE.md`).

## Reusable scenes in existing videos

Copy a scene into your video and adapt it, rather than importing it.

| Need | Where | Notes |
| --- | --- | --- |
| Problem / chaos: scattered sources failing to connect | `videos/marketing/scenes/01-chaos.js` | bezier links that break, connector hex tiles |
| Grind: copy, clean, re-export loop with a week counter | `videos/marketing/scenes/02-grind.js` | spreadsheet cells being fixed |
| Logo reveal with burst and sources connecting in | `videos/marketing/scenes/03-reveal.js` | pairs with the flash in `stage.js` |
| Integrate / Manage / Publish tabs: pipeline canvas, AI prompt, dashboard, web app | `videos/marketing/scenes/04-product.js` | website hero tab bar |
| Partner logos (WHO, World Bank, GPEI, Pathways, DPG, DHIS2) | `videos/marketing/scenes/07-trust.js` | `assets/logos/` |
| Website-style CTA ("Start your free trial") | `videos/marketing/scenes/08-cta.js` | |
| AI agent hook: an agent reaching for data | `videos/mcp-connector/scenes/01-hook.js` | |
| Agents (Claude, ChatGPT, Gemini) plugging in through MCP | `videos/mcp-connector/scenes/02-connect.js` | |
| Real MCP consent screen and permission matrix | `videos/mcp-connector/scenes/03-scope.js` | light app UI classes in its `video.css` |
| Access ceiling: grant inside your own access, masked secrets | `videos/mcp-connector/scenes/04-ceiling.js` | |
| Tool-call log building a dashboard, with a refusal | `videos/mcp-connector/scenes/05-work.js` | |
| Account → MCP connections; narrowing access | `videos/mcp-connector/scenes/06-control.js` | |
| Four-pillar "vision" card | `videos/mcp-connector/scenes/07-vision.js` | |
| Welcome headline with kicker and subline | `videos/getting-started/scenes/01-welcome.js` | |
| Organization → workspaces → data/code/results diagram | `videos/getting-started/scenes/02-concept.js` | |
| Full app walkthrough: cursor, dialog, typing, module tour with callouts | `videos/getting-started/scenes/03-app.js` | cursor keyframes and highlight ring helpers |
| Live docs page scrolling, plus the in-app help popover | `videos/getting-started/scenes/05-docs.js` | `assets/docs/` |
| End card with button and docs link | `videos/getting-started/scenes/06-outro.js` | |

## Assets (`assets/`)

| Folder | Contents |
| --- | --- |
| `fonts/` | Inter variable, JetBrains Mono |
| `img/` | white logo, website tab screenshots, dengue dashboard |
| `icons/` | data sources: DHIS2, IASO, Kobo, ODK, OpenLMIS, Postgres, GCS, CSV, Excel, Parquet, FHIR, ERA5, WorldPop |
| `logos/` | partners |
| `app/` | the app's own connection icons and logo |
| `docs/` | docs.openhexa.com captures, EN/FR |
