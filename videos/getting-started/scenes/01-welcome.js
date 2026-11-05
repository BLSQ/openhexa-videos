// Scene 1: logo build and welcome headline.
E.scene({
  name: 'welcome',
  from: () => 0,
  to: () => TL.scenes.concept + 0.6,
  build(root) {
    const S = I18N[LANG];
    this.mark = UI.logoMark(150, 'wl');
    this.word = UI.wordmark(74);
    this.logo = E.h('div', { class: 'abs', style: { display: 'flex', alignItems: 'center', gap: '34px' } }, [this.mark.el, this.word.el]);
    this.kicker = E.h('div', { class: 'kicker abs', style: { width: '1920px', justifyContent: 'center' } }, [E.h('span', { class: 'dot' }), E.h('span', { text: S.welcome.kicker })]);
    this.hl = E.headline([[S.welcome.title[0], [S.welcome.title[1], 'pink']]], 'headline');
    this.hlEl = E.h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.hl.el]);
    this.sub = E.h('div', { class: 'sub abs', style: { width: '1920px', textAlign: 'center', fontSize: '36px' }, text: S.welcome.sub });
    this.wrap = E.h('div', { class: 'cam' }, [this.logo, this.kicker, this.hlEl, this.sub]);
    root.appendChild(this.wrap);
  },
  update(t) {
    const { set, prog, ease } = E;
    const out = prog(t, TL.scenes.concept - 0.35, 0.8, ease.inCubic);
    set(this.wrap, { y: -out * 120, o: 1 - out, blur: out * 10 });

    const m = prog(t, 0.7, 1.1, ease.outSpring);
    const lw = this.mark.width + 34 + this.word.width;
    const logoX = 960 - lw / 2;
    set(this.logo, { x: logoX, y: 230 });
    set(this.mark.hex, { s: 0.2 + 0.8 * m, r: (1 - m) * -90 });
    set(this.mark.glyph, { s: prog(t, 1.0, 0.7, ease.outBack), o: prog(t, 1.0, 0.3) });
    E.attr(this.mark.outline, 'opacity', String(prog(t, 0.9, 0.5)));
    this.word.letters.forEach((g, i) => {
      const p = prog(t, 1.25 + i * 0.05, 0.6, ease.outQuart);
      set(g, { y: (1 - p) * 30, o: p });
    });

    set(this.kicker, { y: 470, o: prog(t, TL.vo.s01 - 0.2, 0.5) });
    set(this.hlEl, { y: 520 });
    E.revealWords(this.hl.words, t, [TL.vo.s01, TL.vo.s01 + 0.12, TL.word('s01', 'open') - 0.05]);
    const sp = prog(t, TL.cue('quickTour') - 0.1, 0.7, ease.outCubic);
    set(this.sub, { y: 680 + (1 - sp) * 24, o: sp });
  },
});
