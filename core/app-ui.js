// Builders for the OpenHEXA app mock-ups (layout and labels follow the openhexa-app frontend; see
// core/css/app.css and docs/app-facts.md). Each page returns { el, update(t) } and is stacked inside
// the app window's main area.
//
// Labels come from the video's I18N[LANG].app (copy the block from videos/getting-started/i18n.js).
// Page animations play on named beats: AppUI.beats[name] (seconds, or a function returning them)
// when set, else beat(name), i.e. a narration word named in the video's i18n cues.
(function () {
  const { h } = E;
  const A = {};
  const S = () => ({ ...APP_DEFAULTS[LANG], ...((window.I18N && I18N[LANG]) || {}) });
  A.beats = {};
  const beat = (name) => {
    const b = A.beats[name];
    return b == null ? TL.cue(name) : typeof b === 'function' ? b() : b;
  };
  const icon = (name, size = 20, color = 'currentColor', sw = 1.5) => UI.heroIcon(name, size, color, sw);
  A.icon = icon;

  A.btn = (label, kind = 'primary', iconName) => h('div', { class: 'ox-btn ' + kind }, [iconName ? icon(iconName, 18, 'currentColor', 2) : null, h('span', { text: label })]);
  const secondary = (label, iconName) => {
    const b = A.btn(label, '', iconName);
    Object.assign(b.style, { background: '#e0e7ff', color: '#4338ca' });
    return b;
  };
  A.pill = (label, kind = 'gray') => h('span', { class: 'ox-pill ' + kind, text: label });

  // ---------- window + sidebars ----------
  A.window = () => {
    const url = h('div', { class: 'ox-url' });
    const chrome = h('div', { class: 'ox-chrome' }, [h('i'), h('i'), h('i'), url]);
    const body = h('div', { class: 'ox-body' });
    const el = h('div', { class: 'ox-window' }, [chrome, body]);
    const setUrl = (path) => {
      if (url.__p === path) return;
      url.__p = path;
      url.innerHTML = `app.openhexa.org<b>${path}</b>`;
    };
    return { el, body, setUrl };
  };

  A.orgSidebar = () => {
    const s = S();
    const items = [['Home', s.app.orgNav[0]], ['Users', s.app.orgNav[1]], ['Users', s.app.orgNav[2]], ['Square2Stack', s.app.orgNav[3]], ['Cog6Tooth', s.app.orgNav[4]]];
    const nav = items.map(([ic, label], i) => h('div', { class: 'ox-nav-item' + (i === 0 ? ' on' : '') }, [h('div', { class: 'hl', style: { opacity: i === 0 ? 1 : 0 } }), icon(ic, 20), h('span', { text: label })]));
    return h('div', { class: 'ox-side' }, [
      h('div', { class: 'ox-org' }, [icon('ChevronLeft', 18, '#d1d5db', 2), h('div', { class: 'logo', text: s.orgShort }), h('span', { text: s.orgName })]),
      h('div', { class: 'ox-nav', style: { marginTop: '8px' } }, nav),
      h('div', { class: 'ox-user' }, [h('div', { class: 'ox-avatar', text: s.user.initials }), h('span', { text: s.user.name })]),
    ]);
  };

  A.NAV = ['home', 'files', 'database', 'dataStudio', 'datasets', 'connections', 'pipelines', 'jupyter', 'apps', 'settings'];
  const NAV_ICONS = { home: 'Home', files: 'FolderOpen', database: 'CircleStack', dataStudio: 'TableCells', datasets: 'Square2Stack', connections: 'Swatch', pipelines: 'Bolt', jupyter: 'BookOpen', apps: 'GlobeAlt', settings: 'Cog6Tooth' };
  A.wsSidebar = () => {
    const s = S();
    const items = {};
    const nav = A.NAV.map((k) => {
      const bar = h('div', { class: 'bar' });
      const kids = [bar, icon(NAV_ICONS[k], 20), h('span', { text: s.app.nav[k] })];
      if (k === 'dataStudio') kids.push(h('span', { class: 'badge-new', text: s.app.newBadge }));
      const el = h('div', { class: 'ox-nav-item' }, kids);
      items[k] = { el, bar };
      return el;
    });
    const navEl = h('div', { class: 'ox-nav' }, nav);
    const el = h('div', { class: 'ox-side' }, [
      h('div', { class: 'ox-org' }, [icon('ChevronLeft', 18, '#d1d5db', 2), h('div', { class: 'logo', text: s.orgShort }), h('span', { text: s.orgName })]),
      h('div', { class: 'ox-ws' }, [h('span', { class: 'flag', html: FLAGS[s.country.flag] }), h('span', { class: 'name', text: s.workspaceName }), icon('ChevronDown', 16, '#9ca3af', 2)]),
      navEl,
      h('div', { class: 'ox-user' }, [h('div', { class: 'ox-avatar', text: s.user.initials }), h('span', { text: s.user.name })]),
    ]);
    // Active item: pink bar fades in, label turns white.
    const setActive = (key, p = 1) => {
      for (const k of A.NAV) {
        const on = k === key;
        E.set(items[k].bar, { o: on ? p : 0 });
        items[k].el.classList.toggle('on', on && p > 0.5);
      }
    };
    return { el, items, navEl, setActive };
  };

  // Page shell: fixed white header (breadcrumb left, actions right) + content area.
  const shell = (crumbs, actions = [], content = [], { pad = true } = {}) => {
    const crumbEls = [];
    crumbs.forEach((c, i) => {
      if (i) crumbEls.push(icon('ChevronRight', 14, '#9ca3af', 2));
      crumbEls.push(i === crumbs.length - 1 ? h('b', { text: c }) : h('span', { text: c }));
    });
    const page = h('div', { class: 'ox-page', style: pad ? {} : { padding: 0 } }, content);
    const el = h('div', { class: 'abs', style: { width: '744px', height: '640px' } }, [
      h('div', { class: 'ox-header' }, [h('div', { class: 'ox-crumbs' }, crumbEls), ...actions]),
      page,
    ]);
    return { el, page };
  };

  // ---------- organization home (empty: a brand-new organization) ----------
  A.orgPage = () => {
    const s = S();
    const create = A.btn(s.app.createWorkspace, 'primary', 'Plus');
    const el = h('div', { class: 'abs', style: { width: '744px', height: '640px', padding: '32px 28px' } }, [
      h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' } }, [
        h('div', {}, [h('div', { class: 'ox-h1', text: s.orgName }), h('div', { class: 'ox-sub', text: s.app.workspacesCount(0) })]),
        create,
      ]),
      h('div', { class: 'ox-input', style: { marginTop: '24px', width: '300px', color: '#9ca3af' } }, [icon('MagnifyingGlass', 16, '#9ca3af', 2), h('span', { text: s.app.searchWorkspaces })]),
    ]);
    return { el, create, update() {} };
  };

  // ---------- create workspace dialog ----------
  A.createDialog = () => {
    const d = S().app.dialog;
    const s = S();
    const nameText = h('span', {});
    const caret = h('span', { class: 'ox-caret' });
    const nameInput = h('div', { class: 'ox-input' }, [nameText, caret]);
    const countryText = h('span', { class: 'ph', text: d.countryPh });
    const countryInput = h('div', { class: 'ox-input' }, [countryText, h('span', { style: { marginLeft: 'auto', display: 'flex' } }, [icon('ChevronDown', 16, '#9ca3af', 2)])]);
    const option = h('div', { class: 'ox-option' }, [h('span', { class: 'flag-sm', html: FLAGS[s.country.flag] }), h('span', { text: s.country.name })]);
    const menu = h('div', { class: 'ox-menu' }, [h('div', { class: 'ox-option dim', text: 'Brazil' }), h('div', { class: 'ox-option dim', text: 'Bulgaria' }), option, h('div', { class: 'ox-option dim', text: 'Burundi' })]);
    const box = h('div', { class: 'ox-box' });
    const createBtn = A.btn(d.create, 'primary');
    const dialog = h('div', { class: 'ox-dialog', style: { marginTop: '-205px' } }, [
      h('h3', { text: d.title }),
      h('div', { class: 'ox-field' }, [h('label', { class: 'ox-label', html: `${d.name}<span class="req">*</span>` }), nameInput]),
      h('div', { class: 'ox-field', style: { position: 'relative' } }, [h('label', { class: 'ox-label', text: d.country }), countryInput, h('div', { class: 'ox-help', text: d.countryHelp }), menu]),
      h('div', { class: 'ox-check', style: { marginTop: '6px' } }, [box, h('div', {}, [h('div', { class: 'ox-label', style: { marginBottom: '2px' }, text: d.tutorial }), h('div', { class: 'ox-help', style: { marginTop: 0 }, text: d.tutorialHelp })])]),
      h('div', { class: 'ox-dialog-actions' }, [A.btn(d.cancel, 'white'), createBtn]),
    ]);
    const scrim = h('div', { class: 'ox-scrim' });
    const el = h('div', { class: 'abs', style: { width: '1000px', height: '640px' } }, [scrim, dialog]);
    return { el, scrim, dialog, nameText, nameInput, caret, countryText, countryInput, menu, option, box, createBtn };
  };

  // ---------- workspace home (default homepage written by the backend) ----------
  A.homePage = () => {
    const s = S();
    const n = s.workspaceName, slug = s.workspaceSlug;
    const md = h('div', { class: 'ox-card ox-md', style: { padding: '26px 30px', height: '520px', overflow: 'hidden' }, html:
      `<h2>${n}</h2><p>Welcome to your new workspace "${n}"!</p>` +
      `<p>You are currently viewing the homepage of your workspace. This page can be edited by workspace administrators and editors simply by clicking the <b>Edit</b> button on the top-right corner of this screen.</p>` +
      `<h3>Where to go from here?</h3><p>Now that your workspace has been created, you can (depending on your privileges):</p>` +
      `<ul><li>Manage the <a>workspace files</a></li><li>Browse the <a>workspace database</a></li><li>Create and run code <a>notebooks</a></li><li>Monitor and launch <a>data pipelines</a></li></ul>` });
    void slug;
    const sh = shell([], [A.btn(s.app.edit, 'primary')], [md]);
    return { el: sh.el, update() {} };
  };

  // ---------- files ----------
  A.filesPage = () => {
    const f = S().app.files;
    const row = (ic, name, size) => h('tr', {}, [h('td', { class: 'strong' }, [h('span', { class: 'ox-ico-cell' }, [icon(ic, 18, '#6b7280'), h('span', { text: name })])]), h('td', { text: size }), h('td', { text: f.ago })]);
    const newRow = row('DocumentText', LANG === 'fr' ? 'cas_paludisme_2026.xlsx' : 'malaria_cases_2026.xlsx', '84.2 kB');
    const tbody = h('tbody', {}, [row('DocumentText', 'README.MD', '601 B'), row('DocumentText', 'covid_data.csv', '539.2 kB'), row('DocumentText', 'demo.ipynb', '31.4 kB'), newRow]);
    const upload = A.btn(f.upload, 'primary', 'ArrowUpTray');
    const sh = shell([S().app.nav.files], [h('div', { class: 'ox-btn', style: { background: '#e0e7ff', color: '#4338ca', padding: '0 9px' } }, [icon('Cog6Tooth', 18, '#4338ca')]), secondary(f.folder, 'FolderOpen'), upload], [
      h('div', { class: 'ox-card', style: { overflow: 'hidden' } }, [h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, f.cols.map((c) => h('th', { text: c })))]), tbody])]),
    ]);
    return { el: sh.el, upload, newRow, update(t) {
      const p = E.prog(t, beat('upload') + 0.35, 0.5, E.ease.outCubic);
      E.set(newRow, { o: p, y: (1 - p) * -8 });
      newRow.style.background = `rgba(219,234,254,${(0.9 * (1 - E.prog(t, beat('upload') + 1.2, 1.2))) * p})`;
    } };
  };

  // ---------- database ----------
  A.databasePage = () => {
    const d = S().app.database;
    const section = (title, open) => h('div', { class: 'ox-card', style: { marginTop: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500, fontSize: '15px' } }, [icon(open ? 'ChevronDown' : 'ChevronRight', 16, '#6b7280', 2), h('span', { text: title })]);
    const table = h('div', { class: 'ox-card', style: { overflow: 'hidden' } }, [
      h('div', { style: { padding: '14px 16px', fontWeight: 600, fontSize: '16px' }, text: d.tables }),
      h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, [...d.cols.map((c) => h('th', { text: c })), h('th')])]),
        h('tbody', {}, [h('tr', {}, [h('td', { class: 'strong' }, [h('span', { class: 'ox-ico-cell' }, [icon('TableCells', 18, '#6b7280'), h('span', { text: 'covid_data' })])]), h('td', { text: d.rows }), h('td', { style: { textAlign: 'right' } }, [icon('ChevronRight', 16, '#9ca3af', 2)])])])]),
    ]);
    const sh = shell([S().app.nav.database], [], [table, section(d.ro, true), section(d.rw, false)]);
    return { el: sh.el, update() {} };
  };

  // ---------- data studio ----------
  const SQL = [
    ['k', 'SELECT'],
    ['', '  '], ['k', 'CASE WHEN '], ['', 'age < '], ['n', '18'], ['k', ' THEN '], ['s', "'0-17'"], ['', '\n'],
    ['k', '       WHEN '], ['', 'age < '], ['n', '50'], ['k', ' THEN '], ['s', "'18-49'"], ['', '\n'],
    ['k', '       ELSE '], ['s', "'50+'"], ['k', ' END AS '], ['', 'age_group,\n'],
    ['', '  '], ['f', 'COUNT'], ['', '(*) '], ['k', 'AS '], ['', 'patients\n'],
    ['k', 'FROM '], ['', 'covid_data\n'],
    ['k', 'GROUP BY '], ['', 'age_group\n'],
    ['k', 'ORDER BY '], ['', 'age_group;'],
  ];
  A.studioPage = () => {
    const st = S().app.studio;
    const cols = ['id', 'usmer', 'medical_unit', 'sex', 'patient_type', 'date_died', 'age', 'pneumonia', 'diabetes'];
    const schema = h('div', { class: 'ds-schema' }, [
      h('div', { class: 'ds-schema-title', text: st.tables }),
      h('div', { class: 'ds-tbl' }, [icon('ChevronDown', 14, '#6b7280', 2), icon('TableCells', 16, '#6b7280'), h('span', { text: 'covid_data' })]),
      ...cols.map((c) => h('div', { class: 'ds-col', text: c })),
    ]);
    const gen = h('div', { class: 'ds-gen' }, [icon('Sparkles', 15, '#4338ca', 1.8), h('span', { text: st.generate })]);
    const run = h('div', { class: 'ds-run' }, [icon('Play', 13, '#fff', 2), h('span', { text: st.run })]);
    const toolbar = h('div', { class: 'ds-toolbar' }, [icon('TableCells', 16, '#6b7280'), h('b', { text: st.query }), h('span', { class: 'ds-sep' }), h('span', { class: 'ds-dim', text: st.maxRows + ' 1,000' }), h('div', { style: { flex: 1 } }), gen, h('span', { class: 'ds-dim', text: st.format }), run]);
    const askText = h('span', {});
    const ask = h('div', { class: 'ds-ask' }, [icon('Sparkles', 16, '#6366f1', 1.8), h('span', { class: 'ph', text: st.aiPh }), askText]);
    const code = h('div', { class: 'ds-code' });
    const spans = [];
    let total = 0;
    for (const [c, txt] of SQL) {
      const sp = h('span', { class: c ? 'sq-' + c : '' });
      spans.push([sp, txt, total]);
      total += txt.length;
      code.appendChild(sp);
    }
    const res = [['0-17', '23'], ['18-49', '275'], ['50+', '1204']];
    const results = h('div', { class: 'ds-results' }, [
      h('div', { class: 'ds-res-title', text: st.results }),
      h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, [h('th', { text: 'age_group' }), h('th', { text: 'patients' })])]), h('tbody', {}, res.map(([a, b]) => h('tr', {}, [h('td', { class: 'ox-mono', text: a }), h('td', { class: 'ox-mono', text: b })])))]),
    ]);
    const editor = h('div', { class: 'ds-editor' }, [toolbar, ask, code, results]);
    const sh = shell([S().app.nav.dataStudio], [], [h('div', { class: 'ds-wrap' }, [schema, editor])], { pad: false });
    // sub-nav tabs live in the header next to the title
    sh.el.querySelector('.ox-crumbs').append(h('span', { class: 'ds-subtab on', text: st.editor }), h('span', { class: 'ds-subtab', text: st.saved }));
    return { el: sh.el, gen, run, ask, update(t) {
      const tg = beat('generateSql');
      const askP = E.prog(t, tg - 0.1, 0.35);
      E.set(ask, { o: askP, y: (1 - askP) * -6 });
      const typed = Math.floor(E.clamp((t - tg - 0.25) / 1.3) * st.ask.length);
      E.text(askText, st.ask.slice(0, typed));
      E.show(ask.querySelector('.ph'), typed === 0);
      // The generated SQL lands as soon as the question is typed, so the results get time on screen.
      const tq = Math.min(beat('aiSql') - 0.25, tg + 1.75);
      const n = Math.floor(E.clamp((t - tq) / 0.55) * total);
      for (const [sp, txt, at] of spans) E.text(sp, txt.slice(0, Math.max(0, n - at)));
      const rp = E.prog(t, tq + 0.85, 0.4);
      E.set(results, { o: rp, y: (1 - rp) * 10 });
    } };
  };

  // ---------- datasets (detail view of one dataset) ----------
  A.datasetsPage = () => {
    const d = S().app.datasets;
    const s = S();
    const ver = h('div', { class: 'ox-input', style: { width: '210px', fontSize: '13px' } }, [h('span', { text: d.versions[0] }), h('span', { style: { marginLeft: 'auto', display: 'flex' } }, [icon('ChevronDown', 14, '#9ca3af', 2)])]);
    const verMenu = h('div', { class: 'ox-menu', style: { left: 0, top: '42px', width: '210px' } }, d.versions.map((v, i) => h('div', { class: 'ox-option' + (i ? ' dim' : ' sel'), text: v })));
    const tabs = d.tabs.map((x, i) => h('div', { class: 'ox-tab' + (i === 0 ? ' on' : ''), text: x }));
    const general = h('div', { class: 'abs', style: { left: 0, right: 0, top: 0 } }, [
      h('div', { class: 'ox-card', style: { padding: '16px 18px' } }, d.files.map((f) => h('div', { class: 'ds-file' }, [icon('DocumentText', 18, '#6b7280'), h('span', { text: f })]))),
    ]);
    const wsRow = (name, flag) => h('div', { class: 'ds-file' }, [h('span', { class: 'flag-sm', html: FLAGS[flag] }), h('span', { text: name })]);
    const access = h('div', { class: 'abs', style: { left: 0, right: 0, top: 0 } }, [
      h('div', { class: 'ox-card', style: { padding: '16px 18px' } }, [h('div', { style: { fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }, text: d.shared }), wsRow(s.workspaceName, s.country.flag), wsRow(d.sharedWs[0], 'sl'), wsRow(d.sharedWs[1], 'ci')]),
    ]);
    const body = h('div', { style: { position: 'relative', marginTop: '16px', height: '260px' } }, [general, access]);
    const sh = shell([s.app.nav.datasets, d.name], [A.btn(d.newVersion, 'white')], [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px' } }, [h('div', { class: 'ox-h1', text: d.name }), h('div', { style: { position: 'relative', marginLeft: 'auto' } }, [ver, verMenu])]),
      h('div', { class: 'ox-tabs' }, tabs),
      body,
    ]);
    return { el: sh.el, ver, update(t) {
      const tv = beat('versioned');
      const m = E.window(t, tv + 0.1, beat('shareDs') - 0.2, 0.3, 0.25);
      E.set(verMenu, { o: m, y: (1 - m) * -6 });
      const sw = t >= beat('shareDs') + 0.2;
      tabs[0].classList.toggle('on', !sw);
      tabs[2].classList.toggle('on', sw);
      const ap = E.prog(t, beat('shareDs') + 0.2, 0.4);
      E.set(general, { o: 1 - ap });
      E.set(access, { o: ap, y: (1 - ap) * 8 });
    } };
  };

  // ---------- connections ----------
  A.connectionsPage = () => {
    const c = S().app.connections;
    const cards = c.cards.map(([img, name, type, desc]) => h('div', { class: 'ox-card', style: { padding: '16px 18px' } }, [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [h('img', { src: 'assets/app/' + img, style: { width: '24px', height: '24px' } }), h('div', { style: { fontWeight: 600, fontSize: '15px' }, text: name })]),
      h('div', { style: { fontSize: '12.5px', color: '#6b7280', marginTop: '6px' }, text: type }),
      h('div', { style: { fontSize: '13.5px', color: '#374151', marginTop: '8px' }, text: desc }),
    ]));
    const sh = shell([S().app.nav.connections], [A.btn(c.add, 'primary', 'Plus')], [h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } }, cards)]);
    return { el: sh.el, update(t) {
      cards.forEach((el, i) => {
        const p = E.prog(t, beat('connectionsStart') + beat('connectionsSpan') * (0.42 + i * 0.12), 0.45, E.ease.outBack);
        E.set(el, { o: Math.min(1, p * 1.5), s: 0.94 + 0.06 * p, y: (1 - p) * 10 });
      });
    } };
  };

  // ---------- pipelines ----------
  A.pipelinesPage = () => {
    const p = S().app.pipelines;
    const s = S();
    const badges = [];
    const ages = [];
    const cards = p.cards.map(([name, src, code, ver, desc], i) => {
      const badge = h('span', { class: 'ox-pill', style: { background: '#ecfdf5', color: '#10b981' }, text: p.succeeded });
      const age = h('span', { style: { color: '#6b7280', fontSize: '12.5px' }, text: p.ago });
      badges.push(badge); ages.push(age);
      return h('div', { class: 'ox-card', style: { padding: '16px 18px', display: 'flex', flexDirection: 'column', height: '190px' } }, [
        h('div', { style: { fontWeight: 600, fontSize: '16px' }, text: name }),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12.5px', color: '#6b7280' } }, [A.pill(src, 'gray'), h('span', { text: '•' }), h('span', { class: 'ox-mono', text: code }), h('span', { style: { marginLeft: 'auto' }, text: ver })]),
        h('div', { style: { fontSize: '13.5px', color: '#4b5563', marginTop: '10px', lineHeight: 1.45 }, text: desc }),
        h('div', { style: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' } }, [h('span', { style: { color: '#6b7280' }, text: p.lastRun }), badge, age, h('div', { class: 'ox-avatar', style: { width: '22px', height: '22px', fontSize: '9px', marginLeft: 'auto' }, text: s.user.initials })]),
      ]);
    });
    const create = A.btn(p.create, 'primary', 'Plus');
    const tabs = h('div', { class: 'ox-tabs', style: { marginTop: 0, marginBottom: '18px' } }, p.tabs.map((x, i) => h('div', { class: 'ox-tab' + (i ? '' : ' on'), text: x })));
    const grid = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } }, cards);
    const opts = p.options.map(([ic, title, desc]) => h('div', { class: 'pl-opt' }, [icon(ic, 30, '#60a5fa', 1.5), h('div', { class: 'pl-opt-t', text: title }), h('div', { class: 'pl-opt-d', text: desc })]));
    const dialog = h('div', { class: 'ox-dialog', style: { width: '640px', marginLeft: '-320px', marginTop: '-170px', top: '50%' } }, [
      h('h3', { text: p.dlgTitle }),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' } }, opts),
      h('div', { style: { display: 'flex', alignItems: 'center', marginTop: '20px' } }, [h('span', { style: { color: '#2563eb', fontSize: '13.5px', fontWeight: 500 }, text: p.cli }), h('div', { style: { marginLeft: 'auto' } }, [A.btn(p.close, 'white')])]),
    ]);
    const scrim = h('div', { class: 'ox-scrim', style: { left: '-256px' } });
    const modal = h('div', { class: 'abs', style: { width: '744px', height: '640px' } }, [scrim, dialog]);
    const sched = h('div', { class: 'pl-sched ox-card' }, [
      h('div', { class: 'ox-label', text: p.schedule }),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [h('div', { class: 'ox-input ox-mono', style: { width: '150px' }, text: '0 6 * * *' }), h('span', { class: 'ox-switch' }), h('span', { style: { fontSize: '13.5px', color: '#374151' }, text: LANG === 'fr' ? 'Activé' : 'Enabled' })]),
    ]);
    const sh = shell([s.app.nav.pipelines], [create], [tabs, grid]);
    sh.el.append(modal, sched);
    return { el: sh.el, create, opts, update(t) {
      const tOpen = beat('template') - 0.35;
      const tClose = beat('runPipeline') - 0.45;
      const m = E.window(t, tOpen, tClose, 0.3, 0.3);
      this.dim = m;
      E.set(modal, { o: m });
      E.set(dialog, { s: 0.96 + 0.04 * m });
      const hl = [beat('template'), beat('template') + 0.75, beat('withAi')];
      const order = [1, 2, 0];
      opts.forEach((el) => el.classList.remove('hot'));
      let cur = -1;
      hl.forEach((x, i) => { if (t >= x - 0.05) cur = order[i]; });
      if (cur >= 0 && t < tClose) opts[cur].classList.add('hot');
      // Run on demand: second card goes Running -> Succeeded.
      const tr = beat('runPipeline');
      const running = t >= tr && t < beat('schedule') - 0.1;
      const done = t >= beat('schedule') - 0.1;
      E.text(badges[1], running ? p.running : p.succeeded);
      badges[1].style.background = running ? '#f0f9ff' : '#ecfdf5';
      badges[1].style.color = running ? '#0ea5e9' : '#10b981';
      E.text(ages[1], t >= tr ? p.now : p.ago);
      void done;
      const sp = E.prog(t, beat('schedule') - 0.15, 0.45, E.ease.outBack);
      E.set(sched, { o: Math.min(1, sp * 1.4), s: 0.9 + 0.1 * sp, y: (1 - sp) * 12 });
    } };
  };

  // ---------- notebooks (JupyterLab, demo notebook from the tutorial content) ----------
  A.notebooksPage = () => {
    const hist = [216, 243, 1222, 2275, 2477, 1847, 1059, 483, 166, 12];
    const max = 2477;
    const bars = hist.map((v, i) => `<rect x="${30 + i * 26}" y="${130 - (v / max) * 110}" width="25" height="${(v / max) * 110}" fill="#1f77b4"/>`).join('');
    const chart = h('div', { class: 'nb-out', html: `<svg width="300" height="150" viewBox="0 0 300 150"><line x1="28" y1="130" x2="294" y2="130" stroke="#333" stroke-width="1"/><line x1="28" y1="16" x2="28" y2="130" stroke="#333" stroke-width="1"/>${bars}<text x="160" y="146" font-size="9" text-anchor="middle" fill="#333">AGE</text></svg>` });
    const cell = (n, html) => h('div', { class: 'nb-cell' }, [h('div', { class: 'nb-prompt', text: `[${n}]:` }), h('div', { class: 'nb-code', html })]);
    const cells = [
      cell(1, '<span class="sq-k">import</span> pandas <span class="sq-k">as</span> pd\n<span class="sq-k">import</span> matplotlib.pyplot <span class="sq-k">as</span> plt\n\ndf = pd.read_csv(<span class="sq-s">"./covid_data.csv"</span>)'),
      cell(4, 'df[<span class="sq-s">"AGE"</span>].plot.hist()'),
    ];
    const lab = h('div', { class: 'nb-lab' }, [
      h('div', { class: 'nb-menu' }, ['File', 'Edit', 'View', 'Run', 'Kernel', 'Tabs', 'Settings', 'Help'].map((x) => h('span', { text: x }))),
      h('div', { class: 'nb-main' }, [
        h('div', { class: 'nb-files' }, ['README.MD', 'covid_data.csv', 'demo.ipynb'].map((f, i) => h('div', { class: 'nb-file' + (i === 2 ? ' on' : ''), text: f }))),
        h('div', { class: 'nb-doc' }, [h('div', { class: 'nb-tab', text: 'demo.ipynb' }), ...cells, chart]),
      ]),
    ]);
    const sh = shell([S().app.notebooks.title], [], [lab], { pad: false });
    return { el: sh.el, update(t) {
      const c = E.prog(t, beat('explore') - 0.2, 0.6, E.ease.outCubic);
      E.set(chart, { o: c, y: (1 - c) * 8 });
    } };
  };

  // ---------- web apps ----------
  A.webappsPage = () => {
    const w = S().app.webapps;
    const cards = w.apps.map(([name, type], i) => h('div', { class: 'ox-card', style: { padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' } }, [
      h('div', { style: { width: '40px', height: '40px', borderRadius: '8px', background: ['#fce7f3', '#e0e7ff'][i], display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [icon(i ? 'GlobeAlt' : 'Sparkles', 22, ['#db2777', '#4f46e5'][i], 1.6)]),
      h('div', {}, [h('div', { style: { fontSize: '17px', fontWeight: 600 }, text: name }), h('div', { style: { marginTop: '4px' } }, [A.pill(type, 'gray')])]),
      h('div', { style: { marginLeft: 'auto', width: '34px', height: '34px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [icon('Play', 16, '#fff', 2)]),
    ]));
    const preview = h('div', { class: 'wa-preview ox-card' }, [
      h('div', { class: 'wa-prev-title', text: w.apps[0][0] }),
      h('div', { class: 'wa-kpis' }, [['1502', LANG === 'fr' ? 'patients' : 'patients'], ['80%', '50+'], ['18%', '18-49']].map(([v, l]) => h('div', { class: 'wa-kpi' }, [h('b', { text: v }), h('span', { text: l })]))),
      h('div', { class: 'wa-bars', html: [23, 275, 1204].map((v, i) => `<div><i style="height:${(v / 1204) * 100}%"></i><span>${['0-17', '18-49', '50+'][i]}</span></div>`).join('') }),
    ]);
    const opts = w.options.map(([ic, title, desc]) => h('div', { class: 'pl-opt' }, [icon(ic, 30, '#60a5fa', 1.5), h('div', { class: 'pl-opt-t', text: title }), h('div', { class: 'pl-opt-d', text: desc })]));
    const dialog = h('div', { class: 'ox-dialog', style: { width: '640px', marginLeft: '-320px', marginTop: '-150px' } }, [h('h3', { text: w.dlgTitle }), h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' } }, opts)]);
    const scrim = h('div', { class: 'ox-scrim', style: { left: '-256px' } });
    const modal = h('div', { class: 'abs', style: { width: '744px', height: '640px' } }, [scrim, dialog]);
    const sh = shell([w.title], [A.btn(w.create, 'primary', 'Plus')], [
      h('div', { style: { fontWeight: 600, fontSize: '15px', marginBottom: '12px' }, text: w.all }),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } }, cards),
      preview,
    ]);
    sh.el.append(modal);
    return { el: sh.el, update(t) {
      const pv = E.prog(t, beat('dashboards') - 0.1, 0.6, E.ease.outCubic);
      E.set(preview, { o: pv, y: (1 - pv) * 14 });
      const m = E.prog(t, beat('aiAssistant') - 0.9, 0.35);
      this.dim = m;
      E.set(modal, { o: m });
      E.set(dialog, { s: 0.96 + 0.04 * m });
      opts[0].classList.toggle('hot', t >= beat('aiAssistant') - 0.1);
    } };
  };

  // ---------- workspace settings / members ----------
  A.settingsPage = () => {
    const st = S().app.settings;
    const roleCells = [];
    const rows = st.members.map(([n, e, r]) => {
      const rc = h('td', {}, [h('span', { class: 'ox-role', text: r })]);
      roleCells.push(rc.firstChild);
      return h('tr', {}, [h('td', { class: 'strong', text: n }), h('td', { text: e }), rc, h('td', { text: st.joined })]);
    });
    const archive = h('div', { class: 'ox-btn', style: { color: '#b91c1c', background: '#fff', border: '1px solid #fecaca' }, text: st.archive });
    const sh = shell([S().app.nav.settings], [archive], [
      h('div', { class: 'ox-tabs', style: { marginTop: 0 } }, st.tabs.map((x, i) => h('div', { class: 'ox-tab' + (i === 1 ? ' on' : ''), text: x }))),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', margin: '16px 0 12px' } }, [A.btn(st.invite, 'primary', 'UserPlus')]),
      h('div', { class: 'ox-card', style: { overflow: 'hidden' } }, [h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, st.cols.map((c) => h('th', { text: c })))]), h('tbody', {}, rows)])]),
    ]);
    return { el: sh.el, update(t) {
      const cues = [beat('roleAdmin'), beat('roleEditor'), beat('roleViewer')];
      roleCells.forEach((el, i) => el.classList.toggle('hot', t >= cues[i] - 0.1 && (i === 2 || t < cues[i + 1] - 0.1) && t < beat('settingsEnd') + 0.5));
    } };
  };

  window.AppUI = A;
})();
