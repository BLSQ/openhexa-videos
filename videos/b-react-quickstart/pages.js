// App screens this video needs beyond core/app-ui.js. Labels and layout follow openhexa-app at
// 4c2a83b4f (sources in docs/app-facts.md, "Joining, files and datasets in depth"); every name,
// number and workspace in them is illustrative. Each builder returns elements the scene animates;
// none keeps state between frames.
(function () {
  const { h } = E;

  // Heroicons 24/outline the core set lacks, copied from the app's @heroicons/react.
  Object.assign(HERO, {
    ArrowDownTray: ['M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3'],
    Pencil: ['m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125'],
    ExclamationTriangle: ['M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'],
    Envelope: ['M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75'],
    ShieldCheck: ['M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z'],
    XMark: ['M6 18 18 6M6 6l12 12'],
    Eye: ['M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  });
  // DR Congo flag for the sample workspaces.
  FLAGS.cd = '<svg viewBox="0 0 30 20" width="100%" height="100%"><rect width="30" height="20" fill="#007FFF"/><path d="M0 16.4 26 0h4v3.6L4 20H0z" fill="#F7D618"/><path d="M0 18.2 28.9 0H30v1.8L1.1 20H0z" fill="#CE1021"/><path d="M5.5 1.6l.82 2.53h2.66l-2.15 1.56.82 2.53L5.5 6.66 3.35 8.22l.82-2.53L2.02 4.13h2.66z" fill="#F7D618"/></svg>';

  const icon = (n, s = 18, c = 'currentColor', w = 1.5) => UI.heroIcon(n, s, c, w);
  const btn = AppUI.btn;
  const secondary = (label, ic) => {
    const b = btn(label, '', ic);
    Object.assign(b.style, { background: '#e0e7ff', color: '#4338ca' });
    return b;
  };
  const iconBtn = (ic) => h('div', { class: 'ox-btn br-iconbtn' }, [icon(ic, 16, '#4338ca', 1.8)]);

  // Page shell: white header with breadcrumbs and actions, then content (same as core/app-ui.js).
  const shell = (crumbs, actions = [], content = [], { pad = true } = {}) => {
    const crumbEls = [];
    crumbs.forEach((c, i) => {
      if (i) crumbEls.push(icon('ChevronRight', 14, '#9ca3af', 2));
      crumbEls.push(i === crumbs.length - 1 ? h('b', { text: c }) : h('span', { text: c }));
    });
    const page = h('div', { class: 'ox-page', style: pad ? {} : { padding: 0 } }, content);
    const el = h('div', { class: 'abs', style: { width: '744px', height: '640px' } }, [h('div', { class: 'ox-header' }, [h('div', { class: 'ox-crumbs' }, crumbEls), ...actions]), page]);
    return { el, page };
  };
  // Dialog over the main area; the scene dims the sidebar with the page's `dim`.
  const modal = (title, body, actions, { w = 520, top = -200 } = {}) => {
    const dialog = h('div', { class: 'ox-dialog', style: { width: w + 'px', marginLeft: -w / 2 + 'px', marginTop: top + 'px' } }, [h('h3', { text: title }), ...body, h('div', { class: 'ox-dialog-actions' }, actions)]);
    const scrim = h('div', { class: 'ox-scrim' });
    const el = h('div', { class: 'abs', style: { width: '744px', height: '640px' } }, [scrim, dialog]);
    return { el, dialog, scrim };
  };
  const field = (label, input, req) => h('div', { class: 'ox-field' }, [h('label', { class: 'ox-label', html: label + (req ? '<span class="req">*</span>' : '') }), input]);
  const typedInput = (ph, extra = {}) => {
    const txt = h('span', {});
    const phEl = h('span', { class: 'ph', text: ph || '' });
    const el = h('div', { class: 'ox-input', style: extra }, [phEl, txt]);
    return { el, txt, ph: phEl };
  };
  const toast = (text) => h('div', { class: 'br-toast' }, [icon('CheckCircle', 20, '#16a34a', 2), h('span', { text })]);
  // Typewriter into a typedInput: chars appear from t0 at cps.
  const type = (inp, text, t, t0, dur) => {
    const n = Math.floor(E.clamp((t - t0) / Math.max(0.05, dur)) * text.length);
    E.text(inp.txt, text.slice(0, n));
    E.show(inp.ph, n === 0);
    inp.el.classList.toggle('focus', t >= t0 - 0.1 && t < t0 + dur + 0.4);
    return n;
  };
  // Dialog visibility helper: open at a, close at b.
  const showModal = (m, t, a, b) => {
    const p = E.prog(t, a, 0.28, E.ease.outCubic) * (1 - E.prog(t, b, 0.25, E.ease.inCubic));
    E.show(m.el, p > 0.001);
    E.set(m.scrim, { o: p });
    E.set(m.dialog, { o: p, s: 0.95 + 0.05 * p, y: (1 - p) * 14 });
    return p;
  };
  const showToast = (el, t, a, dur = 2.2) => {
    const p = E.window(t, a, a + dur, 0.25, 0.35);
    E.set(el, { o: p, y: (1 - p) * 12 });
  };

  const B = {};
  B.icon = icon;
  B.type = type;
  B.showModal = showModal;

  // ---------- invitation email (outside the app window) ----------
  B.email = (C) => {
    const joinBtn = h('div', { class: 'br-mail-btn', text: C.button });
    const el = h('div', { class: 'br-mail abs' }, [
      h('div', { class: 'br-mail-meta' }, [
        h('div', { class: 'br-mail-subj', text: C.subject }),
        h('div', { class: 'br-mail-from' }, [h('b', { text: C.from }), h('span', { text: ' to ' + C.to })]),
      ]),
      h('div', { class: 'br-mail-body' }, [
        h('div', { class: 'br-mail-head' }, [h('img', { src: VIDEO.dir + 'img/logo_with_text_white.svg' })]),
        h('div', { class: 'br-mail-card' }, [h('div', { class: 'br-mail-h', text: C.heading }), h('div', { class: 'br-mail-p', text: C.body }), joinBtn]),
      ]),
    ]);
    return { el, joinBtn };
  };

  // ---------- register (pages/register.tsx) ----------
  B.registerPage = (C) => {
    const email = h('div', { class: 'ox-input br-disabled', text: C.to });
    const first = typedInput(), last = typedInput(), pw = typedInput(), pw2 = typedInput();
    const submit = btn('Create account', 'primary');
    submit.style.width = '100%';
    submit.style.justifyContent = 'center';
    const form = h('div', { class: 'br-reg' }, [
      h('img', { class: 'br-reg-logo', src: VIDEO.dir + 'img/logo_with_text_black.svg' }),
      h('div', { class: 'br-reg-h', text: 'Create your account' }),
      h('div', { class: 'br-reg-sub', html: 'Already have an account?&nbsp;<a>Go to login page</a>' }),
      field('Email address', email, true), field('First name', first.el, true), field('Last name', last.el, true),
      field('Password', pw.el, true), field('Confirm Password', pw2.el, true), submit,
    ]);
    const el = h('div', { class: 'abs br-reg-page' }, [form]);
    return {
      el, submit, first, update(t) {
        const t0 = TL.at.regType, t1 = TL.at.regDone - 0.15;
        const span = Math.max(0.6, t1 - t0);
        type(first, C.first, t, t0, span * 0.18);
        type(last, C.last, t, t0 + span * 0.22, span * 0.18);
        type(pw, '••••••••••', t, t0 + span * 0.45, span * 0.2);
        type(pw2, '••••••••••', t, t0 + span * 0.7, span * 0.2);
      },
    };
  };

  // ---------- workspace home (custom homepage, illustrative) ----------
  B.homePage = (S) => {
    const md = h('div', { class: 'ox-card ox-md', style: { padding: '26px 30px', height: '520px', overflow: 'hidden' }, html:
      `<h2>${S.workspaceName}</h2><p>Shared workspace of the B-REACT consortium for <b>WP1, data integration</b>.</p>` +
      `<h3>In this workspace</h3><ul><li><a>Files</a>: raw extracts and working files</li><li><a>Datasets</a>: validated data shared with partners</li><li><a>Pipelines</a>: DHIS2 extraction, weekly SitRep</li></ul>` +
      `<h3>Need help?</h3><p>Ask a workspace Admin, or read the guides at docs.openhexa.com.</p>` });
    return { el: shell([], [btn('Edit', 'primary')], [md]).el, update() {} };
  };

  // ---------- files + upload dialog ----------
  B.filesPage = () => {
    const row = (folder, name, size, ago) => {
      const dl = folder ? h('td') : h('td', { style: { textAlign: 'right', width: '40px' } }, [iconBtn('ArrowDownTray')]);
      const tr = h('tr', {}, [h('td', { class: 'strong' }, [h('span', { class: 'ox-ico-cell' }, [icon(folder ? 'FolderOpen' : 'DocumentText', 18, folder ? '#60a5fa' : '#6b7280'), h('span', { text: name })])]), h('td', { text: size }), h('td', { text: ago }), dl]);
      return { tr, dl: dl.firstChild };
    };
    const rows = [row(true, 'exports', '-', '2 days ago'), row(true, 'raw', '-', '5 days ago'), row(false, 'line_list_codebook.xlsx', '48.1 kB', '3 days ago'), row(false, 'zones_de_sante.geojson', '2.4 MB', '1 week ago')];
    const nr = row(false, 'alerts_2026-W44.csv', '312.6 kB', 'a few seconds ago');
    const upload = btn('Upload files', 'primary', 'ArrowUpTray');
    const sh = shell(['Files'], [h('div', { class: 'ox-btn', style: { background: '#e0e7ff', color: '#4338ca', padding: '0 9px' } }, [icon('Cog6Tooth', 18, '#4338ca')]), secondary('Create a folder', 'FolderOpen'), upload], [
      h('div', { class: 'ox-card', style: { overflow: 'hidden' } }, [h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, ['Name', 'Size', 'Last updated', ''].map((c) => h('th', { text: c })))]), h('tbody', {}, [...rows.map((r) => r.tr), nr.tr])])]),
    ]);
    const chip = h('div', { class: 'br-chip' }, [icon('DocumentText', 16, '#2563eb'), h('span', { text: 'alerts_2026-W44.csv' }), h('span', { class: 'br-chip-size', text: '312.6 kB' })]);
    const drop = h('div', { class: 'br-drop' }, [icon('ArrowUpTray', 26, '#9ca3af', 1.6), h('span', { text: 'Drop files or folders here' }), chip]);
    const sendLabel = h('span', { text: 'Upload' });
    const send = h('div', { class: 'ox-btn primary' }, [sendLabel]);
    const m = modal('Upload files in workspace', [drop], [btn('Cancel', 'white'), send], { top: -170 });
    sh.el.append(m.el);
    return {
      el: sh.el, upload, send, drop, dl: nr.dl, newRow: nr.tr, update(t) {
        const A = TL.at;
        this.dim = showModal(m, t, A.uploadOpen, A.uploadSend + 0.95);
        const c = E.prog(t, TL.cue('drop') + 0.1, 0.4, E.ease.outBack);
        E.set(chip, { o: Math.min(1, c * 1.5), s: 0.8 + 0.2 * c, y: (1 - c) * -20 });
        drop.classList.toggle('over', t > TL.cue('drop') - 0.2 && t < TL.cue('drop') + 0.4);
        const up = E.clamp((t - A.uploadSend - 0.05) / 0.8);
        E.text(sendLabel, up > 0 && up < 1 ? `Uploading: ${Math.round(up * 100)}%` : 'Upload');
        const p = E.prog(t, A.uploadSend + 1.05, 0.45, E.ease.outCubic);
        E.show(nr.tr, p > 0);
        E.set(nr.tr, { o: p });
        nr.tr.style.background = `rgba(219,234,254,${(0.9 * (1 - E.prog(t, A.uploadSend + 2.2, 1.4))) * p})`;
      },
    };
  };

  // ---------- datasets list + create dialog ----------
  const DS = [
    ['Weekly cases by zone', 'Nov 3, 2026', 'Grace Mbuyi', 'B-REACT Surveillance', true],
    ['Lab confirmations', 'Nov 2, 2026', 'Joseph Ilunga', 'B-REACT Laboratory', true],
    ['Genomic sequences', 'Oct 30, 2026', 'Joseph Ilunga', 'B-REACT Laboratory', false],
    ['Population movements', 'Oct 24, 2026', 'Sarah Mukendi', 'B-REACT Analysis', false],
  ];
  const star = (on) => icon('Star', 16, on ? '#f59e0b' : '#9ca3af', 1.8);
  B.datasetsList = (C) => {
    const cards = DS.filter((d) => d[4]).map(([n, u, , ws]) => h('div', { class: 'ox-card br-dscard' }, [h('div', { class: 'br-dscard-top' }, [icon('Square2Stack', 18, '#6b7280'), h('b', { text: n }), h('span', { class: 'br-star-on' }, [star(true)])]), h('div', { class: 'br-dscard-meta', text: ws + ' · ' + u })]));
    const rows = DS.map(([n, u, by, ws, pin]) => h('tr', {}, [h('td', { class: 'strong' }, [h('span', { class: 'ox-ico-cell' }, [h('span', { class: pin ? 'br-star-on' : '' }, [star(pin)]), h('span', { text: n })])]), h('td', { text: u }), h('td', { text: by }), h('td', {}, [h('span', { class: 'br-ws' }, [h('span', { class: 'flag-sm', html: FLAGS.cd }), h('span', { text: ws })])])]));
    const create = btn('Create', 'primary', 'Plus');
    const sh = shell(['Datasets'], [create], [
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' } }, cards),
      h('div', { style: { fontWeight: 600, fontSize: '15px', marginBottom: '10px' }, text: 'All datasets' }),
      h('div', { class: 'ox-card', style: { overflow: 'hidden' } }, [h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, ['Name', 'Last updated', 'Created by', 'Workspace'].map((c) => h('th', { text: c })))]), h('tbody', {}, rows)])]),
    ]);
    const name = typedInput('Name'), desc = typedInput('Description', { height: '76px', alignItems: 'flex-start', paddingTop: '9px', lineHeight: '1.45' });
    const ok = btn('Create', 'primary');
    const m = modal('Create a dataset', [field('Name', name.el, true), field('Description', desc.el, true)], [btn('Cancel', 'white'), ok], { top: -170 });
    sh.el.append(m.el);
    return {
      el: sh.el, create, ok, name, update(t) {
        const A = TL.at;
        this.dim = showModal(m, t, A.dsOpen, A.dsClose);
        // The narration moves on fast here, so the fields fill in quickly.
        const span = Math.max(0.6, A.dsClose - A.dsOpen - 0.45);
        type(name, C.dsName, t, A.dsOpen + 0.2, span * 0.3);
        type(desc, C.dsDesc, t, A.dsOpen + 0.25 + span * 0.35, span * 0.6);
      },
    };
  };

  // ---------- one dataset: General / Files / Access management, version + link dialogs, column drawer ----------
  B.datasetPage = (C, D) => {
    // D: { name, desc, ident, versions: [[label, name, date]], changelog, file }
    const title = h('div', { class: 'ox-h1', text: D.name });
    const verText = h('span', { text: D.versions[0][0] });
    const ver = h('div', { class: 'ox-input', style: { width: '230px', fontSize: '13px', height: '34px' } }, [verText, h('span', { style: { marginLeft: 'auto', display: 'flex' } }, [icon('ChevronDown', 14, '#9ca3af', 2)])]);
    const verOpts = D.versions.map((v) => h('div', { class: 'ox-option dim', text: v[0] }));
    const verMenu = h('div', { class: 'ox-menu', style: { left: 0, top: '40px', width: '230px' } }, verOpts);
    const tabs = ['General', 'Files', 'Access management'].map((x) => h('div', { class: 'ox-tab', text: x }));
    const newVer = btn('Create new version', 'primary', 'Plus');

    // General tab
    const dl = (k, v) => h('div', { class: 'br-dl' }, [h('dt', { text: k }), h('dd', { html: v })]);
    const verBlock = h('div', { class: 'ox-card br-pad', style: { marginTop: '12px' } }, [h('div', { class: 'br-sec', text: 'Current version' }), dl('Version', D.versions[0][1]), dl('Created at', D.versions[0][2]), dl('Created by', 'Grace Mbuyi'), dl('Changelog', D.changelog)]);
    const general = h('div', { class: 'abs br-tabbody' }, [
      h('div', { class: 'ox-card br-pad' }, [dl('Description', D.desc), dl('Identifier', `<code class="ox-mono">${D.ident}</code>`), dl('Source workspace', 'B-REACT Surveillance')]),
      verBlock,
    ]);

    // Files tab (DatasetExplorer)
    const fileList = h('div', { class: 'br-flist' }, D.files.map((f, i) => h('div', { class: 'br-fitem' + (i ? '' : ' on'), text: f })));
    const download = h('div', { class: 'ox-btn', style: { background: '#e0e7ff', color: '#4338ca', height: '30px', fontSize: '13px' } }, [icon('ArrowDownTray', 15, '#4338ca', 1.8), h('span', { text: 'Download' })]);
    const ftabs = ['Preview', 'Columns'].map((x, i) => h('div', { class: 'ox-tab' + (i ? '' : ' on'), text: x }));
    const cols = ['health_zone', 'week', 'suspected', 'confirmed', 'deaths'];
    const data = [['ZS-01', '2026-W44', '42', '9', '1'], ['ZS-02', '2026-W44', '17', '3', '0'], ['ZS-03', '2026-W44', '28', '6', '0'], ['ZS-04', '2026-W44', '', '2', '0'], ['ZS-05', '2026-W44', '11', '1', '0']];
    const preview = h('div', { class: 'abs br-fbody' }, [
      h('div', { class: 'br-meta2' }, [h('span', { html: 'Columns <code>5</code>' }), h('span', { html: 'Rows in dataset <code>1,248</code>' })]),
      h('table', { class: 'ox-table br-small' }, [h('thead', {}, [h('tr', {}, cols.map((c) => h('th', { text: c })))]), h('tbody', {}, data.map((r) => h('tr', {}, r.map((x) => h('td', { class: 'ox-mono', text: x })))))]),
    ]);
    const stat = (k, v, hot) => h('tr', { class: hot ? 'br-stat-hot' : '' }, [h('td', { text: k }), h('td', { html: v })]);
    const pencil = h('div', { class: 'ox-btn br-pencil' }, [icon('Pencil', 14, '#4338ca', 1.8)]);
    const tags = [['Unit', 'cases'], ['Source', 'DHIS2 Tracker']].map(([l, v]) => h('span', { class: 'br-badge', text: `${l}: ${v}` }));
    const missRows = [];
    const colBlock = (name, basic, numeric, extra) => {
      const miss = stat('Missing', basic[1]);
      const dist = stat('Distinct', basic[0]);
      missRows.push(miss, dist);
      const kids = [
        h('div', { class: 'br-colname', text: name }),
        h('div', { class: 'br-stats' }, [
          h('table', { class: 'br-stat' }, [h('tbody', {}, [h('tr', { class: 'b' }, [h('td', { text: 'Basic Statistics' })]), dist, miss, stat('Constant', 'No')])]),
          numeric ? h('table', { class: 'br-stat' }, [h('tbody', {}, [h('tr', { class: 'b' }, [h('td', { text: 'Numeric Statistics' })]), stat('Mean', numeric[0]), stat('Median', numeric[1]), stat('Maximum', numeric[2])])]) : null,
        ]),
        h('div', { class: 'br-tags' }, [h('span', { class: 'br-badge amber', text: basic[2] }), ...(extra || [])]),
      ];
      return h('div', { class: 'br-col' }, kids);
    };
    const colA = colBlock('suspected', ['64 <i>(5%)</i>', '38 <i>(3%)</i>', 'int64'], ['21.4', '14', '187'], tags);
    colA.appendChild(pencil);
    const colB = colBlock('health_zone', ['26 <i>(2%)</i>', '0 <i>(0%)</i>', 'object']);
    const columns = h('div', { class: 'abs br-fbody' }, [colA, colB]);
    const filesTab = h('div', { class: 'abs br-tabbody', style: { top: '0', height: '420px' } }, [
      h('div', { class: 'ox-card br-explorer' }, [fileList, h('div', { class: 'br-fmain' }, [
        h('div', { class: 'br-fhead' }, [h('b', { class: 'ox-mono', text: D.files[0] }), download]),
        h('div', { class: 'br-meta' }, [h('span', { html: 'Created at <b>Nov 3, 2026</b>' }), h('span', { html: 'Created by <b>Grace Mbuyi</b>' }), h('span', { html: 'Type <code>text/csv</code>' }), h('span', { html: 'Size <code>86.3 kB</code>' })]),
        h('div', { class: 'ox-tabs', style: { marginTop: '8px' } }, ftabs),
        h('div', { style: { position: 'relative', height: '250px' } }, [preview, columns]),
      ])]),
    ]);

    // Column drawer (ColumnMetadataDrawer)
    const dDesc = typedInput('Enter a description for this column', { height: '62px', alignItems: 'flex-start', paddingTop: '9px', lineHeight: '1.4', fontSize: '13px' });
    const attrRows = [['Unit', 'cases'], ['Source', 'DHIS2 Tracker']].map(([l, v]) => {
      const L = typedInput('Label', { height: '32px', fontSize: '13px' }), V = typedInput('Value', { height: '32px', fontSize: '13px' });
      return { el: h('div', { class: 'br-attr' }, [L.el, V.el, icon('XMark', 14, '#9ca3af', 2)]), L, V, l, v };
    });
    const addAttr = h('div', { class: 'ox-btn br-addattr' }, [icon('Plus', 14, '#4338ca', 2), h('span', { text: 'Attribute' })]);
    const save = btn('Save', 'primary');
    const drawer = h('div', { class: 'br-drawer' }, [
      h('div', { class: 'br-drawer-h' }, [h('b', { class: 'ox-mono', text: 'suspected' }), icon('XMark', 18, '#6b7280', 2)]),
      field('Description', dDesc.el),
      h('div', { class: 'br-attrs-h' }, [h('span', { class: 'ox-label', style: { margin: 0 }, text: 'Attributes' }), addAttr]),
      ...attrRows.map((r) => r.el),
      h('div', { class: 'br-drawer-foot' }, [btn('Close', 'white'), save]),
    ]);
    const drawerScrim = h('div', { class: 'ox-scrim', style: { background: 'rgba(107,114,128,0.35)' } });
    const drawerWrap = h('div', { class: 'abs', style: { width: '744px', height: '640px', overflow: 'hidden' } }, [drawerScrim, drawer]);
    const savedToast = toast('Metadata updated.');

    // Access management tab
    const linkRow = h('tr', {}, [h('td', { class: 'strong' }, [h('span', { class: 'br-ws' }, [h('span', { class: 'flag-sm', html: FLAGS.cd }), h('span', { text: 'B-REACT Analysis' })])]), h('td', { text: 'Nov 5, 2026' }), h('td', { text: 'Grace Mbuyi' }), h('td', {}, [h('span', { class: 'br-revoke', text: 'Revoke' })])]);
    const shareBtn = btn('Share with a workspace', 'primary', 'Share');
    const access = h('div', { class: 'abs br-tabbody' }, [
      h('div', { class: 'ox-card br-pad', style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [h('span', { class: 'br-toggle' }), h('div', {}, [h('div', { style: { fontWeight: 500, fontSize: '14px' }, text: 'Share with the whole Organization' }), h('div', { class: 'ox-help', style: { marginTop: '2px' }, text: 'Only accessible by the owner workspace and explicitly shared workspaces' })])]),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', margin: '14px 0 10px' } }, [shareBtn]),
      h('div', { class: 'ox-card', style: { overflow: 'hidden' } }, [h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, ['Workspace', 'Created At', 'Created By', ''].map((c) => h('th', { text: c })))]), h('tbody', {}, [
        h('tr', {}, [h('td', { class: 'strong' }, [h('span', { class: 'br-ws' }, [h('span', { class: 'flag-sm', html: FLAGS.cd }), h('span', { text: 'B-REACT Laboratory' })])]), h('td', { text: 'Oct 21, 2026' }), h('td', { text: 'Grace Mbuyi' }), h('td', {}, [h('span', { class: 'br-revoke', text: 'Revoke' })])]),
        linkRow,
      ])])]),
    ]);
    const wsText = h('span', { class: 'ph', text: 'Select a workspace' });
    const wsInput = h('div', { class: 'ox-input' }, [wsText, h('span', { style: { marginLeft: 'auto', display: 'flex' } }, [icon('ChevronDown', 16, '#9ca3af', 2)])]);
    const wsOpt = h('div', { class: 'ox-option' }, [h('span', { class: 'flag-sm', html: FLAGS.cd }), h('span', { text: 'B-REACT Analysis' })]);
    const wsMenu = h('div', { class: 'ox-menu', style: { top: '66px' } }, [wsOpt, h('div', { class: 'ox-option dim' }, [h('span', { class: 'flag-sm', html: FLAGS.cd }), h('span', { text: 'MVE-17 Response' })])]);
    const linkBtn = btn('Link', 'primary');
    const lm = modal(`Create a new link to '${D.name}'`, [h('div', { class: 'ox-field', style: { position: 'relative' } }, [h('label', { class: 'ox-label', text: 'Workspace' }), wsInput, wsMenu])], [btn('Cancel', 'white'), linkBtn], { top: -120 });

    // Upload a new version dialog
    const vName = typedInput('Version name. ex: v2'), vLog = typedInput('Changelog', { height: '58px', alignItems: 'flex-start', paddingTop: '9px' });
    const vChip = h('div', { class: 'br-chip' }, [icon('DocumentText', 16, '#2563eb'), h('span', { text: D.newFile }), h('span', { class: 'br-chip-size', text: '86.3 kB' })]);
    const vDrop = h('div', { class: 'br-drop', style: { height: '112px', fontSize: '12.5px', justifyContent: 'flex-start', paddingTop: '16px' } }, [h('span', { text: 'Drag & drop the files from your desktop to create a new version manually.' }), vChip]);
    const vSendLabel = h('span', { text: 'Create' });
    const vSend = h('div', { class: 'ox-btn primary' }, [vSendLabel]);
    const vm = modal('Upload a new version', [
      h('div', { class: 'ox-tabs', style: { marginTop: '-6px', marginBottom: '14px' } }, [h('div', { class: 'ox-tab', text: 'Using SDK' }), h('div', { class: 'ox-tab on', text: 'Upload files' })]),
      field('Name', vName.el, true), field('Changelog', vLog.el), field('Files', vDrop, true),
    ], [btn('Close', 'white'), vSend], { top: -285, w: 560 });

    const body = h('div', { style: { position: 'relative', marginTop: '14px', height: '440px' } }, [general, filesTab, access]);
    const sh = shell(['Datasets', D.name], [h('div', { class: D.pinned ? 'br-star-on' : '', style: { display: 'flex' } }, [star(D.pinned)]), newVer], [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px' } }, [title, h('div', { style: { position: 'relative', marginLeft: 'auto' } }, [ver, verMenu])]),
      h('div', { class: 'ox-tabs', style: { marginTop: '10px' } }, tabs),
      body,
    ]);
    sh.el.append(drawerWrap, vm.el, lm.el, savedToast);
    return {
      el: sh.el, newVer, vSend, ver, verOpts, tabs, ftabs, pencil, colA, addAttr, save, download, shareBtn, wsInput, wsOpt, linkBtn, vName, vDrop,
      // state: { tab, ftab, versionMade, verMenu, pickIdx, hoverCol, drawer:[a,b], link:[a,b], linked, upload:[a,b] }
      render(t, st) {
        const A = TL.at;
        tabs.forEach((el, i) => el.classList.toggle('on', i === st.tab));
        E.show(general, st.tab === 0);
        E.show(filesTab, st.tab === 1);
        E.show(access, st.tab === 2);
        E.show(verBlock, st.versionMade !== false);
        const vi = st.pickIdx ?? 0;
        E.text(verText, st.versionMade === false ? '' : D.versions[vi][0]);
        ver.style.visibility = st.versionMade === false ? 'hidden' : 'visible';
        const mo = st.verMenu || 0;
        E.set(verMenu, { o: mo, y: (1 - mo) * -6 });
        E.show(verMenu, mo > 0.001);
        verOpts.forEach((o, i) => { o.classList.toggle('sel', i === (st.hoverIdx ?? 0)); o.classList.toggle('dim', i !== (st.hoverIdx ?? 0)); });
        ftabs.forEach((el, i) => el.classList.toggle('on', i === (st.ftab || 0)));
        E.show(preview, !st.ftab);
        E.show(columns, !!st.ftab);
        missRows.forEach((r) => r.classList.toggle('br-stat-hot', !!st.statHot));
        colA.classList.toggle('hover', !!st.hoverCol);
        E.set(pencil, { o: st.hoverCol ? 1 : 0 });
        tags.forEach((tg, i) => E.show(tg, !!st.tagsShown));
        // Drawer
        let dim = 0;
        if (st.drawer) {
          const [a, b] = st.drawer;
          const p = E.prog(t, a, 0.35, E.ease.outCubic) * (1 - E.prog(t, b, 0.3, E.ease.inCubic));
          E.show(drawerWrap, p > 0.001);
          E.set(drawerScrim, { o: p });
          E.set(drawer, { x: (1 - p) * 400 });
          dim = Math.max(dim, p * 0.6);
          const ta = a + 0.4;
          const ends = [TL.cue('unit'), TL.cue('source')];
          type(dDesc, 'Suspected cases reported this week', t, ta, Math.max(0.4, ends[0] - ta - 0.35));
          attrRows.forEach((r, i) => {
            const at = ends[i] - 0.05;
            E.show(r.el, t >= at - 0.25);
            type(r.L, r.l, t, at, 0.25);
            type(r.V, r.v, t, at + 0.3, 0.35);
          });
          showToast(savedToast, t, b + 0.15);
        } else E.show(drawerWrap, false);
        // Upload a new version
        if (st.upload) {
          const [a, b] = st.upload;
          dim = Math.max(dim, showModal(vm, t, a, b + 0.9));
          type(vName, 'v1', t, a + 0.35, 0.25);
          type(vLog, D.changelog.replace(/<[^>]+>/g, ''), t, Math.max(TL.cue('changelog'), a + 0.7), 0.9);
          const c = E.prog(t, TL.cue('dropFiles') + 0.15, 0.4, E.ease.outBack);
          E.set(vChip, { o: Math.min(1, c * 1.5), s: 0.8 + 0.2 * c, y: (1 - c) * -20 });
          vDrop.classList.toggle('over', t > TL.cue('dropFiles') - 0.2 && t < TL.cue('dropFiles') + 0.4);
          const up = E.clamp((t - b - 0.05) / 0.75);
          E.text(vSendLabel, up > 0 && up < 1 ? `Creating (${Math.round(up * 100)}%)` : 'Create');
        } else E.show(vm.el, false);
        // Link dialog
        if (st.link) {
          const [a, b] = st.link;
          dim = Math.max(dim, showModal(lm, t, a, b));
          const mo2 = E.window(t, a + 0.45, a + 1.1, 0.15, 0.15);
          E.set(wsMenu, { o: mo2, y: (1 - mo2) * -6 });
          E.show(wsMenu, mo2 > 0.001);
          wsOpt.classList.toggle('sel', t >= a + 0.8);
          const picked = t >= a + 1.0;
          E.text(wsText, picked ? 'B-REACT Analysis' : 'Select a workspace');
          wsText.classList.toggle('ph', !picked);
          wsInput.classList.toggle('focus', t >= a + 0.4 && t < a + 1.2);
        } else E.show(lm.el, false);
        const lp = st.linked ? E.prog(t, st.linked, 0.4) : 0;
        E.show(linkRow, lp > 0);
        E.set(linkRow, { o: lp });
        linkRow.style.background = `rgba(219,234,254,${(0.9 * (1 - E.prog(t, (st.linked || 0) + 1.2, 1.4))) * lp})`;
        void A;
        this.dim = dim;
      },
    };
  };

  // ---------- pipelines: list + templates, pipeline page + run dialog, run page ----------
  B.pipelinesList = () => {
    const card = (name, src, code, v, desc) => h('div', { class: 'ox-card', style: { padding: '16px 18px', display: 'flex', flexDirection: 'column', height: '170px' } }, [
      h('div', { style: { fontWeight: 600, fontSize: '16px' }, text: name }),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12.5px', color: '#6b7280' } }, [AppUI.pill(src, 'gray'), h('span', { text: '•' }), h('span', { class: 'ox-mono', text: code }), h('span', { style: { marginLeft: 'auto' }, text: v })]),
      h('div', { style: { fontSize: '13.5px', color: '#4b5563', marginTop: '10px', lineHeight: 1.45 }, text: desc }),
      h('div', { style: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' } }, [h('span', { style: { color: '#6b7280' }, text: 'Last Run' }), h('span', { class: 'ox-pill', style: { background: '#ecfdf5', color: '#10b981' }, text: 'Succeeded' }), h('span', { style: { color: '#6b7280' }, text: '8 hours ago' })]),
    ]);
    const cards = [card('DHIS2 extraction', 'Template', 'dhis2-extraction', 'v4', 'Extracts weekly alerts and cases from DHIS2 into the workspace.'), card('Weekly SitRep', 'Notebook', 'weekly-sitrep', 'v7', 'Builds the weekly situation report as PDF.')];
    const tabs = ['Pipelines', 'Available Templates'].map((x) => h('div', { class: 'ox-tab', text: x }));
    const gridOf = (kids) => h('div', { class: 'abs', style: { left: '24px', right: '24px', top: '74px' } }, [h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } }, kids)]);
    const grid = gridOf(cards);
    const sh = shell(['Pipelines'], [btn('Create', 'primary', 'Plus')], [h('div', { class: 'ox-tabs', style: { marginTop: 0 } }, tabs)]);
    sh.el.append(grid);
    return {
      el: sh.el, card0: cards[0], create: sh.el.querySelector('.ox-header .ox-btn.primary'), update(t) {
        tabs.forEach((el, i) => el.classList.toggle('on', i === 0));
      },
    };
  };

  B.pipelinePage = () => {
    const run = btn('Run', 'primary', 'Play');
    const tabs = ['General', 'Runs', 'Scheduling and Notifications', 'Code'].map((x, i) => h('div', { class: 'ox-tab' + (i ? '' : ' on'), text: x }));
    const dl = (k, v) => h('div', { class: 'br-dl' }, [h('dt', { text: k }), h('dd', { html: v })]);
    const sh = shell(['Pipelines', 'DHIS2 extraction'], [run], [
      h('div', { class: 'ox-h1', text: 'DHIS2 extraction' }),
      h('div', { class: 'ox-tabs', style: { marginTop: '10px' } }, tabs),
      h('div', { class: 'ox-card br-pad', style: { marginTop: '16px' } }, [dl('Description', 'Extracts weekly alerts and cases from DHIS2 into the workspace.'), dl('Version', 'v4'), dl('Source', 'Template')]),
    ]);
    const params = [['Period start', '2026-10-26'], ['Period end', '2026-11-01'], ['Health zones', 'All']].map(([l, v]) => ({ inp: typedInput(''), l, v }));
    const go = btn('Run', 'primary');
    const adv = h('div', { class: 'br-adv' }, [icon('ChevronRight', 14, '#6b7280', 2), h('div', {}, [h('div', { style: { fontWeight: 500 }, text: 'Advanced settings' }), h('div', { class: 'ox-help', style: { marginTop: '1px' }, text: 'Pipeline version, notifications and logs' })])]);
    const m = modal('Run pipeline', [...params.map((p) => field(p.l, p.inp.el, true)), adv], [btn('Cancel', 'white'), go], { top: -230 });
    sh.el.append(m.el);
    return {
      el: sh.el, run, go, params, update(t) {
        const A = TL.at;
        this.dim = showModal(m, t, A.runOpen, A.runGo + 0.1);
        const t0 = Math.max(TL.cue('parameters') - 0.3, A.runOpen + 0.35);
        const span = Math.max(0.6, A.runGo - t0 - 0.2);
        params.forEach((p, i) => type(p.inp, p.v, t, t0 + (span / 3) * i, (span / 3) * 0.75));
      },
    };
  };

  B.runPage = () => {
    const status = h('span', { class: 'ox-pill' });
    const row = (ic, name, kind) => h('div', { class: 'br-out' }, [icon(ic, 18, '#6b7280'), h('span', { class: 'ox-mono', text: name }), h('span', { class: 'br-out-kind', text: kind }), h('span', { style: { marginLeft: 'auto', display: 'flex' } }, [iconBtn(ic === 'TableCells' ? 'ArrowTopRightOnSquare' : 'ArrowDownTray')])]);
    const outputs = h('div', { class: 'ox-card br-pad', style: { marginTop: '14px' } }, [h('div', { class: 'br-sec', text: 'Outputs' }), row('DocumentText', 'exports/dhis2_alerts_2026-W44.csv', 'File'), row('TableCells', 'dhis2_alerts', 'Database table')]);
    const dl = (k, v) => h('div', { class: 'br-dl' }, [h('dt', { text: k }), h('dd', { html: v })]);
    const statusDl = h('div', { class: 'br-dl' }, [h('dt', { text: 'Status' }), h('dd', {}, [status])]);
    const sh = shell(['Pipelines', 'DHIS2 extraction', 'Run'], [], [
      h('div', { class: 'ox-h1', text: 'DHIS2 extraction' }),
      h('div', { class: 'ox-card br-pad', style: { marginTop: '16px' } }, [statusDl, dl('Executed by', 'Grace Mbuyi'), dl('Parameters', '<code class="ox-mono">2026-10-26 → 2026-11-01 · All</code>')]),
      outputs,
    ]);
    return {
      el: sh.el, outputs, update(t) {
        const done = t >= TL.at.runGo + 1.6;
        E.text(status, done ? 'Succeeded' : 'Running');
        status.style.background = done ? '#ecfdf5' : '#f0f9ff';
        status.style.color = done ? '#10b981' : '#0ea5e9';
        const p = E.prog(t, TL.at.runGo + 1.7, 0.45, E.ease.outCubic);
        E.set(outputs, { o: p, y: (1 - p) * 10 });
      },
    };
  };

  // ---------- settings / members + invite dialog ----------
  B.settingsPage = () => {
    const members = [['Grace Mbuyi', 'grace@example.org', 'Admin'], ['Patrick Kabongo', 'patrick@example.org', 'Admin'], ['Joseph Ilunga', 'joseph@example.org', 'Editor'], ['Sarah Mukendi', 'sarah@example.org', 'Viewer']];
    const rows = members.map(([n, e, r]) => h('tr', {}, [h('td', { class: 'strong', text: n }), h('td', { text: e }), h('td', {}, [h('span', { class: 'ox-role', text: r })]), h('td', { text: 'Oct 12, 2026' })]));
    const invite = btn('Add/Invite member', 'primary', 'UserPlus');
    const tabs = ['General', 'Members', 'Database'].map((x, i) => h('div', { class: 'ox-tab' + (i === 1 ? ' on' : ''), text: x }));
    const sh = shell(['Settings'], [h('div', { class: 'ox-btn', style: { color: '#b91c1c', background: '#fff', border: '1px solid #fecaca' }, text: 'Archive' })], [
      h('div', { class: 'ox-tabs', style: { marginTop: 0 } }, tabs),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', margin: '16px 0 12px' } }, [invite]),
      h('div', { class: 'ox-card', style: { overflow: 'hidden' } }, [h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, ['Name', 'Email', 'Role', 'Joined'].map((c) => h('th', { text: c })))]), h('tbody', {}, rows)])]),
    ]);
    const user = typedInput('Search users');
    const opt = h('div', { class: 'ox-option' }, [h('span', { text: 'Invite new user: paul@partner.org' })]);
    const menu = h('div', { class: 'ox-menu', style: { top: '66px' } }, [opt]);
    const roleText = h('span', { text: 'Viewer' });
    const role = h('div', { class: 'ox-input' }, [roleText, h('span', { style: { marginLeft: 'auto', display: 'flex' } }, [icon('ChevronDown', 16, '#9ca3af', 2)])]);
    const go = btn('Invite', 'primary');
    const m = modal('Add or invite member', [h('div', { class: 'ox-field', style: { position: 'relative', zIndex: 2 } }, [h('label', { class: 'ox-label', text: 'User' }), user.el, menu]), field('Role', role)], [btn('Cancel', 'white'), go], { top: -150 });
    sh.el.append(m.el);
    const ok = toast('Member invited successfully');
    sh.el.append(ok);
    return {
      el: sh.el, invite, go, role, update(t) {
        const A = TL.at;
        this.dim = showModal(m, t, A.inviteOpen, A.inviteDone);
        const t0 = A.inviteOpen + 0.35;
        const tl = TL.cue('lowest');
        const n = type(user, 'paul@partner.org', t, t0, Math.max(0.5, Math.min(0.9, tl - t0 - 0.6)));
        const mo = n > 4 && t < tl - 0.05 ? 1 : 0;
        E.set(menu, { o: mo });
        E.show(menu, mo > 0);
        opt.classList.toggle('sel', t >= tl - 0.35);
        role.classList.toggle('focus', t >= tl && t < A.inviteDone - 0.2);
        roleText.classList.toggle('br-hotrole', t >= tl);
        showToast(ok, t, A.inviteDone + 0.3, 1.8);
      },
    };
  };

  // ---------- sidebar card for users with no organization of their own (ExternalCollaboratorNotice) ----------
  B.orgNotice = (O) => h('div', { class: 'br-notice' }, [
    h('div', { class: 'br-notice-row' }, [icon('Sparkles', 16, '#fff', 2), h('div', {}, [
      h('div', { class: 'br-notice-t', text: O.card[0] }),
      h('div', { class: 'br-notice-d', text: O.card[1] }),
      h('div', { class: 'br-notice-a' }, [h('span', { text: O.card[2] }), icon('ArrowTopRightOnSquare', 11, '#fff', 2)]),
    ])]),
  ]);

  // ---------- JupyterHub: JupyterLab with a Python notebook using the SDK (illustrative content) ----------
  const py = (src) => src
    .replace(/(".*?")/g, '<span class="sq-s">$1</span>')
    .replace(/\b(from|import|as)\b/g, '<span class="sq-k">$1</span>')
    .replace(/(#.*)$/gm, '<span class="nb-com">$1</span>');
  B.notebooksPage = () => {
    const cellsSrc = [
      'from openhexa.sdk import workspace\nimport pandas as pd',
      'ds = workspace.get_dataset("weekly-cases-by-zone-a1b2c3")\nf = ds.latest_version.get_file("cases_by_zone.csv")\ndf = pd.read_csv(f.download_url)\ndf.head(3)',
      'summary = workspace.create_dataset("Zone summary", "Cases per zone, all weeks")',
      'v = summary.create_version("v1")\nv.add_file(f"{workspace.files_path}/exports/zone_summary.csv")',
    ];
    const cells = cellsSrc.map((src, i) => h('div', { class: 'nb-cell' }, [h('div', { class: 'nb-prompt', text: `[${i + 1}]:` }), h('div', { class: 'nb-code', html: py(src) })]));
    const out = h('div', { class: 'nb-out br-dfout' }, [h('table', { class: 'br-df' }, [
      h('thead', {}, [h('tr', {}, ['', 'health_zone', 'week', 'suspected', 'confirmed'].map((x) => h('th', { text: x })))]),
      h('tbody', {}, [['0', 'ZS-01', '2026-W44', '42', '9'], ['1', 'ZS-02', '2026-W44', '17', '3'], ['2', 'ZS-03', '2026-W44', '28', '6']].map((r) => h('tr', {}, r.map((x, i) => h(i ? 'td' : 'th', { text: x })))))])]);
    const doc = h('div', { class: 'nb-doc' }, [h('div', { class: 'nb-tab', text: 'weekly_cases.ipynb' }), cells[0], cells[1], out, cells[2], cells[3]]);
    const kernel = h('div', { class: 'br-kernel', text: 'Python 3 (ipykernel)' });
    const tile = (label, sub) => h('div', { class: 'br-ltile' }, [h('div', { class: 'br-ltile-i', text: sub }), h('span', { text: label })]);
    const tiles = [tile('Python 3 (ipykernel)', 'Py'), tile('R', 'R')];
    const launcher = h('div', { class: 'br-launcher' }, [h('div', { class: 'br-lsec' }, [icon('BookOpen', 18, '#f57c00', 1.8), h('span', { text: 'Notebook' })]), h('div', { class: 'br-ltiles' }, tiles)]);
    const lab = h('div', { class: 'nb-lab' }, [
      h('div', { class: 'nb-menu' }, [...['File', 'Edit', 'View', 'Run', 'Kernel', 'Tabs', 'Settings', 'Help'].map((x) => h('span', { text: x })), kernel]),
      h('div', { class: 'nb-main' }, [
        h('div', { class: 'nb-files' }, ['exports', 'raw', 'weekly_cases.ipynb', 'line_list_codebook.xlsx'].map((f, i) => h('div', { class: 'nb-file' + (i === 2 ? ' on' : ''), text: f }))),
        h('div', { style: { position: 'relative', flex: 1 } }, [doc, launcher]),
      ]),
    ]);
    const sh = shell(['Notebooks'], [], [lab], { pad: false });
    return {
      el: sh.el, tiles, update(t) {
        const c = TL.cue;
        const lp = 1 - E.prog(t, c('signedIn') - 0.45, 0.3);
        E.set(launcher, { o: lp });
        tiles.forEach((el, i) => el.classList.toggle('hot', t >= c('python') + i * 0.45 && lp > 0.5));
        E.set(kernel, { o: 1 - lp });
        const at = [c('signedIn') - 0.2, c('readDs') - 0.2, c('createDs') - 0.1, c('publishVer') - 0.1];
        cells.forEach((el, i) => { const p = E.prog(t, at[i], 0.35, E.ease.outCubic); E.set(el, { o: p, y: (1 - p) * 8 }); el.classList.toggle('run', t >= at[i] && t < (at[i + 1] ?? TL.end('s14') + 0.5)); });
        const op = E.prog(t, at[1] + 0.7, 0.35);
        E.set(out, { o: op, y: (1 - op) * 6 });
      },
    };
  };

  // ---------- Account settings, Access tokens (AccountAccessTokens, WorkspaceAccessTokenCell) ----------
  B.accountPage = () => {
    const eye = h('span', { class: 'br-eye' }, [icon('Eye', 16, '#374151', 1.8)]);
    const copy = h('span', { class: 'br-copy' }, [icon('Square2Stack', 16, '#374151', 1.8)]);
    const masked = h('span', { class: 'br-masked' }, [icon('LockClosed', 12, '#6b7280', 2), h('span', { text: '*********' })]);
    const shown = h('code', { class: 'br-token', text: 'hx_8f3KqZ2vT9mLx4Wc7Rb1Ya6Nd0Pe5Gs3Uh2Jk' });
    const row = (ws, role, cell) => h('tr', {}, [h('td', { class: 'strong', text: ws }), h('td', { text: role }), h('td', {}, [cell])]);
    const cell0 = h('div', { class: 'br-tcell' }, [h('div', { class: 'br-tslot' }, [masked, shown]), eye, copy]);
    const maskedRow = () => h('div', { class: 'br-tcell' }, [h('div', { class: 'br-tslot' }, [h('span', { class: 'br-masked' }, [icon('LockClosed', 12, '#6b7280', 2), h('span', { text: '*********' })])]), icon('Eye', 16, '#374151', 1.8)]);
    const tbl = h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, ['Workspace', 'Role', 'Token'].map((x) => h('th', { text: x })))]), h('tbody', {}, [
      row('B-REACT Surveillance', 'Admin', cell0),
      row('B-REACT Laboratory', 'Editor', maskedRow()),
      row('B-REACT Analysis', 'Viewer', h('span', { class: 'br-ask', text: 'Ask a workspace admin for an editor role.' })),
    ])]);
    const block = h('div', { class: 'ox-card br-pad' }, [
      h('div', { class: 'br-sec', style: { fontSize: '17px' }, text: 'Access tokens' }),
      h('p', { class: 'br-tokdesc', html: 'Use these tokens to authenticate with the <code>openhexa</code> CLI and the OpenHEXA SDK. Workspaces you are a direct member of have a long-lived token; workspaces you only administer issue a temporary one that has to be generated again once it expires.' }),
      tbl,
    ]);
    const el = h('div', { class: 'abs br-account' }, [h('div', { class: 'ox-h1', style: { marginBottom: '16px' }, text: 'Your account' }), block]);
    return {
      el, eye, copy, update(t) {
        const A = TL.at;
        const on = t >= A.tokenEye;
        E.show(masked, !on);
        E.show(shown, on);
        E.show(copy, on);
        copy.classList.toggle('hot', t >= A.tokenCopy - 0.05 && t < A.tokenCopy + 0.5);
      },
    };
  };

  // ---------- Web apps: list, Create a web app (Create with AI), editor with the AI Assistant ----------
  B.webappsPage = () => {
    const cards = [['Weekly SitRep dashboard', 'Static'], ['Lab turnaround', 'Static']].map(([n, ty]) => h('div', { class: 'ox-card', style: { padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' } }, [
      h('div', { style: { width: '36px', height: '36px', borderRadius: '8px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [icon('GlobeAlt', 20, '#4f46e5', 1.6)]),
      h('div', {}, [h('div', { style: { fontSize: '15px', fontWeight: 600 }, text: n }), h('div', { style: { marginTop: '4px' } }, [AppUI.pill(ty, 'gray')])]),
    ]));
    const create = btn('Create', 'primary', 'Plus');
    const sh = shell(['Web Apps'], [create], [h('div', { style: { fontWeight: 600, fontSize: '15px', marginBottom: '12px' }, text: 'All apps' }), h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' } }, cards)]);
    const opts = [['Sparkles', 'Create with AI', 'Describe what you want, AI writes the code'], ['CodeBracket', 'From code', 'Write or upload your own HTML, CSS and JavaScript'], ['GlobeAlt', 'iFrame', 'Embed an existing website by its URL']].map(([ic, tt, d]) => h('div', { class: 'pl-opt' }, [icon(ic, 26, '#60a5fa', 1.5), h('div', { class: 'pl-opt-t', text: tt }), h('div', { class: 'pl-opt-d', text: d })]));
    const choose = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' } }, opts);
    const prompt = typedInput('e.g. Create a dashboard that shows the monthly number of malaria cases per district from the workspace database', { height: '92px', alignItems: 'flex-start', paddingTop: '10px', lineHeight: '1.45', fontSize: '13px' });
    const stepTexts = ['Generating web app code', 'Creating web app', 'Opening web app editor'];
    const steps = stepTexts.map((x) => h('div', { class: 'br-aistep' }, [h('span', { class: 'br-spin' }), h('span', { text: x })]));
    const goBtn = btn('Create', 'primary');
    const aiForm = h('div', {}, [
      h('div', { style: { fontSize: '13px', color: '#6b7280', marginBottom: '8px' }, text: '← Back' }),
      h('div', { style: { fontSize: '13.5px', color: '#374151', marginBottom: '10px' }, text: 'Describe your web app and the AI will generate the code to get you started.' }),
      prompt.el, h('div', { class: 'br-aisteps' }, steps), h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '12px' } }, [goBtn]),
    ]);
    const m = modal('Create a web app', [choose, aiForm], [], { w: 620, top: -190 });
    m.dialog.querySelector('.ox-dialog-actions').remove();
    // Editor: preview on the left, the AI Assistant chat on the right.
    const bars = [62, 41, 55, 23, 34].map((v, i) => `<div><i style="height:${(v / 62) * 100}%"></i><span>ZS-0${i + 1}</span></div>`).join('');
    const preview = h('div', { class: 'br-dash' }, [
      h('div', { class: 'br-dash-h', text: 'Weekly cases by health zone' }),
      h('div', { class: 'wa-kpis' }, [['126', 'suspected, W44'], ['21', 'confirmed'], ['5', 'health zones']].map(([v, l]) => h('div', { class: 'wa-kpi' }, [h('b', { text: v }), h('span', { text: l })]))),
      h('div', { class: 'wa-bars', style: { height: '150px' }, html: bars }),
    ]);
    const chat = h('div', { class: 'br-chat' }, [
      h('div', { class: 'br-chat-h' }, [icon('Sparkles', 16, '#4f46e5', 1.8), h('b', { text: 'AI Assistant' })]),
      h('div', { class: 'br-bubble me', text: 'A dashboard of weekly suspected cases by health zone' }),
      h('div', { class: 'br-bubble', text: 'Done: KPI cards and a bar chart by health zone. Want a map next?' }),
    ]);
    const editor = h('div', { class: 'abs br-editor' }, [h('div', { class: 'ox-header' }, [h('div', { class: 'ox-crumbs' }, [h('span', { text: 'Web Apps' }), icon('ChevronRight', 14, '#9ca3af', 2), h('b', { text: 'Weekly cases dashboard' })])]), h('div', { class: 'br-editor-body' }, [preview, chat])]);
    sh.el.append(m.el, editor);
    return {
      el: sh.el, create, opts, goBtn, prompt, update(t) {
        const A = TL.at;
        this.dim = showModal(m, t, A.appOpen, A.appDone - 0.2);
        const ai = t >= A.appAi + 0.2;
        E.show(choose, !ai);
        E.show(aiForm, ai);
        opts[0].classList.toggle('hot', t >= A.appAi - 0.15);
        type(prompt, 'A dashboard of weekly suspected cases by health zone', t, A.appAi + 0.35, Math.max(0.6, A.appSend - A.appAi - 0.75));
        const sd = (A.appDone - 0.25 - A.appSend) / 3;
        steps.forEach((el, i) => { E.show(el, t >= A.appSend + 0.1 + i * sd); el.classList.toggle('done', t >= A.appSend + 0.1 + (i + 1) * sd); });
        const ep = E.prog(t, A.appDone - 0.15, 0.4, E.ease.outCubic);
        E.show(editor, ep > 0);
        E.set(editor, { o: ep });
        const bp = E.prog(t, A.appDone + 0.2, 0.6, E.ease.outCubic);
        E.set(preview, { o: 0.3 + 0.7 * bp, y: (1 - bp) * 8 });
      },
    };
  };

  // ---------- Create a pipeline dialog ----------
  B.createPipelineDialog = () => {
    const opts = [['Sparkles', 'Create with AI', 'Describe what you want, AI writes the code'], ['Square2Stack', 'From Template', 'Start from a shared template'], ['BookOpen', 'From Notebook', 'Use a Jupyter notebook']].map(([ic, tt, d]) => h('div', { class: 'pl-opt' }, [icon(ic, 30, '#60a5fa', 1.5), h('div', { class: 'pl-opt-t', text: tt }), h('div', { class: 'pl-opt-d', text: d })]));
    const cli = h('div', { class: 'br-cli', text: 'From OpenHEXA CLI →' });
    const m = modal('Create a pipeline', [h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' } }, opts), h('div', { style: { marginTop: '18px', display: 'flex' } }, [cli])], [btn('Close', 'white')], { w: 640, top: -160 });
    return { el: m.el, m, opts, cli };
  };


  // ---------- B-REACT access & sharing (scenes/035-breact.js) ----------
  // A partner's Datasets list: links to the controllers' datasets, the Workspace column naming the
  // source workspace (pages/workspaces/[workspaceSlug]/datasets/index.tsx; dates are relative there).
  B.brDatasets = () => {
    const rows = [
      ['Aggregated alerts', '2 days ago', 'Patrick Kabongo', 'DSE'],
      ['Aggregated contacts', '2 days ago', 'Patrick Kabongo', 'DSE'],
      ['Line lists · No ID', 'yesterday', 'Sarah Mukendi', 'COUSP'],
      ['Contacts · No ID', 'yesterday', 'Sarah Mukendi', 'COUSP'],
      ['Lab data', '3 days ago', 'Joseph Ilunga', 'INRB'],
      ['ETC line lists', '4 days ago', 'Esther Lunda', 'MSF'],
    ];
    const wsCells = [];
    const trs = rows.map(([n, u, by, ws]) => {
      const cell = h('td', {}, [h('span', { class: 'br-ws' }, [h('span', { class: 'flag-sm', html: FLAGS.cd }), h('span', { text: ws })])]);
      wsCells.push(cell);
      return h('tr', {}, [h('td', { class: 'strong' }, [h('span', { class: 'ox-ico-cell' }, [star(false), h('span', { text: n })])]), h('td', { text: u }), h('td', { text: by }), cell]);
    });
    const heads = ['Name', 'Last updated', 'Created by', 'Workspace'].map((c) => h('th', { text: c }));
    const sh = shell(['Datasets'], [btn('Create', 'primary', 'Plus')], [
      h('div', { class: 'ox-card', style: { overflow: 'hidden' } }, [h('table', { class: 'ox-table' }, [h('thead', {}, [h('tr', {}, heads)]), h('tbody', {}, trs)])]),
    ]);
    return { el: sh.el, wsHead: heads[3], wsCells, update() {} };
  };

  // Oxford's pipeline page: "Publish as Template" sits first in the header actions
  // (workspaces/layouts/PipelineLayout/PipelineLayout.tsx).
  B.brPipeline = () => {
    const publish = secondary('Publish as Template');
    const tabs = ['General', 'Runs', 'Scheduling and Notifications', 'Code'].map((x, i) => h('div', { class: 'ox-tab' + (i ? '' : ' on'), text: x }));
    const dl = (k, v) => h('div', { class: 'br-dl' }, [h('dt', { text: k }), h('dd', { html: v })]);
    const sh = shell(['Pipelines', 'Contact cleaning'], [publish, secondary('Download code'), btn('Run', 'primary', 'Play')], [
      h('div', { class: 'ox-h1', text: 'Contact cleaning' }),
      h('div', { class: 'ox-tabs', style: { marginTop: '10px' } }, tabs),
      h('div', { class: 'ox-card br-pad', style: { marginTop: '16px' } }, [dl('Description', 'Cleans and deduplicates contact tracing lists.'), dl('Version', 'v3')]),
    ]);
    return { el: sh.el, publish, update() {} };
  };

  // Available Templates: every template on the instance ("All templates"), as TemplateCards with a
  // publisher badge ("Community" until validated) and "Create pipeline"
  // (pipelines/features/PipelineTemplates, workspaces/features/TemplateCard).
  B.brTemplates = () => {
    const tabs = ['Pipelines', 'Available Templates'].map((x, i) => h('div', { class: 'ox-tab' + (i ? ' on' : ''), text: x }));
    const select = (label) => h('div', { class: 'ox-input', style: { width: '170px', height: '34px', fontSize: '13px' } }, [h('span', { text: label }), h('span', { style: { marginLeft: 'auto', display: 'flex' } }, [icon('ChevronDown', 14, '#9ca3af', 2)])]);
    const card = (name, desc, n, initials) => {
      const create = btn('Create pipeline', 'primary');
      const el = h('div', { class: 'ox-card br-tpl' }, [
        h('div', { class: 'br-tpl-top' }, [h('b', { text: name }), AppUI.pill('Community', 'gray')]),
        h('div', { class: 'br-tpl-desc', text: desc }),
        h('div', { class: 'br-tpl-foot' }, [h('span', { html: `<b>${n}</b> ${n === 1 ? 'pipeline' : 'pipelines'}` }), h('span', { class: 'br-tpl-av', text: initials })]),
        h('div', { class: 'br-tpl-btns' }, [btn('Details', 'white'), create]),
      ]);
      return { el, create };
    };
    const c1 = card('Contact cleaning', 'Cleans and deduplicates contact tracing lists.', 1, 'OX');
    const c2 = card('DHIS2 extraction', 'Extracts weekly alerts and cases from DHIS2 into the workspace.', 6, 'BS');
    const t = toast('Successfully created pipeline Contact cleaning');
    const sh = shell(['Pipelines'], [btn('Create', 'primary', 'Plus')], [
      h('div', { class: 'ox-tabs', style: { marginTop: 0 } }, tabs),
      h('div', { style: { display: 'flex', gap: '10px', marginTop: '16px' } }, [select('All templates'), select('All publishers')]),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' } }, [c1.el, c2.el]),
    ]);
    sh.el.append(t);
    return {
      el: sh.el, tab: tabs[1], create: c1.create, update(tt) { showToast(t, tt, TL.at.tplCreate + 0.25, 2.6); },
    };
  };

  window.BR = B;
})();
