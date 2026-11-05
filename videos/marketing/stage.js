// Background mood for the marketing video: muted and cool during the problem, vivid from the
// logo reveal (15 s) on, with a white-pink flash on the reveal itself.
window.STAGE = {
  background(t, L) {
    const { set, prog, ease, lerp } = E;
    const vivid = prog(t, 12.8, 2.4, ease.inOutSine);
    const drift = t * 0.6;
    set(L.glowPink, { x: lerp(1250, 1100, vivid) + Math.sin(drift * 0.5) * 80, y: lerp(-300, -200, vivid) + Math.cos(drift * 0.4) * 60, o: lerp(0.18, 0.75, vivid) });
    set(L.glowTeal, { x: -250 + Math.cos(drift * 0.3) * 90, y: 450 + Math.sin(drift * 0.35) * 70, o: lerp(0.12, 0.55, vivid) });
    set(L.glowViolet, { x: 500 + Math.sin(drift * 0.25) * 120, y: 250 + Math.cos(drift * 0.3) * 50, o: lerp(0.35, 0.5, vivid) });
    set(L.hexLayer, { x: -((t * 6) % 76.2) - 60, y: -((t * 3) % 132) - 60, o: lerp(0.35, 0.8, vivid) });
    set(L.bigHexes[0], { x: 1300 + Math.sin(t * 0.1) * 40, y: -120 + t * 2, r: 4 + t * 0.2, o: 0.3 + 0.7 * vivid });
    set(L.bigHexes[1], { x: -180 + Math.cos(t * 0.12) * 30, y: 620 - t * 1.5, r: -6 + t * 0.15, o: 0.3 + 0.7 * vivid });
    set(L.bigHexes[2], { x: 700, y: 520 + Math.sin(t * 0.08) * 30, r: 30 - t * 0.1, o: 0.4 * vivid });
    set(L.bgBase, { filter: `saturate(${lerp(0.55, 1, vivid).toFixed(3)}) brightness(${lerp(0.82, 1, vivid).toFixed(3)})` });
  },
  overlays(t, L) {
    const { set, prog, ease } = E;
    const f1 = prog(t, 14.95, 0.05, ease.linear) * (1 - prog(t, 15.0, 0.42, ease.outQuad));
    set(L.flash, { o: f1, s: 1 + (1 - f1) * 0.25 });
  },
  fade: { in: 0.6, out: 0.7 },
};
