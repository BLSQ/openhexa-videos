// End card: logo on the music's final downbeat (TL.outroHit), headline, call-to-action button.
E.scene({
  name: 'outro',
  from: () => TL.scenes.outro,
  to: () => TL.duration + 1,
  build(root) {
    const O = I18N[LANG].outro;
    const { h } = E;
    this.mark = UI.logoMark(118, 'ol');
    this.word = UI.wordmark(58);
    this.logo = h('div', { class: 'abs', style: { display: 'flex', alignItems: 'center', gap: '28px' } }, [this.mark.el, this.word.el]);
    this.hl = E.headline([[O.title[0]], [[O.title[1], 'pink']]], 'headline');
    this.hlEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.hl.el]);
    this.btn = h('div', { class: 'btn-primary abs', style: { height: '84px', padding: '0 44px', fontSize: '30px' } }, [h('span', { text: O.button })]);
    root.append(this.logo, this.hlEl, this.btn);
  },
  update(t) {
    const { set, prog, ease } = E;
    const th = TL.outroHit - 0.15;
    const m = prog(t, th, 1.0, ease.outSpring);
    set(this.logo, { x: 960 - (this.mark.width + 28 + this.word.width) / 2, y: 190, o: Math.min(1, m * 2) });
    set(this.mark.hex, { s: 0.3 + 0.7 * m, r: (1 - m) * -60 });
    set(this.mark.glyph, { s: prog(t, th + 0.2, 0.6, ease.outBack) });
    this.word.letters.forEach((g, i) => set(g, { y: (1 - prog(t, th + 0.25 + i * 0.04, 0.5, ease.outQuart)) * 24, o: prog(t, th + 0.25 + i * 0.04, 0.5) }));
    set(this.hlEl, { y: 380 });
    E.revealWords(this.hl.words, t, TL.cue('tryIt'));
    const b = prog(t, TL.end('s03') - 0.8, 0.7, ease.outBack);
    set(this.btn, { x: 960 - (this.btn.offsetWidth || 400) / 2, y: 700 + (1 - b) * 30, s: 0.85 + 0.15 * b, o: Math.min(1, b * 1.4) });
  },
});
