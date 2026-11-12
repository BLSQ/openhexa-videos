// B-REACT access & sharing, right after the Datasets chapter: slides 11 to 13 of the B-REACT deck
// redrawn (data controllers, partner workspaces with their restricted twins, the agreements), a
// request diagram, and two app cuts (a partner's Datasets list; Publish as Template → Available
// Templates). The app scene steps aside meanwhile (scenes/04-app.js).
E.scene({
  name: 'breact',
  from: () => TL.scenes.breact,
  to: () => TL.scenes.notebooks + 0.8,
  build(root) {
    const S = I18N[LANG], B = S.br, { h } = E;
    this.B = B;
    const ico = (n, s, c, w = 1.8) => UI.heroIcon(n, s, c, w);
    const X0 = 222, W = 1476;
    this.X0 = X0; this.W = W;

    // ---------- architecture (slides 11 to 13) ----------
    this.arch = h('div', { class: 'abs' });
    this.ctlLabel = h('div', { class: 'abs brx-label' }, [h('span', { text: B.ctlLabel }), h('span', { class: 'brx-hosted', text: B.hosted })]);
    this.hostedEl = this.ctlLabel.lastChild;
    const widths = [250, 420, 230, 250, 230];
    let x = X0;
    this.ctl = B.controllers.map(([name, chips], i) => {
      const chipEls = chips.map(([c, k]) => h('span', { class: 'brx-chip' + (k ? ' id' : ''), text: c }));
      const el = h('div', { class: 'abs brx-ctl', style: { width: widths[i] + 'px' } }, [h('div', { class: 'brx-ctl-name', text: name }), h('div', { class: 'brx-chips' }, chipEls)]);
      const c = { el, chips: chipEls, x, cx: x + widths[i] / 2 };
      x += widths[i] + 24;
      return c;
    });
    this.flowSvg = h('div', { class: 'abs', html: '<svg width="1920" height="1080">' + this.ctl.map((c) => `<path d="M ${c.cx} 336 L ${c.cx} 404" stroke="#3ee6c1" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="7 9"/>`).join('') + '</svg>' });
    this.flowPaths = [...this.flowSvg.querySelectorAll('path')];
    this.flowParts = B.flow.map((f, i) => h('span', { class: i ? 'ex' : '', text: (i ? ' · ' : '') + f }));
    this.flow = h('div', { class: 'abs brx-flow' }, [h('span', { class: 'arr', text: '↓ ' }), ...this.flowParts, h('span', { class: 'arr', text: ' ↓' })]);
    this.partLabel = h('div', { class: 'abs brx-label', text: B.partLabel });

    const row = (n, r) => {
      const chips = h('div', { class: 'brx-chips row' });
      const el = h('div', { class: 'abs brx-row' + (r ? ' r' : ''), style: { width: W - (r ? 40 : 0) + 'px' } }, [
        r ? h('span', { class: 'brx-rname' }, [ico('LockClosed', 18, '#c9ccf5', 2), h('span', { text: B.restricted })]) : h('span', { class: 'brx-rname', text: n }),
        chips,
      ]);
      const o = { n, r, el, chips };
      if (r) {
        o.ids = B.idChips.map((c) => h('span', { class: 'brx-chip id', text: c }));
        chips.append(...o.ids);
        if (n === 'Oxford') {
          o.arrow = h('span', { class: 'brx-arrow', text: '→' });
          o.cleaned = h('span', { class: 'brx-chip ox', text: B.cleaned });
          chips.append(o.arrow, o.cleaned);
        }
      } else {
        o.general = h('span', { class: 'brx-chip', text: B.general });
        chips.append(o.general);
        if (n === 'Oxford') {
          o.telco = h('span', { class: 'brx-chip telco', text: B.telco });
          o.pipeline = h('span', { class: 'brx-chip ox' }, [ico('Bolt', 16, '#f0965f', 2), h('span', { text: B.pipeline })]);
          chips.append(o.telco, o.pipeline);
        }
      }
      return o;
    };
    this.rows = [];
    B.partners.forEach((n) => {
      this.rows.push(row(n, false));
      if (n === 'Oxford' || n === 'INRB') this.rows.push(row(n, true));
    });
    this.byName = (n, r = false) => this.rows.find((o) => o.n === n && o.r === r);
    // Copies of Oxford's cleaned contact dataset landing in the partners it is shared with (slide 12).
    this.copyTo = ['Imperial', 'Pasteur', 'INRB', 'WHO'];
    this.copies = this.copyTo.map(() => h('span', { class: 'abs brx-chip ox copy', text: B.cleaned }));
    this.shareCap = h('div', { class: 'abs brx-cap' }, [ico('Square2Stack', 24, '#3ee6c1', 2), h('b', { text: B.shareCap[0] }), h('span', { text: B.shareCap[1] })]);
    this.rowsWrap = h('div', { class: 'abs' }, [this.partLabel, ...this.rows.map((r) => r.el), ...this.copies]);
    // Agreements (slide 13): a DSA on every partner, the DPA and DSA explained below.
    this.dsaPills = B.partners.map(() => h('span', { class: 'abs brx-dsa', text: 'DSA' }));
    const badge = ([tag, title, sub]) => h('div', { class: 'abs brx-agree' }, [h('span', { class: 'brx-agree-tag', text: tag }), h('div', {}, [h('b', { text: title }), h('span', { text: sub })])]);
    this.dpa = badge(B.dpa);
    this.dsa = badge(B.dsa);
    this.arch.append(this.ctlLabel, this.flowSvg, ...this.ctl.map((c) => c.el), this.flow, this.rowsWrap, ...this.dsaPills, this.shareCap, this.dpa, this.dsa);

    // ---------- asking for more data ----------
    const R = B.req;
    const node = (icon, title, cls) => h('div', { class: 'abs brx-node ' + cls }, [h('div', { class: 'br-flow-ico' }, [ico(icon, 40, '#ff8cc0', 1.7)]), h('b', { text: title })]);
    this.you = node('Users', R.you, 'you');
    this.ctlNode = node('BuildingOffice', R.ctl, 'ctl');
    this.reqSvg = h('div', { class: 'abs', html: '<svg width="1920" height="1080"><path class="ask" d="M 790 520 L 1120 520" stroke="#ff459a" stroke-width="4" fill="none" stroke-linecap="round"/><path class="back" d="M 1370 650 C 1370 860, 550 860, 550 650" stroke="#f0965f" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="10 10"/></svg>' });
    this.askPath = this.reqSvg.querySelector('.ask');
    this.backPath = this.reqSvg.querySelector('.back');
    this.askHead = h('div', { class: 'abs brx-head', text: '▶' });
    this.askLabel = h('div', { class: 'abs brx-asklabel', text: R.ask });
    this.dsaReq = h('div', { class: 'abs brx-dsareq' }, [ico('ShieldCheck', 26, '#3ee6c1', 2), h('span', { text: R.dsa })]);
    this.dsChip = h('div', { class: 'abs brx-chip ox big' }, [ico('Square2Stack', 20, '#f0965f', 2), h('span', { text: R.ds })]);
    this.backLabel = h('div', { class: 'abs brx-backlabel', text: R.back });
    this.req = h('div', { class: 'abs' }, [this.reqSvg, this.you, this.ctlNode, this.askHead, this.askLabel, this.dsaReq, this.dsChip, this.backLabel]);

    // ---------- app cuts ----------
    this.win = AppUI.window();
    this.side = AppUI.wsSidebar();
    this.side.el.classList.add('br-side');
    this.side.el.insertBefore(BR.orgNotice(S.org), this.side.el.querySelector('.ox-user'));
    this.wsName = this.side.el.querySelector('.ox-ws .name');
    this.main = h('div', { class: 'ox-main' });
    this.pages = { ds: BR.brDatasets(), pipe: BR.brPipeline(), tpl: BR.brTemplates() };
    this.main.append(...Object.values(this.pages).map((p) => p.el));
    this.win.body.append(this.side.el, this.main);
    this.winWrap = h('div', { class: 'abs' }, [this.win.el]);
    E.set(this.win.el, { s: 1.15 });
    this.tplCap = h('div', { class: 'abs brx-cap tpl' }, [ico('GlobeAlt', 24, '#3ee6c1', 2), h('b', { text: B.tplCap[0] }), h('span', { text: B.tplCap[1] })]);
    this.ring = h('div', { class: 'ox-ring abs' });
    this.cursor = UI.cursor();

    this.cam = h('div', { class: 'cam' }, [this.arch, this.req, this.winWrap, this.tplCap, this.ring, this.cursor]);
    root.appendChild(this.cam);
    this.stage = document.getElementById('stage');
  },

  box(el) {
    const s = this.stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / TL.width;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  },

  update(t) {
    const { set, prog, ease, lerp, clamp } = E;
    const c = TL.cue, A = TL.at, vo = TL.vo, T = TL.scenes;
    const t0 = T.breact, tEnd = T.notebooks;
    const out = prog(t, tEnd - 0.35, 0.7, ease.inCubic);
    set(this.cam, { o: prog(t, t0, 0.5) * (1 - out), blur: out * 6 });

    // Which layer is on screen: the architecture, the request diagram or the app window.
    const archO = Math.max(E.window(t, t0, vo.b04 - 0.3, 0.6, 0.45), E.window(t, vo.b06 - 0.3, c('publishTpl') - 0.4, 0.5, 0.45), E.window(t, vo.b09 - 0.4, tEnd + 1, 0.5, 0.3));
    const reqO = E.window(t, vo.b05 - 0.3, vo.b06 - 0.3, 0.5, 0.45);
    const appO = Math.max(E.window(t, vo.b04 - 0.55, vo.b05 - 0.3, 0.55, 0.45), E.window(t, c('publishTpl') - 0.45, vo.b09 - 0.4, 0.55, 0.45));
    set(this.arch, { o: archO, s: lerp(0.97, 1, archO), blur: (1 - archO) * 6 });
    E.show(this.arch, archO > 0.001);
    set(this.req, { o: reqO, blur: (1 - reqO) * 6 });
    E.show(this.req, reqO > 0.001);
    set(this.winWrap, { x: 385, y: 150 + (1 - appO) * 40, s: lerp(0.95, 1, appO), o: appO, blur: (1 - appO) * 6 });
    E.show(this.winWrap, appO > 0.001);

    if (archO > 0.001) this.updateArch(t);
    if (reqO > 0.001) this.updateReq(t);
    this.updateApp(t, appO);
  },

  updateArch(t) {
    const { set, prog, ease, lerp } = E;
    const c = TL.cue, vo = TL.vo, X0 = this.X0;
    // b07's word timings miss its opening ("Code can travel, too."), so the pipeline chip keys off the line start.
    // Controllers drop in as they are named.
    set(this.ctlLabel, { x: X0, y: 146, o: prog(t, TL.scenes.breact + 0.2, 0.5) });
    set(this.hostedEl, { o: prog(t, c('hosted') - 0.1, 0.5) });
    this.ctl.forEach((k, i) => {
      const p = prog(t, c('controllers') + 0.1 + i * 0.32, 0.55, ease.outBackSoft);
      set(k.el, { x: k.x, y: 186 + (1 - p) * 30, o: Math.min(1, p * 1.5) });
    });
    // COUSP's ID chips and Flowminder's telco data light up for the two exceptions.
    const exc = E.window(t, c('exceptions') - 0.1, vo.b04, 0.3, 0.3);
    this.ctl[1].chips.forEach((el, i) => el.classList.toggle('hot', i % 2 === 0 && exc > 0.5 && t < c('telco') + 0.3));
    this.ctl[3].chips[0].classList.toggle('hot', t >= c('telco') - 0.1 && t < vo.b04);
    this.ctl.forEach((k) => k.el.classList.toggle('dsa', t >= c('dsa') - 0.1));

    // Flow arrows and the access line between the two rows (slide 11).
    const fp = prog(t, c('rawData') - 0.1, 0.6);
    const later = t >= vo.b06 - 0.3 ? 0.35 : 1;
    this.flowPaths.forEach((p) => { p.style.strokeDashoffset = (-t * 32).toFixed(1); p.style.opacity = (fp * later).toFixed(3); });
    set(this.flow, { x: 0, y: 352, o: fp * later });
    set(this.flowParts[0], { o: 1 });
    set(this.flowParts[1], { o: prog(t, c('restrictedWs') - 0.1, 0.4) });
    set(this.flowParts[2], { o: prog(t, c('telco') - 0.1, 0.4) });

    // Partner rows; the restricted twins of Oxford and INRB open for the exceptions.
    const open = prog(t, c('restrictedWs') - 0.25, 0.7, ease.inOutCubic);
    const agr = prog(t, c('layers') - 0.1, 0.6);
    set(this.rowsWrap, { o: lerp(1, 0.45, agr) });
    set(this.partLabel, { x: X0, y: 394, o: prog(t, c('rawData') + 0.1, 0.5) });
    let y = 424, gi = 0;
    this.rows.forEach((r) => {
      const hgt = r.r ? 52 : 58;
      const k = r.r ? open : 1;
      r.y = y;
      if (r.r) {
        E.css(r.el, 'height', (hgt * k).toFixed(1) + 'px');
        set(r.el, { x: X0 + 40, y, o: k });
        r.ids.forEach((el, i) => set(el, { o: prog(t, c('restrictedWs') + 0.25 + i * 0.15, 0.4) }));
      } else {
        const p = prog(t, c('partnersRow') - 0.25 + gi * 0.28, 0.5, ease.outCubic);
        set(r.el, { x: X0 + (1 - p) * 30, y, o: p });
        set(r.general, { o: prog(t, c('sameSource') - 0.6 + gi * 0.08, 0.4) });
        gi++;
      }
      y += (hgt + 10) * k;
    });
    const ox = this.byName('Oxford'), oxr = this.byName('Oxford', true);
    set(ox.telco, { o: prog(t, c('telco') + 0.05, 0.4), s: 0.9 + 0.1 * prog(t, c('telco') + 0.05, 0.4, ease.outBack) });
    set(ox.pipeline, { o: prog(t, TL.vo.b07 + 0.2, 0.4), s: 0.9 + 0.1 * prog(t, TL.vo.b07 + 0.2, 0.4, ease.outBack) });
    ox.pipeline.classList.toggle('hot', t >= TL.vo.b07 + 0.2 && t < c('publishTpl'));
    const cp = prog(t, c('cleaned') - 0.15, 0.45, ease.outBack);
    set(oxr.arrow, { o: prog(t, c('oxfordTurns'), 0.4) });
    set(oxr.cleaned, { o: Math.min(1, cp * 1.4), s: 0.9 + 0.1 * cp });
    oxr.el.classList.toggle('hot', t >= c('oxfordTurns') - 0.2 && t < c('sharesIt') + 2.2);

    // The cleaned contact dataset is shared with four workspaces: copies fly to their rows.
    const src = this.box(oxr.cleaned);
    this.copies.forEach((el, i) => {
      const dst = this.byName(this.copyTo[i]);
      const tx = X0 + 610, ty = dst.y + 13;
      const p = prog(t, c('sharesIt') + 0.15 + i * 0.32, 0.75, ease.inOutCubic);
      const arc = Math.sin(p * Math.PI) * 40;
      set(el, { x: lerp(src.x, tx, p) + arc, y: lerp(src.y, ty, p), o: p > 0 ? Math.min(1, p * 4) : 0, s: lerp(1, 0.96, p) });
    });
    set(this.shareCap, { x: 960, y: 930, o: E.window(t, c('sharesIt') + 0.7, vo.b07 + 0.2, 0.4, 0.3) });
    E.css(this.shareCap, 'translate', '-50% 0');

    // Agreements: DSA pills on every partner, then the DPA and DSA cards.
    this.dsaPills.forEach((el, i) => {
      const r = this.byName(this.B.partners[i]);
      const p = prog(t, c('dsa') + 0.1 + i * 0.16, 0.4, ease.outBack);
      set(el, { x: X0 + this.W - 92, y: r.y + 14, o: Math.min(1, p * 1.5), s: 0.8 + 0.2 * p });
    });
    const dp = prog(t, c('dpa') - 0.5, 0.6, ease.outBackSoft), dsp = prog(t, c('dsa') - 0.3, 0.6, ease.outBackSoft);
    set(this.dpa, { x: X0, y: 914 + (1 - dp) * 30, o: Math.min(1, dp * 1.5) });
    set(this.dsa, { x: X0 + this.W / 2 + 12, y: 914 + (1 - dsp) * 30, o: Math.min(1, dsp * 1.5) });
  },

  updateReq(t) {
    const { set, prog, ease, lerp } = E;
    const c = TL.cue, vo = TL.vo;
    const p0 = prog(t, vo.b05 - 0.2, 0.6, ease.outBackSoft), p1 = prog(t, vo.b05 + 0.1, 0.6, ease.outBackSoft);
    set(this.you, { x: 320, y: 400 + (1 - p0) * 30, o: Math.min(1, p0 * 1.5) });
    set(this.ctlNode, { x: 1130, y: 400 + (1 - p1) * 30, o: Math.min(1, p1 * 1.5) });
    const a = prog(t, c('askCtl') - 0.1, 0.6, ease.outCubic);
    this.askPath.style.strokeDasharray = `${(a * 330).toFixed(1)} 400`;
    set(this.askHead, { x: 790 + a * 330 - 14, y: 504, o: a > 0.02 ? 1 : 0 });
    set(this.askLabel, { x: 955, y: 462, o: prog(t, c('askCtl'), 0.4) });
    E.css(this.askLabel, 'translate', '-50% 0');
    const d = prog(t, c('agreement') - 0.4, 0.5, ease.outBack);
    set(this.dsaReq, { x: 1365, y: 300 + (1 - d) * 20, o: Math.min(1, d * 1.5), s: 0.9 + 0.1 * d });
    E.css(this.dsaReq, 'translate', '-50% 0');
    // The dataset travels back along the curve into your workspace.
    const b = prog(t, c('shareBack') - 0.1, 1.1, ease.inOutCubic);
    this.backPath.style.opacity = (prog(t, c('shareBack') - 0.3, 0.4) * 0.9).toFixed(3);
    this.backPath.style.strokeDashoffset = (-t * 30).toFixed(1);
    const q = 1 - b, P = [[1370, 650], [1370, 860], [550, 860], [550, 650]];
    const bx = q * q * q * P[0][0] + 3 * q * q * b * P[1][0] + 3 * q * b * b * P[2][0] + b * b * b * P[3][0];
    const by = q * q * q * P[0][1] + 3 * q * q * b * P[1][1] + 3 * q * b * b * P[2][1] + b * b * b * P[3][1];
    set(this.dsChip, { x: bx - 70, y: by - 24 - prog(t, c('shareBack') + 1.0, 0.4, ease.outCubic) * 60, o: prog(t, c('shareBack') - 0.2, 0.3) });
    set(this.backLabel, { x: 960, y: 850, o: prog(t, c('shareBack') + 0.8, 0.5) });
    E.css(this.backLabel, 'translate', '-50% 0');
  },

  updateApp(t, appO) {
    const { set, prog, ease, lerp, clamp } = E;
    const c = TL.cue, A = TL.at, vo = TL.vo;
    const seg = t < vo.b05 ? 'ds' : t < A.tplSwitch ? 'pipe' : 'tpl';
    const P = this.pages;
    for (const [k, p] of Object.entries(P)) {
      const on = k === seg;
      E.show(p.el, on && appO > 0.001);
      if (on) { set(p.el, { o: seg === 'tpl' ? prog(t, A.tplSwitch, 0.3) : 1 }); p.update(t); }
    }
    E.text(this.wsName, seg === 'pipe' ? 'Oxford' : 'Imperial');
    this.side.setActive(seg === 'ds' ? 'datasets' : 'pipelines', 1);
    this.win.setUrl(seg === 'ds' ? '/workspaces/imperial/datasets' : seg === 'pipe' ? '/workspaces/oxford/pipelines/contact-cleaning' : '/workspaces/imperial/pipelines?tab=templates');
    set(this.tplCap, { x: 960, y: 1000, o: E.window(t, c('tplVisible') - 0.2, vo.b09 - 0.4, 0.4, 0.4) });
    E.css(this.tplCap, 'translate', '-50% 0');

    // Highlight ring: the Workspace column, then Publish as Template, then Create pipeline.
    let ringBox = null, ringO = 0;
    if (appO > 0.5) {
      const wcol = E.window(t, c('wsColumn') - 0.25, vo.b05 - 0.45, 0.25, 0.25);
      const pub = E.window(t, c('publishTpl') - 0.1, A.tplSwitch - 0.1, 0.25, 0.2);
      const cre = E.window(t, c('availTpl') - 0.35, A.tplCreate + 0.1, 0.25, 0.2);
      if (wcol > 0 && seg === 'ds') {
        const a = this.box(P.ds.wsHead), z = this.box(P.ds.wsCells[P.ds.wsCells.length - 1]);
        ringBox = { x: a.x, y: a.y, w: a.w, h: z.y + z.h - a.y }; ringO = wcol;
      } else if (pub > 0 && seg === 'pipe') { ringBox = this.box(P.pipe.publish); ringO = pub; }
      else if (cre > 0 && seg === 'tpl') { ringBox = this.box(P.tpl.create); ringO = cre; }
    }
    if (ringBox) {
      set(this.ring, { x: ringBox.x - 8, y: ringBox.y - 8, o: ringO });
      E.css(this.ring, 'width', (ringBox.w + 16).toFixed(1) + 'px');
      E.css(this.ring, 'height', (ringBox.h + 16).toFixed(1) + 'px');
    } else set(this.ring, { o: 0 });

    // Cursor.
    const keys = [];
    const add = (time, el, opt = {}) => keys.push({ t: time, el, ...opt });
    add(vo.b04 - 0.4, null, { xy: [1500, 1000] });
    add(c('wsColumn') + 0.1, P.ds.wsHead, { dx: 0.4 });
    add(vo.b05 - 0.3, P.ds.wsHead, { dx: 0.4 });
    add(c('publishTpl') - 0.4, null, { xy: [1500, 1000] });
    add(c('publishTpl') + 0.35, P.pipe.publish, { dx: 0.45 });
    add(A.tplSwitch - 0.05, P.pipe.publish, { dx: 0.45 });
    add(A.tplSwitch + 0.4, P.tpl.tab, { dx: 0.5 });
    add(c('availTpl') - 0.1, P.tpl.create, { dx: 0.5 });
    add(A.tplCreate, P.tpl.create, { click: true, dx: 0.5 });
    add(A.tplCreate + 1.4, null, { xy: [1450, 960] });
    keys.sort((a, b) => a.t - b.t);
    const pos = (k) => {
      if (k.xy) return k.xy;
      if (!k.el || k.el.offsetParent === null) return null;
      const b = this.box(k.el);
      return [b.x + b.w * (k.dx ?? 0.5), b.y + b.h * (k.dy ?? 0.55)];
    };
    let i = keys.findIndex((k) => k.t > t);
    if (i < 0) i = keys.length;
    const prevK = keys[Math.max(0, i - 1)], nextK = keys[Math.min(keys.length - 1, i)];
    let p0 = pos(prevK), p1 = pos(nextK);
    if (!p0) p0 = p1 || [1500, 1000];
    if (!p1) p1 = p0;
    const mv0 = Math.max(prevK.t, nextK.t - 0.6);
    const mp = nextK === prevK ? 1 : ease.inOutCubic(clamp((t - mv0) / Math.max(0.01, nextK.t - mv0)));
    const press = clamp(1 - Math.abs(t - A.tplCreate) / 0.12);
    set(this.cursor, { x: lerp(p0[0], p1[0], mp) - 8, y: lerp(p0[1], p1[1], mp) - 6, s: 1 - 0.14 * press, o: appO });
  },
});
