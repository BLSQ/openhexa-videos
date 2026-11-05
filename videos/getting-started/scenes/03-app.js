// Beats the core app pages need that are not narration words.
AppUI.beats = {
  connectionsStart: () => TL.vo.s10,
  connectionsSpan: () => TL.voDur.s10,
  settingsEnd: () => TL.end('s14'),
};

// Scenes 3-4: one continuous app window. Create the first workspace from the organization page,
// then tour the workspace sidebar module by module, with a callout pointing to each guide.
E.scene({
  name: 'app',
  from: () => TL.scenes.create,
  to: () => TL.scenes.docs + 1.0,
  build(root) {
    const S = I18N[LANG];
    const { h } = E;
    this.S = S;
    this.WS = 1.28;
    this.win = AppUI.window();
    this.orgSide = AppUI.orgSidebar();
    this.wsSide = AppUI.wsSidebar();
    this.main = h('div', { class: 'ox-main' });
    // Modal scrim over the sidebar (page dialogs live inside the clipped main area).
    this.sideDim = h('div', { class: 'ox-scrim', style: { right: 'auto', width: '256px' } });
    this.win.body.append(this.orgSide, this.wsSide.el, this.main, this.sideDim);

    this.org = AppUI.orgPage();
    this.pages = {
      home: AppUI.homePage(), files: AppUI.filesPage(), database: AppUI.databasePage(), dataStudio: AppUI.studioPage(),
      datasets: AppUI.datasetsPage(), connections: AppUI.connectionsPage(), pipelines: AppUI.pipelinesPage(),
      jupyter: AppUI.notebooksPage(), apps: AppUI.webappsPage(), settings: AppUI.settingsPage(),
    };
    this.main.append(this.org.el, ...Object.values(this.pages).map((p) => p.el));
    this.dlg = AppUI.createDialog();
    this.dlg.el.style.left = '0';
    this.win.body.appendChild(this.dlg.el);
    this.helpBtn = h('div', { class: 'ox-help-btn', text: '?' });
    this.win.body.appendChild(this.helpBtn);

    // Provisioning overlay shown inside the window while the workspace is being created.
    const prov = (ic, label) => h('div', { class: 'prov-item' }, [h('div', { class: 'prov-ico' }, [UI.heroIcon(ic, 54, '#fff', 1.4)]), h('div', { class: 'prov-check' }, [UI.heroIcon('Check', 22, '#192041', 3)]), h('span', { text: label })]);
    this.provItems = [prov('CircleStack', 'PostgreSQL'), prov('FolderOpen', S.app.nav.files)];
    this.prov = h('div', { class: 'prov' }, this.provItems);
    // Outside the body so the body's blur doesn't soften it.
    this.prov.style.top = '36px';
    this.win.el.appendChild(this.prov);

    this.winWrap = h('div', { class: 'abs' }, [this.win.el]);
    E.set(this.win.el, { s: this.WS });

    // Right-hand callout: create checklist, provisioning checklist, then one card per module.
    this.callout = h('div', { class: 'callout abs' });
    const list = (title, items) => {
      const its = items.map((x, i) => h('div', { class: 'co-item' }, [h('div', { class: 'tick', text: String(i + 1) }), h('span', { text: x })]));
      return { el: h('div', { class: 'co-panel' }, [h('div', { class: 'co-count', style: { marginBottom: '22px' }, text: title }), h('div', { class: 'co-list' }, its)]), items: its };
    };
    this.coCreate = list(S.steps[0], S.createSteps);
    this.coProv = list(S.provisioning.title, S.provisioning.items);
    this.tourKeys = ['home', 'files', 'database', 'dataStudio', 'datasets', 'connections', 'pipelines', 'jupyter', 'apps', 'settings'];
    const NAV_ICONS = { home: 'Home', files: 'FolderOpen', database: 'CircleStack', dataStudio: 'TableCells', datasets: 'Square2Stack', connections: 'Swatch', pipelines: 'Bolt', jupyter: 'BookOpen', apps: 'GlobeAlt', settings: 'Cog6Tooth' };
    this.coTour = {};
    this.tourKeys.forEach((k, i) => {
      const [title, desc, doc] = S.tour[k];
      this.coTour[k] = h('div', { class: 'co-panel' }, [
        h('div', { class: 'co-top' }, [h('div', { class: 'co-icon' }, [UI.heroIcon(NAV_ICONS[k], 36, '#ff8cc0', 1.6)]), h('div', { class: 'co-count', text: i ? S.tour.count(i, 9) : S.steps[1] })]),
        h('div', { class: 'co-title', text: title }),
        h('div', { class: 'co-desc', html: desc }),
        h('div', { class: 'co-doc', style: doc.length > 18 ? { fontSize: '16.5px' } : {} }, [UI.heroIcon('BookOpen', 22, '#9ff3df', 1.7), h('span', { text: 'docs.openhexa.com/' + doc })]),
      ]);
    });
    this.panels = [this.coCreate.el, this.coProv.el, ...Object.values(this.coTour)];
    this.callout.append(...this.panels);

    this.ring = h('div', { class: 'ox-ring abs' });
    this.cursor = UI.cursor();
    root.append(this.winWrap, this.callout, this.ring, this.cursor);
    this.stage = document.getElementById('stage');
  },

  // Element box in stage pixels (works both scaled in the player and unscaled in render mode).
  box(el) {
    const s = this.stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = s.width / TL.width;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  },
  center(el, dx = 0.5, dy = 0.55) {
    const b = this.box(el);
    return [b.x + b.w * dx, b.y + b.h * dy];
  },

  // Tour beats: when each module becomes active.
  beats() {
    const v = TL.vo;
    return [
      ['home', TL.scenes.tour], ['files', v.s07 - 0.4], ['database', v.s08 - 0.4], ['dataStudio', TL.cue('dataStudio') - 0.3],
      ['datasets', v.s09 - 0.4], ['connections', v.s10 - 0.4], ['pipelines', v.s11 - 0.4], ['jupyter', v.s12 - 0.4],
      ['apps', v.s13 - 0.4], ['settings', v.s14 - 0.4],
    ];
  },

  update(t) {
    const { set, prog, ease, lerp, clamp } = E;
    const S = this.S;
    const T = TL.scenes;
    const tClick = TL.cue('clickCreate') + 0.55;
    const tCreate = TL.end('s04') + 0.6;
    const tTour = T.tour;
    const tExit = T.docs;

    // ---------- window placement ----------
    const enter = prog(t, T.create, 1.0, ease.outQuart);
    const exit = prog(t, tExit - 0.2, 0.9, ease.inCubic);
    const wx = 70 - exit * 160, wy = 150 + (1 - enter) * 90;
    set(this.winWrap, { x: wx, y: wy, s: lerp(0.94, 1, enter) * lerp(1, 0.92, exit), o: Math.min(1, enter * 1.6) * (1 - exit), blur: exit * 6 });

    // ---------- org page vs workspace ----------
    const inWs = t >= tTour;
    E.show(this.orgSide, !inWs);
    E.show(this.wsSide.el, inWs);
    E.show(this.org.el, !inWs);
    this.win.setUrl(inWs ? '' : `/organizations/${LANG === 'fr' ? 'mon-organisation' : 'my-organization'}`);

    // ---------- create dialog ----------
    const d = this.dlg;
    const dOpen = prog(t, tClick + 0.05, 0.3, ease.outCubic);
    const dClose = prog(t, tCreate + 0.05, 0.3, ease.inCubic);
    const dv = dOpen * (1 - dClose);
    E.show(d.el, dv > 0.001);
    set(d.scrim, { o: dv });
    set(d.dialog, { o: dv, s: 0.95 + 0.05 * dv, y: (1 - dOpen) * 16 });
    const name = S.workspaceName;
    const nType = Math.floor(clamp((t - TL.nameAt) / TL.typeDur) * name.length);
    E.text(d.nameText, name.slice(0, nType));
    const tCountry = TL.cue('country');
    const nameFocus = t < tCountry + 0.25;
    d.nameInput.classList.toggle('focus', nameFocus);
    set(d.caret, { o: nameFocus && Math.floor(t * 2.2) % 2 === 0 ? 1 : nType < name.length && nameFocus ? 1 : 0 });
    const menuOpen = E.window(t, tCountry + 0.3, tCountry + 1.05, 0.15, 0.15);
    set(d.menu, { o: menuOpen, y: (1 - menuOpen) * -6 });
    d.option.classList.toggle('sel', t >= tCountry + 0.75);
    const picked = t >= tCountry + 1.0;
    d.countryInput.classList.toggle('focus', t >= tCountry + 0.25 && t < TL.tickAt - 0.1);
    E.text(d.countryText, picked ? S.country.name : S.app.dialog.countryPh);
    d.countryText.classList.toggle('ph', !picked);
    d.box.classList.toggle('on', t >= TL.tickAt);

    // ---------- provisioning (between Create and the tour) ----------
    const pv = E.window(t, tCreate + 0.25, tTour + 0.3, 0.45, 0.5);
    E.css(this.win.body, 'filter', pv > 0.01 ? `blur(${(pv * 3).toFixed(2)}px)` : 'none');
    set(this.prov, { o: pv });
    const pt = [TL.cue('database'), TL.cue('storage')];
    this.provItems.forEach((el, i) => {
      const p = prog(t, pt[i] - 0.1, 0.5, ease.outBack);
      set(el, { s: 0.8 + 0.2 * p, o: Math.min(1, p * 1.5) });
      set(el.querySelector('.prov-check'), { s: prog(t, pt[i] + 0.35, 0.35, ease.outBack) });
    });

    // ---------- tour: active module, page, URL ----------
    const beats = this.beats();
    let cur = 0;
    beats.forEach(([, bt], i) => { if (t >= bt) cur = i; });
    const [key, bt] = beats[cur];
    const fade = prog(t, bt, 0.35, ease.outCubic);
    this.wsSide.setActive(key, inWs ? (cur === 0 ? prog(t, tTour + 0.3, 0.3) : 1) : 0);
    let dim = 0;
    for (const [k, page] of Object.entries(this.pages)) {
      const prev = cur > 0 && k === beats[cur - 1][0] && fade < 1;
      const on = inWs && (k === key || prev);
      E.show(page.el, on);
      if (!on) continue;
      if (k === key) set(page.el, { o: cur === 0 ? 1 : fade, x: (1 - fade) * 14 });
      else set(page.el, { o: 1 - fade });
      page.update(t);
      if (k === key && page.dim) dim = Math.max(dim, page.dim * (cur === 0 ? 1 : fade));
      else if (page.dim) dim = Math.max(dim, page.dim * (1 - fade));
    }
    set(this.sideDim, { o: inWs ? dim : 0 });
    const paths = { home: '', files: '/files', database: '/databases', dataStudio: '/data-studio', datasets: '/datasets/covid-19-cases', connections: '/connections', pipelines: '/pipelines', jupyter: '/notebooks', apps: '/webapps', settings: '/settings' };
    if (inWs) this.win.setUrl(`/workspaces/${S.workspaceSlug}${paths[key]}`);
    set(this.helpBtn, { o: inWs ? 1 : 0 });

    // ---------- callout ----------
    const coIn = prog(t, T.create + 0.5, 0.8, ease.outQuart) * (1 - exit);
    set(this.callout, { x: 1395 + (1 - coIn) * 60 + exit * 80, y: 380, o: coIn });
    const showPanel = (el, a, b) => {
      const p = E.window(t, a, b, 0.4, 0.25);
      E.show(el, p > 0.001);
      set(el, { o: p, y: (1 - prog(t, a, 0.5, ease.outCubic)) * 18 });
      return p;
    };
    showPanel(this.coCreate.el, -1, tCreate + 0.35);
    const cs = [TL.cue('clickCreate') - 0.2, TL.cue('name') - 0.1, TL.cue('tutorial') - 0.1, tCreate];
    this.coCreate.items.forEach((el, i) => {
      el.classList.toggle('on', t >= cs[i] && t < cs[i + 1]);
      el.classList.toggle('done', t >= cs[i + 1]);
    });
    showPanel(this.coProv.el, tCreate + 0.35, tTour);
    const ps = [pt[0] + 0.3, pt[1] + 0.3, TL.end('s05') - 0.3];
    this.coProv.items.forEach((el, i) => {
      el.classList.toggle('done', t >= ps[i]);
      const p = prog(t, ps[i] - 0.4, 0.4, ease.outCubic);
      set(el, { o: 0.35 + 0.65 * p });
    });
    beats.forEach(([k, b], i) => showPanel(this.coTour[k], i === 0 ? tTour + 0.1 : b, i < beats.length - 1 ? beats[i + 1][1] : tExit + 1));

    // ---------- cursor ----------
    const keys = [];
    const add = (time, el, opt = {}) => keys.push({ t: time, el, ...opt });
    add(T.create, null, { xy: [1500, 1000] });
    add(tClick, this.org.create, { click: true });
    add(TL.nameAt - 0.05, d.nameInput, { dx: 0.7 });
    add(tCountry + 0.25, d.countryInput, { click: true, dx: 0.4 });
    add(tCountry + 0.95, d.option, { click: true, dx: 0.3 });
    add(TL.tickAt, d.box, { click: true });
    add(tCreate, d.createBtn, { click: true });
    add(tTour - 0.4, null, { xy: [900, 640] });
    add(TL.cue('sidebar'), this.wsSide.items.files.el, { dx: 0.4 });
    beats.slice(1).forEach(([k, b]) => add(b, this.wsSide.items[k].el, { click: true, dx: 0.35 }));
    // In-page actions after arriving on a module.
    const pages = this.pages;
    add(TL.cue('upload') + 0.2, pages.files.upload, { click: true });
    add(TL.cue('generateSql') - 0.05, pages.dataStudio.gen, { click: true });
    add(Math.min(TL.cue('aiSql') - 0.25, TL.cue('generateSql') + 1.75) + 0.65, pages.dataStudio.run, { click: true });
    add(TL.cue('versioned') + 0.05, pages.datasets.ver, { click: true, dx: 0.8 });
    add(TL.cue('template') - 0.45, pages.pipelines.create, { click: true });
    add(TL.cue('template') + 0.1, pages.pipelines.opts[1], {});
    add(TL.cue('template') + 0.8, pages.pipelines.opts[2], {});
    add(TL.cue('withAi') + 0.05, pages.pipelines.opts[0], {});
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
    if (!p0) p0 = this.lastCursor || [1500, 1000];
    if (!p1) p1 = p0;
    const mv0 = Math.max(prevK.t, nextK.t - 0.7);
    const mp = nextK === prevK ? 1 : ease.inOutCubic(clamp((t - mv0) / Math.max(0.01, nextK.t - mv0)));
    const cx = lerp(p0[0], p1[0], mp) + Math.sin(mp * Math.PI) * 18, cy = lerp(p0[1], p1[1], mp) - Math.sin(mp * Math.PI) * 26;
    this.lastCursor = [cx, cy];
    let press = 0;
    for (const k of keys) if (k.click) press = Math.max(press, 1 - Math.abs(t - k.t) / 0.12);
    const cVis = E.window(t, T.create + 0.4, tExit + 0.1, 0.4, 0.3);
    set(this.cursor, { x: cx - 8, y: cy - 6, s: 1 - 0.14 * clamp(press), o: cVis });

    // ---------- highlight ring ----------
    let ringEl = null, ringO = 0;
    const ringAt = (el, a, b) => { const o = E.window(t, a, b, 0.25, 0.3); if (o > ringO) { ringO = o; ringEl = el; } };
    ringAt(this.org.create, TL.cue('clickCreate') - 0.5, tClick + 0.1);
    ringAt(this.wsSide.navEl, TL.cue('sidebar') - 0.15, TL.end('s06') + 0.3);
    ringAt(pages.files.upload, TL.cue('upload') - 0.15, TL.cue('upload') + 1.2);
    ringAt(pages.dataStudio.gen, TL.cue('generateSql') - 0.4, TL.cue('generateSql') + 0.5);
    if (ringEl && ringEl.offsetParent !== null) {
      const b = this.box(ringEl);
      set(this.ring, { x: b.x - 8, y: b.y - 8, o: ringO });
      E.css(this.ring, 'width', (b.w + 16).toFixed(1) + 'px');
      E.css(this.ring, 'height', (b.h + 16).toFixed(1) + 'px');
    } else set(this.ring, { o: 0 });
  },
});
