// Scene 8 — "OpenHEXA. Bring your agents. Keep control. Start your free trial today."
// End card with the lockup, the headline and the website's CTA.
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const R = {};
  const burst = [];

  E.scene({
    name: 'cta',
    from: S.cta - 0.2,
    to: TL.duration + 1,
    build(root) {
      const cam = h('div', { class: 'cam' });
      root.appendChild(cam);
      R.cam = cam;

      R.glow = h('div', { class: 'abs', style: { width: '1200px', height: '1200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,69,154,0.32) 0%, rgba(255,69,154,0.08) 38%, rgba(255,69,154,0) 65%)' } });
      cam.appendChild(R.glow);

      // lockup
      R.lock = h('div', { class: 'abs' });
      R.mark = UI.logoMark(104, 'cta');
      R.word = UI.wordmark(48);
      R.markWrap = h('div', { class: 'abs' }, [R.mark.el]);
      R.wordWrap = h('div', { class: 'abs' }, [R.word.el]);
      R.lock.append(R.markWrap, R.wordWrap);
      cam.appendChild(R.lock);

      R.hl = E.headline([["Bring", "your", "agents."], [["Keep", 'pink'], ["control.", 'pink']]], 'headline');
      Object.assign(R.hl.el.style, { position: 'absolute', width: '1920px', textAlign: 'center', fontSize: '112px' });
      cam.appendChild(R.hl.el);

      // CTA button
      R.btnWrap = h('div', { class: 'abs', style: { width: '1920px', display: 'flex', justifyContent: 'center' } });
      R.btn = h('div', { class: 'btn-primary', style: { height: '104px', padding: '0 58px 0 64px', fontSize: '40px', gap: '18px', boxShadow: '0 20px 60px -10px rgba(255,69,154,0.65)' } }, [
        'Start your free trial',
        h('span', { style: { display: 'inline-flex' }, html: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#192041" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' }),
      ]);
      R.btnWrap.appendChild(R.btn);
      cam.appendChild(R.btnWrap);
      R.ring = h('div', { class: 'abs', style: { width: '560px', height: '104px', borderRadius: '999px', border: '3px solid #ff459a' } });
      cam.appendChild(R.ring);

      R.small = h('div', { class: 'abs', style: { width: '1920px', textAlign: 'center', fontSize: '28px', color: '#c9cde6', fontWeight: 500 }, html: 'MCP connector included&nbsp;&nbsp;·&nbsp;&nbsp;Claude, ChatGPT, Gemini &amp; more&nbsp;&nbsp;·&nbsp;&nbsp;Open source' });
      R.url = h('div', { class: 'abs mono', style: { width: '1920px', textAlign: 'center', fontSize: '34px', color: '#fff', letterSpacing: '0.02em' }, html: '<span style="color:#ff8cc0">openhexa</span>.com' });
      cam.append(R.small, R.url);

      // click burst
      const rnd = E.rand(3);
      for (let i = 0; i < 16; i++) {
        const s = 12 + rnd() * 16;
        const el = h('div', { class: 'abs', html: `<svg width="${s}" height="${s * 1.155}" viewBox="0 0 ${s} ${s * 1.155}"><path d="${E.hexPath(s, s * 1.155, 0.15)}" fill="${['#ff459a', '#3ee6c1', '#7b86ff', '#ffffff'][i % 4]}"/></svg>` });
        cam.appendChild(el);
        burst.push({ el, ang: (i / 16) * Math.PI * 2 + rnd() * 0.3, dist: 200 + rnd() * 160, s });
      }

      R.cursor = UI.cursor();
      cam.appendChild(R.cursor);
    },

    update(t) {
      const t0 = S.cta;
      set(R.cam, { s: 1.02 - prog(t, t0, 8, ease.outCubic) * 0.02 });

      // lockup emerges from the collapsed iris point, then settles at the top
      const lp = prog(t, t0 - 0.05, 1.0, ease.outSpring);
      const markW = R.mark.width, wordW = R.word.width, gap = 26;
      const total = markW + gap + wordW;
      const lx = 960 - total / 2, ly = 175;
      set(R.markWrap, { x: lx, y: ly, s: lp, o: clamp(lp * 3) });
      R.markWrap.style.transformOrigin = '50% 50%';
      R.word.letters.forEach((l, i) => {
        const p = prog(t, at('v09', 'open') + 0.1 + i * 0.04, 0.5, ease.outQuart);
        set(l, { y: (1 - p) * 20, o: p });
      });
      set(R.wordWrap, { x: lx + markW + gap, y: ly + (104 - 48) / 2 });
      set(R.glow, { x: 360, y: -60 + Math.sin(t * 0.6) * 20, o: 0.7 + 0.3 * Math.sin(t * 1.3), s: 0.8 + 0.2 * lp });

      E.revealWords(R.hl.words, t, [at('v09', 'bring') - 0.1, at('v09', 'your') - 0.08, at('v09', 'agents') - 0.08, at('v09', 'keep') - 0.1, at('v09', 'control') - 0.1], 0.6);
      set(R.hl.el, { x: 0, y: 360 });

      // button pops on "Start"
      const bT = at('v10', 'start') - 0.15;
      const bp = prog(t, bT, 0.7, ease.outBack);
      const click = TL.click;
      const press = Math.max(0, 1 - Math.abs(t - click) / 0.12);
      const hover = prog(t, click - 0.35, 0.25, ease.outCubic);
      const breathe = t > click + 0.6 ? Math.sin((t - click - 0.6) * 3.2) * 0.012 : 0;
      set(R.btnWrap, { x: 0, y: 668 + (1 - bp) * 40, s: (0.85 + 0.15 * bp) * (1 - press * 0.05 + hover * 0.03 + breathe), o: clamp(bp * 2) });
      R.btnWrap.style.transformOrigin = '50% 50%';
      E.css(R.btn, 'background', hover > 0 ? `rgb(255,${Math.round(lerp(69, 95, hover))},${Math.round(lerp(154, 170, hover))})` : '#ff459a');
      // ripple ring after click
      const rp = prog(t, click, 0.9, ease.outCubic);
      const btnW = R.btn.offsetWidth || 560;
      R.ring.style.width = btnW + 'px';
      set(R.ring, { x: 960 - btnW / 2, y: 668, s: 1 + rp * 0.35, o: rp > 0 ? (1 - rp) : 0 });
      R.ring.style.transformOrigin = '50% 50%';
      burst.forEach((b) => {
        const p = prog(t, click, 1.1, ease.outQuart);
        const cx = 960 + Math.cos(b.ang) * (btnW / 2 + b.dist * p) * 0.9;
        const cy = 720 + Math.sin(b.ang) * (60 + b.dist * p * 0.55);
        set(b.el, { x: cx - b.s / 2, y: cy - b.s / 2, o: p > 0 ? 1 - prog(t, click + 0.3, 0.8) : 0, r: p * 180, s: 1 - p * 0.3 });
      });

      const sp = prog(t, at('v10', 'free') + 0.2, 0.7, ease.outCubic);
      set(R.small, { x: 0, y: 816 + (1 - sp) * 16, o: sp });
      const up = prog(t, at('v10', 'today') + 0.1, 0.7, ease.outCubic);
      set(R.url, { x: 0, y: 884 + (1 - up) * 16, o: up });

      // cursor glides in, clicks, then drifts away slightly
      const cIn = prog(t, click - 1.2, 1.05, ease.inOutCubic);
      const cOut = prog(t, click + 0.5, 1.2, ease.inOutSine);
      const tx = 1180, ty = 740;
      const cx = lerp(1560, tx, cIn) + cOut * 90, cy = lerp(1010, ty, cIn) + cOut * 120;
      set(R.cursor, { x: cx, y: cy, s: 1 - press * 0.15, o: clamp(cIn * 3) * (1 - prog(t, click + 1.0, 0.6)) });
    },
  });
})();
