// Scene 7 — "Trusted by the World Health Organization, the World Bank, and health programs
// around the world." Light section (like the website), opened and closed with a hexagon iris.
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const R = {};
  const cards = [];

  // Hexagon clip-path around (cx, cy) with circumradius r (pointy-top).
  function hexClip(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i - 90);
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)}px ${(cy + r * Math.sin(a)).toFixed(1)}px`);
    }
    return `polygon(${pts.join(',')})`;
  }
  window.hexClip = hexClip;

  E.scene({
    name: 'trust',
    from: S.trust - 0.35,
    to: S.cta + 0.35,
    build(root) {
      R.root = root;
      const bgl = h('div', { class: 'layer', style: { background: 'radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f6f7fb 55%, #eceef6 100%)' } });
      root.appendChild(bgl);
      const pat = h('div', { class: 'layer', style: { opacity: 0.9 } }, [UI.hexPattern(2100, 1300, 44, 'rgba(25,32,65,0.05)', 2)]);
      root.appendChild(pat);
      R.pat = pat;
      R.glow = h('div', { class: 'abs', style: { width: '2000px', height: '1000px', borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(255,69,154,0.10), rgba(123,134,255,0.06) 40%, rgba(255,255,255,0) 70%)' } });
      root.appendChild(R.glow);
      const cam = h('div', { class: 'cam' });
      root.appendChild(cam);
      R.cam = cam;

      R.kicker = h('div', { class: 'kicker abs', style: { color: '#6b7280', width: '1920px', justifyContent: 'center' } }, [h('span', { class: 'dot' }), 'Trusted by']);
      cam.appendChild(R.kicker);
      R.hl = E.headline([["Trusted", "by", "health", "programs"], [["around", 'navy-text'], ["the", 'navy-text'], ["world.", 'navy-text']]], 'headline');
      Object.assign(R.hl.el.style, { position: 'absolute', width: '1920px', textAlign: 'center', color: '#111827', fontSize: '88px' });
      cam.appendChild(R.hl.el);
      R.underline = h('div', { class: 'abs', style: { height: '12px', borderRadius: '6px', background: 'rgba(255,69,154,0.55)' } });
      cam.appendChild(R.underline);

      const logos = [
        ['who.png', 230, 'World Health Organization'],
        ['world-bank.png', 260, 'World Bank'],
        ['polio.png', 200, 'Polio'],
        ['pathways.svg', 230, 'Pathways'],
        ['dpg-alliance.png', 170, 'DPG'],
      ];
      logos.forEach(([file, w], i) => {
        const el = h('div', { class: 'card light abs', style: { width: '322px', height: '196px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' } }, [
          h('img', { src: 'assets/logos/' + file, style: { maxWidth: w + 'px', maxHeight: '120px', objectFit: 'contain' } }),
        ]);
        cam.appendChild(el);
        cards.push({ el, i });
      });

      // bottom row: partner badge + facts
      R.badge = h('img', { class: 'abs', src: 'assets/logos/dhis2-tech-partner-lg.png', style: { width: '150px', height: 'auto' } });
      R.badgeText = h('div', { class: 'abs', style: { color: '#111827', fontSize: '38px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap' }, html: 'Recognized <span style="box-shadow: inset 0 -10px 0 rgba(255,69,154,0.35)">DHIS2 Technology Partner</span><div style="font-size:26px;font-weight:500;color:#6b7280;margin-top:10px;letter-spacing:0">Open source (AGPL-3.0) · Self-host or use OpenHEXA Cloud</div>' });
      cam.append(R.badge, R.badgeText);
    },

    update(t) {
      const t0 = S.trust;
      // Iris open (from center) and close (into center, handing over to the CTA)
      const open = prog(t, t0 - 0.3, 0.75, ease.inOutCubic);
      const close = prog(t, S.cta - 0.4, 0.55, ease.inCubic);
      const r = lerp(0, 1350, open) * (1 - close);
      E.css(R.root, 'clip-path', hexClip(960, 540, Math.max(0.01, r)));
      set(R.cam, { s: 1.03 - prog(t, t0, 5.5, ease.outCubic) * 0.03 - close * 0.3 });
      set(R.glow, { x: -40, y: -300 + Math.sin(t * 0.5) * 20 });
      set(R.pat, { x: -((t * 6) % 76.2) - 40, y: -40 });

      const kp = prog(t, t0 + 0.1, 0.6, ease.outCubic);
      set(R.kicker, { x: 0, y: 160 + (1 - kp) * 16, o: kp });
      set(R.hl.el, { x: 0, y: 206 });
      const ht = at('v08', 'trusted');
      E.revealWords(R.hl.words, t, [ht, ht + 0.12, ht + 0.24, ht + 0.36, ht + 0.5, ht + 0.62, ht + 0.74], 0.6);
      // underline under "around the world."
      const up = prog(t, at('v08', 'world') - 0.9, 0.7, ease.inOutCubic);
      const lineW = 620;
      set(R.underline, { x: 960 - lineW / 2 + 6, y: 378, sx: up, o: up > 0 ? 1 : 0 });
      R.underline.style.width = lineW + 'px';
      R.underline.style.transformOrigin = '0 50%';

      const cT = [at('v08', 'who') - 0.25, at('v08', 'worldbank') - 0.25, at('v08', 'programs') - 0.3, at('v08', 'programs') - 0.15, at('v08', 'programs')];
      cards.forEach((c) => {
        const p = prog(t, cT[c.i], 0.65, ease.outBack);
        const x = 960 - (5 * 322 + 4 * 26) / 2 + c.i * 348;
        set(c.el, { x, y: 500 + (1 - p) * 50, s: 0.9 + 0.1 * p, o: clamp(p * 2) });
      });
      const bp = prog(t, at('v08', 'programs') + 0.35, 0.7, ease.outBack);
      set(R.badge, { x: 470, y: 772 + (1 - bp) * 40, o: clamp(bp * 2), s: 0.9 + 0.1 * bp });
      const tp = prog(t, at('v08', 'programs') + 0.5, 0.7, ease.outCubic);
      set(R.badgeText, { x: 652, y: 812 + (1 - tp) * 20, o: tp });
    },
  });
})();
