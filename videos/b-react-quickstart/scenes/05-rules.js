// Rules for AI: the access ceiling and reviewing proposals, as two cards timed to the narration.
E.scene({
  name: 'rules',
  from: () => TL.scenes.rules,
  to: () => TL.scenes.org + 0.8,
  build(root) {
    const R = I18N[LANG].rules;
    const { h } = E;
    this.hl = E.headline([[R.title[0]], [[R.title[1], 'pink']]], 'headline md');
    this.hlEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.hl.el]);
    this.cards = R.cards.map(([ic, title, sub], i) => h('div', { class: 'abs br-rule' + (i === 0 ? ' main' : '') }, [
      h('div', { class: 'br-rule-ico' }, [UI.heroIcon(ic, 44, i === 0 ? '#3ee6c1' : '#ff8cc0', 1.7)]),
      h('div', { class: 'br-rule-t', text: title }),
      h('div', { class: 'br-rule-s', text: sub }),
    ]));
    this.cam = h('div', { class: 'cam' }, [this.hlEl, ...this.cards]);
    root.appendChild(this.cam);
  },
  update(t) {
    const { set, prog, ease, lerp } = E;
    const t0 = TL.scenes.rules;
    const out = prog(t, TL.scenes.org - 0.3, 0.8, ease.inCubic);
    const inn = prog(t, t0, 0.6, ease.outCubic);
    set(this.cam, { o: inn * (1 - out), s: 1 + out * 0.12, blur: out * 8 });
    set(this.hlEl, { y: 170 });
    E.revealWords(this.hl.words, t, TL.cue('never') - 0.25);
    const ct = [TL.cue('never') + 0.4, TL.cue('review') - 0.1];
    this.cards.forEach((el, i) => {
      const p = prog(t, ct[i], 0.6, ease.outBackSoft);
      set(el, { x: 460 + i * 530, y: 480 + (1 - p) * 50, s: lerp(0.9, 1, p), o: Math.min(1, p * 1.5) });
    });
  },
});
