// Concept: the real B-REACT workspaces in one OpenHEXA organization. Files, database, pipelines, notebooks and web
// apps stay inside each workspace; the dataset is what moves between workspaces. Then the three roles.
E.scene({
  name: 'concept',
  from: () => TL.scenes.concept,
  to: () => TL.scenes.join + 0.8,
  build(root) {
    const C = I18N[LANG].concept;
    const { h } = E;
    this.title = E.headline([[C.title[0]], [[C.title[1], 'pink']]], 'headline md');
    this.titleEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.title.el]);
    this.org = h('div', { class: 'abs br-org' }, [h('div', { class: 'concept-org-label' }, [UI.heroIcon('BuildingOffice', 26, '#8d93b8', 1.7), h('span', { text: C.org })])]);
    this.locks = [];
    this.stays = [];
    // The seven real B-REACT workspaces: four on top, the three BDBV partner workspaces below.
    const CW = 375, GAP = 22, ORG_X = 135, ORG_W = 1650;
    const rowX = (n) => ORG_X + (ORG_W - (n * CW + (n - 1) * GAP)) / 2;
    this.wsPos = C.workspaces.map((_, i) => (i < 4 ? [rowX(4) + i * (CW + GAP), 336] : [rowX(3) + (i - 4) * (CW + GAP), 640]));
    this.ws = C.workspaces.map(([name]) => {
      const items = C.stays.map(([ic, label]) => {
        const lock = h('span', { class: 'br-lock' }, [UI.heroIcon('LockClosed', 13, '#8d93b8', 2.2)]);
        this.locks.push(lock);
        const el = h('div', { class: 'br-stay' }, [UI.heroIcon(ic, 24, '#b3baff', 1.7), h('span', { text: label }), lock]);
        this.stays.push(el);
        return el;
      });
      return h('div', { class: 'abs br-wscard' }, [h('div', { class: 'br-wshead' }, [UI.heroIcon('Square2Stack', 22, '#ff8cc0', 1.8), h('span', { text: name })]), h('div', { class: 'br-stays' }, items)]);
    });
    // A dataset leaves DRC COUSP and lands on the three partner workspaces.
    const src = [this.wsPos[1][0] + CW / 2, 486];
    this.dsSrc = src;
    this.dsDst = [4, 5, 6].map((i) => [this.wsPos[i][0] + CW / 2, 616]);
    const curve = ([x0, y0], [x1, y1]) => `M ${x0} ${y0} C ${x0} ${y0 + 70}, ${x1} ${y1 - 80}, ${x1} ${y1}`;
    const chip = () => h('div', { class: 'abs br-dschip' }, [UI.heroIcon('Square2Stack', 22, '#192041', 2), h('span', { text: C.dataset })]);
    this.chips = [chip(), chip(), chip(), chip()];
    this.svg = h('div', { class: 'abs', html: '<svg width="1920" height="1080">' + this.dsDst.map((d) => `<path d="${curve(src, d)}" fill="none" stroke="#3ee6c1" stroke-width="4" stroke-dasharray="10 12" stroke-linecap="round"/>`).join('') + '</svg>' });
    this.paths = [...this.svg.querySelectorAll('path')];
    this.curvePts = this.dsDst.map((d) => [src, [src[0], src[1] + 70], [d[0], d[1] - 80], d]);
    this.phaseA = h('div', { class: 'cam' }, [this.titleEl, this.org, ...this.ws, this.svg, ...this.chips]);

    this.rTitle = E.headline([[C.rolesTitle[0], [C.rolesTitle[1], 'pink']]], 'headline md');
    this.rTitleEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.rTitle.el]);
    const icons = ['Eye', 'Pencil', 'Cog6Tooth'];
    this.roles = C.roles.map(([role, items], i) => h('div', { class: 'abs br-role' + (i === 2 ? ' admin' : '') }, [
      h('div', { class: 'br-role-h' }, [h('div', { class: 'br-role-ico' }, [UI.heroIcon(icons[i], 34, '#ff8cc0', 1.7)]), h('span', { text: role })]),
      ...items.map((x) => h('div', { class: 'br-role-item' }, [UI.heroIcon('Check', 24, '#3ee6c1', 2.4), h('span', { text: x })])),
    ]));
    this.phaseB = h('div', { class: 'cam' }, [this.rTitleEl, ...this.roles]);
    root.append(this.phaseA, this.phaseB);
  },
  update(t) {
    const { set, prog, ease, lerp } = E;
    const t0 = TL.scenes.concept, tB = TL.vo.s04 - 0.45, tOut = TL.scenes.join;
    const swap = prog(t, tB - 0.2, 0.7, ease.inOutCubic);
    set(this.phaseA, { s: 1 + swap * 0.08, o: 1 - swap, blur: swap * 8 });
    set(this.titleEl, { y: 70 });
    E.revealWords(this.title.words, t, [t0 + 0.25, t0 + 0.32, t0 + 0.39, t0 + 0.46, TL.cue('datasetMove') - 0.25]);
    const oi = prog(t, t0 + 0.35, 0.9, ease.outQuart);
    set(this.org, { x: 135, y: 250 + (1 - oi) * 40, o: oi });
    const wsT = TL.cue('workspaces');
    this.ws.forEach((el, i) => {
      const p = prog(t, wsT - 0.15 + i * 0.1, 0.7, ease.outBackSoft);
      set(el, { x: this.wsPos[i][0], y: this.wsPos[i][1] + (1 - p) * 40, s: lerp(0.92, 1, p), o: Math.min(1, p * 1.5) });
    });
    // Files, database, pipelines, notebooks, web apps appear as they are named, then lock in place.
    const ho = TL.cue('holds');
    this.stays.forEach((el, i) => {
      const p = prog(t, ho + 0.1 + (i % 5) * 0.38 + Math.floor(i / 5) * 0.03, 0.4, ease.outCubic);
      set(el, { o: p, y: (1 - p) * 8 });
    });
    const st = TL.cue('stay');
    this.locks.forEach((el, i) => {
      const p = prog(t, st - 0.1 + (i % 5) * 0.06 + Math.floor(i / 5) * 0.05, 0.45, ease.outBack);
      set(el, { s: 0.5 + 0.5 * p, o: Math.min(1, p * 1.5) });
    });
    // The dataset leaves DRC COUSP and reaches the three partner workspaces.
    const dm = TL.cue('datasetMove');
    const c0 = prog(t, dm - 0.3, 0.5, ease.outBack);
    const CHW = 150, CHH = 46;
    set(this.chips[0], { x: this.dsSrc[0] - CHW / 2, y: this.dsSrc[1] - CHH / 2 + 8, s: 0.8 + 0.2 * c0, o: Math.min(1, c0 * 1.5) });
    const bez = (P, u) => { const q = 1 - u; return [0, 1].map((k) => q * q * q * P[0][k] + 3 * q * q * u * P[1][k] + 3 * q * u * u * P[2][k] + u * u * u * P[3][k]); };
    this.paths.forEach((path, k) => {
      const len = 900;
      const p = prog(t, dm + 0.1 + k * 0.3, 0.6, ease.inOutCubic);
      path.style.strokeDasharray = `${(p * len).toFixed(1)} ${len}`;
      E.css(path, 'opacity', p > 0 ? '0.75' : '0');
      const q = prog(t, dm + 0.15 + k * 0.3, 0.75, ease.inOutCubic);
      const [x, y] = bez(this.curvePts[k], q);
      set(this.chips[k + 1], { x: x - CHW / 2, y: y - CHH / 2, s: 0.85 + 0.15 * q, o: q > 0 ? Math.min(1, q * 4) : 0 });
    });

    const outB = prog(t, tOut - 0.3, 0.8, ease.inCubic);
    const inB = prog(t, tB, 0.6, ease.outCubic);
    set(this.phaseB, { o: inB * (1 - outB), s: 1 + outB * 0.15, blur: outB * 8 });
    set(this.rTitleEl, { y: 110 });
    E.revealWords(this.rTitle.words, t, TL.cue('role') - 0.2);
    const rt = [TL.cue('viewers'), TL.cue('editors'), TL.cue('admins')];
    this.roles.forEach((el, i) => {
      const p = prog(t, rt[i] - 0.15, 0.6, ease.outBackSoft);
      set(el, { x: 195 + i * 530, y: 320 + (1 - p) * 50, s: lerp(0.9, 1, p), o: Math.min(1, p * 1.5) });
    });
  },
});
