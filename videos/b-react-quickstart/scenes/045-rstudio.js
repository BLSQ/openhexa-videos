// RStudio chapter: install the openhexa R package, copy the access token from Account settings,
// log in through the package's dialog (R/login_gadget.R in BLSQ/openhexa-sdk-r) or with arguments,
// then read a dataset, publish a version and a web app. The RStudio window is a generic mock-up;
// the dialog's labels and console messages come from the package source (see README.md).
E.scene({
  name: 'rstudio',
  from: () => TL.scenes.rstudio,
  to: () => TL.scenes.pipelines + 1.0,
  build(root) {
    const S = I18N[LANG];
    const { h } = E;
    const ic = (n, s, c, w) => UI.heroIcon(n, s, c, w);
    // ---- RStudio window ----
    const paneHead = (tabs) => h('div', { class: 'rs-phead' }, tabs.map((x, i) => h('span', { class: i ? '' : 'on', text: x })));
    this.code = h('div', { class: 'rs-code' });
    this.lines = [];
    const R = [
      ['k', 'library', '(openhexa)'],
      ['k', 'login', '('],
      ['', '  token = ', 'Sys.getenv(<s>"OPENHEXA_TOKEN"</s>),'],
      ['', '  server_url = ', '<s>"https://api.openhexa.org"</s>,'],
      ['', '  workspace = ', '<s>"b-react-surveillance"</s>'],
      ['', ')', ''],
      ['', '', ''],
      ['', 'cases <- ', 'get_dataset_file(<s>"weekly-cases-by-zone-a1b2c3"</s>, <s>"cases_by_zone.csv"</s>)'],
      ['', 'ds <- ', 'create_dataset(<s>"Zone summary"</s>)$slug'],
      ['', '', 'create_dataset_version(ds, <s>"v1"</s>)'],
      ['', '', 'add_dataset_file(ds, <s>"zone_summary.csv"</s>)'],
      ['', 'chart <- ', 'plotly::plot_ly(cases, x = ~health_zone, y = ~suspected, type = <s>"bar"</s>)'],
      ['', '', 'publish_webapp(<s>"Weekly cases"</s>, chart)'],
    ];
    R.forEach(([k, a, b], i) => {
      const ln = h('div', { class: 'rs-line' }, [h('span', { class: 'rs-ln', text: String(i + 1) }), h('span', { html: (k ? `<b>${a}</b>` : a) + b.replace(/<s>/g, '<span class="rs-str">').replace(/<\/s>/g, '</span>') })]);
      this.lines.push(ln);
      this.code.appendChild(ln);
    });
    this.console = h('div', { class: 'rs-console' });
    const cl = (cls, html) => { const el = h('div', { class: 'rs-cl ' + cls, html }); this.console.appendChild(el); return el; };
    this.con = {
      inst1: cl('cmd', '&gt; install.packages(c(<span class="rs-str">"remotes"</span>, <span class="rs-str">"shiny"</span>))'),
      inst2: cl('cmd', '&gt; remotes::install_github(<span class="rs-str">"BLSQ/openhexa-sdk-r"</span>)'),
      done: cl('out', '* DONE (openhexa)'),
      lib: cl('cmd', '&gt; library(openhexa)'),
      login: cl('cmd', '&gt; login()'),
      auth: cl('ok', '✔ Authenticated as <b>Grace Mbuyi</b> on https://api.openhexa.org.'),
      ws: cl('ok', '✔ Using workspace <b>B-REACT Surveillance</b> ("b-react-surveillance").'),
      pub: cl('cmd', '&gt; publish_webapp(<span class="rs-str">"Weekly cases"</span>, chart)'),
    };
    this.env = h('div', { class: 'rs-env' }, [h('div', { class: 'rs-env-row' }, [h('b', { text: 'cases' }), h('span', { text: '1248 obs. of 5 variables' })]), h('div', { class: 'rs-env-row' }, [h('b', { text: 'chart' }), h('span', { text: 'List of 8' })])]);
    this.envRows = [...this.env.children];
    const bars = [62, 41, 55, 23, 34].map((v, i) => `<div><i style="height:${(v / 62) * 100}%"></i><span>ZS-0${i + 1}</span></div>`).join('');
    this.viewer = h('div', { class: 'rs-viewer' }, [h('div', { class: 'wa-bars', style: { height: '170px' }, html: bars })]);
    this.rs = h('div', { class: 'abs rs-win' }, [
      h('div', { class: 'rs-title' }, [h('i'), h('i'), h('i'), h('span', { text: 'RStudio' })]),
      h('div', { class: 'rs-tool' }, [h('span', { text: 'File  Edit  Code  View  Plots  Session  Build  Debug  Profile  Tools  Help' })]),
      h('div', { class: 'rs-grid' }, [
        h('div', { class: 'rs-pane rs-src' }, [paneHead(['analysis.R']), this.code]),
        h('div', { class: 'rs-pane rs-envp' }, [paneHead(['Environment', 'History', 'Connections']), this.env]),
        h('div', { class: 'rs-pane rs-con' }, [paneHead(['Console', 'Terminal']), this.console]),
        h('div', { class: 'rs-pane rs-view' }, [paneHead(['Viewer', 'Files', 'Plots', 'Packages', 'Help']), this.viewer]),
      ]),
    ]);

    // ---- the package's login dialog (shiny gadget in an RStudio dialog) ----
    this.tokenText = h('span', { class: 'rs-ph' });
    this.wsBlock = h('div', { class: 'rs-field' }, [h('label', { text: 'Workspace' }), h('div', { class: 'rs-select' }, [h('span', { text: 'B-REACT Surveillance ("b-react-surveillance")' }), ic('ChevronDown', 14, '#555', 2)])]);
    this.doneLabel = h('span', { text: 'Log in' });
    this.doneBtn = h('div', { class: 'rs-btn primary' }, [this.doneLabel]);
    this.tokenField = h('div', { class: 'rs-input' }, [this.tokenText]);
    this.dlg = h('div', { class: 'abs rs-dlg' }, [
      h('div', { class: 'rs-dlg-title', text: 'OpenHEXA' }),
      h('div', { class: 'rs-dlg-body' }, [
        h('h3', { text: 'Log in to OpenHEXA' }),
        h('div', { class: 'rs-field' }, [h('label', { text: 'Server' }), h('div', { class: 'rs-select' }, [h('span', { text: 'OpenHEXA (api.openhexa.org)' }), ic('ChevronDown', 14, '#555', 2)])]),
        h('div', { class: 'rs-field' }, [h('label', { text: 'API token' }), this.tokenField, h('div', { class: 'rs-help', html: 'Copy your token from your <a>account settings</a> in OpenHEXA.' })]),
        this.wsBlock,
        h('div', { class: 'rs-dlg-actions' }, [h('div', { class: 'rs-btn', text: 'Cancel' }), this.doneBtn]),
      ]),
    ]);

    // ---- Account settings in the browser ----
    this.acWin = AppUI.window();
    this.account = BR.accountPage();
    this.acWin.body.appendChild(this.account.el);
    this.acWin.setUrl('/user/account/');
    this.acWrap = h('div', { class: 'abs' }, [this.acWin.el]);

    // ---- callout ----
    const C = S.rstudio;
    this.items = C.steps.items.map((x, i) => h('div', { class: 'co-item' }, [h('div', { class: 'tick', text: String(i + 1) }), h('span', { text: x })]));
    this.callout = h('div', { class: 'abs callout' }, [h('div', { class: 'co-panel' }, [
      h('div', { class: 'co-top' }, [h('div', { class: 'co-icon' }, [ic('CodeBracket', 36, '#ff8cc0', 1.6)]), h('div', { class: 'co-title', style: { fontSize: '40px' }, text: C.steps.title })]),
      h('div', { class: 'co-list' }, this.items),
      h('div', { class: 'co-doc', style: { fontSize: '17px' } }, [ic('CodeBracket', 22, '#9ff3df', 1.7), h('span', { text: C.repo })]),
    ])]);
    this.ring = h('div', { class: 'ox-ring abs' });
    this.cursor = UI.cursor();
    root.append(this.rs, this.callout, this.acWrap, this.dlg, this.ring, this.cursor);
    this.stage = document.getElementById('stage');
  },
  box(el) {
    const s = this.stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / TL.width;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  },
  update(t) {
    const { set, prog, ease, lerp, clamp } = E;
    const c = TL.cue, A = TL.at, T = TL.scenes;
    const t0 = T.rstudio, tOut = T.pipelines;
    const inn = prog(t, t0 + 0.1, 0.8, ease.outQuart), out = prog(t, tOut - 0.35, 0.7, ease.inCubic);
    set(this.rs, { x: 70 + out * 120, y: 150 + (1 - inn) * 80, s: lerp(0.95, 1, inn) * lerp(1, 0.94, out), o: Math.min(1, inn * 1.5) * (1 - out), blur: out * 6 });

    // Console and editor content, line by line.
    const show = (el, at) => { const p = prog(t, at, 0.25); E.show(el, p > 0); set(el, { o: p }); };
    show(this.con.inst1, c('install') - 0.1);
    show(this.con.inst2, c('install') + 0.35);
    show(this.con.done, c('token') - 0.2);
    show(this.con.lib, c('loginDlg') - 0.5);
    show(this.con.login, c('loginDlg') - 0.1);
    show(this.con.auth, A.dlgContinue + 0.35);
    show(this.con.ws, A.dlgContinue + 0.55);
    show(this.con.pub, c('publishR') + 0.1);
    const lineAt = [c('args') - 0.2, c('args'), c('args') + 0.3, c('args') + 0.5, c('args') + 0.7, c('args') + 0.85, c('readR') - 0.4, c('readR') - 0.2, c('createR') - 0.2, c('createR') + 0.1, c('createR') + 0.35, c('publishR') - 0.4, c('publishR') - 0.1];
    this.lines.forEach((el, i) => show(el, lineAt[i]));
    this.lines[2].classList.toggle('hot', t >= c('envVar') - 0.3 && t < TL.end('s18') + 0.4);
    this.envRows.forEach((el, i) => show(el, i ? c('publishR') - 0.1 : c('readR') + 0.3));
    const vp = prog(t, c('publishR') + 0.5, 0.6, ease.outCubic);
    set(this.viewer, { o: vp, y: (1 - vp) * 10 });

    // Account settings: slides in for the token, then away before pasting.
    const ac = E.window(t, c('account') - 0.35, A.dlgOpen - 0.2, 0.55, 0.45);
    set(this.acWrap, { x: 760 + (1 - ac) * 260, y: 190, o: ac, s: 1 });
    E.show(this.acWrap, ac > 0.001);
    this.account.update(t);

    // Login dialog.
    const dv = E.window(t, A.dlgOpen, A.dlgContinue + 0.3, 0.3, 0.3);
    E.show(this.dlg, dv > 0.001);
    set(this.dlg, { x: 960 - 230, y: 300 + (1 - dv) * 16, o: dv, s: 0.96 + 0.04 * dv });
    const pasted = t >= A.dlgPaste;
    E.text(this.tokenText, pasted ? '••••••••••••••••••••••••••••••••' : '');
    this.tokenField.classList.toggle('focus', t >= A.dlgPaste - 0.4 && t < A.dlgLogIn);
    const wsOn = t >= A.dlgLogIn + 0.35;
    E.show(this.wsBlock, wsOn);
    E.text(this.doneLabel, wsOn ? 'Continue' : 'Log in');

    // Callout (hidden while the browser window covers the right side).
    const coIn = prog(t, t0 + 0.4, 0.7, ease.outQuart) * (1 - out) * (1 - ac);
    set(this.callout, { x: 1395 + (1 - coIn) * 60, y: 330, o: coIn });
    const st = [c('rstudio') - 0.2, c('account') - 0.3, c('loginDlg') - 0.2, c('readR') - 0.2, TL.end('s19') + 0.6];
    this.items.forEach((el, i) => { el.classList.toggle('on', t >= st[i] && t < st[i + 1]); el.classList.toggle('done', t >= st[i + 1]); });

    // Cursor.
    const keys = [];
    const add = (time, el, opt = {}) => keys.push({ t: time, el, ...opt });
    add(t0, null, { xy: [1300, 980] });
    add(c('install') + 0.2, this.con.inst2, { dx: 0.8 });
    add(c('eye') - 0.1, this.account.eye, {});
    add(A.tokenEye, this.account.eye, { click: true });
    add(A.tokenCopy, this.account.copy, { click: true });
    add(A.dlgPaste - 0.1, this.tokenField, { dx: 0.4, click: true });
    add(A.dlgLogIn, this.doneBtn, { click: true });
    add(A.dlgContinue, this.doneBtn, { click: true });
    add(c('envVar'), this.lines[2], { dx: 0.5 });
    add(c('publishR') + 0.6, this.viewer, { dx: 0.6, dy: 0.6 });
    keys.sort((a, b) => a.t - b.t);
    const pos = (k) => {
      if (k.xy) return k.xy;
      if (!k.el || !k.el.isConnected || k.el.offsetParent === null) return null;
      const b = this.box(k.el);
      return [b.x + b.w * (k.dx ?? 0.5), b.y + b.h * (k.dy ?? 0.55)];
    };
    let i = keys.findIndex((k) => k.t > t);
    if (i < 0) i = keys.length;
    const pk = keys[Math.max(0, i - 1)], nk = keys[Math.min(keys.length - 1, i)];
    let p0 = pos(pk), p1 = pos(nk);
    if (!p0) p0 = p1 || [1300, 980];
    if (!p1) p1 = p0;
    const mv0 = Math.max(pk.t, nk.t - 0.6);
    const mp = nk === pk ? 1 : ease.inOutCubic(clamp((t - mv0) / Math.max(0.01, nk.t - mv0)));
    let press = 0;
    for (const k of keys) if (k.click) press = Math.max(press, 1 - Math.abs(t - k.t) / 0.12);
    set(this.cursor, { x: lerp(p0[0], p1[0], mp) - 8, y: lerp(p0[1], p1[1], mp) - 6, s: 1 - 0.14 * clamp(press), o: E.window(t, t0 + 0.5, tOut, 0.4, 0.3) });

    // Ring on the access tokens row, then on the pasted token field.
    let ringEl = null, ro = 0;
    const ringAt = (el, a, b) => { const o = E.window(t, a, b, 0.2, 0.25); if (o > ro) { ro = o; ringEl = el; } };
    ringAt(this.account.eye, c('eye') - 0.3, A.tokenEye + 0.1);
    ringAt(this.account.copy, A.tokenCopy - 0.25, A.tokenCopy + 0.5);
    if (ringEl && ringEl.offsetParent !== null) {
      const b = this.box(ringEl);
      set(this.ring, { x: b.x - 8, y: b.y - 8, o: ro });
      E.css(this.ring, 'width', (b.w + 16).toFixed(1) + 'px');
      E.css(this.ring, 'height', (b.h + 16).toFixed(1) + 'px');
    } else set(this.ring, { o: 0 });
  },
});
