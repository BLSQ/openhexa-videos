// Scene 1 — "AI agents can now do real data work. But would you hand one the keys to your
// health data? What can it see? What can it change?"
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const R = { chips: [] };

  const CARD = { x: 1090, y: 330, w: 640, h: 350 };
  const PROMPT = 'Find districts where malaria cases rose this month, then publish a dashboard.';

  const RESOURCES = [
    { title: 'Patient-level records', meta: 'hmis_cases · 4.2M rows', icon: 'table', x: 990, y: 128 },
    { title: 'DHIS2 credentials', meta: 'username · password', icon: 'key', x: 1480, y: 108 },
    { title: 'Production pipelines', meta: 'weekly-surveillance', icon: 'flow', x: 960, y: 792 },
    { title: 'Warehouse database', meta: 'PostgreSQL · 112 tables', icon: 'db', x: 1470, y: 812 },
  ];

  E.scene({
    name: 'hook',
    from: 0,
    to: S.connect,
    build(root) {
      const cam = (R.cam = h('div', { class: 'cam' }));
      root.appendChild(cam);

      // red alarm wash behind everything in this scene
      R.alarm = h('div', { class: 'layer', style: { background: 'radial-gradient(70% 70% at 70% 50%, rgba(242,87,103,0.32), rgba(242,87,103,0) 70%)' } });
      cam.appendChild(R.alarm);

      // links between the agent and the resources
      R.svg = h('svg', { width: 1920, height: 1080, class: 'abs', style: { overflow: 'visible' } });
      cam.appendChild(R.svg);

      // headline 1
      R.hl1 = E.headline([['AI', 'agents', 'can', 'now'], ['do', ['real', 'pink'], ['data', 'pink'], ['work.', 'pink']]], 'headline');
      // headline 2
      R.hl2 = E.headline([['Would', 'you', 'hand', 'one'], ['the', 'keys', 'to', 'your'], [['health', 'pink'], ['data?', 'pink']]], 'headline md');
      // headline 3: "What can it [see|change]?"
      R.hl3 = E.headline([['What', 'can', 'it']], 'headline');
      R.see = h('div', { class: 'abs headline', style: { color: '#fbbf24' }, text: 'see?' });
      R.change = h('div', { class: 'abs headline', style: { color: '#f25767' }, text: 'change?' });
      R.swap = h('div', { class: 'abs', style: { width: '560px', height: '130px', overflow: 'hidden' } }, [R.see, R.change]);
      for (const el of [R.hl1.el, R.hl2.el, R.hl3.el]) { el.style.position = 'absolute'; cam.appendChild(el); }
      cam.appendChild(R.swap);

      // agent chat card
      R.card = h('div', { class: 'card abs', style: { width: CARD.w + 'px', height: CARD.h + 'px' } }, [
        h('div', { class: 'chrome' }, [
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '20px', color: '#fff' } }, [UI.svgIcon('spark', 24, '#ff8cc0'), 'AI agent']),
          h('div', { class: 'badge gray', style: { marginLeft: 'auto', fontSize: '15px' } }, ['connected']),
        ]),
      ]);
      const body = h('div', { class: 'abs', style: { left: '28px', top: '82px', width: CARD.w - 56 + 'px' } });
      R.bubble = h('div', { style: { marginLeft: '70px', padding: '18px 22px', borderRadius: '18px 18px 4px 18px', background: 'rgba(255,255,255,0.1)', fontSize: '23px', lineHeight: 1.42, minHeight: '100px', color: '#fff' } }, [R.ptxt = h('span'), R.pcaret = h('span', { class: 'caret' })]);
      R.calls = ['SELECT * FROM hmis_cases', 'read .env → DHIS2_PASSWORD', 'export patients.csv'].map((txt) => h('div', { class: 'mono', style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '19px', color: '#c9cde6', marginTop: '14px' } }, [h('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24', flex: 'none' } }), txt]));
      body.append(R.bubble, ...R.calls);
      R.card.appendChild(body);
      cam.appendChild(R.card);

      // resource chips
      for (const r of RESOURCES) {
        const badge = h('div', { style: { position: 'absolute', right: '-14px', top: '-14px', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
        const eye = UI.svgIcon('eye', 22, '#10152f', 2.4);
        const pen = UI.svgIcon('pencil', 22, '#fff', 2.4);
        badge.append(eye, pen);
        const el = h('div', { class: 'chip abs' }, [
          h('div', { class: 'ico', style: { background: 'rgba(123,134,255,0.18)', color: '#b3baff' } }, [UI.svgIcon(r.icon, 26, '#b3baff', 2)]),
          h('div', {}, [h('span', { text: r.title }), h('span', { class: 'meta mono', text: r.meta })]),
          badge,
        ]);
        cam.appendChild(el);
        const line = h('path', { fill: 'none', stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 2.5, 'stroke-dasharray': '3 10', 'stroke-linecap': 'round' });
        const beam = h('path', { fill: 'none', 'stroke-width': 4, 'stroke-linecap': 'round' });
        R.svg.append(line, beam);
        R.chips.push({ ...r, el, badge, eye, pen, line, beam });
      }
    },

    update(t) {
      set(R.cam, { s: 1 + prog(t, 0, S.connect, ease.linear) * 0.05 });
      const tOut = S.connect - 0.3;

      // headlines
      set(R.hl1.el, { x: 110, y: 360 });
      const w1 = at('v01', 'ai');
      E.revealWords(R.hl1.words, t, [w1 - 0.15, at('v01', 'agents') - 0.1, at('v01', 'can') - 0.1, at('v01', 'now') - 0.1, at('v01', 'do') - 0.1, at('v01', 'real') - 0.1, at('v01', 'data') - 0.1, at('v01', 'work') - 0.1], 0.55, at('v02', 'but') - 0.4, 0.3);
      set(R.hl2.el, { x: 110, y: 330 });
      E.revealWords(R.hl2.words, t, [at('v02', 'would') - 0.1, at('v02', 'you') - 0.1, at('v02', 'hand') - 0.1, at('v02', 'one') - 0.1, at('v02', 'the') - 0.1, at('v02', 'keys') - 0.1, at('v02', 'to'), at('v02', 'your'), at('v02', 'health') - 0.1, at('v02', 'data') - 0.1], 0.5, at('v02', 'what') - 0.55, 0.3);
      set(R.hl3.el, { x: 110, y: 400 });
      E.revealWords(R.hl3.words, t, [at('v02', 'what') - 0.05, at('v02', 'can') - 0.08, at('v02', 'it') - 0.08], 0.5, tOut, 0.35);
      // "see?" then "change?" swap
      const pSee = prog(t, at('v02', 'see') - 0.08, 0.45, ease.outQuart);
      const pSwap = prog(t, at('v02', 'change') - 0.12, 0.45, ease.inOutCubic);
      const pOut = prog(t, tOut, 0.35, ease.inCubic);
      set(R.swap, { x: 110, y: 400 + 104 + 4 });
      set(R.see, { x: 0, y: (1 - pSee) * 110 - pSwap * 110, o: pSee * (1 - pSwap), blur: (1 - pSee) * 6 + pSwap * 6 });
      set(R.change, { x: 0, y: (1 - pSwap) * 110 - pOut * 110, o: pSwap * (1 - pOut), blur: (1 - pSwap) * 6 + pOut * 6 });

      // agent card
      const cp = prog(t, 0.25, 0.9, ease.outQuart);
      const shake = t > at('v02', 'change') && t < at('v02', 'change') + 0.5 ? Math.sin(t * 90) * 4 * (1 - (t - at('v02', 'change')) / 0.5) : 0;
      set(R.card, { x: CARD.x + shake, y: CARD.y + (1 - cp) * 60, o: cp * (1 - pOut), s: 0.94 + 0.06 * cp, blur: (1 - cp) * 6 + pOut * 6 });
      UI.typeText(R.ptxt, PROMPT, t, at('v01', 'agents') - 0.1, 44, R.pcaret);
      if (t > at('v01', 'agents') - 0.1 + PROMPT.length / 44 + 0.4) R.pcaret.style.opacity = '0';
      R.calls.forEach((c, i) => {
        const tc = at('v01', 'work') + 0.35 + i * 0.32;
        const p = prog(t, tc, 0.35, ease.outCubic);
        set(c, { x: (1 - p) * -20, o: p });
        c.firstChild.style.background = t > at('v02', 'change') ? '#f25767' : '#fbbf24';
      });
      E.css(R.card, 'border-color', t > at('v02', 'see') ? `rgba(242,87,103,${(0.4 + 0.3 * Math.sin(t * 9) ** 2).toFixed(2)})` : 'rgba(255,255,255,0.16)');

      // alarm wash
      const alarm = prog(t, at('v02', 'see') - 0.2, 0.6) * 0.6 + prog(t, at('v02', 'change') - 0.1, 0.4) * 0.4;
      set(R.alarm, { o: alarm * (0.8 + 0.2 * Math.sin(t * 6)) * (1 - pOut) });

      // resource chips appear on "keys … health data"
      const cx = CARD.x + CARD.w / 2, cy = CARD.y + CARD.h / 2;
      R.chips.forEach((c, i) => {
        const t0 = at('v02', 'keys') - 0.1 + i * 0.16;
        const p = prog(t, t0, 0.6, ease.outBack);
        const ox = (c.x + 160 - cx) * 0.35, oy = (c.y + 40 - cy) * 0.35;
        const fx = E.noise1(t * 0.7, i) * 5, fy = E.noise1(t * 0.6, i + 5) * 5;
        const out = prog(t, tOut - 0.05 + i * 0.03, 0.4, ease.inCubic);
        set(c.el, { x: c.x - ox * (1 - p) + fx, y: c.y - oy * (1 - p) + fy, s: 0.7 + 0.3 * p, o: clamp(p * 2) * (1 - out), blur: out * 8 });

        // dashed link
        const ax = c.x + 160 + fx, ay = c.y + (c.y < cy ? 80 : 0) + fy;
        const bx = cx + (c.x + 160 < cx ? -160 : 160), by = c.y < cy ? CARD.y : CARD.y + CARD.h;
        const d = `M${bx.toFixed(1)},${by.toFixed(1)} L${ax.toFixed(1)},${ay.toFixed(1)}`;
        E.attr(c.line, 'd', d);
        E.attr(c.line, 'opacity', (clamp(p) * 0.8 * (1 - out)).toFixed(3));
        E.attr(c.line, 'stroke-dashoffset', (-t * 40).toFixed(1));

        // "see": amber scan beam; "change": red beam and pencil badge
        const see = prog(t, at('v02', 'see') + i * 0.09, 0.3);
        const chg = prog(t, at('v02', 'change') + i * 0.07, 0.25);
        E.attr(c.beam, 'd', d);
        E.attr(c.beam, 'stroke', chg > 0 ? '#f25767' : '#fbbf24');
        const L = Math.hypot(ax - bx, ay - by);
        E.attr(c.beam, 'stroke-dasharray', `${(L * see).toFixed(1)} ${L.toFixed(1)}`);
        E.attr(c.beam, 'opacity', (see * (0.85 + 0.15 * Math.sin(t * 12 + i)) * (1 - out)).toFixed(3));
        const glow = chg > 0 ? `0 0 0 2px rgba(242,87,103,${(0.9 * chg).toFixed(2)}), 0 0 50px -6px rgba(242,87,103,${(0.8 * chg).toFixed(2)})` : `0 0 0 2px rgba(251,191,36,${(0.8 * see).toFixed(2)}), 0 0 40px -8px rgba(251,191,36,${(0.6 * see).toFixed(2)})`;
        E.css(c.el, 'box-shadow', glow + ', 0 20px 50px -15px rgba(0,0,0,0.6)');
        const bp = chg > 0 ? chg : see;
        set(c.badge, { s: ease.outBack(clamp(bp)), o: clamp(bp * 2) });
        E.css(c.badge, 'background', chg > 0 ? '#f25767' : '#fbbf24');
        E.show(c.eye, chg <= 0);
        E.show(c.pen, chg > 0);
        if (chg > 0 && chg < 1) set(c.el, { x: c.x + fx + Math.sin(t * 80 + i) * 3 * (1 - chg), y: c.y + fy, o: 1 - out });
      });
    },
  });
})();
