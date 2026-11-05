// Scene 6: end card with the call to action and where to find help.
E.scene({
  name: 'outro',
  from: () => TL.scenes.outro,
  to: () => TL.duration + 1,
  build(root) {
    const S = I18N[LANG];
    const O = S.outro;
    const { h } = E;
    this.mark = UI.logoMark(118, 'ol');
    this.word = UI.wordmark(58);
    this.logo = h('div', { class: 'abs', style: { display: 'flex', alignItems: 'center', gap: '28px' } }, [this.mark.el, this.word.el]);
    this.kicker = h('div', { class: 'kicker abs', style: { width: '1920px', justifyContent: 'center' } }, [h('span', { class: 'dot' }), h('span', { text: O.kicker })]);
    this.hl = E.headline(O.title.map((l, i) => [[l, i === O.title.length - 1 ? 'pink' : '']]), 'headline');
    this.hlEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.hl.el]);
    this.btn = h('div', { class: 'btn-primary abs', style: { height: '84px', padding: '0 44px', fontSize: '30px', gap: '14px' } }, [UI.heroIcon('Plus', 32, '#192041', 2.4), h('span', { text: O.button })]);
    this.doc = h('div', { class: 'abs outro-doc' }, [UI.heroIcon('BookOpen', 30, '#9ff3df', 1.7), h('span', { text: 'docs.openhexa.com' })]);
    this.cam = h('div', { class: 'cam' }, [this.logo, this.kicker, this.hlEl, this.btn, this.doc]);
    root.appendChild(this.cam);
  },
  update(t) {
    const { set, prog, ease } = E;
    const t0 = TL.scenes.outro;
    const zoom = prog(t, t0, TL.duration - t0, ease.linear);
    set(this.cam, { s: 1 + zoom * 0.04 });

    const th = TL.outroHit - 0.15;
    const m = prog(t, th, 1.0, ease.outSpring);
    const lw = this.mark.width + 28 + this.word.width;
    set(this.logo, { x: 960 - lw / 2, y: 150, o: Math.min(1, m * 2) });
    set(this.mark.hex, { s: 0.3 + 0.7 * m, r: (1 - m) * -60 });
    set(this.mark.glyph, { s: prog(t, th + 0.2, 0.6, ease.outBack) });
    this.word.letters.forEach((g, i) => {
      const p = prog(t, th + 0.25 + i * 0.04, 0.5, ease.outQuart);
      set(g, { y: (1 - p) * 24, o: p });
    });
    set(this.kicker, { y: 345, o: prog(t, Math.min(th + 0.3, TL.cue('createFirst') - 0.3), 0.5) });
    set(this.hlEl, { y: 400 });
    E.revealWords(this.hl.words, t, TL.cue('createFirst') - 0.1);

    const bw = this.btn.offsetWidth || 560;
    const b = prog(t, TL.end('s16') - 1.2, 0.7, ease.outBack);
    set(this.btn, { x: 960 - bw / 2, y: 690 + (1 - b) * 30, s: 0.85 + 0.15 * b, o: Math.min(1, b * 1.4) });
    const dw = this.doc.offsetWidth || 400;
    const d = prog(t, TL.end('s16') - 0.6, 0.7, ease.outCubic);
    set(this.doc, { x: 960 - dw / 2, y: 820 + (1 - d) * 20, o: d });
  },
});
