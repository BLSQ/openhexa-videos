// Own organization: workspace members who belong to no organization see "Create your own organization"
// at the bottom of the sidebar (ExternalCollaboratorNotice). It opens the Bluesquare Console, which
// provisions the new organization with the user as Owner. The console is drawn as a diagram, not a screen.
E.scene({
  name: 'org',
  from: () => TL.scenes.org,
  to: () => TL.scenes.outro + 0.8,
  build(root) {
    const S = I18N[LANG];
    const O = S.org;
    const { h } = E;
    this.hl = E.headline([[O.title[0], [O.title[1], 'pink']]], 'headline md');
    this.hlEl = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center' } }, [this.hl.el]);
    const side = AppUI.wsSidebar();
    side.el.classList.add('br-side');
    this.notice = BR.orgNotice(O);
    side.el.insertBefore(this.notice, side.el.querySelector('.ox-user'));
    side.setActive('home', 1);
    // Only the lower half of the sidebar, scaled up.
    this.sideClip = h('div', { class: 'abs br-sideclip' }, [h('div', { class: 'br-sideinner' }, [side.el])]);
    const card = (cls, icon, title, sub, extra) => h('div', { class: 'abs br-flow ' + cls }, [
      h('div', { class: 'br-flow-ico' }, [UI.heroIcon(icon, 40, '#ff8cc0', 1.7)]),
      h('div', { class: 'br-flow-t', text: title }),
      h('div', { class: 'br-flow-s', text: sub }),
      extra || null,
    ]);
    this.console = card('', 'BuildingOffice', O.console[0], O.console[1]);
    this.console.querySelector('.br-flow-s').classList.add('mono');
    const chips = h('div', { class: 'br-flow-chips' }, ['Workspaces', 'Members', 'Datasets'].map((x) => h('span', { text: x })));
    this.yours = card('mine', 'Users', O.yours[0], O.yours[1], chips);
    this.arrows = h('div', { class: 'abs', html: '<svg width="1920" height="1080"><path class="a1" d="M 640 640 L 780 640" stroke="#3ee6c1" stroke-width="4" fill="none" stroke-linecap="round"/><path class="a2" d="M 1250 640 L 1360 640" stroke="#3ee6c1" stroke-width="4" fill="none" stroke-linecap="round"/></svg>' });
    this.paths = [this.arrows.querySelector('.a1'), this.arrows.querySelector('.a2')];
    this.ring = h('div', { class: 'ox-ring abs' });
    this.cursor = UI.cursor();
    this.cam = h('div', { class: 'cam' }, [this.hlEl, this.sideClip, this.arrows, this.console, this.yours, this.ring, this.cursor]);
    root.appendChild(this.cam);
    this.stage = document.getElementById('stage');
  },
  box(el) {
    const s = this.stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / TL.width;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  },
  update(t) {
    const { set, prog, ease, lerp } = E;
    const c = TL.cue, t0 = TL.scenes.org;
    const out = prog(t, TL.scenes.outro - 0.3, 0.8, ease.inCubic);
    set(this.cam, { o: prog(t, t0, 0.6) * (1 - out), s: 1 + out * 0.1, blur: out * 8 });
    set(this.hlEl, { y: 150 });
    E.revealWords(this.hl.words, t, c('another') - 0.5);
    const sp = prog(t, t0 + 0.2, 0.8, ease.outQuart);
    set(this.sideClip, { x: 200, y: 330 + (1 - sp) * 40, o: sp });
    const click = c('ownOrg') + 0.4;
    this.notice.classList.toggle('pressed', Math.abs(t - click) < 0.15);
    const nb = this.box(this.notice);
    const ro = E.window(t, c('ownOrg') - 0.3, c('console') + 0.4, 0.25, 0.3);
    set(this.ring, { x: nb.x - 8, y: nb.y - 8, o: ro });
    E.css(this.ring, 'width', (nb.w + 16).toFixed(1) + 'px');
    E.css(this.ring, 'height', (nb.h + 16).toFixed(1) + 'px');
    const cur = prog(t, c('ownOrg') - 0.4, 0.7, ease.inOutCubic);
    set(this.cursor, { x: lerp(560, nb.x + nb.w * 0.5, cur) - 8, y: lerp(900, nb.y + nb.h * 0.5, cur) - 6, s: 1 - 0.14 * Math.max(0, 1 - Math.abs(t - click) / 0.12), o: E.window(t, t0 + 0.6, TL.scenes.outro, 0.3, 0.3) });
    const a1 = prog(t, c('console') - 0.5, 0.45, ease.outCubic), a2 = prog(t, c('console') + 0.45, 0.45, ease.outCubic);
    [a1, a2].forEach((p, i) => { this.paths[i].style.strokeDasharray = `${(p * 160).toFixed(1)} 400`; });
    const cp = prog(t, c('console') - 0.2, 0.6, ease.outBackSoft), yp = prog(t, c('console') + 0.75, 0.6, ease.outBackSoft);
    set(this.console, { x: 790, y: 470 + (1 - cp) * 40, s: lerp(0.9, 1, cp), o: Math.min(1, cp * 1.5) });
    set(this.yours, { x: 1370, y: 470 + (1 - yp) * 40, s: lerp(0.9, 1, yp), o: Math.min(1, yp * 1.5) });
  },
});
