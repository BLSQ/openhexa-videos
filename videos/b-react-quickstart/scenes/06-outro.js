// End card: logo on the music's final downbeat (TL.outroHit), headline, docs link.
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
    this.doc = h('div', { class: 'abs br-outro-doc' }, [UI.heroIcon('BookOpen', 34, '#9ff3df', 1.7), h('span', { text: O.doc })]);
    this.kicker = h('div', { class: 'kicker abs', style: { width: '1920px', justifyContent: 'center' } }, [h('span', { class: 'dot' }), h('span', { text: O.kicker })]);
    this.hl = E.headline([[O.title[0], [O.title[1], 'pink']]], 'headline');
    this.hlEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.hl.el]);
    this.cam = h('div', { class: 'cam' }, [this.logo, this.doc, this.kicker, this.hlEl]);
    root.appendChild(this.cam);
  },
  update(t) {
    const { set, prog, ease } = E;
    const t0 = TL.scenes.outro;
    set(this.cam, { s: 1 + prog(t, t0, TL.duration - t0, ease.linear) * 0.04 });
    const th = TL.outroHit - 0.15;
    const m = prog(t, th, 1.0, ease.outSpring);
    set(this.logo, { x: 960 - (this.mark.width + 28 + this.word.width) / 2, y: 170, o: Math.min(1, m * 2) });
    set(this.mark.hex, { s: 0.3 + 0.7 * m, r: (1 - m) * -60 });
    set(this.mark.glyph, { s: prog(t, th + 0.2, 0.6, ease.outBack) });
    this.word.letters.forEach((g, i) => set(g, { y: (1 - prog(t, th + 0.25 + i * 0.04, 0.5, ease.outQuart)) * 24, o: prog(t, th + 0.25 + i * 0.04, 0.5) }));
    const dw = this.doc.offsetWidth || 520;
    const d = prog(t, TL.cue('docs') - 0.2, 0.6, ease.outBack);
    set(this.doc, { x: 960 - dw / 2, y: 400 + (1 - d) * 24, s: 0.9 + 0.1 * d, o: Math.min(1, d * 1.4) });
    set(this.kicker, { y: 530, o: prog(t, TL.cue('docs') + 0.6, 0.5) });
    set(this.hlEl, { y: 600 });
    E.revealWords(this.hl.words, t, TL.cue('welcome') - 0.1);
  },
});
