# OpenHEXA quick start for B-REACT users (EN)

A 2:33 narrated walkthrough for B-REACT consortium members (INRB, INSP and partners), adapted
from the written guide "OpenHEXA quick-start for B-REACT users" (Nov 5, 2026). It covers what
members do most: joining, files, datasets (the longest chapter, as in the guide), pipelines,
inviting colleagues and AI. It shows no code.

**Outputs** (`out/en/`, not committed): `b-react-quickstart-en.mp4` (1920×1080, 60 fps, -14 LUFS),
a 720p copy and `.srt` captions.

## Story

| Chapter | What the viewer sees | Narration |
| --- | --- | --- |
| Intro | Logo, "OpenHEXA for B-REACT partners", "No coding needed" | s01 |
| Concept | Three B-REACT workspaces, each with Files / Database / Pipelines locked inside; a dataset travels from one workspace to the others. Then Viewer / Editor / Admin cards | s02–s03 |
| 1 · Join | The invitation email → **Join Now** → **Create your account** (name, password) → the workspace home | s04 |
| 2 · Files | Files → **Upload files** → dialog, file dropped, **Upload** → new row, download button highlighted. Callout: visible to every member, no personal data | s05–s06 |
| 3 · Datasets | Datasets list (pinned cards, Workspace column) → **Create** → *Create a dataset* → **Create new version** → *Upload a new version* (name, changelog, files) → Files tab Preview → Columns (Missing/Distinct highlighted) → pencil → annotation drawer (Unit, Source, PII) → version selector (older version) → **Download** → Access management → **Share with a workspace** → *Create a new link* → **Link**. A six-step checklist on the right | s07–s12 |
| 4 · Pipelines | Pipelines → DHIS2 extraction → **Run** → *Run pipeline* (parameters, Advanced settings) → run page with **Outputs**. Then *Available Templates* → **Create pipeline** | s13–s14 |
| 5 · Team | Settings → Members → **Add/Invite member** → email → *Invite new user* → Role **Viewer** → **Invite**. Callout: pick the lowest role that fits | s15 |
| 6 · AI | Data Studio **Generate** (question → SQL → results), then the *Create a pipeline* dialog with **Create with AI**. Callout lists Data Studio, Create with AI and MCP clients | s16 |
| Rules | "AI never sees more than your account can": same permissions as you, review every proposal, no personal data in prompts | s17 |
| Outro | docs.openhexa.com, "English and French", "Welcome aboard!" | s18 |

The full narration is in `script.json`.

## Accuracy

Labels and flows were checked against openhexa-app `main` at `4c2a83b4f` (29 Oct 2026). New
findings were added to `docs/app-facts.md` under "Joining, files and datasets in depth".

| Claim on screen or in the narration | Source (openhexa-app) |
| --- | --- |
| Files, database and pipelines belong to a workspace; datasets are shared with other workspaces or the organization | `docs/en/datasets.md`; `DatasetLink`; `.../[sourceWorkspaceSlug]/access.tsx` |
| Viewers download and run pipelines; Editors upload, publish datasets and create pipelines; only Admins manage members | permission table in `docs/en/workspaces.md` |
| Invitation email: subject, heading, "Join Now" button (pink), dark header with white logo | `backend/hexa/workspaces/utils.py`, `templates/workspaces/mails/invite_new_user.mjml` |
| "Create your account" page: Email address (disabled), First name, Last name, Password, Confirm Password, "Create account" | `frontend/src/pages/register.tsx` |
| Registering accepts the invitation, logs you in and opens the workspace | `resolve_register` in `backend/hexa/user_management/schema/mutations.py`; `pages/workspaces/index.tsx` |
| Workspace sidebar items, order and icons; help button | `workspaces/layouts/WorkspaceLayout/Sidebar.tsx` (via `core/app-ui.js`) |
| Files: "Create a folder", "Upload files"; dialog "Upload files in workspace", "Drop files or folders here", "Upload" / "Uploading: n%"; download icon on file rows only | `UploadObjectDialog.tsx`, `BucketExplorer.tsx` |
| Datasets list: "Create", pinned cards above "All datasets", columns Name / Last updated / Created by / Workspace, star to pin | `pages/workspaces/[workspaceSlug]/datasets/index.tsx`, `PinDatasetButton` |
| "Create a dataset" with required Name and Description | `CreateDatasetDialog.tsx` |
| Dataset header: star, "Create new version"; name with version picker "{name} - {date}"; tabs General / Files / Access management | `datasets/layouts/DatasetLayout.tsx` |
| "Upload a new version": tabs Using SDK / Upload files; Name ("Version name. ex: v2"), Changelog, Files dropzone text; Close / Create, "Creating (n%)" | `UploadDatasetVersionDialog.tsx` |
| Files tab: file list, Download button, Created at / Created by / Type / Size, Preview / Columns, "Rows in dataset" | `DatasetExplorer.tsx`, `DatasetVersionFileSample.tsx` |
| Columns: Basic Statistics (Distinct, Missing with %, Constant), Numeric Statistics (Mean, Median, Maximum shown), data-type tag, attribute tags "Label: value", pencil on hover | `DatasetVersionFileColumns.tsx` |
| Annotation drawer: Description ("Enter a description for this column"), Attributes, "Attribute" button, Label / Value, Close / Save, toast "Metadata updated." | `ColumnMetadataDrawer.tsx` |
| Access management: "Share with the whole Organization" toggle and its help text, "Share with a workspace", table Workspace / Created At / Created By / Revoke; dialog "Create a new link to '{name}'", Workspace, Link | `access.tsx`, `DatasetLinksDataGrid.tsx`, `LinkDatasetDialog.tsx` |
| Pipeline page "Run"; dialog "Run pipeline" with parameters and "Advanced settings" ("Pipeline version, notifications and logs"); Cancel / Run | `PipelineLayout.tsx`, `RunPipelineDialog.tsx` |
| Run page "Outputs" section with files and tables | `pages/.../runs/[runId].tsx`, `PipelineRunDataCard` |
| Available Templates: publisher badge (organization name or "Community"), "Create pipeline", toast "Successfully created pipeline {name}" | `TemplateCard.tsx`, `TemplateBadge.tsx`, `PipelineCreateFromTemplateButton.tsx` |
| Members tab, "Add/Invite member", "Add or invite member", User, "Invite new user: {email}", Role (default Viewer), Invite, "Member invited successfully" | `InviteMemberDialog.tsx`, `UserPicker.tsx` |
| Data Studio "Generate" writes SQL from a question; "Create with AI" in Create a pipeline (and web apps); MCP clients Claude, ChatGPT, Gemini CLI | `docs/app-facts.md` (AI assistant, MCP connector) |
| The AI acts with the user's own permissions and never gets more access | `backend/hexa/mcp/models.py` `MCPUser` (access ceiling); guide section 8 |
| Docs at docs.openhexa.com in English and French (`/fr/`) | `docs/app-facts.md` (docs site) |

**Simplifications.** The video shows one user, Grace, as a workspace Admin so that every button
in the walkthrough is visible. The datasets chapter switches from the dataset just created
("Validated alerts", one version) to an established one ("Weekly cases by zone") when it reaches
previews, so the version selector has older versions to pick. The AI chapter shows Data Studio and
the pipeline dialog; it does not show the web-app dialog or the MCP setup screens.

**Not checked:** EN only, so no French strings were needed. The organization AI budget and the
app.openhexa.org EU hosting from the guide are not claimed in the video.

## Illustrative content

Not from a real workspace:
- organization "B-REACT"; workspaces "B-REACT Surveillance", "B-REACT Laboratory", "B-REACT Analysis", "MVE-17 Response"; the DR Congo flag on them;
- people (Grace Mbuyi, Patrick Kabongo, Joseph Ilunga, Sarah Mukendi, paul@partner.org) and their emails;
- the workspace homepage text; file names, sizes and dates in Files;
- datasets, identifiers, versions, changelogs, file names, columns, health-zone codes (ZS-01…), every number in previews and statistics, and the annotations;
- pipelines "DHIS2 extraction" and "Weekly SitRep", their parameters, run outputs, and the four templates;
- the Data Studio question and results (the tutorial `covid_data` table, as in getting-started).

## Production

- Voice: Eden AI → ElevenLabs `eleven_multilingual_v2`, Matilda. 18 lines, $0.31
  (`vo/cost-ledger.json`). Every take was transcribed without a prompt to catch garbled words.
- Score: the shared song form (`music.py`), energy per chapter.
- Screens beyond `core/app-ui.js` live in `pages.js` (register, files with upload, datasets list,
  dataset page with version / link dialogs and column drawer, pipeline run, templates,
  members). It also adds a few Heroicons (copied from the app's `@heroicons/react`) and the DR
  Congo flag; `core/` is unchanged.

```sh
npm run v -- b-react-quickstart tts && npm run v -- b-react-quickstart prep && npm run v -- b-react-quickstart score
npm run v -- b-react-quickstart check && npm run v -- b-react-quickstart render
```
