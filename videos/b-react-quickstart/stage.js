// Stage: a calmer field while the light app window is on screen, and a chapter stepper across the
// top from the invitation to the AI chapter.
window.STAGE = {
  tealAlpha: 0.3,
  fade: { in: 0.6, out: 0.8 },
  build(stage, L) {
    const { h } = E;
    L.steps = I18N[LANG].steps.map((label, i) => h('div', { class: 'step' }, [h('div', { class: 'step-num', text: String(i + 1) }), h('span', { text: label })]));
    L.stepper = h('div', { class: 'stepper' }, L.steps.flatMap((s, i) => (i ? [h('div', { class: 'step-line' }), s] : [s])));
    stage.appendChild(L.stepper);
  },
  background(t, L) {
    const { set, lerp } = E;
    const SC = TL.scenes;
    const drift = t * 0.6;
    const calm = E.window(t, SC.join + 0.3, SC.rules + 0.4, 1.2, 1.2);
    set(L.glowPink, { x: 1150 + Math.sin(drift * 0.5) * 80, y: -220 + Math.cos(drift * 0.4) * 60, o: lerp(0.7, 0.45, calm) });
    set(L.glowTeal, { x: -250 + Math.cos(drift * 0.3) * 90, y: 450 + Math.sin(drift * 0.35) * 70, o: lerp(0.5, 0.3, calm) });
    set(L.glowViolet, { x: 500 + Math.sin(drift * 0.25) * 120, y: 250 + Math.cos(drift * 0.3) * 50, o: 0.5 });
    set(L.hexLayer, { x: -((t * 6) % 76.2) - 60, y: -((t * 3) % 132) - 60, o: lerp(0.8, 0.45, calm) });
    set(L.bigHexes[0], { x: 1300 + Math.sin(t * 0.1) * 40, y: -120 + t * 0.4, r: 4 + t * 0.05, o: 1 - calm * 0.6 });
    set(L.bigHexes[1], { x: -180 + Math.cos(t * 0.12) * 30, y: 620 - t * 0.3, r: -6 + t * 0.04, o: 1 - calm * 0.6 });
    set(L.bigHexes[2], { x: 700, y: 520 + Math.sin(t * 0.08) * 30, r: 30 - t * 0.03, o: 0.4 * (1 - calm) });
  },
  update(t, L) {
    const SC = TL.scenes;
    const starts = [SC.join, SC.files, SC.datasets, SC.pipelines, SC.members, SC.ai];
    const vis = E.window(t, SC.join - 0.2, SC.rules + 0.2, 0.6, 0.5);
    E.set(L.stepper, { y: (1 - E.ease.outCubic(Math.min(1, vis * 1.2))) * -40, o: vis });
    L.steps.forEach((el, i) => {
      el.classList.toggle('on', t >= starts[i] && (i === L.steps.length - 1 || t < starts[i + 1]));
      el.classList.toggle('done', i < L.steps.length - 1 && t >= starts[i + 1]);
    });
  },
};
