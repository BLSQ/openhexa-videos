# OpenHEXA app facts (verified)

Facts about the OpenHEXA web app that videos rely on, checked against
[BLSQ/openhexa-app](https://github.com/BLSQ/openhexa-app) `main` at commit `4c2a83b4f`
(29 Oct 2026) unless a row says otherwise.
- FR strings come from `frontend/public/locales/fr/messages.json`, keyed by the English string.
- Paths are relative to `frontend/src/` unless they start with `backend/` or `docs/`.
- When you verify something new, add it here with its source.

## Sign-up and first run

- **Self sign-up** (`pages/signup.tsx`) is only available when `allowSelfRegistration` is on.
  - Page: "Sign up", field "Email address", then "Check your email" ("This link will expire in 48 hours.").
  - `pages/register.tsx`: "Create your account", fields First name / Last name / Password / Confirm Password, button "Create account".
  - After registering, the user is logged in and sent to `/workspaces`.
- **Trial organizations** are created by the external Bluesquare Console through the `createOrganization` mutation.
  - The subscription stores limits and a monthly AI budget; the default is 10, the "OH free trial" plan, per `backend/hexa/user_management/models.py`.
  - The owner gets the OWNER role.
- **Landing logic** (`pages/workspaces/index.tsx`), in order:
  - the last visited workspace, else the first workspace;
  - with no workspace and exactly one organization: `/organizations/{id}`.
  - So a new trial user lands on the organization page.
  - With no workspace and no organization: "No workspace available".
- There is no welcome modal or onboarding wizard.

## Organization page (`pages/organizations/[organizationId]/index.tsx`)

- **Header:** an h1 with the org name, then a gray line "{n} workspaces" (FR keeps "workspaces").
- **Primary button:** "Create Workspace" → « Créer un espace de travail », with a Plus icon.
  - It is disabled at the plan limit, with the tooltip "You have reached the maximum number of workspaces for your plan."
- **Search:** "Search workspaces..." → « Rechercher des workspaces... ».
- **Workspace card:** flag (if exactly one country) + name + tags. Actions: "Tags" « Balises », "Settings" « Paramètres », "Archive" « Archiver ».
- **Org sidebar** (gray-800), with FR labels:
  - Workspaces « Espaces de travail »
  - Members « Utilisateurs »
  - External Collaborators « Collaborateurs externes »
  - Datasets « Jeux de données »
  - Settings « Paramètres »

## Create workspace dialog (`workspaces/features/CreateWorkspaceDialog/CreateWorkspaceDialog.tsx`)

| EN | FR |
| --- | --- |
| Create a workspace (title) | Créer un workspace |
| Workspace name * | Nom du workspace |
| Country / "Select a country" | Pays / Sélectionner un pays |
| Add the country flag to the workspace | Ajouter le drapeau du pays au workspace |
| Add tutorial content | Ajouter un tutoriel |
| Enabling this option will import tutorial content in your new workspace | L'activation de cette option permet d'importer le contenu du didacticiel dans votre nouveau workspace. |
| Cancel / Create | Annuler / Créer |

- The dialog has no description field.
- The country combobox shows the name only once picked; options show a 16×11 flag.
- **On create** (`backend/hexa/workspaces/models.py`):
  - a dedicated PostgreSQL database is provisioned, with read/write and read-only passwords;
  - a storage bucket is created;
  - the creator becomes workspace **Admin**;
  - the browser redirects to the new workspace.
- **Slug:** `slugify(name)`, plus a random suffix only on collision.
- **Tutorial content:**
  - files `README.MD` (601 B), `covid_data.csv` (539.2 kB) and `demo.ipynb` (31.4 kB) in the bucket;
  - table `covid_data` in the database: 1,502 rows, Mexican COVID-19 sample;
  - it does **not** change the homepage.
- **Default homepage** (English only, never translated): "# {name}", "Welcome to your new workspace "{name}"!" ... "Where to go from here?".

## Workspace sidebar (`workspaces/layouts/WorkspaceLayout/Sidebar.tsx`)

- **Layout:** gray-800 background, with a pink-500 bar on the active item.
- **Top:** a "‹ org" back-link, then the workspace switcher (flag + name + chevron).
- **Switcher menu:** "Search workspaces...", "Create a new workspace", "Add to favorites".

| # | EN | FR | Heroicon | Shown when |
| --- | --- | --- | --- | --- |
| 1 | Home | Accueil | HomeIcon | always |
| 2 | Files | Fichiers | FolderOpenIcon | always |
| 3 | Database | Base de données | CircleStackIcon | always |
| 4 | Data Studio + badge "New" | Data Studio + « Nouveau » | TableCellsIcon | always |
| 5 | Datasets | Jeux de données | Square2StackIcon | always |
| 6 | Connections | Connexions | SwatchIcon | always |
| 7 | Pipelines | Pipelines | BoltIcon | always (also active on /templates) |
| 8 | JupyterHub | JupyterHub | BookOpenIcon | Editor/Admin (`launchNotebookServer`) |
| 9 | Apps | Applications | GlobeAltIcon | `webappsEnabled` (WEBAPPS_DOMAIN set) |
| 10 | Settings | Paramètres | Cog6ToothIcon | Admin (`manageMembers`) |

- **Bottom user menu:** Account settings, Administration, MCP, Documentation, Sign out, Interface language.
- **Help button:** a round "?" fixed at the bottom right of every workspace page.
  - Popover: "Suggested help topics" « Sujets d'aide suggérés ».
  - Footer link: "Visit the OpenHEXA documentation homepage" « Visitez la page d'accueil de la documentation d'OpenHEXA ».
  - Without links, the button goes straight to docs.openhexa.com.
- **AI assistant:** no sidebar item. It appears in context, only when the org enables it (Organization settings → AI Assistant):
  - "Create with AI" in the create dialogs for pipelines and web apps;
  - an "AI Assistant" chat panel in the pipeline and web-app code editors;
  - "Generate" in Data Studio.

## Module pages

**Home**
- Markdown homepage. "Edit" « Editer » (primary), for Admin and Editor.

**Files**
- Breadcrumb "Files".
- Actions: Search… « Recherche... », a gear for "Show hidden files", "Create a folder" « Créer un dossier » (secondary), "Upload files" « Télécharger des fichiers » (primary).
- Columns: Name / Size / Last updated, in FR Nom / Taille / Dernière mise à jour.

**Database**
- Heading "Tables" « Tableaux »; columns Name / # Rows; rows read "1502 rows" « 1502 lignes ».
- Collapsible sections:
  - "Read-Only Connection" « Lecture seule », with "Recommended for visualization tools:";
  - "Read/Write Connection (Full Access)" « Écriture/Lecture (Accès complet) ».

**Data Studio**
- Header sub-tabs: Editor « Éditeur » / Saved queries « Requêtes sauvegardées ».
- Left panel: schema browser "Tables".
- Toolbar:
  - Query « Requête »
  - Save « Sauvegarder »
  - Max rows « Lignes max »
  - Generate « Générer » (indigo pill, Sparkles icon)
  - Format « Formater »
  - Export CSV « Exporter en CSV »
  - Run « Exécuter » (blue-600)
- AI placeholder: "Describe what you'd like to query…" « Décrivez ce que vous souhaitez interroger… ».
- Results panel: "Results" « Résultats ».
- Generate SQL produces one read-only SELECT. The model sees only the schema, never the data (`docs/en/ai.md`).

**Datasets**
- List: "Create" « Créer »; "All datasets"; columns Name / Last updated / Created by / Workspace.
- Detail tabs: General « Général » / Files « Fichiers » / Access management « Gestion de l'accès ».
- "Create new version" « Créer une nouvelle version »; the version picker reads "{name} - {date}".
- Datasets are versioned and shareable with other workspaces (`DatasetLink`) or org-wide.

**Connections**
- "Add connection" « Ajouter une connexion »; cards show icon + name, type label and description.
- Type labels are not translated:

| Type label | Icon |
| --- | --- |
| DHIS2 Instance | `assets/app/dhis2.svg` |
| IASO Account | `assets/app/iaso.svg` |
| PostgreSQL | `assets/app/postgres.svg` |
| Amazon S3 Bucket | `assets/app/s3.svg` |
| Google GCS Bucket | `assets/app/gcs.svg` |
| Custom « Sur mesure » | none |

**Pipelines**
- Tabs: Pipelines / Available Templates « Modèles disponibles ».
- Button: "Create" « Créer ».
- Card: name, a source badge (Notebook, Template « Modèle », From CLI), `code`, `v{n}`, description, "Last Run" « Dernière Exécution » + status.
- Statuses:

| EN | FR | Badge |
| --- | --- | --- |
| Succeeded | Réussi | emerald |
| Failed | Échec | red |
| Running | En cours d'exécution | sky |
| Queued | En attente | gray |
| Stopped | Arrêtée | yellow |

- Create dialog "Create a pipeline" « Créer un pipeline »:
  - "Create with AI" « Créer avec l'IA » / "Describe what you want, AI writes the code";
  - "From Template" « À partir du modèle » / "Start from a shared template";
  - "From Notebook" « Du carnet de notes » / "Use a Jupyter notebook";
  - a "From OpenHEXA CLI →" link;
  - "Close" « Fermer ».
- Detail tabs: General, Runs « Exécutions », Scheduling and Notifications « Programmation et notifications », Code.
- Field "Schedule" « Programmation » (cron), with "Enabled" « Activé ».
- Runs are triggered manually, on a schedule or by webhook.

**JupyterHub**
- Page title "Notebooks"; loading text "Starting your Jupyter server...".
- The tutorial notebook `demo.ipynb` starts with `import pandas as pd`, `df = pd.read_csv("./covid_data.csv")`, then `df["AGE"].plot.hist()`.

**Apps**
- Page title "Web Apps" « Applications Web »; types Static, Superset, iFrame (not translated).
- Create dialog "Create a web app": "Create with AI"; "From code" « À partir du code »; Superset; "iFrame" « Intégrer un site web existant via son URL ».
- Apps are Public or Private « Privé ».

**Settings**
- Tabs General / Members « Utilisateurs » / Database; header button "Archive".
- Members: "Add/Invite member" « Ajouter/inviter utilisateur ».
  - Columns Name / Email / Role / Joined (FR Nom / E-mail / Rôle / Rejoint).
  - Invite dialog "Add or invite member"; roles Admin « Administrateur », Editor « Éditeur », Viewer « Lecture seule » (default Viewer).

## Roles

- **Workspace roles:** Admin, Editor, Viewer.
  - Viewers can launch pipelines but not create them or use notebooks.
  - See the permission table in `docs/en/workspaces.md`.
- **Organization roles:** Owner « Propriétaire », Admin, Member « Membre ». Owners and Admins see every workspace in the org.

## MCP connector (from the mcp-connector video, `backend/hexa/mcp/`)

- **Consent:** OAuth, where you choose workspaces and tools; the first authorization is read-only (`pages/mcp/authorize.tsx`).
- **Permissions:** Read & Write / Read / No access, per resource (`mcp/features/MCPPermissionMatrix/MCPPermissionMatrix.tsx`).
- **Ceiling:** an agent never gets more than its user can do (`backend/hexa/mcp/models.py` `MCPUser`, `tests/test_access_ceiling.py`).
- **Secrets and SQL:** connection field values are never exposed, and there is no SQL execution.
- **Logging:** every tool call is logged, refusals included (`protocol.py` `call_tool` → `ToolCall`).
- **Refusal text:** "The OpenHEXA connection for Claude is not authorized to call run_pipeline."
- **Revoking:** narrow or revoke from Account → MCP connections; it applies on the next call.
- **Clients documented:** Claude, ChatGPT, Gemini CLI (`pages/mcp/wiki.tsx`).

## Docs site (docs.openhexa.com, mkdocs + i18n folders)

- The EN pages are at `/<page>/` and the FR pages at `/fr/<page>/`.
- All of these return 200:
  - `workspaces/`, `files/`, `database/`, `datasets/`, `connections/`, `pipelines/`;
  - `notebooks/`, `static-webapps/`, `ai/`, `sql-widgets/`, `navigation/`.
- Data Studio has no dedicated page; `sql-widgets/` covers its charts.
- Captures for scenes: `assets/docs/{en,fr}-home-full.png` (refresh with `node tools/shoot-docs.mjs`).
- Help links per page (`helpLinks`):

| Page | Links |
| --- | --- |
| Pipelines | "About pipelines" `/pipelines/` « À propos des pipelines »; "Writing OpenHEXA pipelines" `/writing-pipelines/` « Écrire des pipelines OpenHEXA » |
| Files | "About the workspace's filesystem" `/files/` |
| Database | "About the workspace database" `/database/` |
| Datasets | "About datasets" `/datasets/` |
| Connections | "About connections" `/connections/` |
| Settings | "Inviting and managing users" `/workspaces/#members` |

## Brand

- **Colors:** pink `#ff459a` (website) / `#ec4899` (app pink-500); navy `#192041`; app buttons blue-600 `#2563eb`.
- **Type and logo:** Inter; logo mark `#FF3E96`.
- **App screens:** white content, gray-800 sidebar. App mock-ups are built at the app's real CSS size and scaled ×1.28 (`core/css/app.css`).

## Joining, files and datasets in depth (from the b-react-quickstart video, EN only)

Checked at `4c2a83b4f`. FR strings were not checked for this section.

**Workspace invitation email** (`backend/hexa/workspaces/utils.py`, `backend/hexa/workspaces/templates/workspaces/mails/invite_new_user.mjml`)
- Subject: "You've been invited to join the workspace {name} on OpenHEXA", sent in the inviter's language.
- Body: dark header with the white OpenHEXA logo; heading "{owner} has invited you to join the workspace "{workspace}" on OpenHEXA"; "Join {owner} ({email}) to start collaborating."; pink (`#FF499C`) button "Join Now".
- The button opens `/register?email=…&token=…` (`pages/register.tsx`): logo, h2 "Create your account", fields Email address (disabled), First name, Last name, Password, Confirm Password, button "Create account" (full width).
- Registering accepts every pending invitation for that email, logs the user in and sends them to `/workspaces`, which opens the workspace (`backend/hexa/user_management/schema/mutations.py` `resolve_register`).

**Files upload** (`workspaces/features/UploadObjectDialog/UploadObjectDialog.tsx`, `BucketExplorer.tsx`)
- Dialog title "Upload files in workspace"; dropzone "Drop files or folders here"; Cancel / "Upload", which reads "Uploading: {n}%" while sending.
- Each file row has a download button with `ArrowDownTrayIcon` (folders have none).

**Datasets list** (`pages/workspaces/[workspaceSlug]/datasets/index.tsx`)
- Header button "Create". Pinned datasets show as `DatasetCard`s above the "All datasets" table.
- Table columns: Name / Last updated / Created by / Workspace; a star (`PinDatasetButton`, outline/solid `StarIcon`) pins a dataset.

**Create a dataset** (`datasets/features/CreateDatasetDialog`): title "Create a dataset"; Name and Description, both required; Cancel / Create.

**Dataset page** (`datasets/layouts/DatasetLayout.tsx`)
- Header: breadcrumbs, pin star, "Create new version". Below: the dataset name (h2) with the version picker at its right.
- Tabs: General / Files / Access management.
- General: Name, Description, Identifier, Source workspace, Organization sharing; "Current version" with Version, Created at, Created by, Changelog.

**Upload a new version** (`datasets/features/UploadDatasetVersionDialog`)
- Tabs "Using SDK" (first) / "Upload files".
- Upload files: Name (placeholder "Version name. ex: v2"), Changelog, Files* (dropzone "Drag & drop the files from your desktop to create a new version manually.").
- Buttons Close / Create ("Creating ({n}%)" while uploading).

**Files tab** (`datasets/features/DatasetExplorer`, `DatasetVersionFileSample`, `DatasetVersionFileColumns`)
- Left: monospaced file list. Right: file name with a "Download" button (secondary, small), then Created at / Created by / Type / Size, then tabs Preview / Columns.
- Preview: "Generating sample..." until ready; shows "Rows in dataset" and a sample table.
- Columns: one block per column, its name as title, "Basic Statistics" (Distinct "n (x%)", Missing "n (x%)", Constant Yes/No), and for numbers "Numeric Statistics" (Mean, Median, Std Deviation, Minimum, Maximum, 25% Quantile, 75% Quantile).
- A pencil button (`PencilIcon`, secondary small) shows at the top right of a column on hover, for users who can update the dataset.

**Column annotations** (`datasets/features/ColumnMetadataDrawer`)
- Drawer fields: Description (placeholder "Enter a description for this column"), "Attributes" with an "Attribute" add button, each row Label + Value ("Label and value are required").
- Buttons Close / Save; toast "Metadata updated."; footer "Last updated on {datetime} by {user}".

**Access management** (`.../[sourceWorkspaceSlug]/access.tsx`, `LinkDatasetDialog`, `DatasetLinksDataGrid`)
- "Share with a workspace" button; toggle "Share with the whole Organization" (source workspace only).
- Links table: Workspace / Created At / Created By / "Revoke".
- Dialog "Create a new link to '{name}'": Workspace picker; Cancel / "Link".

**Running a pipeline** (`workspaces/layouts/PipelineLayout/PipelineLayout.tsx`, `workspaces/features/RunPipelineDialog`, `pages/.../runs/[runId].tsx`)
- Pipeline page header button "Run" (`PlayIcon`), for anyone with run permission.
- Dialog "Run pipeline": the pipeline's parameters, then "Advanced settings" ("Pipeline version, notifications and logs": Version, Send notifications, Show debug messages); Cancel / Run.
- Run page: once finished, an "Outputs" section (title not translated) listing files, datasets and tables, or "No outputs".

**Templates** (`workspaces/features/TemplateCard`, `pipelines/features/PipelineCreateFromTemplateButton`)
- Available Templates cards: name, a badge (the publishing organization's name for validated templates, else "Community"), description, a "Create pipeline" button.
- Success toast: "Successfully created pipeline {name}".

**Inviting** (`workspaces/features/InviteMemberDialog`, `workspaces/features/UserPicker/UserPicker.tsx`)
- Typing an unknown email in User offers "Invite new user: {email}". Toast after Invite: "Member invited successfully".

**Role permissions** (`docs/en/workspaces.md`): Viewers read and download files and datasets and launch pipelines; Editors also write files and datasets, create pipelines and use notebooks; only Admins manage and invite users.
