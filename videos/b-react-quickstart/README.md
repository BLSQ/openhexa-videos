# OpenHEXA quick start for B-REACT users (EN)

A 5:42 narrated walkthrough for B-REACT consortium members (INRB, INSP and partners), many of them
data scientists. Adapted from the written guide "OpenHEXA quick-start for B-REACT users" (Nov 5,
2026). It covers joining, files, datasets, then **B-REACT access and sharing** (slides 11 to 13 of
the B-REACT deck: what each partner can access, how to get more data, how partners share their
work), notebooks and the Python and R SDKs, R in RStudio with an access token, pipelines, inviting
colleagues, web apps and AI, and creating your own organization. The B-REACT workspaces live in
Bluesquare's organization.

**Outputs** (`out/en/deliver/`, not committed): `openhexa-b-react-quickstart-en.mp4` (1920×1080,
60 fps, -14 LUFS), a 720p copy and `.srt` captions.

## Story

| Chapter | What the viewer sees | Narration |
| --- | --- | --- |
| Intro | Logo, "OpenHEXA for B-REACT partners" | s01 |
| Concept | The Bluesquare organization with three B-REACT workspaces. Files, Database, Pipelines, Notebooks and Web apps appear as named, then lock in place; "Datasets" travels from one workspace to the others. Then Viewer / Editor / Admin cards | s02–s04 |
| 1 · Join | The invitation email → **Join Now** → **Create your account** → the workspace home. From here on the sidebar shows the "Create your own organization" card | s05 |
| 2 · Files | Files → **Upload files** → dialog, file dropped, **Upload** → new row, download button highlighted | s06 |
| 3 · Datasets | Datasets list → **Create** → *Create a dataset* ("Weekly indicators") → **Create new version** → *Upload a new version* → Files tab Preview → Columns (Missing/Distinct highlighted) → pencil → annotation drawer (Unit, Source) → older version in the selector → **Download** → Access management → **Share with a workspace** → **Link**. A six-step checklist on the right | s07–s12 |
| 4 · B-REACT access & sharing | Slide 11 redrawn: the five data controllers (DSE, COUSP · DHIS2, INRB, Flowminder, MSF), "Hosted by Bluesquare on OpenHEXA"; partner rows (Oxford, Imperial, Pasteur, INRB, WHO) reading the controllers' data; Oxford and INRB each open a **restricted** workspace holding the ID data, telco data reaches Oxford only. Cut to Imperial's **Datasets** list, the **Workspace** column ringed. A request diagram: your workspace asks the data controller, your data sharing agreement, the dataset comes back. Slide 12: Oxford's cleaned contacts, made in its restricted workspace, land in Imperial, Pasteur, INRB and WHO ("Share with a workspace"). Oxford's pipeline page, **Publish as Template** → Imperial's **Available Templates**, **Create pipeline**, toast; caption "Templates are visible to every OpenHEXA workspace · Code, never data". Slide 13: a DSA on every partner, the DPA and DSA cards | b01–b09 |
| 5 · Code: notebooks | JupyterHub → JupyterLab launcher (Python 3, R) → a Python notebook: `from openhexa.sdk import workspace`, read a dataset by identifier into pandas, `create_dataset`, `create_version`, `add_file` | s13–s14 |
| 5 · Code: RStudio | RStudio: install from GitHub → Account settings in the browser, **Access tokens**, eye, copy → `login()` opens *Log in to OpenHEXA* (Server, API token, then Workspace, **Continue**) → console confirms → the same login with `token = Sys.getenv("OPENHEXA_TOKEN")`, `server_url`, `workspace` → `get_dataset_file`, `create_dataset`, `create_dataset_version`, `add_dataset_file`, `publish_webapp` with a plotly chart in the Viewer | s15–s19 |
| 6 · Pipelines | DHIS2 extraction → **Run** → *Run pipeline* → run page with **Outputs**. Then **Create** → *Create a pipeline*: From Template, From Notebook, "From OpenHEXA CLI →" highlighted in turn | s20–s21 |
| 7 · Team | Settings → Members → **Add/Invite member** → *Invite new user* → Role **Viewer** → **Invite** | s22 |
| 8 · Apps & AI | Apps → **Create** → *Create a web app* → **Create with AI** → prompt → generating steps → editor with a dashboard preview and the AI Assistant chat. Then Data Studio **Generate** → SQL → results; callout lists the MCP clients | s23–s24 |
| Rules | "AI never sees more than your account can": same permissions as you, you review every proposal | s25 |
| Own organization | The sidebar card "Create your own organization" is clicked → Bluesquare Console (console.bluesquarehub.com) → "Your organization, you are its Owner" | s26 |
| Outro | docs.openhexa.com, "English and French", "Welcome aboard!" | s27 |

The full narration is in `script.json`.

## Accuracy

Labels and flows were checked against openhexa-app `main` at `4c2a83b4f` (29 Oct 2026) and
BLSQ/openhexa-sdk-r v0.1.2. The findings are in `docs/app-facts.md`, under "Joining, files and
datasets in depth", "Own organization, access tokens, SDKs and AI web apps" and "Shared datasets
and pipeline templates across workspaces". The B-REACT chapter's architecture comes from slides 11
to 13 of the B-REACT deck and their speaker notes, reviewed by the B-REACT team.

| Claim on screen or in the narration | Source |
| --- | --- |
| Workspaces hold files, a database, pipelines, notebooks and web apps; datasets are what is shared with other workspaces | `docs/en/workspaces.md`, `docs/en/datasets.md`; `.../[sourceWorkspaceSlug]/access.tsx`; R package README |
| Viewers download and run pipelines; Editors upload, publish datasets, use notebooks and create pipelines; only Admins manage members | permission table in `docs/en/workspaces.md` |
| Invitation email, "Join Now"; "Create your account"; registering accepts the invitation and opens the workspace | `invite_new_user.mjml`, `workspaces/utils.py`; `pages/register.tsx`; `resolve_register` |
| Workspace sidebar items, order and icons; help button | `WorkspaceLayout/Sidebar.tsx` (via `core/app-ui.js`) |
| "Create your own organization" card at the bottom of the sidebar, its texts and gradient, shown to users with no organization of their own, opening the Bluesquare Console | `ExternalCollaboratorNotice.tsx`; `CONSOLE_URL` in `.env.dist` |
| The Console creates the organization with the user as Owner | `resolve_create_organization` in `backend/hexa/user_management/schema/mutations.py` |
| Files upload dialog and download buttons | `UploadObjectDialog.tsx`, `BucketExplorer.tsx` |
| Datasets list, Create a dataset, dataset header, Upload a new version, Files tab, column statistics, annotation drawer, Access management, link dialog | `datasets/…` components listed in `docs/app-facts.md` |
| JupyterHub notebooks run Python or R, with the SDK installed and signed in | `docs/en/notebooks.md` (code cells in Python, R); R package README ("preinstalled in OpenHEXA notebooks… configured"); Python SDK usage in `docs/en/notebooks.md` |
| Python: `workspace.get_dataset`, `latest_version.get_file(...).download_url`, `workspace.create_dataset(name, description)`, `create_version`, `add_file`, `workspace.files_path` | `openhexa/sdk/workspaces/current_workspace.py`, `openhexa/sdk/datasets/dataset.py` |
| R package installed with `remotes::install_github("BLSQ/openhexa-sdk-r")` | openhexa-sdk-r README |
| Tokens under Account settings → Access tokens, one per workspace; eye reveals, copy button; Viewers get none | `AccountAccessTokens.tsx`, `WorkspaceAccessTokenCell.tsx`; `login()` docs ("one per workspace") |
| `login()` in RStudio opens the "OpenHEXA" dialog: "Log in to OpenHEXA", Server "OpenHEXA (api.openhexa.org)", API token, help text, then Workspace and "Continue" | `R/login_gadget.R` (needs shiny and rstudioapi) |
| Console: `✔ Authenticated as … on https://api.openhexa.org.`, `✔ Using workspace … ("slug").` | `R/client.R` (`login`, `set_workspace`) |
| `login(token = Sys.getenv("OPENHEXA_TOKEN"), server_url = "https://api.openhexa.org", workspace = …)` | openhexa-sdk-r README example |
| `get_dataset_file`, `create_dataset(...)$slug`, `create_dataset_version`, `add_dataset_file`, `publish_webapp(name, htmlwidget)` | `R/datasets.R`, `R/webapps.R`, README |
| Pipeline Run dialog and Outputs; Create a pipeline with Create with AI, From Template, From Notebook and "From OpenHEXA CLI →" | `RunPipelineDialog.tsx`, `runs/[runId].tsx`; `docs/app-facts.md` (pipelines); Python SDK README (CLI) |
| Members tab and invite dialog | `InviteMemberDialog.tsx`, `UserPicker.tsx` |
| Create a web app: "Create with AI", "From code", "iFrame" (Superset only when an instance exists); the AI form, its three progress steps, and an AI Assistant chat in the editor | `CreateWebappDialog.tsx`; `docs/app-facts.md` (AI assistant) |
| Data Studio "Generate"; MCP clients Claude, ChatGPT, Gemini CLI; the AI never gets more access than the user | `docs/app-facts.md`; `backend/hexa/mcp/models.py` `MCPUser` |
| B-REACT: data controllers and their data, partner workspaces, restricted workspaces for Oxford and INRB with COUSP's ID data, telco data to Oxford only, Oxford's cleaned contacts shared with Imperial, Pasteur, INRB and WHO, the contact cleaning pipeline shared with Imperial and Pasteur, the DPA (Bluesquare ↔ MoH and INSP) and each partner's bilateral DSA with the relevant data controllers | B-REACT deck slides 11–13 and speaker notes; review comments ("data controller", not "data owner"; requests go to the data controller, not Bluesquare) |
| A partner's Datasets list holds the datasets shared with it; the Workspace column names the source workspace | `datasets/index.tsx` (`dataset.workspace.name`) |
| "Publish as Template" first in the pipeline header; Available Templates cards with "Community", "Details", "Create pipeline"; "Successfully created pipeline …" | `PipelineLayout.tsx`, `TemplateCard.tsx`, `PipelineCreateFromTemplateButton` |
| Templates are visible to every OpenHEXA workspace | `resolve_pipeline_templates` has no user or organization filter; creating from one only needs `create_pipeline` in your workspace |
| Docs at docs.openhexa.com in English and French | `docs/app-facts.md` (docs site) |

**Simplifications**
- **One user.** Grace is a workspace Admin, so every button in the walkthrough is visible.
  The B-REACT chapter's app cuts (Imperial's and Oxford's workspaces) keep her in the sidebar too.
- **Two datasets.** The datasets chapter switches from the dataset just created ("Weekly
  indicators", one version) to an established one ("Weekly cases by zone") at the preview step, so
  the version selector has older versions to pick.
- **The web-app editor** is drawn as a preview next to an AI Assistant chat. Its exact layout
  wasn't checked.
- **RStudio** is a generic mock-up of the IDE.
- **The Bluesquare Console** is drawn as a diagram, not as a copy of its pages.
- **Requests for more data** are drawn as a diagram, not as an app flow: the app has no request
  button; the data controller shares the dataset with "Share with a workspace".
- **Publish as Template**: the cursor points at the button and the video cuts to Available
  Templates; the publish dialog (template name, description, "Confirm publishing") isn't shown.

**Not checked:** EN only. Plans, pricing and free-trial terms in the Console are not claimed. The
JupyterLab kernel names ("Python 3 (ipykernel)", "R") are the usual Jupyter defaults, not checked
on app.openhexa.org.

**Spotted in passing:**
- `docs/en/notebooks.md` in openhexa-app still says there is no R SDK.
- The Datasets chapter's list shows absolute dates under "Last updated"; the app shows relative
  ones ("2 days ago"), as the B-REACT chapter's list does.

## Illustrative content

Real, from the B-REACT deck: the partner and data controller names, their data labels (Aggregated
alerts, Line lists · ID, Telco data…), "Cleaned contacts", the contact cleaning pipeline, the DPA and
DSA.

Not from a real workspace:
- workspaces "B-REACT Surveillance", "B-REACT Laboratory", "B-REACT Analysis", "MVE-17 Response", and the DR Congo flag on them;
- people (Grace Mbuyi, Patrick Kabongo, Joseph Ilunga, Sarah Mukendi, paul@partner.org) and their emails;
- the workspace homepage text; file names, sizes and dates;
- datasets, identifiers, versions, changelogs, columns, health-zone codes (ZS-01…), every number and the annotations;
- the notebook and R code's names and outputs; the access token string; the R Environment and Viewer content;
- pipelines "DHIS2 extraction" and "Weekly SitRep", their parameters and run outputs;
- the web apps, the AI prompt, the generated dashboard and the assistant's reply;
- the B-REACT workspaces "Imperial" and "Oxford" as app screens (names, slugs, flag), the datasets' dates and creators (Esther Lunda is new), the "Contact cleaning" pipeline page and template card, the "DHIS2 extraction" template card;
- the Data Studio question and results (the tutorial `covid_data` table, as in getting-started).

## Production

- **Voice:** Eden AI → ElevenLabs `eleven_multilingual_v2`, Matilda. 36 lines, $0.72 in all (`vo/cost-ledger.json`), including the earlier versions of the video.
  - v2 reused the 9 unchanged takes from v1 under their new IDs. v3 added b01–b09 (the B-REACT chapter) without renumbering, so every earlier take was kept.
  - Every take was transcribed without a prompt to catch garbled words. s21 ("SDK" cut short) and s17 (heard as "In our studio") were regenerated.
  - b07's word timings skip its opening "Code can travel, too." (the audio has it), so its cue uses "its" and the pipeline chip keys off the line's start.
- **Score:** the shared song form (`music.py`), with an energy level per chapter.
- **Screens beyond `core/app-ui.js`** live in `pages.js`, the B-REACT chapter lives in `scenes/035-breact.js` and the RStudio chapter in `scenes/045-rstudio.js`.
  - `pages.js` also adds a few Heroicons (copied from the app's `@heroicons/react`) and the DR Congo flag.
  - `core/` is unchanged.

```sh
npm run v -- b-react-quickstart tts && npm run v -- b-react-quickstart prep && npm run v -- b-react-quickstart score
npm run v -- b-react-quickstart check && npm run v -- b-react-quickstart render && npm run v -- b-react-quickstart deliver
```
