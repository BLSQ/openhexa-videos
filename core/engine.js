// Tiny deterministic animation engine: every frame is a pure function of time t.
// Scenes build their DOM once, then update(t) sets styles from t. No CSS transitions,
// no timers, so the player and the frame-by-frame renderer produce identical frames.
(function () {
  const E = {};

  // ---------- math ----------
  E.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  E.lerp = (a, b, p) => a + (b - a) * p;
  E.map = (x, a, b, c, d) => c + (d - c) * E.clamp((x - a) / (b - a));
  // progress of t through [t0, t0 + dur], eased
  E.prog = (t, t0, dur, ease = E.ease.outCubic) => ease(E.clamp((t - t0) / dur));
  // fade in at [a, a+ia] and out at [b-ob, b]
  E.window = (t, a, b, ia = 0.4, ob = 0.4) => Math.min(E.prog(t, a, ia, E.ease.inOutSine), 1 - E.prog(t, b - ob, ob, E.ease.inOutSine));

  E.ease = {
    linear: (p) => p,
    inQuad: (p) => p * p,
    outQuad: (p) => 1 - (1 - p) * (1 - p),
    inOutQuad: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    inCubic: (p) => p * p * p,
    outCubic: (p) => 1 - Math.pow(1 - p, 3),
    inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outQuart: (p) => 1 - Math.pow(1 - p, 4),
    inQuart: (p) => p * p * p * p,
    outQuint: (p) => 1 - Math.pow(1 - p, 5),
    inOutQuint: (p) => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2),
    outExpo: (p) => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    inExpo: (p) => (p === 0 ? 0 : Math.pow(2, 10 * p - 10)),
    inOutExpo: (p) => (p === 0 ? 0 : p === 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2),
    inOutSine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
    outBack: (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    outBackSoft: (p) => { const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    // critically-damped-ish spring overshoot
    outSpring: (p) => 1 - Math.exp(-6.5 * p) * Math.cos(9 * p),
  };

  // Deterministic pseudo-random
  E.rand = (seed) => {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  };
  E.noise1 = (x, seed = 0) => Math.sin(x * 1.13 + seed * 7.1) * 0.5 + Math.sin(x * 2.31 + seed * 3.7) * 0.3 + Math.sin(x * 0.57 + seed) * 0.2;

  // ---------- DOM ----------
  E.h = (tag, attrs = {}, children = []) => {
    const svgTags = ['svg', 'path', 'g', 'circle', 'rect', 'line', 'polygon', 'polyline', 'defs', 'linearGradient', 'radialGradient', 'stop', 'pattern', 'clipPath', 'mask', 'text', 'use', 'filter', 'feGaussianBlur', 'ellipse'];
    const isSvg = svgTags.includes(tag);
    const el = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c != null) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    return el;
  };

  // Set transform/opacity/filter in one call. Values are only written when they change.
  E.set = (el, o) => {
    if (!el) return;
    const st = el.__st || (el.__st = {});
    const x = o.x ?? 0, y = o.y ?? 0, s = o.s ?? 1, sx = o.sx ?? s, sy = o.sy ?? s, r = o.r ?? 0;
    const tf = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)` + (o.yp ? ` translateY(${o.yp.toFixed(2)}%)` : '') + ` rotate(${r.toFixed(3)}deg) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
    if (st.tf !== tf) { el.style.transform = tf; st.tf = tf; }
    const op = o.o ?? 1;
    const ops = op.toFixed(3);
    if (st.op !== ops) { el.style.opacity = ops; st.op = ops; }
    const vis = op <= 0.001 ? 'hidden' : 'visible';
    if (st.vis !== vis) { el.style.visibility = vis; st.vis = vis; }
    const blur = o.blur ?? 0;
    const f = (blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '') + (o.filter ? ' ' + o.filter : '');
    if (st.f !== f) { el.style.filter = f || 'none'; st.f = f; }
  };
  E.show = (el, on) => { const v = on ? '' : 'none'; if (el.__disp !== v) { el.style.display = v; el.__disp = v; } };
  E.css = (el, prop, val) => { const k = '__c_' + prop; if (el[k] !== val) { el.style.setProperty(prop, val); el[k] = val; } };
  E.attr = (el, k, v) => { const kk = '__a_' + k; if (el[kk] !== v) { el.setAttribute(k, v); el[kk] = v; } };
  E.text = (el, v) => { if (el.__t !== v) { el.textContent = v; el.__t = v; } };

  // ---------- text reveal ----------
  // Builds a headline where each word rises out of a mask. words: [{w, cls}], or a string.
  // Returns {el, words: [span...]}. Use E.revealWords(words, t, times) in update.
  E.headline = (lines, cls = 'headline') => {
    const el = E.h('div', { class: cls });
    const words = [];
    for (const line of lines) {
      const ln = E.h('div', { class: 'hl-line' });
      for (const part of line) {
        const [txt, c] = Array.isArray(part) ? part : [part, ''];
        for (const w of txt.split(' ').filter(Boolean)) {
          const inner = E.h('span', { class: 'hl-word-inner ' + c, text: w });
          const outer = E.h('span', { class: 'hl-word' }, [inner]);
          ln.appendChild(outer);
          ln.appendChild(document.createTextNode(' '));
          words.push(inner);
        }
      }
      el.appendChild(ln);
    }
    return { el, words };
  };
  // Reveal each word at its time (times array or [start, stagger]).
  E.revealWords = (words, t, times, dur = 0.55, outT = null, outDur = 0.45) => {
    words.forEach((w, i) => {
      const t0 = Array.isArray(times) ? times[Math.min(i, times.length - 1)] + (i >= times.length ? (i - times.length + 1) * 0.08 : 0) : times + i * 0.07;
      const p = E.prog(t, t0, dur, E.ease.outQuart);
      let y = (1 - p) * 105, o = E.clamp(p * 1.6), blur = (1 - p) * 8;
      if (outT != null) {
        const q = E.prog(t, outT + i * 0.025, outDur, E.ease.inCubic);
        y -= q * 105; o *= 1 - q; blur += q * 8;
      }
      E.set(w, { yp: y, o, blur });
    });
  };

  // ---------- shapes ----------
  // Rounded pointy-top hexagon path centered in a w x h box.
  E.hexPath = (w, h, r = 0.12) => {
    const pts = [[w / 2, 0], [w, h * 0.25], [w, h * 0.75], [w / 2, h], [0, h * 0.75], [0, h * 0.25]];
    const rr = Math.min(w, h) * r;
    let d = '';
    for (let i = 0; i < 6; i++) {
      const p0 = pts[(i + 5) % 6], p1 = pts[i], p2 = pts[(i + 1) % 6];
      const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
      const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
      const a = [p1[0] + (v1[0] / l1) * rr, p1[1] + (v1[1] / l1) * rr];
      const b = [p1[0] + (v2[0] / l2) * rr, p1[1] + (v2[1] / l2) * rr];
      d += (i === 0 ? `M${a[0].toFixed(2)},${a[1].toFixed(2)}` : `L${a[0].toFixed(2)},${a[1].toFixed(2)}`) + `Q${p1[0]},${p1[1]} ${b[0].toFixed(2)},${b[1].toFixed(2)}`;
    }
    return d + 'Z';
  };

  // ---------- scenes ----------
  E.scenes = [];
  E.scene = (def) => { E.scenes.push(def); return def; };

  window.E = E;
})();
