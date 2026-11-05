// Feature: the real OpenHEXA app (core/app-ui.js) on the left, a callout with the docs link on the
// right. The cursor clicks the sidebar item, then the page plays its own beats (here Files'
// "upload", a cue named in i18n.js). Swap the page for any AppUI.*Page; see docs/components.md.
E.scene({
  name: 'feature',
  from: () => TL.scenes.feature,
  to: () => TL.scenes.outro + 0.8,
  build(root) {
    const F = I18N[LANG].feature;
    const { h } = E;
    this.win = AppUI.window();
    this.side = AppUI.wsSidebar();
    this.page = AppUI.filesPage();
    this.main = h('div', { class: 'ox-main' }, [this.page.el]);
    this.win.body.append(this.side.el, this.main, h('div', { class: 'ox-help-btn', text: '?' }));
    this.win.setUrl(`/workspaces/${APP_DEFAULTS[LANG].workspaceSlug}/files`);
    E.set(this.win.el, { s: 1.28 });
    this.winWrap = h('div', { class: 'abs' }, [this.win.el]);
    this.callout = h('div', { class: 'co-panel abs' }, [
      h('div', { class: 'co-top' }, [h('div', { class: 'co-icon' }, [UI.heroIcon('FolderOpen', 36, '#ff8cc0', 1.6)])]),
      h('div', { class: 'co-title', text: F.title }),
      h('div', { class: 'co-desc', html: F.desc }),
      h('div', { class: 'co-doc' }, [UI.heroIcon('BookOpen', 22, '#9ff3df', 1.7), h('span', { text: F.doc })]),
    ]);
    this.cursor = UI.cursor();
    root.append(this.winWrap, this.callout, this.cursor);
    this.stage = document.getElementById('stage');
  },
  // Center of an element in stage pixels (scaled player or unscaled render).
  center(el) {
    const s = this.stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / TL.width;
    return [(r.left - s.left + r.width * 0.4) / k, (r.top - s.top + r.height * 0.55) / k];
  },
  update(t) {
    const { set, prog, ease, lerp } = E;
    const t0 = TL.scenes.feature, out = prog(t, TL.scenes.outro - 0.3, 0.8, ease.inCubic);
    const enter = prog(t, t0, 1.0, ease.outQuart);
    set(this.winWrap, { x: 70, y: 150 + (1 - enter) * 90, s: lerp(0.94, 1, enter), o: Math.min(1, enter * 1.6) * (1 - out), blur: out * 6 });
    const co = prog(t, t0 + 0.4, 0.8, ease.outQuart);
    set(this.callout, { x: 1395 + (1 - co) * 60, y: 380, o: co * (1 - out) });
    const click = TL.cue('openFiles');
    this.side.setActive('files', prog(t, click, 0.25));
    this.page.update(t);
    const [x1, y1] = this.center(this.side.items.files.el), [x2, y2] = this.center(this.page.upload);
    const mv = ease.inOutCubic(E.clamp((t - (click - 0.7)) / 0.7));
    const mv2 = ease.inOutCubic(E.clamp((t - (TL.cue('upload') - 0.5)) / 0.7));
    const press = Math.max(1 - Math.abs(t - click) / 0.12, 1 - Math.abs(t - TL.cue('upload') - 0.2) / 0.12, 0);
    set(this.cursor, { x: lerp(lerp(1400, x1, mv), x2, mv2) - 8, y: lerp(lerp(950, y1, mv), y2, mv2) - 6, s: 1 - 0.14 * press, o: E.window(t, t0 + 0.4, TL.scenes.outro, 0.4, 0.3) });
  },
});
