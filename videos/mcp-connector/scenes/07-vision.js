// Scene 7 — "Responsible AI, by design." The four guarantees behind it, as pillars.
(function () {
  const { h, set, prog, ease, clamp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const R = {};
  const PILLARS = [
    [L('Least privilege', 'Moindre privilège'), 'shield'],
    [L('Secrets never exposed', 'Secrets jamais exposés'), 'lock'],
    [L('Every call logged', 'Chaque appel journalisé'), 'log'],
    [L('Open standard: MCP', 'Standard ouvert\u00a0: MCP'), 'plug'],
  ];

  E.scene({
    name: 'vision',
    from: S.vision - 0.3,
    to: S.cta + 0.1,
    build(root) {
      const cam = (R.cam = h('div', { class: 'cam' }));
      root.appendChild(cam);
      R.glow = h('div', { class: 'abs', style: { width: '1400px', height: '1400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,134,255,0.3) 0%, rgba(123,134,255,0.08) 40%, rgba(123,134,255,0) 65%)' } });
      R.hex = h('div', { class: 'abs', html: `<svg width="900" height="1040" viewBox="0 0 900 1040" style="overflow:visible"><path d="${E.hexPath(900, 1040, 0.06)}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3"/></svg>` });
      cam.append(R.glow, R.hex);
      R.hl = E.headline(L([['Responsible', 'AI,'], [['by', 'pink'], ['design.', 'pink']]], [['Une', 'IA', 'responsable,'], [['dès', 'pink'], ['la', 'pink'], ['conception.', 'pink']]]), 'headline');
      Object.assign(R.hl.el.style, { position: 'absolute', width: '1920px', textAlign: 'center', fontSize: '128px' });
      cam.appendChild(R.hl.el);
      R.pillars = PILLARS.map(([txt, ic]) => {
        const el = h('div', { class: 'pill abs', style: { fontSize: '24px', padding: '16px 26px 16px 18px' } }, [UI.svgIcon(ic, 28, '#ff8cc0', 2), txt]);
        cam.appendChild(el);
        return el;
      });
    },

    update(t) {
      const t0 = S.vision, tOut = S.cta;
      set(R.cam, { s: 1 + prog(t, t0 - 0.3, 3, ease.linear) * 0.04 });
      const out = prog(t, tOut - 0.3, 0.3, ease.inCubic);
      const gp = prog(t, t0 - 0.3, 0.8, ease.outCubic);
      set(R.glow, { x: 260, y: -160, o: gp * (1 - out), s: 0.8 + 0.2 * gp });
      set(R.hex, { x: 510, y: 20, r: t * 3, o: gp * (1 - out) });
      R.hex.style.transformOrigin = '450px 520px';
      set(R.hl.el, { x: 0, y: 300, s: 1 - out * 0.4, o: 1 - out, blur: out * 10 });
      R.hl.el.style.transformOrigin = '50% 50%';
      E.revealWords(R.hl.words, t, L([at('v08', 'responsible') - 0.15, at('v08', 'ai') - 0.1, at('v08', 'by') - 0.1, at('v08', 'design') - 0.1], [at('v08', 'une') - 0.15, at('v08', 'ia') - 0.1, at('v08', 'responsable') - 0.1, at('v08', 'des') - 0.1, at('v08', 'la') - 0.08, at('v08', 'conception') - 0.1]), 0.55);
      // pillars sit in a centred row; widths are measured once laid out
      const widths = R.pillars.map((p) => p.offsetWidth || 300);
      const gap = 22, total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
      let x = 960 - total / 2;
      R.pillars.forEach((p, i) => {
        const q = prog(t, at('v08', 'responsible') + 0.25 + i * 0.22, 0.55, ease.outBack);
        set(p, { x, y: 640 + (1 - q) * 24, s: 0.85 + 0.15 * q, o: clamp(q * 2) * (1 - out), blur: out * 8 });
        p.style.transformOrigin = '50% 50%';
        x += widths[i] + gap;
      });
    },
  });
})();
