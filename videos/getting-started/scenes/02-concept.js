// Scene 2: an organization holds workspaces; a workspace is a secure, shared space for data, code and results.
E.scene({
  name: 'concept',
  from: () => TL.scenes.concept,
  to: () => TL.scenes.create + 0.7,
  build(root) {
    const S = I18N[LANG];
    const C = S.concept;
    const { h } = E;
    this.title = E.headline([[C.title[0], [C.title[1], 'pink']]], 'headline md');
    this.titleEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.title.el]);

    this.org = h('div', { class: 'abs concept-org' }, [
      h('div', { class: 'concept-org-label' }, [UI.heroIcon('BuildingOffice', 26, '#8d93b8', 1.6), h('span', { text: C.org })]),
    ]);

    const wsCard = (name, flag, main) => {
      const el = h('div', { class: 'abs concept-ws' + (main ? ' main' : '') }, [
        h('div', { class: 'concept-ws-head' }, [h('span', { class: 'flag', html: FLAGS[flag] }), h('span', { text: name })]),
        main ? null : h('div', { class: 'concept-skel' }, [['CircleStack', 62], ['Bolt', 48], ['GlobeAlt', 70]].map(([ic, w]) => h('div', {}, [UI.heroIcon(ic, 22, 'rgba(255,255,255,0.35)', 1.6), h('i', { style: { width: w + '%' } })]))),
      ]);
      return el;
    };
    this.side = [wsCard(C.workspaces[1], C.flags[1]), wsCard(C.workspaces[2], C.flags[2])];
    this.main = wsCard(S.workspaceName, S.country.flag, true);

    const pill = (icon, label, items, color) => h('div', { class: 'concept-pill', style: { '--c': color } }, [
      h('div', { class: 'cp-ico' }, [UI.heroIcon(icon, 30, color, 1.7)]),
      h('div', {}, [h('div', { class: 'cp-label', text: label }), h('div', { class: 'cp-items', text: items })]),
    ]);
    this.pills = [
      pill('CircleStack', C.data[0], C.data[1], '#3ee6c1'),
      pill('Bolt', C.code[0], C.code[1], '#ff8cc0'),
      pill('GlobeAlt', C.results[0], C.results[1], '#b3baff'),
    ];
    this.pillWrap = h('div', { class: 'concept-pills' }, this.pills);
    this.main.appendChild(this.pillWrap);

    this.lock = h('div', { class: 'concept-badge abs' }, [UI.heroIcon('LockClosed', 24, '#fff', 2), h('span', { text: C.secure })]);
    const av = (txt, bg) => h('div', { class: 'concept-av', style: { background: bg }, text: txt });
    this.team = h('div', { class: 'concept-team abs' }, [av('AK', '#7b86ff'), av('MD', '#ff459a'), av('JS', '#22a38a'), av('+3', '#2b3466'), h('span', { text: C.shared })]);
    this.main.append(this.lock, this.team);

    this.cam = h('div', { class: 'cam' }, [this.titleEl, this.org, ...this.side, this.main]);
    root.appendChild(this.cam);
  },
  update(t) {
    const { set, prog, ease, lerp } = E;
    const t0 = TL.scenes.concept;
    const tOut = TL.scenes.create;
    const out = prog(t, tOut - 0.3, 0.9, ease.inOutCubic);
    set(this.cam, { s: 1 + out * 0.25, o: 1 - out, blur: out * 8 });

    set(this.titleEl, { y: 118 });
    E.revealWords(this.title.words, t, t0 + 0.25);

    const orgIn = prog(t, t0 + 0.35, 0.9, ease.outQuart);
    set(this.org, { x: 135, y: 250 + (1 - orgIn) * 40, o: orgIn });

    const wsT = TL.cue('workspaces');
    const focus = prog(t, TL.cue('secure') - 0.4, 0.9, ease.inOutCubic);
    // Three workspace cards drop in; the middle one then grows into focus.
    const slots = [[195, 400], [1225, 400]];
    this.side.forEach((el, i) => {
      const p = prog(t, wsT + 0.12 + i * 0.12, 0.7, ease.outBackSoft);
      set(el, { x: slots[i][0] + (i ? 1 : -1) * focus * 40, y: slots[i][1] + (1 - p) * 60, s: lerp(0.9, 1, p) * lerp(1, 0.92, focus), o: Math.min(1, p * 1.5) * lerp(1, 0.45, focus) });
    });
    const pm = prog(t, wsT, 0.7, ease.outBackSoft);
    set(this.main, { x: 710, y: lerp(400, 320, focus) + (1 - pm) * 60, s: lerp(0.9, 1, pm), o: Math.min(1, pm * 1.5) });
    E.css(this.main, 'height', lerp(250, 560, focus).toFixed(1) + 'px');

    const lk = prog(t, TL.cue('secure') - 0.05, 0.55, ease.outBack);
    set(this.lock, { x: 26, y: 92, s: 0.6 + 0.4 * lk, o: lk });
    const tm = prog(t, TL.cue('shared') - 0.05, 0.55, ease.outBack);
    set(this.team, { x: 26, y: 146, s: 0.6 + 0.4 * tm, o: tm });
    const pt = [TL.cue('data'), TL.cue('code'), TL.cue('results')];
    this.pills.forEach((el, i) => {
      const p = prog(t, pt[i] - 0.12, 0.55, ease.outBack);
      set(el, { y: (1 - p) * 30, s: 0.85 + 0.15 * p, o: Math.min(1, p * 1.4) });
    });
    set(this.pillWrap, { o: focus });
  },
});
