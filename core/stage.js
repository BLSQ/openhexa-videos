// Stage, persistent background, render loop, player controls and render-mode hooks, shared by
// every video. A video customizes it through window.STAGE (set in its own stage.js):
//   STAGE.build(stage, L)      add persistent layers (e.g. a chapter stepper) above the scenes
//   STAGE.background(t, L)     animate the background layers (default: steady, vivid)
//   STAGE.overlays(t, L)       animate overlays such as L.flash (default: none)
//   STAGE.update(t, L)         per-frame work after the scenes (e.g. the stepper)
//   STAGE.fade = { in, out }   fade from/to black at the start and end (seconds)
// L holds the layers: bgBase, hexLayer, glowPink, glowTeal, glowViolet, bigHexes, flash, fadeBlack.
(function () {
  const { h, set, prog, ease } = E;
  const H = window.STAGE || {};
  const stage = document.getElementById('stage');
  const W = TL.width, H_ = TL.height;
  const L = { stage };

  // ---------- persistent background ----------
  const bg = h('div', { class: 'layer', id: 'bg' });
  L.bgBase = h('div', { class: 'layer', id: 'bg-base' });
  L.hexLayer = h('div', { class: 'layer', id: 'bg-hex' }, [UI.hexPattern(W * 1.3, H_ * 1.3, 44, 'rgba(255,255,255,0.045)', 2)]);
  const glow = (size, rgb, a) => h('div', { class: 'glow', style: { width: size + 'px', height: size + 'px', background: `radial-gradient(circle, rgba(${rgb},${a}), rgba(${rgb},0) 65%)` } });
  L.glowPink = glow(900, '255,69,154', 0.55);
  L.glowTeal = glow(1000, '62,230,193', H.tealAlpha ?? 0.35);
  L.glowViolet = glow(1100, '123,134,255', 0.4);
  L.bigHexes = [0, 1, 2].map((i) => {
    const s = [760, 520, 980][i];
    return h('div', { class: 'abs', html: `<svg width="${s}" height="${s * 1.155}" viewBox="0 0 ${s} ${s * 1.155}"><path d="${E.hexPath(s, s * 1.155, 0.05)}" fill="none" stroke="${['rgba(62,230,193,0.10)', 'rgba(255,69,154,0.10)', 'rgba(123,134,255,0.08)'][i]}" stroke-width="3"/></svg>` });
  });
  bg.append(L.bgBase, L.glowViolet, L.glowTeal, L.glowPink, L.hexLayer, ...L.bigHexes);
  stage.appendChild(bg);

  const scenesRoot = h('div', { class: 'layer', id: 'scenes' });
  stage.appendChild(scenesRoot);
  if (H.build) H.build(stage, L);

  // ---------- overlays ----------
  L.flash = h('div', { class: 'layer', style: { background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, #ffd6ea 25%, rgba(255,90,170,0.8) 55%, rgba(255,69,154,0.35) 100%)', mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0, visibility: 'hidden' } });
  const vignette = h('div', { class: 'layer', id: 'vignette' });
  const grainWrap = h('div', { class: 'layer', id: 'grain' });
  const grains = [];
  for (let i = 0; i < 6; i++) {
    const c = h('canvas', { width: 960, height: 540, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'none' } });
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(960, 540);
    const rnd = E.rand(1234 + i * 77);
    for (let p = 0; p < img.data.length; p += 4) {
      const v = 128 + (rnd() - 0.5) * 120;
      img.data[p] = img.data[p + 1] = img.data[p + 2] = v;
      img.data[p + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    grains.push(c);
    grainWrap.appendChild(c);
  }
  L.fadeBlack = h('div', { class: 'layer', style: { background: '#070a18', pointerEvents: 'none' } });
  stage.append(vignette, L.flash, grainWrap, L.fadeBlack);

  // ---------- scenes ----------
  for (const sc of E.scenes) {
    sc.root = h('div', { class: 'scene', id: 'scene-' + sc.name });
    scenesRoot.appendChild(sc.root);
    sc.build(sc.root);
  }
  const at = (x) => (typeof x === 'function' ? x() : x);

  function defaultBackground(t) {
    const drift = t * 0.6;
    set(L.glowPink, { x: 1100 + Math.sin(drift * 0.5) * 80, y: -200 + Math.cos(drift * 0.4) * 60, o: 0.75 });
    set(L.glowTeal, { x: -250 + Math.cos(drift * 0.3) * 90, y: 450 + Math.sin(drift * 0.35) * 70, o: 0.55 });
    set(L.glowViolet, { x: 500 + Math.sin(drift * 0.25) * 120, y: 250 + Math.cos(drift * 0.3) * 50, o: 0.5 });
    set(L.hexLayer, { x: -((t * 6) % 76.2) - 60, y: -((t * 3) % 132) - 60, o: 0.8 });
    set(L.bigHexes[0], { x: 1300 + Math.sin(t * 0.1) * 40, y: -120 + t * 2, r: 4 + t * 0.2, o: 1 });
    set(L.bigHexes[1], { x: -180 + Math.cos(t * 0.12) * 30, y: 620 - t * 1.5, r: -6 + t * 0.15, o: 1 });
    set(L.bigHexes[2], { x: 700, y: 520 + Math.sin(t * 0.08) * 30, r: 30 - t * 0.1, o: 0.4 });
  }

  const fade = { in: 0.6, out: 0.7, ...(H.fade || {}) };
  function render(t, frame = Math.floor(t * TL.fps)) {
    (H.background || defaultBackground)(t, L);
    for (const sc of E.scenes) {
      const on = t >= at(sc.from) && t < at(sc.to);
      E.show(sc.root, on);
      if (on) { sc.root.style.visibility = 'visible'; sc.update(t); }
    }
    if (H.update) H.update(t, L);
    if (H.overlays) H.overlays(t, L);
    grains.forEach((g, i) => E.show(g, i === frame % grains.length));
    const fin = 1 - prog(t, 0, fade.in, ease.inOutSine);
    const fout = prog(t, TL.duration - fade.out, fade.out, ease.inOutSine);
    set(L.fadeBlack, { o: Math.max(fin, fout) });
  }
  window.renderAt = render;

  // ---------- fit stage to window ----------
  function fit() {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H_);
    stage.style.transform = `scale(${s})`;
  }
  window.addEventListener('resize', fit);
  fit();

  // ---------- readiness ----------
  const imgs = [...document.querySelectorAll('img')];
  window.stageReady = Promise.all([
    document.fonts.ready,
    ...imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; }))),
  ]).then(() => Promise.all(imgs.map((im) => (im.decode ? im.decode().catch(() => {}) : null))));

  const params = new URLSearchParams(location.search);
  if (params.has('render')) {
    document.body.classList.add('render');
    stage.style.transform = 'none';
    render(Number(params.get('t') || 0));
    return;
  }

  // ---------- player ----------
  const audio = document.getElementById('audio');
  audio.src = `${VIDEO.dir}out/${LANG}/mix.m4a`;
  const btn = document.getElementById('play');
  const scrub = document.getElementById('scrub');
  const time = document.getElementById('time');
  const overlay = document.getElementById('startOverlay');
  const langSwitch = document.getElementById('langSwitch');
  const others = VIDEO.langs.filter((l) => l !== LANG);
  if (others.length) {
    langSwitch.textContent = others[0].toUpperCase();
    langSwitch.href = `?video=${VIDEO.id}&lang=${others[0]}`;
  } else langSwitch.style.display = 'none';
  scrub.max = TL.duration;
  let playing = false;
  const fmt = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  function tick() {
    const t = Math.min(audio.currentTime, TL.duration - 0.001);
    render(t);
    scrub.value = t;
    time.textContent = `${fmt(t)} / ${fmt(TL.duration)}`;
    if (audio.ended || audio.currentTime >= TL.duration) { playing = false; btn.textContent = '↺'; }
    if (playing) requestAnimationFrame(tick);
  }
  function play() {
    if (audio.ended || audio.currentTime >= TL.duration - 0.05) audio.currentTime = 0;
    audio.play();
    playing = true;
    btn.textContent = '❚❚';
    overlay.style.display = 'none';
    requestAnimationFrame(tick);
  }
  function pause() { audio.pause(); playing = false; btn.textContent = '▶'; }
  btn.onclick = () => (playing ? pause() : play());
  overlay.onclick = play;
  const seek = (x) => { audio.currentTime = x; render(x); time.textContent = `${fmt(x)} / ${fmt(TL.duration)}`; };
  scrub.oninput = () => seek(Number(scrub.value));
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    if (e.code === 'ArrowRight') seek(Math.min(TL.duration, audio.currentTime + 2));
    if (e.code === 'ArrowLeft') seek(Math.max(0, audio.currentTime - 2));
  });
  let idleTimer;
  window.addEventListener('mousemove', () => { document.body.classList.remove('idle'); clearTimeout(idleTimer); idleTimer = setTimeout(() => playing && document.body.classList.add('idle'), 2000); });
  window.stageReady.then(() => { const t0 = Number(params.get('t') || 1.0); audio.currentTime = t0; render(t0); });
})();
