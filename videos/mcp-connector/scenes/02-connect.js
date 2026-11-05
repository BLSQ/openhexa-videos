// Scene 2 — "With the OpenHEXA MCP connector, bring the agent you already use. Claude,
// ChatGPT, Gemini... with governance built in."
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const R = { rings: [], shards: [], clients: [] };

  const MARK_H = 200, MARK_W = MARK_H * (42.4 / 48), WORD_H = 70;
  const START = { cx: 960, cy: 440 };
  const END = { cx: 1460, cy: 640, s: 0.62 };
  const HUB = { x: 990, y: 640 };
  const CLIENTS = [
    { name: 'Claude', sub: 'Custom connector', word: 'claude', y: 470, color: '#ff8a5c' },
    { name: 'ChatGPT', sub: 'Developer mode', word: 'chatgpt', y: 610, color: '#3ee6c1' },
    { name: 'Gemini CLI', sub: 'gemini mcp add', word: 'gemini', y: 750, color: '#7b86ff' },
  ];
  const SHIELD = 300;

  E.scene({
    name: 'connect',
    from: S.connect - 0.05,
    to: S.scope + 0.4,
    build(root) {
      const cam = (R.cam = h('div', { class: 'cam' }));
      root.appendChild(cam);

      R.svg = h('svg', { width: 1920, height: 1080, class: 'abs', style: { overflow: 'visible' } }, [
        h('defs', {}, [
          h('linearGradient', { id: 'cnGrad', x1: 0, y1: 0, x2: 1, y2: 0 }, [
            h('stop', { offset: 0, 'stop-color': '#3ee6c1', 'stop-opacity': 0.9 }),
            h('stop', { offset: 1, 'stop-color': '#ff459a', 'stop-opacity': 0.95 }),
          ]),
        ]),
      ]);
      cam.appendChild(R.svg);

      for (let i = 0; i < 3; i++) {
        const s = 300;
        const el = h('div', { class: 'abs', html: `<svg width="${s}" height="${s * 1.155}" viewBox="0 0 ${s} ${s * 1.155}" style="overflow:visible"><path d="${E.hexPath(s, s * 1.155, 0.08)}" fill="none" stroke="${i === 1 ? '#3ee6c1' : '#ff459a'}" stroke-width="${3 - i * 0.6}"/></svg>` });
        cam.appendChild(el);
        R.rings.push({ el, s, delay: i * 0.12 });
      }
      const rnd = E.rand(91);
      for (let i = 0; i < 26; i++) {
        const s = 10 + rnd() * 22;
        const col = ['#ff459a', '#3ee6c1', '#7b86ff', '#ffffff'][i % 4];
        const el = h('div', { class: 'abs', html: `<svg width="${s}" height="${s * 1.155}" viewBox="0 0 ${s} ${s * 1.155}"><path d="${E.hexPath(s, s * 1.155, 0.15)}" fill="${col}" fill-opacity="${0.5 + rnd() * 0.5}"/></svg>` });
        cam.appendChild(el);
        R.shards.push({ el, ang: rnd() * Math.PI * 2, dist: 260 + rnd() * 520, spin: (rnd() - 0.5) * 400, s });
      }

      // client → hub links, hub → OpenHEXA link
      for (const c of CLIENTS) {
        const path = h('path', { fill: 'none', stroke: 'url(#cnGrad)', 'stroke-width': 3, 'stroke-linecap': 'round' });
        const dash = h('path', { fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 26' });
        R.svg.append(path, dash);
        c.path = path;
        c.dash = dash;
      }
      R.trunk = h('path', { fill: 'none', stroke: '#ff459a', 'stroke-width': 4, 'stroke-linecap': 'round' });
      R.trunkDash = h('path', { fill: 'none', stroke: '#fff', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-dasharray': '2 24' });
      R.svg.append(R.trunk, R.trunkDash);

      // shield around OpenHEXA
      R.shield = h('div', { class: 'abs', html: `<svg width="${SHIELD * 2}" height="${SHIELD * 2.31}" viewBox="0 0 ${SHIELD * 2} ${SHIELD * 2.31}" style="overflow:visible"><defs><linearGradient id="shG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3ee6c1"/><stop offset="1" stop-color="#ff459a"/></linearGradient></defs><path d="${E.hexPath(SHIELD * 2, SHIELD * 2.31, 0.08)}" fill="rgba(255,69,154,0.06)" stroke="url(#shG)" stroke-width="4"/></svg>` });
      R.shieldPath = R.shield.querySelector('path');
      R.shieldPath.setAttribute('pathLength', '1000');
      R.shieldPath.setAttribute('stroke-dasharray', '1000 1000');
      cam.appendChild(R.shield);
      R.shieldTag = h('div', { class: 'badge pink abs', style: { fontSize: '20px', padding: '10px 18px', background: 'rgba(40,20,60,0.95)' } }, [UI.svgIcon('shield', 24, '#ff8cc0', 2), 'Governance built in']);
      cam.appendChild(R.shieldTag);

      // logo
      R.glow = h('div', { class: 'abs', style: { width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,69,154,0.5) 0%, rgba(255,69,154,0.14) 35%, rgba(255,69,154,0) 65%)' } });
      cam.appendChild(R.glow);
      R.logo = h('div', { class: 'abs', style: { width: '600px', height: '360px', transformOrigin: '50% 50%' } });
      R.mark = UI.logoMark(MARK_H, 'cn');
      R.markWrap = h('div', { class: 'abs' }, [R.mark.el]);
      R.word = UI.wordmark(WORD_H);
      R.wordWrap = h('div', { class: 'abs' }, [R.word.el]);
      R.logo.append(R.markWrap, R.wordWrap);
      cam.appendChild(R.logo);
      R.markLen = 170;
      R.mark.outline.setAttribute('stroke-dasharray', R.markLen);

      // MCP hub node
      R.hub = h('div', { class: 'abs', style: { width: '150px', height: '173px' }, html: `<svg width="150" height="173" viewBox="0 0 150 173" style="position:absolute;inset:0;overflow:visible;filter:drop-shadow(0 18px 30px rgba(0,0,0,0.5))"><path d="${E.hexPath(150, 173, 0.12)}" fill="#222a55" stroke="rgba(255,255,255,0.35)" stroke-width="2"/></svg>` });
      const hubIn = h('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' } }, [UI.svgIcon('plug', 46, '#fff', 2), h('div', { class: 'mono', style: { fontSize: '22px', fontWeight: 500, letterSpacing: '0.08em' }, text: 'MCP' })]);
      R.hub.appendChild(hubIn);
      cam.appendChild(R.hub);
      R.hubLabel = h('div', { class: 'abs mono', style: { width: '400px', textAlign: 'center', fontSize: '19px', color: '#8d93b8' }, text: 'app.openhexa.org/mcp' });
      cam.appendChild(R.hubLabel);

      // client cards
      for (const c of CLIENTS) {
        c.el = h('div', { class: 'chip abs', style: { width: '400px', padding: '18px 24px 18px 18px' } }, [
          h('div', { class: 'ico', style: { width: '56px', height: '56px', borderRadius: '14px', background: c.color + '26', border: `1.5px solid ${c.color}66` } }, [UI.svgIcon('spark', 30, c.color)]),
          h('div', {}, [h('span', { style: { fontSize: '27px', fontWeight: 700 }, text: c.name }), h('span', { class: 'meta mono', text: c.sub })]),
          h('div', { style: { marginLeft: 'auto', width: '14px', height: '14px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px #22c55e' } }),
        ]);
        cam.appendChild(c.el);
      }
      R.more = h('div', { class: 'abs', style: { fontSize: '22px', fontWeight: 600, color: '#8d93b8', width: '400px', textAlign: 'center' }, text: '+ any MCP client' });
      cam.appendChild(R.more);

      // headline
      R.kicker = h('div', { class: 'kicker abs' }, [h('span', { class: 'dot' }), 'OpenHEXA MCP connector']);
      R.hl = E.headline([['Bring', 'your', 'own', 'agent.'], [['Governance', 'pink'], ['built', 'pink'], ['in.', 'pink']]], 'headline md');
      Object.assign(R.hl.el.style, { position: 'absolute', width: '1920px', textAlign: 'center' });
      R.kicker.style.width = '1920px';
      R.kicker.style.justifyContent = 'center';
      cam.append(R.kicker, R.hl.el);
    },

    update(t) {
      const t0 = S.connect;
      const tOut = S.scope;
      set(R.cam, { s: 1.04 - prog(t, t0, 6, ease.outCubic) * 0.04 });
      const out = prog(t, tOut - 0.45, 0.45, ease.inCubic);

      // ---- logo entrance at the cut, then moves right on "bring" ----
      const mp = prog(t, t0, 1.1, ease.outSpring);
      const mo = prog(t, t0, 0.12, ease.linear);
      set(R.mark.hex, { s: lerp(0.2, 1, mp), r: lerp(-90, 0, prog(t, t0, 0.9, ease.outQuart)), o: mo });
      E.attr(R.mark.outline, 'stroke-dashoffset', (R.markLen * (1 - prog(t, t0, 0.7, ease.outCubic))).toFixed(1));
      R.mark.outline.style.opacity = (1 - prog(t, t0 + 0.6, 0.5)).toFixed(3);
      const gp = prog(t, t0 + 0.18, 0.7, ease.outBack);
      set(R.mark.glyph, { s: gp, r: lerp(40, 0, gp), o: clamp(gp * 3) });
      R.word.letters.forEach((l, i) => {
        const p = prog(t, at('v03', 'open') - 0.1 + i * 0.045, 0.55, ease.outQuart);
        set(l, { y: (1 - p) * 26, o: p, blur: (1 - p) * 3 });
      });
      set(R.markWrap, { x: 300 - MARK_W / 2, y: 0 });
      set(R.wordWrap, { x: 300 - R.word.width / 2, y: MARK_H + 30 });
      const mv = prog(t, at('v03', 'bring') - 0.4, 1.1, ease.inOutQuint);
      const lcx = lerp(START.cx, END.cx, mv), lcy = lerp(START.cy, END.cy, mv);
      const ls = lerp(1, END.s, mv);
      // the logo box is 600 wide; mark+word stack is ~300 tall, centred at y=150
      set(R.logo, { x: lcx - 300, y: lcy - 150, s: ls, o: 1 - out, blur: out * 6 });
      set(R.glow, { x: lcx - 350, y: lcy - 350 - 40 * ls, s: 0.6 + mp * 0.5, o: (0.5 + 0.3 * prog(t, at('v03', 'governance'), 0.6)) * mo * (1 - out) });

      const cx = START.cx, cy = START.cy - 40;
      R.rings.forEach((rg) => {
        const p = prog(t, t0 + rg.delay, 1.5, ease.outCubic);
        set(rg.el, { x: cx - rg.s / 2, y: cy - (rg.s * 1.155) / 2, s: 0.3 + p * 5, o: (1 - p) * (p > 0 ? 1 : 0) });
      });
      R.shards.forEach((sd) => {
        const p = prog(t, t0 + 0.02, 1.8, ease.outQuart);
        const d = sd.dist * p;
        set(sd.el, { x: cx + Math.cos(sd.ang) * d - sd.s / 2, y: cy + Math.sin(sd.ang) * d - sd.s / 2, r: sd.spin * p, o: p > 0 ? 1 - prog(t, t0 + 0.8, 1.0) : 0, s: 1 - p * 0.4 });
      });

      // ---- kicker + headline ----
      const kp = prog(t, at('v03', 'mcp') - 0.2, 0.6, ease.outCubic);
      const toTop = prog(t, at('v03', 'bring') - 0.4, 1.0, ease.inOutQuint);
      set(R.kicker, { x: 0, y: lerp(640, 120, toTop) + (1 - kp) * 16, o: kp * (1 - out) });
      set(R.hl.el, { x: 0, y: 166 });
      const hw = R.hl.words;
      E.revealWords(hw.slice(0, 4), t, [at('v03', 'bring') - 0.05, at('v03', 'the2') - 0.05, at('v03', 'agent') - 0.2, at('v03', 'agent')], 0.55, tOut - 0.45, 0.4);
      E.revealWords(hw.slice(4), t, [at('v03', 'governance') - 0.1, at('v03', 'built') - 0.1, at('v03', 'in') - 0.1], 0.55, tOut - 0.4, 0.4);

      // ---- MCP hub ----
      const hp = prog(t, at('v03', 'agent') - 0.1, 0.7, ease.outBack);
      set(R.hub, { x: HUB.x - 75, y: HUB.y - 86, s: 0.5 + 0.5 * hp, o: clamp(hp * 2) * (1 - out) });
      set(R.hubLabel, { x: HUB.x - 200, y: HUB.y + 104, o: prog(t, at('v03', 'already'), 0.6) * (1 - out) });

      // trunk: hub → OpenHEXA
      const tp = prog(t, at('v03', 'already'), 0.6, ease.inOutCubic);
      const tx0 = HUB.x + 75, tx1 = END.cx - 140;
      const td = `M${tx0},${HUB.y} L${tx1},${HUB.y}`;
      E.attr(R.trunk, 'd', td);
      E.attr(R.trunkDash, 'd', td);
      E.attr(R.trunk, 'stroke-dasharray', `${((tx1 - tx0) * tp).toFixed(1)} 2000`);
      E.attr(R.trunk, 'opacity', (0.85 * (1 - out)).toFixed(3));
      E.attr(R.trunkDash, 'stroke-dashoffset', (-t * 150).toFixed(1));
      E.attr(R.trunkDash, 'opacity', (tp >= 1 ? 0.7 : 0) * (1 - out));

      // ---- clients ----
      CLIENTS.forEach((c, i) => {
        const tc = at('v03', c.word) - 0.25;
        const p = prog(t, tc, 0.7, ease.outQuart);
        const fy = E.noise1(t * 0.6, i + 2) * 4;
        set(c.el, { x: 230 + (1 - p) * -80, y: c.y - 48 + fy, o: clamp(p * 2) * (1 - out), blur: (1 - p) * 6 + out * 6 });
        const ax = 630, ay = c.y + fy, bx = HUB.x - 75, by = HUB.y;
        const d = `M${ax},${ay.toFixed(1)} C${ax + 140},${ay.toFixed(1)} ${bx - 140},${by} ${bx},${by}`;
        const lp = prog(t, tc + 0.3, 0.6, ease.inOutCubic);
        E.attr(c.path, 'd', d);
        E.attr(c.dash, 'd', d);
        E.attr(c.path, 'stroke-dasharray', `${(420 * lp).toFixed(1)} 1000`);
        E.attr(c.path, 'opacity', (0.8 * (1 - out)).toFixed(3));
        E.attr(c.dash, 'stroke-dashoffset', (-t * 140).toFixed(1));
        E.attr(c.dash, 'opacity', (lp >= 1 ? 0.55 : 0) * (1 - out));
      });
      const mp2 = prog(t, at('v03', 'gemini') + 0.4, 0.6, ease.outCubic);
      set(R.more, { x: 230, y: 840 + (1 - mp2) * 12, o: mp2 * (1 - out) });

      // ---- governance shield closes around OpenHEXA ----
      const sp = prog(t, at('v03', 'governance') - 0.15, 0.9, ease.inOutCubic);
      E.attr(R.shieldPath, 'stroke-dashoffset', (1000 * (1 - sp)).toFixed(1));
      const pulse = Math.max(0, 1 - Math.abs(t - at('v03', 'built') - 0.25) / 0.35);
      set(R.shield, { x: END.cx - SHIELD, y: END.cy - SHIELD * 1.155 - 18, s: 0.62 + 0.04 * ease.outQuad(pulse), o: clamp(sp * 3) * (1 - out) });
      R.shield.style.transformOrigin = '50% 50%';
      const bp = prog(t, at('v03', 'built') - 0.1, 0.6, ease.outBack);
      set(R.shieldTag, { x: END.cx - 132, y: END.cy + 212 + (1 - bp) * 20, s: 0.8 + 0.2 * bp, o: clamp(bp * 2) * (1 - out) });
    },
  });
})();
