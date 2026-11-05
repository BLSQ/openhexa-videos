// Scene 3 — "Meet OpenHEXA. The open-source data platform that brings it all together."
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const R = {};
  const rings = [];
  const shards = [];
  const sources = [];

  // Shared with the product scene: where the logo lives in the nav bar.
  const NAV = { x: 96, y: 40, mark: 58, word: 27, gap: 16 };
  window.NAV_LOGO = NAV;

  const MARK_H = 210;
  const MARK_W = MARK_H * (42.4 / 48);
  const MARK_POS = { x: 960 - MARK_W / 2, y: 175 };
  const WORD_H = 78;

  E.scene({
    name: 'reveal',
    from: TL.scenes.reveal - 0.05,
    to: TL.scenes.integrate + 0.9,
    build(root) {
      const cam = h('div', { class: 'cam' });
      root.appendChild(cam);
      R.cam = cam;

      // connection lines layer
      R.svg = h('svg', { width: 1920, height: 1080, class: 'abs', style: { overflow: 'visible' } }, [
        h('defs', {}, [
          h('linearGradient', { id: 'lineGrad', x1: 0, y1: 0, x2: 1, y2: 0 }, [
            h('stop', { offset: 0, 'stop-color': '#3ee6c1', 'stop-opacity': 0.9 }),
            h('stop', { offset: 1, 'stop-color': '#ff459a', 'stop-opacity': 0.9 }),
          ]),
        ]),
      ]);
      cam.appendChild(R.svg);

      // shockwave rings
      for (let i = 0; i < 3; i++) {
        const s = 300;
        const el = h('div', { class: 'abs', html: `<svg width="${s}" height="${s * 1.155}" viewBox="0 0 ${s} ${s * 1.155}" style="overflow:visible"><path d="${E.hexPath(s, s * 1.155, 0.08)}" fill="none" stroke="${i === 1 ? '#3ee6c1' : '#ff459a'}" stroke-width="${3 - i * 0.6}"/></svg>` });
        cam.appendChild(el);
        rings.push({ el, s, delay: i * 0.12 });
      }
      // hex shards burst
      const rnd = E.rand(77);
      for (let i = 0; i < 26; i++) {
        const s = 10 + rnd() * 22;
        const col = ['#ff459a', '#3ee6c1', '#7b86ff', '#ffffff'][i % 4];
        const el = h('div', { class: 'abs', html: `<svg width="${s}" height="${s * 1.155}" viewBox="0 0 ${s} ${s * 1.155}"><path d="${E.hexPath(s, s * 1.155, 0.15)}" fill="${col}" fill-opacity="${0.5 + rnd() * 0.5}"/></svg>` });
        cam.appendChild(el);
        shards.push({ el, ang: rnd() * Math.PI * 2, dist: 260 + rnd() * 520, spin: (rnd() - 0.5) * 400, s });
      }

      // Source tiles that fly in and connect
      const src = [
        ['dhis2.svg', 250, 120], ['odk.png', 90, 390], ['excel.svg', 150, 680], ['postgres.png', 330, 920],
        ['iaso.svg', 1570, 120], ['kobo.svg', 1730, 390], ['csv.png', 1670, 680], ['gcs.png', 1490, 920],
        ['openlmis.svg', 600, 40], ['worldpop.png', 1220, 40],
      ];

      src.forEach(([icon, x, y], i) => {
        const el = UI.hexTile(icon, 100);
        const path = h('path', { fill: 'none', stroke: 'url(#lineGrad)', 'stroke-width': 3, 'stroke-linecap': 'round' });
        const dash = h('path', { fill: 'none', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 28', opacity: 0.8 });
        const dot = h('circle', { r: 7, fill: '#ff459a' });
        R.svg.append(path, dash, dot);
        cam.appendChild(el);
        sources.push({ el, x, y, path, dash, dot, i });
      });

      // Logo
      R.markWrap = h('div', { class: 'abs', style: { transformOrigin: '0 0' } });
      R.glow = h('div', { class: 'abs', style: { width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,69,154,0.55) 0%, rgba(255,69,154,0.15) 35%, rgba(255,69,154,0) 65%)' } });
      cam.appendChild(R.glow);
      R.mark = UI.logoMark(MARK_H, 'rv');
      R.markWrap.appendChild(R.mark.el);
      cam.appendChild(R.markWrap);
      const len = 170;
      R.mark.outline.setAttribute('stroke-dasharray', len);
      R.markLen = len;

      R.wordWrap = h('div', { class: 'abs', style: { transformOrigin: '0 0' } });
      R.word = UI.wordmark(WORD_H);
      R.wordWrap.appendChild(R.word.el);
      cam.appendChild(R.wordWrap);

      R.tag1 = E.headline([["The", ["open-source", 'teal'], "data", "platform"]], 'headline sm');
      R.tag2 = E.headline([["that", "brings", "it", "all", ["together.", 'pink']]], 'headline sm');
      for (const tg of [R.tag1, R.tag2]) { tg.el.style.position = 'absolute'; tg.el.style.textAlign = 'center'; tg.el.style.width = '1920px'; cam.appendChild(tg.el); }
    },

    update(t) {
      const t0 = TL.scenes.reveal;
      const tOut = TL.scenes.integrate;
      set(R.cam, { s: 1.04 - prog(t, t0, 5.5, ease.outCubic) * 0.04 });

      // --- mark entrance ---
      const mp = prog(t, t0, 1.1, ease.outSpring);
      const mo = prog(t, t0, 0.12, ease.linear);
      set(R.mark.hex, { s: lerp(0.2, 1, mp), r: lerp(-90, 0, prog(t, t0, 0.9, ease.outQuart)), o: mo });
      E.attr(R.mark.outline, 'stroke-dashoffset', (R.markLen * (1 - prog(t, t0, 0.7, ease.outCubic))).toFixed(1));
      R.mark.outline.style.opacity = (1 - prog(t, t0 + 0.6, 0.5)).toFixed(3);
      const gp = prog(t, t0 + 0.18, 0.7, ease.outBack);
      set(R.mark.glyph, { s: gp, r: lerp(40, 0, gp), o: clamp(gp * 3) });

      // pulse on "together"
      const pulse = Math.max(0, 1 - Math.abs(t - at('v04', 'together') - 0.05) / 0.3);
      const pulseS = 1 + ease.outQuad(pulse) * 0.06;

      // --- wordmark: letters rise in sequence on "OpenHexa" ---
      const wt = at('v04', 'openhexa') - 0.05;
      R.word.letters.forEach((l, i) => {
        const p = prog(t, wt + i * 0.045, 0.55, ease.outQuart);
        set(l, { y: (1 - p) * 26, o: p, blur: (1 - p) * 3 });
      });

      // --- positions: centered stack → nav bar ---
      const toNav = prog(t, tOut - 0.35, 0.95, ease.inOutQuint);
      const wordW = R.word.width;
      const markStart = { x: MARK_POS.x, y: MARK_POS.y };
      const wordStart = { x: 960 - wordW / 2, y: MARK_POS.y + MARK_H + 34 };
      const nav = NAV;
      const navMarkW = nav.mark * (42.4 / 48);
      const markEnd = { x: nav.x, y: nav.y };
      const wordEnd = { x: nav.x + navMarkW + nav.gap, y: nav.y + (nav.mark - nav.word) / 2 };
      const ms = lerp(1, nav.mark / MARK_H, toNav) * pulseS;
      const ws = lerp(1, nav.word / WORD_H, toNav);
      const mx = lerp(markStart.x, markEnd.x, toNav) - (pulseS - 1) * MARK_W / 2;
      const my = lerp(markStart.y, markEnd.y, toNav) - (pulseS - 1) * MARK_H / 2;
      set(R.markWrap, { x: mx, y: my, s: ms });
      set(R.wordWrap, { x: lerp(wordStart.x, wordEnd.x, toNav), y: lerp(wordStart.y, wordEnd.y, toNav), s: ws });
      const cx = MARK_POS.x + MARK_W / 2, cy = MARK_POS.y + MARK_H / 2;
      set(R.glow, { x: cx - 350, y: cy - 350, s: 0.6 + mp * 0.5 + pulse * 0.25, o: (0.5 + pulse * 0.5) * mo * (1 - toNav) });

      // --- shockwave + shards ---
      rings.forEach((rg) => {
        const p = prog(t, t0 + rg.delay, 1.5, ease.outCubic);
        set(rg.el, { x: cx - rg.s / 2, y: cy - (rg.s * 1.155) / 2, s: 0.3 + p * 5, o: (1 - p) * (p > 0 ? 1 : 0) });
      });
      shards.forEach((sd) => {
        const p = prog(t, t0 + 0.02, 1.8, ease.outQuart);
        const d = sd.dist * p;
        set(sd.el, { x: cx + Math.cos(sd.ang) * d - sd.s / 2, y: cy + Math.sin(sd.ang) * d - sd.s / 2, r: sd.spin * p, o: p > 0 ? (1 - prog(t, t0 + 0.8, 1.0)) : 0, s: 1 - p * 0.4 });
      });

      // --- tagline ---
      E.revealWords(R.tag1.words, t, [at('v04', 'opensource') - 0.35, at('v04', 'opensource') - 0.15, at('v04', 'opensource') + 0.25, at('v04', 'platform')], 0.55, tOut - 0.45, 0.4);
      E.revealWords(R.tag2.words, t, [at('v04', 'brings') - 0.25, at('v04', 'brings'), at('v04', 'brings') + 0.15, at('v04', 'brings') + 0.3, at('v04', 'together')], 0.55, tOut - 0.4, 0.4);
      set(R.tag1.el, { x: 0, y: 628 });
      set(R.tag2.el, { x: 0, y: 706 });

      // --- sources fly in and connect on "brings it all together" ---
      const bt = at('v04', 'brings') - 0.45;
      sources.forEach((s) => {
        const ti = bt + s.i * 0.06;
        const p = prog(t, ti, 0.8, ease.outQuart);
        const ox = (s.x + 50 - 960) * 0.7, oy = (s.y + 58 - 540) * 0.7;
        const out = prog(t, tOut - 0.5, 0.6, ease.inCubic);
        const x = s.x + ox * (1 - p) + ox * out * 1.2 + E.noise1(t * 0.6, s.i) * 6;
        const y = s.y + oy * (1 - p) + oy * out * 1.2 + E.noise1(t * 0.5, s.i + 3) * 6;
        set(s.el, { x, y, o: clamp(p * 2) * (1 - out), s: 0.6 + 0.4 * p, blur: (1 - p) * 8 + out * 8 });
        // line from tile center to the mark center, curving upward/outward
        const a = [x + 50, y + 58];
        const b = [cx, cy];
        const c = a[1] > cy + 60 ? [a[0] + (a[0] < 960 ? 40 : -40), cy - 30] : [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 50];
        const lp = prog(t, ti + 0.25, 0.7, ease.inOutCubic);
        const d = `M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${b[0]},${b[1]}`;
        E.attr(s.path, 'd', d);
        E.attr(s.dash, 'd', d);
        const L = 1400;
        E.attr(s.path, 'stroke-dasharray', `${(L * lp).toFixed(1)} ${L}`);
        E.attr(s.path, 'opacity', ((1 - out) * 0.75).toFixed(3));
        // flowing dashes toward the logo once connected
        E.attr(s.dash, 'stroke-dashoffset', (-t * 140).toFixed(1));
        E.attr(s.dash, 'opacity', (lp >= 1 ? 0.55 : 0) * (1 - out));
        // traveling dot during the draw
        const q = lp;
        const px = (1 - q) * (1 - q) * a[0] + 2 * (1 - q) * q * c[0] + q * q * b[0];
        const py = (1 - q) * (1 - q) * a[1] + 2 * (1 - q) * q * c[1] + q * q * b[1];
        E.attr(s.dot, 'cx', px.toFixed(1));
        E.attr(s.dot, 'cy', py.toFixed(1));
        E.attr(s.dot, 'opacity', q > 0 && q < 1 ? 1 : 0);
      });
    },
  });
})();
