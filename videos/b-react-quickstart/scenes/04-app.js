// Data Studio beats for core/app-ui.js studioPage.
AppUI.beats = {
  generateSql: () => TL.cue('studio') + 0.1,
  aiSql: () => TL.cue('studio') + 1.4,
};

// Scenes join → ai: the invitation email, then one continuous app window. It steps aside while the
// RStudio chapter plays (scenes/045-rstudio.js) and comes back for pipelines. Each page is a builder
// from pages.js (or core/app-ui.js); `segments()` says which page shows when, `dsState()` drives the
// dataset page, and a callout on the right tracks each chapter.
E.scene({
  name: 'app',
  from: () => TL.scenes.join,
  to: () => TL.scenes.rules + 1.0,
  build(root) {
    const S = I18N[LANG];
    const { h } = E;
    this.S = S;
    this.win = AppUI.window();
    this.side = AppUI.wsSidebar();
    // B-REACT partners belong to workspaces, not to the Bluesquare organization, so the app shows them
    // the "Create your own organization" card at the bottom of the sidebar.
    this.side.el.classList.add('br-side');
    this.side.el.insertBefore(BR.orgNotice(S.org), this.side.el.querySelector('.ox-user'));
    this.main = h('div', { class: 'ox-main' });
    this.sideDim = h('div', { class: 'ox-scrim', style: { right: 'auto', width: '256px' } });
    this.reg = BR.registerPage(S.email);
    this.win.body.append(this.side.el, this.main, this.sideDim, this.reg.el);

    const dsNewDef = { name: 'Weekly indicators', desc: 'Weekly indicators by health zone, from DHIS2.', ident: 'weekly-indicators-7c1e2a', versions: [['v1 - Nov 5, 2026', 'v1', 'Nov 5, 2026']], changelog: 'First release: weeks 18 to 44.', files: ['indicators_by_zone.csv'], newFile: 'indicators_by_zone.csv', pinned: false };
    const dsMainDef = { name: 'Weekly cases by zone', desc: 'Suspected and confirmed cases by health zone and week, from DHIS2 Tracker.', ident: 'weekly-cases-by-zone-a1b2c3', versions: [['2026-W44 - Nov 3, 2026', '2026-W44', 'Nov 3, 2026'], ['2026-W43 - Oct 27, 2026', '2026-W43', 'Oct 27, 2026'], ['2026-W42 - Oct 20, 2026', '2026-W42', 'Oct 20, 2026']], changelog: 'Adds week 44.', files: ['cases_by_zone.csv', 'cases_by_zone.parquet'], newFile: 'cases_by_zone.csv', pinned: true };
    this.pages = {
      home: BR.homePage(S),
      files: BR.filesPage(),
      dsList: BR.datasetsList({ dsName: dsNewDef.name, dsDesc: dsNewDef.desc }),
      dsNew: BR.datasetPage(S, dsNewDef),
      dsMain: BR.datasetPage(S, dsMainDef),
      notebooks: BR.notebooksPage(),
      pipes: BR.pipelinesList(),
      pipe: BR.pipelinePage(),
      run: BR.runPage(),
      settings: BR.settingsPage(),
      webapps: BR.webappsPage(),
      studio: AppUI.studioPage(),
    };
    this.plDlg = BR.createPipelineDialog();
    this.main.append(...Object.values(this.pages).map((p) => p.el), this.plDlg.el);
    this.helpBtn = h('div', { class: 'ox-help-btn', text: '?' });
    this.win.body.appendChild(this.helpBtn);
    this.winWrap = h('div', { class: 'abs' }, [this.win.el]);
    E.set(this.win.el, { s: 1.28 });

    this.mail = BR.email(S.email);

    // Callout panels.
    const C = S.co;
    const doc = (d) => h('div', { class: 'co-doc' }, [UI.heroIcon('BookOpen', 22, '#9ff3df', 1.7), h('span', { text: 'docs.openhexa.com/' + d })]);
    const panel = (ic, title, desc, d) => h('div', { class: 'co-panel' }, [
      h('div', { class: 'co-top' }, [h('div', { class: 'co-icon' }, [UI.heroIcon(ic, 36, '#ff8cc0', 1.6)])]),
      h('div', { class: 'co-title', text: title }),
      h('div', { class: 'co-desc', html: desc }),
      d ? doc(d) : null,
    ]);
    const list = (ic, title, items, d) => {
      const its = items.map((x, i) => h('div', { class: 'co-item' }, [h('div', { class: 'tick', text: String(i + 1) }), h('span', { text: x })]));
      return { el: h('div', { class: 'co-panel' }, [h('div', { class: 'co-top' }, [h('div', { class: 'co-icon' }, [UI.heroIcon(ic, 36, '#ff8cc0', 1.6)]), h('div', { class: 'co-title', style: { fontSize: '44px' }, text: title })]), h('div', { class: 'co-list' }, its), d ? doc(d) : null]), items: its };
    };
    this.co = {
      join: list('Envelope', C.join.title, C.join.items),
      files: { el: panel('FolderOpen', ...C.files) },
      datasets: { el: panel('Square2Stack', ...C.datasets) },
      dsSteps: list('Square2Stack', C.dsSteps.title, C.dsSteps.items, 'datasets/'),
      notebooks: { el: panel('BookOpen', ...C.notebooks) },
      sdk: list('CodeBracket', C.sdk.title, C.sdk.items, C.sdk.doc),
      pipelines: { el: panel('Bolt', ...C.pipelines) },
      webapps: { el: panel('GlobeAlt', ...C.webapps) },
      ai: list('Sparkles', C.ai.title, C.ai.items, C.ai.doc),
    };
    const roleRows = C.members.roles.map(([r, d]) => h('div', { class: 'br-corole' }, [h('b', { text: r }), h('span', { text: d })]));
    this.roleRows = roleRows;
    this.tip = h('div', { class: 'br-cotip' }, [UI.heroIcon('CheckCircle', 24, '#3ee6c1', 1.8), h('span', { text: C.members.tip })]);
    this.co.members = { el: h('div', { class: 'co-panel' }, [h('div', { class: 'co-top' }, [h('div', { class: 'co-icon' }, [UI.heroIcon('Users', 36, '#ff8cc0', 1.6)]), h('div', { class: 'co-title', style: { fontSize: '44px' }, text: C.members.title })]), ...roleRows, this.tip]) };
    this.callout = h('div', { class: 'callout abs' }, Object.values(this.co).map((p) => p.el));

    this.ring = h('div', { class: 'ox-ring abs' });
    this.cursor = UI.cursor();
    root.append(this.mail.el, this.winWrap, this.callout, this.ring, this.cursor);
    this.stage = document.getElementById('stage');
  },

  box(el) {
    const s = this.stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / TL.width;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  },
  center(el, dx = 0.5, dy = 0.55) {
    const b = this.box(el);
    return [b.x + b.w * dx, b.y + b.h * dy];
  },

  segments() {
    const c = TL.cue, A = TL.at;
    return [
      ['home', A.regDone + 0.45], ['files', c('files') - 0.15], ['dsList', c('dataset') - 0.15], ['dsNew', A.dsClose + 0.05],
      ['dsMain', c('filesTab') - 0.35], ['notebooks', c('jupyter') - 0.15], ['pipes', c('pipelines') - 0.15], ['pipe', c('extracting') + 0.35],
      ['run', A.runGo + 0.4], ['pipes', c('editorsCreate') - 0.3], ['settings', c('settings') - 0.15], ['webapps', c('webapps') - 0.15],
      ['studio', c('studio') - 0.45],
    ];
  },

  // Dataset page state over time (tab, version menu, drawer, link...).
  dsState(t, key) {
    const c = TL.cue, A = TL.at;
    if (key === 'dsNew') return { tab: 0, versionMade: t >= A.verSend + 0.95, upload: [A.verOpen, A.verSend] };
    const st = { tab: 0, ftab: 0 };
    if (t >= c('filesTab') + 0.15) st.tab = 1;
    if (t >= c('statistics') + 0.1 && t < c('selector')) st.ftab = 1;
    st.statHot = t >= c('missing') - 0.15 && t < TL.end('s09') + 0.8;
    st.hoverCol = t >= c('hover') - 0.05 && t < A.drawerSave + 0.4;
    st.drawer = [A.drawerOpen, A.drawerSave];
    st.tagsShown = t >= A.drawerSave + 0.35;
    st.verMenu = E.window(t, c('selector') + 0.2, A.pick + 0.1, 0.15, 0.15);
    st.hoverIdx = t >= A.pick - 0.35 ? 1 : 0;
    st.pickIdx = t >= A.pick + 0.05 ? 1 : 0;
    if (t >= c('access') + 0.15) st.tab = 2;
    st.link = [A.linkOpen, A.linkDone];
    st.linked = A.linkDone + 0.15;
    return st;
  },

  update(t) {
    const { set, prog, ease, lerp, clamp } = E;
    const c = TL.cue, A = TL.at, T = TL.scenes;
    const tWin = c('joinNow') + 0.55;
    const tExit = T.rules;

    // ---------- invitation email ----------
    const mIn = prog(t, T.join + 0.1, 0.8, ease.outQuart);
    const mOut = prog(t, tWin, 0.7, ease.inOutCubic);
    set(this.mail.el, { x: 170 - mOut * 220, y: 240 + (1 - mIn) * 60, s: lerp(0.96, 1, mIn) * lerp(1, 0.9, mOut), o: Math.min(1, mIn * 1.5) * (1 - mOut), blur: mOut * 6 });
    E.show(this.mail.el, mOut < 1);

    // ---------- window (steps aside during the RStudio chapter) ----------
    const enter = prog(t, tWin + 0.1, 0.9, ease.outQuart);
    const exit = prog(t, tExit - 0.2, 0.9, ease.inCubic);
    const away = ease.inOutCubic(E.window(t, T.rstudio - 0.3, T.pipelines + 0.15, 0.7, 0.7));
    const gone = Math.max(exit, away);
    set(this.winWrap, { x: 70 - gone * 160, y: 150 + (1 - enter) * 90, s: lerp(0.94, 1, enter) * lerp(1, 0.92, gone), o: Math.min(1, enter * 1.6) * (1 - gone), blur: gone * 6 });
    E.show(this.winWrap, enter > 0 && gone < 1);

    const inApp = t >= A.regDone + 0.45;
    const regFade = prog(t, A.regDone + 0.35, 0.35);
    E.show(this.reg.el, regFade < 1);
    set(this.reg.el, { o: 1 - regFade });
    this.reg.update(t);
    E.show(this.side.el, regFade > 0);

    // ---------- page segments ----------
    const segs = this.segments();
    let cur = -1;
    segs.forEach(([, st], i) => { if (t >= st) cur = i; });
    const navOf = { home: 'home', files: 'files', dsList: 'datasets', dsNew: 'datasets', dsMain: 'datasets', notebooks: 'jupyter', pipes: 'pipelines', pipe: 'pipelines', run: 'pipelines', settings: 'settings', webapps: 'apps', studio: 'dataStudio' };
    const paths = { home: '', files: '/files', dsList: '/datasets', dsNew: '/datasets/weekly-indicators-7c1e2a/from/b-react-surveillance', dsMain: '/datasets/weekly-cases-by-zone-a1b2c3/from/b-react-surveillance/files', notebooks: '/notebooks', pipes: '/pipelines', pipe: '/pipelines/dhis2-extraction', run: '/pipelines/dhis2-extraction/runs/3f2a9c', settings: '/settings', webapps: '/webapps', studio: '/data-studio' };
    let dim = 0;
    const key = cur >= 0 ? segs[cur][0] : 'home';
    const fade = cur >= 0 ? prog(t, segs[cur][1], 0.35, ease.outCubic) : 1;
    const prevKey = cur > 0 ? segs[cur - 1][0] : null;
    if (gone < 1) {
      for (const [k, page] of Object.entries(this.pages)) {
        const on = k === key || (k === prevKey && fade < 1);
        E.show(page.el, (on && inApp) || (k === 'home' && regFade > 0 && cur <= 0));
        if (!on) continue;
        if (k === key) set(page.el, { o: cur <= 0 ? 1 : fade, x: (1 - fade) * 14 });
        else set(page.el, { o: 1 - fade });
        if (page.render) page.render(t, this.dsState(t, k));
        else page.update(t);
        if (page.dim) dim = Math.max(dim, page.dim * (k === key ? fade : 1 - fade));
      }
    }
    // Create a pipeline: from a template, from a notebook, or with the SDK through the CLI.
    const plP = BR.showModal(this.plDlg.m, t, A.createOpen, A.createClose);
    const hotAt = [c('template'), c('fromNotebook'), c('withSdk')];
    const hot = hotAt.reduce((k, x, i) => (t >= x - 0.1 ? i : k), -1);
    this.plDlg.opts[1].classList.toggle('hot', hot === 0);
    this.plDlg.opts[2].classList.toggle('hot', hot === 1);
    this.plDlg.cli.classList.toggle('hot', hot === 2);
    dim = Math.max(dim, plP);
    set(this.sideDim, { o: inApp ? dim : 0 });
    const sideP = cur > 0 ? prog(t, segs[cur][1] - 0.05, 0.25) : 1;
    this.side.setActive(navOf[key], sideP);
    this.win.setUrl(!inApp ? `/register?email=${encodeURIComponent(this.S.email.to)}` : `/workspaces/${this.S.workspaceSlug}${paths[key]}`);
    // Modals and the column drawer cover the help button, as they do in the app.
    set(this.helpBtn, { o: inApp ? 1 - Math.min(1, dim * 1.7) : 0 });

    // ---------- callout ----------
    const coIn = prog(t, T.join + 0.4, 0.8, ease.outQuart) * (1 - gone);
    set(this.callout, { x: 1395 + (1 - coIn) * 60 + gone * 80, y: 330, o: coIn });
    const showPanel = (el, a, b) => {
      const p = E.window(t, a, b, 0.4, 0.25);
      E.show(el, p > 0.001);
      set(el, { o: p, y: (1 - prog(t, a, 0.5, ease.outCubic)) * 18 });
    };
    const steps = (items, times) => items.forEach((el, i) => {
      el.classList.toggle('on', t >= times[i] && t < times[i + 1]);
      el.classList.toggle('done', t >= times[i + 1]);
    });
    const vo = TL.vo;
    showPanel(this.co.join.el, -1, c('files') - 0.3);
    steps(this.co.join.items, [c('invitation') - 0.2, c('joinNow') - 0.1, c('yourName') - 0.1, A.regDone + 0.3]);
    showPanel(this.co.files.el, c('files') - 0.3, c('dataset') - 0.3);
    showPanel(this.co.datasets.el, c('dataset') - 0.3, vo.s08 - 0.3);
    showPanel(this.co.dsSteps.el, vo.s08 - 0.3, c('jupyter') - 0.3);
    steps(this.co.dsSteps.items, [c('create') - 0.2, c('newVersion') - 0.2, c('filesTab') - 0.2, c('hover') - 0.2, c('older') - 0.2, c('access') - 0.2, TL.end('s12') + 0.5]);
    showPanel(this.co.notebooks.el, c('jupyter') - 0.3, c('readDs') - 0.4);
    showPanel(this.co.sdk.el, c('readDs') - 0.4, T.rstudio + 0.4);
    steps(this.co.sdk.items, [c('readDs') - 0.1, c('createDs') - 0.1, c('publishVer') - 0.1, TL.end('s14') + 0.5]);
    showPanel(this.co.pipelines.el, c('pipelines') - 0.3, c('settings') - 0.3);
    showPanel(this.co.members.el, c('settings') - 0.3, c('webapps') - 0.3);
    this.roleRows.forEach((el, i) => el.classList.toggle('on', i === 0 && t >= c('lowest') - 0.1));
    const tp = prog(t, c('lowest') - 0.1, 0.45, ease.outBack);
    set(this.tip, { o: Math.min(1, tp * 1.4), s: 0.9 + 0.1 * tp });
    showPanel(this.co.webapps.el, c('webapps') - 0.3, vo.s24 - 0.3);
    showPanel(this.co.ai.el, vo.s24 - 0.3, tExit + 1);
    steps(this.co.ai.items, [vo.s24 - 0.6, c('sql') - 0.2, c('connect') - 0.2, TL.end('s24') + 0.6]);

    // ---------- cursor ----------
    const P = this.pages, ds = P.dsMain, dn = P.dsNew;
    const keys = [];
    const add = (time, el, opt = {}) => keys.push({ t: time, el, ...opt });
    add(T.join, null, { xy: [1500, 1000] });
    add(c('joinNow') + 0.5, this.mail.joinBtn, { click: true });
    add(A.regType - 0.1, this.reg.first.el, { dx: 0.3 });
    add(A.regDone, this.reg.submit, { click: true, dx: 0.6 });
    add(c('files') - 0.1, this.side.items.files.el, { click: true, dx: 0.35 });
    add(A.uploadOpen - 0.3, P.files.upload, { click: true });
    add(c('drop') - 0.05, P.files.drop, { dx: 0.5, dy: 0.6 });
    add(A.uploadSend, P.files.send, { click: true });
    add(A.uploadSend + 1.5, P.files.dl, {});
    add(c('dataset') - 0.15, this.side.items.datasets.el, { click: true, dx: 0.35 });
    add(A.dsOpen - 0.25, P.dsList.create, { click: true });
    add(A.dsClose - 0.2, P.dsList.ok, { click: true });
    add(A.verOpen - 0.3, dn.newVer, { click: true });
    add(c('dropFiles') - 0.05, dn.vDrop, { dy: 0.4 });
    add(A.verSend, dn.vSend, { click: true });
    add(c('filesTab') + 0.1, ds.tabs[1], { click: true });
    add(c('statistics'), ds.ftabs[1], { click: true });
    add(c('hover') + 0.1, ds.colA, { dx: 0.55, dy: 0.35 });
    add(A.drawerOpen - 0.3, ds.pencil, { click: true });
    add(c('unit') - 0.15, ds.addAttr, { click: true });
    add(c('source') - 0.15, ds.addAttr, { click: true });
    add(A.drawerSave, ds.save, { click: true });
    add(c('selector') + 0.15, ds.ver, { click: true, dx: 0.7 });
    add(A.pick, ds.verOpts[1], { click: true, dx: 0.6 });
    add(c('downloadFile') + 0.2, ds.download, { click: true });
    add(c('access') + 0.1, ds.tabs[2], { click: true });
    add(A.linkOpen - 0.25, ds.shareBtn, { click: true });
    add(A.linkOpen + 0.4, ds.wsInput, { click: true, dx: 0.6 });
    add(A.linkOpen + 0.85, ds.wsOpt, { click: true, dx: 0.4 });
    add(A.linkDone - 0.3, ds.linkBtn, { click: true });
    add(c('jupyter') - 0.1, this.side.items.jupyter.el, { click: true, dx: 0.35 });
    add(c('python') + 0.1, P.notebooks.tiles[0], { dx: 0.5 });
    add(c('signedIn') - 0.5, P.notebooks.tiles[0], { click: true, dx: 0.5 });
    add(T.rstudio - 0.3, null, { xy: [700, 900] });
    add(T.pipelines + 0.2, null, { xy: [700, 900] });
    add(c('pipelines') - 0.1, this.side.items.pipelines.el, { click: true, dx: 0.35 });
    add(c('extracting') + 0.3, P.pipes.card0, { click: true, dx: 0.3, dy: 0.2 });
    add(A.runOpen - 0.3, P.pipe.run, { click: true });
    add(A.runOpen + 0.5, P.pipe.params[0].inp.el, { dx: 0.4 });
    add(A.runGo, P.pipe.go, { click: true });
    add(A.runGo + 1.9, P.run.outputs, { dx: 0.7, dy: 0.5 });
    add(A.createOpen - 0.3, P.pipes.create, { click: true });
    add(c('template') + 0.05, this.plDlg.opts[1], {});
    add(c('fromNotebook') + 0.05, this.plDlg.opts[2], {});
    add(c('withSdk') + 0.05, this.plDlg.cli, { dx: 0.4 });
    add(c('settings') - 0.1, this.side.items.settings.el, { click: true, dx: 0.35 });
    add(A.inviteOpen - 0.3, P.settings.invite, { click: true });
    add(c('lowest'), P.settings.role, { click: true, dx: 0.4 });
    add(A.inviteDone - 0.3, P.settings.go, { click: true });
    add(c('webapps') - 0.1, this.side.items.apps.el, { click: true, dx: 0.35 });
    add(A.appOpen - 0.3, P.webapps.create, { click: true });
    add(A.appAi - 0.1, P.webapps.opts[0], { click: true });
    add(A.appAi + 0.4, P.webapps.prompt.el, { dx: 0.6 });
    add(A.appSend, P.webapps.goBtn, { click: true });
    add(c('studio') - 0.3, this.side.items.dataStudio.el, { click: true, dx: 0.35 });
    add(c('studio') + 0.05, P.studio.gen, { click: true });
    add(c('connect') + 0.4, null, { xy: [1250, 980] });
    keys.sort((a, b) => a.t - b.t);
    const pos = (k) => {
      if (k.xy) return k.xy;
      if (!k.el || !k.el.isConnected || k.el.offsetParent === null) return null;
      return this.center(k.el, k.dx ?? 0.5, k.dy ?? 0.55);
    };
    let i = keys.findIndex((k) => k.t > t);
    if (i < 0) i = keys.length;
    const prevK = keys[Math.max(0, i - 1)], nextK = keys[Math.min(keys.length - 1, i)];
    let p0 = pos(prevK), p1 = pos(nextK);
    if (!p0) p0 = p1 || [1500, 1000];
    if (!p1) p1 = p0;
    const mv0 = Math.max(prevK.t, nextK.t - 0.6);
    const mp = nextK === prevK ? 1 : ease.inOutCubic(clamp((t - mv0) / Math.max(0.01, nextK.t - mv0)));
    const cx = lerp(p0[0], p1[0], mp) + Math.sin(mp * Math.PI) * 14, cy = lerp(p0[1], p1[1], mp) - Math.sin(mp * Math.PI) * 20;
    let press = 0;
    for (const k of keys) if (k.click) press = Math.max(press, 1 - Math.abs(t - k.t) / 0.12);
    set(this.cursor, { x: cx - 8, y: cy - 6, s: 1 - 0.14 * clamp(press), o: E.window(t, T.join + 0.4, tExit + 0.1, 0.4, 0.3) * (1 - gone) });

    // ---------- highlight ring ----------
    let ringEl = null, ringO = 0;
    const ringAt = (el, a, b) => { const o = E.window(t, a, b, 0.2, 0.25); if (o > ringO) { ringO = o; ringEl = el; } };
    ringAt(this.mail.joinBtn, c('joinNow') - 0.3, c('joinNow') + 0.55);
    ringAt(P.files.upload, c('upload') - 0.2, A.uploadOpen);
    ringAt(P.files.dl, A.uploadSend + 1.4, TL.end('s06') + 0.8);
    ringAt(P.dsList.create, c('create') - 0.3, A.dsOpen);
    ringAt(dn.newVer, A.verOpen - 0.7, A.verOpen);
    ringAt(ds.pencil, c('pencil') - 0.3, A.drawerOpen);
    ringAt(ds.ver, c('selector') - 0.25, c('selector') + 0.2);
    ringAt(ds.download, c('downloadFile') + 0.1, TL.end('s11') + 0.7);
    ringAt(ds.shareBtn, c('share') - 0.3, A.linkOpen);
    ringAt(P.pipe.run, c('run') - 0.35, A.runOpen);
    ringAt(P.run.outputs, A.runGo + 2.0, TL.vo.s21 - 0.1);
    ringAt(P.pipes.create, c('editorsCreate') - 0.2, A.createOpen);
    ringAt(P.settings.invite, c('members') - 0.25, A.inviteOpen);
    ringAt(P.webapps.create, c('createApp') - 0.3, A.appOpen);
    ringAt(P.studio.gen, c('studio') - 0.2, c('studio') + 0.45);
    if (ringEl && ringEl.offsetParent !== null && gone < 0.5) {
      const b = this.box(ringEl);
      set(this.ring, { x: b.x - 8, y: b.y - 8, o: ringO });
      E.css(this.ring, 'width', (b.w + 16).toFixed(1) + 'px');
      E.css(this.ring, 'height', (b.h + 16).toFixed(1) + 'px');
    } else set(this.ring, { o: 0 });
  },
});
