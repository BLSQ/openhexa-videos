// Scene 2 — "Weeks copying, cleaning and re-exporting, instead of making decisions."
// Ends by imploding everything into a single point that becomes the logo.
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;

  const R = {};
  const words = [];
  const ghosts = [];
  const exportsFly = [];
  const streaks = [];

  const ROWS = [
    ['District', 'Period', 'Cases', 'Tested', 'Reporting'],
    ['Bo', '2026-W14', '1,284', '3,902', '94%'],
    ['Kenema', '2O26-W14', '#N/A', '2,711', '88%'],
    ['Kailahun', '2026-W14', '962', '??', '91%'],
    ['Port Loko', '2026-W14', '1,107', '3,356', '—'],
    ['Bombali', '2026-W14', '873', '2,470', '97%'],
    ['Kono', '26/04/2026', '1,016', '3,015', '90%'],
    ['Tonkolili', '2026-W14', '781', '2,264', '86%'],
    ['Moyamba', '2026-W14', '#REF!', '1,988', '92%'],
  ];
  const FIXES = { '2,1': '2026-W14', '2,2': '1,153', '3,3': '2,806', '4,4': '89%', '6,1': '2026-W14', '8,2': '694' };

  function makeSheet(w, hgt, withRefs) {
    const win = UI.windowCard('sharepoint / exports / malaria_cases_FINAL_v3.xlsx', { w, h: hgt });
    const sheet = h('div', { class: 'sheet', style: { position: 'absolute', inset: '0' } });
    const cells = {};
    ROWS.forEach((row, r) => {
      const rowEl = h('div', { class: 'row' + (r === 0 ? ' head' : '') });
      row.forEach((v, c) => {
        const isErr = FIXES[`${r},${c}`] != null;
        const cell = h('div', { class: 'c' + (isErr ? ' err' : ''), text: v, style: c === 0 ? { flex: '1.3' } : {} });
        rowEl.appendChild(cell);
        cells[`${r},${c}`] = cell;
      });
      sheet.appendChild(rowEl);
    });
    win.body.appendChild(sheet);
    if (withRefs) Object.assign(R, { cells });
    return win;
  }

  E.scene({
    name: 'grind',
    from: TL.scenes.grind - 0.1,
    to: TL.scenes.reveal + 0.05,
    build(root) {
      const cam = h('div', { class: 'cam' });
      const implode = h('div', { class: 'layer', style: { transformOrigin: '960px 540px' } });
      cam.appendChild(implode);
      root.appendChild(cam);
      R.cam = cam; R.implode = implode;

      // Week counter pill
      R.week = h('div', { class: 'pill abs', style: { fontSize: '26px', gap: '14px', padding: '12px 24px' } }, [UI.svgIcon('calendar', 28, '#ff8cc0', 2), R.weekText = h('span', { text: 'Week 1' })]);
      implode.appendChild(R.week);

      // Kinetic verbs
      const verbs = [['Copy.', ''], ['Clean.', ''], ['Re-export.', ''], ['Repeat.', 'pink']];
      verbs.forEach(([txt, cls], i) => {
        const hl = E.headline([[[txt, cls]]], 'headline');
        hl.el.style.position = 'absolute';
        implode.appendChild(hl.el);
        words.push({ el: hl.el, inner: hl.words, y: 215 + i * 118 });
      });
      R.instead = h('div', { class: 'abs sub', style: { fontSize: '40px', color: '#c9cde6', whiteSpace: 'nowrap', fontWeight: 500 }, html: '…instead of making <span style="color:#fff;font-weight:700">decisions</span>.' });
      implode.appendChild(R.instead);

      // Ghost windows behind (repetition)
      for (let i = 0; i < 4; i++) {
        const g = makeSheet(900, 440, false);
        g.el.classList.add('abs');
        implode.appendChild(g.el);
        ghosts.push(g.el);
      }
      const main = makeSheet(900, 440, true);
      main.el.classList.add('abs');
      implode.appendChild(main.el);
      R.win = main.el;

      // Selection box + keycap
      R.sel = h('div', { class: 'abs', style: { width: '10px', height: '10px', border: '2.5px solid #7b86ff', background: 'rgba(123,134,255,0.18)', borderRadius: '3px' } });
      main.body.appendChild(R.sel);
      R.key = h('div', { class: 'abs', style: { padding: '10px 18px', borderRadius: '12px', background: '#f3f4f6', color: '#111827', fontWeight: 800, fontSize: '30px', boxShadow: '0 6px 0 #9ca3af, 0 20px 40px rgba(0,0,0,0.5)' }, text: '⌘ C' });
      implode.appendChild(R.key);

      // Export menu
      R.menu = h('div', { class: 'abs', style: { width: '300px', borderRadius: '14px', background: '#f9fafb', color: '#111827', boxShadow: '0 25px 60px rgba(0,0,0,0.55)', padding: '8px', fontSize: '20px', fontWeight: 600 } }, [
        h('div', { style: { padding: '10px 14px', color: '#6b7280' }, text: 'Save as…' }),
        R.menuHi = h('div', { style: { padding: '10px 14px', borderRadius: '9px', background: '#2563eb', color: '#fff' }, text: 'Export as CSV' }),
        h('div', { style: { padding: '10px 14px', color: '#6b7280' }, text: 'Email a copy' }),
      ]);
      implode.appendChild(R.menu);

      // Flying exported files
      const names = ['export_v7.csv', 'export_v8.csv', 'export_v8_fixed.csv', 'export_v9_FINAL.csv', 'export_v9_FINAL2.csv'];
      names.forEach((n, i) => {
        const el = h('div', { class: 'chip', style: { padding: '12px 18px 12px 12px', fontSize: '20px' } }, [h('div', { class: 'ico', style: { background: '#2563eb', width: '36px', height: '36px', fontSize: '12px' }, text: 'CSV' }), n]);
        implode.appendChild(el);
        exportsFly.push({ el, i });
      });

      // Waiting dashboard card
      R.wait = h('div', { class: 'card abs', style: { width: '400px', height: '150px', padding: '26px 28px' } }, [
        h('div', { style: { fontSize: '17px', letterSpacing: '0.12em', fontWeight: 700, color: '#8d93b8', textTransform: 'uppercase' }, text: 'Program review' }),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '18px', fontSize: '26px', fontWeight: 600, color: '#c9cde6' } }, [
          R.spinner = h('div', { style: { width: '34px', height: '34px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.15)', borderTopColor: '#ff459a' } }),
          'Waiting for data…',
        ]),
      ]);
      implode.appendChild(R.wait);

      // Speed streaks converging into the singularity
      const rnd = E.rand(9);
      for (let i = 0; i < 46; i++) {
        const ang = rnd() * Math.PI * 2;
        const el = h('div', { class: 'abs', style: { width: (120 + rnd() * 260) + 'px', height: '3px', borderRadius: '3px', background: `linear-gradient(90deg, rgba(255,69,154,0), ${rnd() < 0.5 ? 'rgba(255,120,190,0.9)' : 'rgba(160,170,255,0.8)'})`, transformOrigin: '100% 50%' } });
        cam.appendChild(el);
        streaks.push({ el, ang, d0: 700 + rnd() * 700, delay: rnd() * 0.9, len: el.style.width });
      }
      R.core = h('div', { class: 'abs', style: { width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #ffc2de 18%, rgba(255,69,154,0.7) 40%, rgba(255,69,154,0) 70%)' } });
      cam.appendChild(R.core);
    },

    update(t) {
      const t0 = TL.scenes.grind;
      const enter = prog(t, t0, 0.8, ease.outQuart);
      set(R.cam, { s: 1.0 + (t - t0) * 0.005 });

      // Week counter: "weeks" → rolls from 1 to 9
      const wp = prog(t, at('v03', 'weeks') - 0.2, 3.2, ease.inOutSine);
      E.text(R.weekText, 'Week ' + Math.max(1, Math.round(1 + wp * 8)));
      const wIn = prog(t, t0 + 0.3, 0.6, ease.outBack);
      set(R.week, { x: 120, y: 110, s: wIn, o: clamp(wIn * 2) });

      // Verbs
      const vt = [at('v03', 'copying'), at('v03', 'cleaning'), at('v03', 'exporting'), at('v03', 'exporting') + 0.55];
      words.forEach((w, i) => {
        set(w.el, { x: 120, y: w.y });
        E.revealWords(w.inner, t, [vt[i]], 0.55);
        // earlier verbs dim as the next one lands
        const dim = i < 3 ? prog(t, vt[i + 1], 0.4) * 0.55 : 0;
        const late = prog(t, at('v03', 'instead') - 0.1, 0.5) * 0.35;
        w.el.style.opacity = (1 - dim - late).toFixed(3);
      });
      const ip = prog(t, at('v03', 'instead') - 0.05, 0.6, ease.outCubic);
      set(R.instead, { x: 120, y: 710 + (1 - ip) * 24, o: ip, blur: (1 - ip) * 6 });

      // Main window slides in
      const wx = 900, wy = 170;
      set(R.win, { x: wx + (1 - enter) * 500, y: wy, o: enter, blur: (1 - enter) * 12, r: (1 - enter) * 4 });

      // Selection on "copying"
      const sp = prog(t, at('v03', 'copying') - 0.1, 0.45, ease.outCubic);
      const sOut = prog(t, at('v03', 'cleaning') + 0.2, 0.3);
      E.css(R.sel, 'width', (lerp(10, 520, sp)).toFixed(1) + 'px');
      E.css(R.sel, 'height', (lerp(10, 280, sp)).toFixed(1) + 'px');
      set(R.sel, { x: 250, y: 42, o: sp > 0 ? 1 - sOut : 0 });
      const kp = prog(t, at('v03', 'copying') + 0.15, 0.4, ease.outBack);
      const kOut = prog(t, at('v03', 'cleaning'), 0.25);
      const press = Math.max(0, 1 - Math.abs(t - at('v03', 'copying') - 0.45) / 0.08) * 6;
      set(R.key, { x: 1560, y: 560 + press, s: kp * (1 - kOut * 0.3), o: kp * (1 - kOut) });

      // Cleaning: error cells get fixed one by one
      const fixKeys = Object.keys(FIXES);
      fixKeys.forEach((k, i) => {
        const ft = at('v03', 'cleaning') + i * 0.09;
        const cell = R.cells[k];
        const fixed = t >= ft;
        E.text(cell, fixed ? FIXES[k] : ROWS[+k.split(',')[0]][+k.split(',')[1]]);
        const flash = fixed ? Math.max(0, 1 - (t - ft) / 0.5) : 0;
        E.css(cell, 'background', fixed ? `rgba(34,197,94,${(0.35 * flash).toFixed(3)})` : 'rgba(242,87,103,0.14)');
        E.css(cell, 'color', fixed ? '#c9cde6' : '#ff8f9b');
      });

      // Export menu
      const mp = prog(t, at('v03', 'exporting') - 0.25, 0.35, ease.outBack);
      const mOut = prog(t, at('v03', 'exporting') + 0.5, 0.25);
      set(R.menu, { x: 1300, y: 330, s: mp, o: mp * (1 - mOut) });

      // Exported files fly out into a messy pile + ghost windows pile up behind
      exportsFly.forEach(({ el, i }) => {
        const ft = at('v03', 'exporting') + 0.25 + i * 0.26;
        const p = prog(t, ft, 0.7, ease.outCubic);
        const tx = 960 + (i % 2 ? 70 : -40) + i * 36, ty = 650 + i * 58;
        set(el, { x: lerp(1400, tx, p), y: lerp(420, ty, p) - Math.sin(p * Math.PI) * 120, r: lerp(0, (i % 2 ? 4 : -5), p), s: lerp(0.6, 1, p), o: clamp(p * 3) });
      });
      ghosts.forEach((g, i) => {
        const gt = at('v03', 'exporting') + 0.1 + i * 0.3;
        const p = prog(t, gt, 0.5, ease.outCubic);
        const k = i + 1;
        set(g, { x: wx + k * 34 * p, y: wy - k * 30 * p, o: p * (0.55 - i * 0.1), s: 1 - 0.02 * k * p });
      });
      // keep the main window on top of ghosts visually by nudging it
      const wp2 = prog(t, at('v03', 'exporting'), 1.4, ease.outCubic);
      set(R.win, { x: wx + (1 - enter) * 500 - wp2 * 30, y: wy + wp2 * 30, o: enter, blur: (1 - enter) * 12, r: (1 - enter) * 4 });

      // Waiting card on "decisions"
      const dp = prog(t, at('v03', 'decisions') - 0.4, 0.6, ease.outBack);
      set(R.wait, { x: 1420, y: 800, s: dp, o: clamp(dp * 2) });
      E.css(R.spinner, 'transform', `rotate(${(t * 420) % 360}deg)`);

      // Implosion into the singularity
      const imp = prog(t, 12.9, 1.85, ease.inExpo);
      set(R.implode, { s: 1 - imp * 0.985, r: imp * 38, o: 1 - prog(t, 14.45, 0.3), blur: imp * 10 });
      streaks.forEach((s) => {
        const p = clamp((t - 13.5 - s.delay * 0.8) / 0.8);
        const d = s.d0 * (1 - ease.inCubic(p));
        const x = 960 + Math.cos(s.ang) * d, y = 540 + Math.sin(s.ang) * d;
        set(s.el, { x: x - parseFloat(s.len), y: y - 1.5, r: (s.ang * 180) / Math.PI + 180, o: p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0 });
        s.el.style.transformOrigin = '100% 50%';
      });
      const cp = prog(t, 13.4, 1.6, ease.inCubic);
      set(R.core, { x: 860, y: 440, s: 0.15 + cp * 1.6 + Math.sin(t * 30) * 0.03 * cp, o: cp });
    },
  });
})();
