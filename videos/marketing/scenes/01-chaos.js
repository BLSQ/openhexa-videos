// Scene 1 — "Your data lives everywhere." Scattered systems and files that don't talk.
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;

  // Partial quadratic bezier (first fraction p of the curve) as SVG path data.
  function quadPartial(a, c, b, p) {
    const q0 = [lerp(a[0], c[0], p), lerp(a[1], c[1], p)];
    const q1 = [lerp(c[0], b[0], p), lerp(c[1], b[1], p)];
    const e = [lerp(q0[0], q1[0], p), lerp(q0[1], q1[1], p)];
    return { d: `M${a[0]},${a[1]} Q${q0[0]},${q0[1]} ${e[0]},${e[1]}`, end: e };
  }

  const items = [];
  let headline, lines = [], particles = [], tags = [];

  E.scene({
    name: 'chaos',
    from: 0,
    to: 8.1,
    build(root) {
      const cam = h('div', { class: 'cam' });
      root.appendChild(cam);

      // Data "fragments": tiny glyphs everywhere
      const rnd = E.rand(42);
      const fragLayer = h('div', { class: 'layer' });
      cam.appendChild(fragLayer);
      for (let i = 0; i < 70; i++) {
        const x = rnd() * 1920, y = rnd() * 1080;
        const kind = rnd();
        const el = h('div', { class: 'abs', style: {
          width: (kind < 0.5 ? 8 : 26) + 'px', height: '8px', borderRadius: '3px',
          background: kind < 0.33 ? 'rgba(255,255,255,0.22)' : kind < 0.66 ? 'rgba(123,134,255,0.35)' : 'rgba(255,69,154,0.3)',
        } });
        fragLayer.appendChild(el);
        particles.push({ el, x, y, d: rnd(), sp: 0.4 + rnd() });
      }

      // Out-of-focus background tiles for depth (visible from the first frame)
      const deep = [['dhis2.svg', 1450, 470, 150], ['excel.svg', 1000, 260, 120], ['postgres.png', 1700, 40, 110], ['odk.png', 640, 820, 140], ['csv.png', 1220, 780, 100], ['kobo.svg', 330, 470, 110], ['gcs.png', 1820, 620, 130]];
      this.deep = deep.map(([ic, x, y, sz], i) => {
        const el = UI.hexTile(ic, sz);
        el.classList.add('abs');
        cam.appendChild(el);
        return { el, x, y, i };
      });

      // Connection attempts layer (under the items)
      const svg = h('svg', { width: 1920, height: 1080, class: 'abs', style: { overflow: 'visible' } });
      cam.appendChild(svg);

      headline = E.headline([["Your", "data", "lives"], [["everywhere.", 'pink']]], 'headline');
      set(headline.el, { x: 120, y: 118 });
      headline.el.style.position = 'absolute';
      cam.appendChild(headline.el);

      // Sources: [type, icon/label, x, y, popTime, tagText?]
      const T = (c, w) => at(c, w);
      const defs = [
        ['hex', 'dhis2.svg', 1060, 110, T('v02', 'health'), 'DHIS2'],
        ['hex', 'iaso.svg', 1470, 70, T('v02', 'health') + 0.12],
        ['hex', 'openlmis.svg', 1745, 300, T('v02', 'systems')],
        ['hex', 'fhir.png', 1250, 430, T('v02', 'systems') + 0.12],
        ['hex', 'odk.png', 830, 455, T('v02', 'surveys')],
        ['hex', 'kobo.svg', 1560, 610, T('v02', 'surveys') + 0.12],
        ['hex', 'excel.svg', 330, 590, T('v02', 'spreadsheets')],
        ['hex', 'csv.png', 1000, 770, T('v02', 'spreadsheets') + 0.1],
        ['hex', 'postgres.png', 1735, 845, T('v02', 'databases')],
        ['hex', 'parquet.png', 560, 880, T('v02', 'databases') + 0.1],
        ['hex', 'gcs.png', 1330, 900, T('v02', 'databases') + 0.2],
        ['hex', 'worldpop.png', 120, 860, T('v02', 'databases') + 0.3],
        ['chip', ['malaria_cases_FINAL_v3.xlsx', '12,408 rows · edited 3 weeks ago', '#1d6f42', 'XLS'], 110, 420, T('v02', 'spreadsheets') + 0.15],
        ['chip', ['district_report (2).csv', 'exported by email', '#2563eb', 'CSV'], 1080, 600, T('v02', 'spreadsheets') + 0.25],
        ['chip', ['stock_levels_OLD.csv', '4 versions · which is right?', '#2563eb', 'CSV'], 560, 690, T('v02', 'spreadsheets') + 0.35],
        ['chip', ['survey_round2_clean.xlsx', 'Round 2 · 1,932 submissions', '#1d6f42', 'XLS'], 1300, 250, T('v02', 'surveys') + 0.2],
      ];
      for (const [type, data, x, y, t0] of defs) {
        let el, w, hgt;
        if (type === 'hex') {
          el = UI.hexTile(data, 112);
          w = 112; hgt = 129;
        } else {
          const [name, meta, color, abbr] = data;
          el = h('div', { class: 'chip' }, [
            h('div', { class: 'ico', style: { background: color }, text: abbr }),
            h('div', {}, [name, h('span', { class: 'meta', text: meta })]),
          ]);
          w = 400; hgt = 80;
        }
        cam.appendChild(el);
        items.push({ el, x, y, w, h: hgt, t0, seed: items.length * 1.7 + 0.3, type });
      }

      // Category tags that appear with the narration
      const tagDefs = [
        ['Health systems', 1060, 262, T('v02', 'health') + 0.1],
        ['Surveys', 805, 600, T('v02', 'surveys') + 0.05],
        ['Spreadsheets', 300, 735, T('v02', 'spreadsheets') + 0.05],
        ['Databases', 1690, 990, T('v02', 'databases') + 0.05],
      ];
      for (const [txt, x, y, t0] of tagDefs) {
        const el = h('div', { class: 'abs mono', style: { fontSize: '17px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', borderRadius: '8px', background: 'rgba(10,14,35,0.6)', border: '1px solid rgba(255,255,255,0.12)', whiteSpace: 'nowrap' }, text: txt });
        cam.appendChild(el);
        tags.push({ el, x, y, t0 });
      }

      // Failed connections: [fromIndex, toIndex, bend]
      const pairs = [[0, 12, -120], [4, 8, 140], [7, 3, -90]];
      pairs.forEach(([a, b, bend], i) => {
        const path = h('path', { fill: 'none', stroke: 'rgba(255,255,255,0.55)', 'stroke-width': 3, 'stroke-dasharray': '10 10', 'stroke-linecap': 'round' });
        const x = h('div', { class: 'abs', style: { width: '46px', height: '46px', borderRadius: '50%', background: '#f25767', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px rgba(242,87,103,0.25), 0 10px 30px rgba(0,0,0,0.5)' } }, [UI.svgIcon('x', 26, '#fff', 3)]);
        svg.appendChild(path);
        cam.appendChild(x);
        lines.push({ path, x, a, b, bend, t0: at('v02', 'none') + i * 0.22 });
      });

      this.cam = cam;
    },

    update(t) {
      const exit = prog(t, 7.25, 0.75, ease.inCubic);
      // gentle camera push
      set(this.cam, { s: 1.0 + t * 0.006, x: -t * 3 });

      E.revealWords(headline.words, t, [at('v01'), at('v01', 'data'), at('v01', 'lives'), at('v01', 'everywhere')], 0.6, 7.15, 0.4);

      // fragments: burst in on "everywhere", drift, get pushed out on exit
      const burst = at('v01', 'everywhere');
      particles.forEach((p, i) => {
        const pp = prog(t, burst - 0.3 + p.d * 0.8, 0.6, ease.outCubic);
        const dx = Math.sin(t * 0.4 * p.sp + i) * 20, dy = Math.cos(t * 0.3 * p.sp + i * 2) * 16 - t * 4 * p.sp;
        set(p.el, { x: p.x + dx, y: p.y + dy, o: pp * 0.9 * (1 - exit), s: pp });
      });

      this.deep.forEach((d) => {
        const p = prog(t, 0.2 + d.i * 0.15, 1.6, ease.outCubic);
        set(d.el, { x: d.x + Math.sin(t * 0.3 + d.i) * 30 - t * 10, y: d.y + Math.cos(t * 0.25 + d.i * 2) * 20, r: t * (d.i % 2 ? 4 : -4), o: p * 0.2 * (1 - prog(t, 2.2, 1.2)), blur: 4, s: 0.9 });
      });

      const pos = [];
      items.forEach((it, i) => {
        const p = prog(t, it.t0, 0.7, ease.outBack);
        const pa = prog(t, it.t0, 0.25, ease.linear);
        const fx = E.noise1(t * 0.55, it.seed) * 14, fy = E.noise1(t * 0.45, it.seed + 5) * 12;
        const rot = E.noise1(t * 0.35, it.seed + 9) * (it.type === 'hex' ? 5 : 2.5);
        // shake when connections fail
        const sh = Math.max(0, 1 - Math.abs(t - at('v02', 'talk') - 0.1) / 0.35);
        const shx = Math.sin(t * 60 + i) * 5 * sh;
        // exit: fly away from center + blur
        const cx = it.x + it.w / 2 - 960, cy = it.y + it.h / 2 - 540;
        const ex = cx * exit * 0.9, ey = cy * exit * 0.9;
        const x = it.x + fx + shx + ex, y = it.y + fy + ey;
        set(it.el, { x, y, r: rot, s: (0.4 + 0.6 * p) * (1 + exit * 0.4), o: pa * (1 - exit), blur: (1 - pa) * 10 + exit * 14 });
        pos.push([x + it.w / 2, y + it.h / 2]);
      });

      tags.forEach((tg) => {
        const p = prog(t, tg.t0, 0.5, ease.outCubic);
        set(tg.el, { x: tg.x, y: tg.y + (1 - p) * 14, o: p * (1 - prog(t, 6.9, 0.4)) });
      });

      lines.forEach((ln) => {
        const a = pos[ln.a], b = pos[ln.b];
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const n = [-(b[1] - a[1]), b[0] - a[0]];
        const nl = Math.hypot(...n);
        const c = [mid[0] + (n[0] / nl) * ln.bend, mid[1] + (n[1] / nl) * ln.bend];
        const draw = prog(t, ln.t0, 0.45, ease.outCubic) * 0.55;
        const { d, end } = quadPartial(a, c, b, draw);
        E.attr(ln.path, 'd', d);
        const fail = prog(t, ln.t0 + 0.45, 0.3, ease.outBack);
        const fade = 1 - prog(t, 7.0, 0.35);
        E.attr(ln.path, 'stroke-opacity', ((draw > 0 ? 1 : 0) * fade * (1 - fail * 0.5)).toFixed(3));
        set(ln.x, { x: end[0] - 23, y: end[1] - 23, s: fail, o: Math.min(1, fail * 2) * fade });
      });
    },
  });
})();
