// Intro: logo build, kicker, two-line headline. Every value is a pure function of t.
E.scene({
  name: 'intro',
  from: () => 0,
  to: () => TL.scenes.concept + 0.6,
  build(root) {
    const C = I18N[LANG].intro;
    const { h } = E;
    this.mark = UI.logoMark(130, 'il');
    this.word = UI.wordmark(64);
    this.logo = h('div', { class: 'abs', style: { display: 'flex', alignItems: 'center', gap: '30px' } }, [this.mark.el, this.word.el]);
    this.kicker = h('div', { class: 'kicker abs', style: { width: '1920px', justifyContent: 'center' } }, [h('span', { class: 'dot' }), h('span', { text: C.kicker })]);
    this.hl = E.headline([[C.title[0]], [[C.title[1], 'pink']]], 'headline');
    this.hlEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.hl.el]);
    this.wrap = h('div', { class: 'cam' }, [this.logo, this.kicker, this.hlEl]);
    root.appendChild(this.wrap);
  },
  update(t) {
    const { set, prog, ease } = E;
    const out = prog(t, TL.scenes.concept - 0.35, 0.8, ease.inCubic);
    set(this.wrap, { y: -out * 120, o: 1 - out, blur: out * 10 });
    const m = prog(t, 0.7, 1.1, ease.outSpring);
    set(this.logo, { x: 960 - (this.mark.width + 30 + this.word.width) / 2, y: 150 });
    set(this.mark.hex, { s: 0.2 + 0.8 * m, r: (1 - m) * -90 });
    set(this.mark.glyph, { s: prog(t, 1.0, 0.7, ease.outBack), o: prog(t, 1.0, 0.3) });
    this.word.letters.forEach((g, i) => {
      const p = prog(t, 1.25 + i * 0.05, 0.6, ease.outQuart);
      set(g, { y: (1 - p) * 30, o: p });
    });
    set(this.kicker, { y: 405, o: prog(t, TL.vo.s01 - 0.2, 0.5) });
    set(this.hlEl, { y: 460 });
    E.revealWords(this.hl.words, t, TL.cue('introTitle') - 0.1);
  },
});
