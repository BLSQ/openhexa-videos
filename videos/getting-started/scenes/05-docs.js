// Scene 5: the documentation site (real captures of docs.openhexa.com) and the in-app help button.
E.scene({
  name: 'docs',
  from: () => TL.scenes.docs,
  to: () => TL.scenes.outro + 0.7,
  build(root) {
    const S = I18N[LANG];
    const D = S.docs;
    const { h } = E;
    const W = 1180, H = 720;
    this.win = UI.windowCard(LANG === 'fr' ? 'docs.openhexa.com / fr' : 'docs.openhexa.com / ', { w: W, h: H, light: true });
    // Captured at 1440 css px wide (2x DPR); shown at the window's width.
    this.shotScale = W / 1440;
    this.shot = h('img', { src: `assets/docs/${LANG}-home-full.png`, style: { position: 'absolute', left: 0, top: 0, width: W + 'px' } });
    this.win.body.style.overflow = 'hidden';
    this.win.body.appendChild(this.shot);
    this.winWrap = h('div', { class: 'abs' }, [this.win.el]);

    // In-app help: corner of a workspace page with the "?" button and its popover.
    this.help = h('div', { class: 'abs help-card' });
    const page = h('div', { class: 'help-page' }, [
      h('div', { class: 'help-lines' }, [0, 1, 2, 3, 4].map((i) => h('i', { style: { width: [70, 92, 55, 84, 40][i] + '%' } }))),
    ]);
    this.helpBtn = h('div', { class: 'ox-help-btn', text: '?' });
    this.pop = h('div', { class: 'help-pop' }, [
      h('div', { class: 'hp-title', text: D.suggested }),
      h('ul', {}, D.links.map((l) => h('li', {}, [h('span', { text: l })]))),
      h('div', { class: 'hp-foot', text: D.homepage }),
    ]);
    this.cursor = UI.cursor();
    this.help.append(page, this.pop, this.helpBtn, this.cursor);
    root.append(this.winWrap, this.help);
  },
  update(t) {
    const { set, prog, ease, lerp } = E;
    const t0 = TL.scenes.docs;
    const tHelp = TL.cue('helpButton');
    const out = prog(t, TL.scenes.outro - 0.35, 0.8, ease.inCubic);

    const win = prog(t, t0 + 0.1, 1.0, ease.outQuart);
    const shift = prog(t, tHelp - 1.5, 0.9, ease.inOutCubic);
    set(this.winWrap, { x: lerp(370, 120, shift), y: 200 + (1 - win) * 120, s: lerp(0.94, 1, win) * lerp(1, 0.9, shift), o: Math.min(1, win * 1.5) * (1 - out), blur: out * 8 });
    // Scroll from the hero down to the user-manual cards as the guides are mentioned.
    const sc = prog(t, TL.cue('guide') - 0.3, 1.6, ease.inOutCubic);
    set(this.shot, { y: -sc * 1060 * this.shotScale });

    const hp = prog(t, tHelp - 1.35, 0.8, ease.outQuart);
    set(this.help, { x: lerp(1380, 1230, hp), y: 300, o: Math.min(1, hp * 1.4) * (1 - out), blur: out * 8 });
    const click = tHelp - 0.15;
    const cp = prog(t, tHelp - 0.85, 0.65, ease.inOutCubic);
    const press = 1 - 0.12 * (prog(t, click - 0.05, 0.05, ease.linear) - prog(t, click + 0.05, 0.15, ease.linear));
    set(this.cursor, { x: lerp(560, 520, cp), y: lerp(620, 480, cp), o: hp, s: press });
    set(this.helpBtn, { s: press });
    const pp = prog(t, click + 0.05, 0.45, ease.outBack);
    set(this.pop, { y: (1 - pp) * 16, s: 0.94 + 0.06 * pp, o: Math.min(1, pp * 1.5) });
  },
});
