// Scenes 4–6 — Integrate / Manage / Publish, framed like the website hero:
// persistent nav bar + three step tabs, left column copy, right column product visual.
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const R = { secs: [] };

  const SECTIONS = [
    { key: 'integrate', start: S.integrate, end: S.manage },
    { key: 'manage', start: S.manage, end: S.publish },
    { key: 'publish', start: S.publish, end: S.trust },
  ];
  const RIGHT = { x: 780, y: 262, w: 1044, h: 720 };

  // ---------- helpers ----------
  function typeText(el, full, t, t0, cps = 40, caret = null) {
    const n = Math.max(0, Math.min(full.length, Math.floor((t - t0) * cps)));
    E.text(el, t < t0 ? '' : full.slice(0, n));
    if (caret) caret.style.opacity = t >= t0 - 0.3 && (n < full.length || Math.floor(t * 2.5) % 2 === 0) ? '1' : '0';
    return n / full.length;
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  function bullet(text, icon) {
    const el = h('div', { class: 'abs', style: { display: 'flex', alignItems: 'center', gap: '20px', fontSize: '30px', fontWeight: 600, color: '#e7e9f7', whiteSpace: 'nowrap' } }, [
      h('div', { style: { position: 'relative', width: '52px', height: '58px', flex: 'none' }, html: `<svg width="52" height="58" viewBox="0 0 52 58" style="position:absolute;inset:0"><path d="${E.hexPath(52, 58, 0.14)}" fill="rgba(123,134,255,0.18)" stroke="rgba(123,134,255,0.55)" stroke-width="1.5"/></svg>` }),
      h('span', { html: text }),
    ]);
    const ic = UI.svgIcon(icon, 26, '#b3baff', 2);
    Object.assign(ic.style, { position: 'absolute', left: '13px', top: '16px' });
    el.firstChild.appendChild(ic);
    return el;
  }

  function sectionLeft(sec, kicker, lines, bullets) {
    const wrap = h('div', { class: 'abs' });
    const k = h('div', { class: 'kicker abs' }, [h('span', { class: 'dot' }), kicker]);
    const hl = E.headline(lines, 'headline md');
    hl.el.style.position = 'absolute';
    wrap.append(k, hl.el);
    set(k, { x: 96, y: 290 });
    set(hl.el, { x: 96, y: 336 });
    const bl = bullets.map(([txt, icon], i) => {
      const b = bullet(txt, icon);
      wrap.appendChild(b);
      return b;
    });
    sec.left = wrap;
    sec.kicker = k;
    sec.hl = hl;
    sec.bullets = bl;
    return wrap;
  }

  // ---------- INTEGRATE visual ----------
  function buildIntegrate(sec) {
    const win = UI.windowCard('app.openhexa.org / pipelines / dhis2-extractor', { w: RIGHT.w, h: RIGHT.h });
    win.el.classList.add('abs');
    const b = win.body;
    const V = (sec.v = {});
    // header row
    b.appendChild(h('div', { class: 'abs', style: { left: '36px', top: '28px', fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em' }, text: 'dhis2-extractor' }));
    V.tpl = h('div', { class: 'badge pink abs', style: { left: '330px', top: '31px', fontSize: '18px' } }, [UI.svgIcon('template', 20, '#ff8cc0', 2), 'From template']);
    V.sched = h('div', { class: 'badge violet abs', style: { left: '752px', top: '31px', fontSize: '18px' } }, [UI.svgIcon('clock', 20, '#b3baff', 2), 'Every Monday · 06:00']);
    b.append(V.tpl, V.sched);

    // DAG
    const svg = h('svg', { width: RIGHT.w, height: RIGHT.h - 54, class: 'abs', style: { overflow: 'visible' } });
    b.appendChild(svg);
    V.svg = svg;
    const srcs = [['dhis2.svg', 60, 128], ['odk.png', 60, 268], ['excel.svg', 60, 408]];
    V.srcs = srcs.map(([ic, x, y]) => {
      const el = UI.hexTile(ic, 92);
      el.classList.add('abs');
      b.appendChild(el);
      return { el, x, y };
    });
    const nodes = [
      ['Extract', 'dhis2 · odk · xlsx', 270],
      ['Transform', 'clean · validate · join', 545],
      ['Load', 'workspace database', 820],
    ];
    V.nodes = nodes.map(([title, sub, x], i) => {
      const status = h('div', { style: { position: 'absolute', right: '18px', top: '20px', width: '30px', height: '30px', borderRadius: '50%', border: '3.5px solid rgba(255,255,255,0.18)', borderTopColor: '#ff459a' } });
      const check = h('div', { style: { position: 'absolute', right: '18px', top: '20px', width: '30px', height: '30px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [UI.svgIcon('check', 20, '#fff', 3)]);
      const el = h('div', { class: 'abs', style: { width: '220px', height: '112px', borderRadius: '16px', background: 'rgba(16,21,47,0.75)', border: '1.5px solid rgba(255,255,255,0.16)', padding: '18px 20px', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.6)' } }, [
        h('div', { style: { fontSize: '15px', fontWeight: 700, letterSpacing: '0.12em', color: '#8d93b8' }, text: 'STEP ' + (i + 1) }),
        h('div', { style: { fontSize: '26px', fontWeight: 800, marginTop: '6px' }, text: title }),
        h('div', { class: 'mono', style: { fontSize: '15px', color: '#8d93b8', marginTop: '4px' }, text: sub }),
        status, check,
      ]);
      b.appendChild(el);
      return { el, x, y: 256, status, check };
    });
    V.edges = [];
    const mk = (color = 'url(#pipeGrad)') => {
      const p = h('path', { fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round' });
      const f = h('path', { fill: 'none', stroke: '#fff', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': '2 22', opacity: 0 });
      svg.append(p, f);
      return { p, f };
    };
    svg.appendChild(h('defs', {}, [h('linearGradient', { id: 'pipeGrad', x1: 0, x2: 1, y1: 0, y2: 0 }, [h('stop', { offset: 0, 'stop-color': '#3ee6c1' }), h('stop', { offset: 1, 'stop-color': '#ff459a' })])]));
    srcs.forEach(([, x, y]) => V.edges.push({ ...mk(), d: `M${x + 92},${y + 53} C${x + 150},${y + 53} ${200},${312} 270,312`, len: 260 }));
    V.edges.push({ ...mk('#ff459a'), d: 'M490,312 L545,312', len: 60 });
    V.edges.push({ ...mk('#ff459a'), d: 'M765,312 L820,312', len: 60 });

    // run bar
    V.run = h('div', { class: 'abs', style: { left: '270px', top: '420px', width: '770px', height: '64px', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: '18px', padding: '0 22px', fontSize: '21px', color: '#c9cde6' } }, [
      V.runDot = h('div', { style: { width: '14px', height: '14px', borderRadius: '50%', background: '#fbbf24' } }),
      V.runText = h('span', { style: { fontWeight: 700, color: '#fff' }, text: 'Run #128 · running' }),
      h('span', { style: { marginLeft: 'auto' }, class: 'mono', text: '52 weeks · 1,480 org units' }),
    ]);
    V.run.style.width = '740px';
    b.appendChild(V.run);

    // code panel (Python)
    V.code = h('div', { class: 'abs card', style: { left: '26px', top: '366px', width: '992px', height: '290px', padding: '26px 30px', background: 'rgba(12,16,38,0.98)' } });
    const codeLines = [
      ['<span class="k">from</span> openhexa.sdk <span class="k">import</span> pipeline, workspace', 0],
      ['', 0],
      ['<span class="d">@pipeline</span>(<span class="s">"dhis2-extractor"</span>)', 0],
      ['<span class="k">def</span> <span class="f">dhis2_extractor</span>():', 0],
      ['    cases = <span class="f">extract</span>(period=<span class="s">"LAST_52_WEEKS"</span>)', 0],
      ['    <span class="f">load</span>(<span class="f">clean</span>(cases), <span class="s">"malaria_cases_weekly"</span>)', 0],
    ];
    V.codeLines = codeLines.map(([html]) => {
      const ln = h('div', { class: 'code', html: html || '&nbsp;' });
      V.code.appendChild(ln);
      return ln;
    });
    V.codeTab = h('div', { class: 'badge gray abs', style: { left: '820px', top: '20px', fontSize: '16px' } }, [UI.svgIcon('code', 18, '#c9cde6', 2), 'pipeline.py']);
    V.code.appendChild(V.codeTab);
    b.appendChild(V.code);

    // AI assistant panel
    V.ai = h('div', { class: 'abs card', style: { left: '560px', top: '118px', width: '460px', height: '310px', padding: '22px 24px', background: 'linear-gradient(180deg, rgba(58,40,98,0.98), rgba(34,30,78,0.98))', borderColor: 'rgba(255,69,154,0.45)', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8), 0 0 60px -10px rgba(255,69,154,0.35)' } }, [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', color: '#ff8cc0', fontWeight: 800, fontSize: '18px', letterSpacing: '0.12em' } }, [UI.svgIcon('spark', 22, '#ff8cc0'), 'AI ASSISTANT']),
      h('div', { style: { marginTop: '18px', padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', fontSize: '22px', lineHeight: 1.4, minHeight: '96px', color: '#fff' } }, [V.aiText = h('span'), V.aiCaret = h('span', { class: 'caret' })]),
      V.aiGen = h('div', { style: { marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '19px', color: '#c9cde6' } }, [
        V.aiSpin = h('div', { style: { width: '22px', height: '22px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.18)', borderTopColor: '#ff459a' } }),
        'Writing pipeline code…',
      ]),
      V.aiBar1 = h('div', { style: { marginTop: '14px', height: '10px', borderRadius: '6px', background: 'linear-gradient(90deg, rgba(255,69,154,0.5), rgba(123,134,255,0.5))' } }),
    ]);
    b.appendChild(V.ai);

    sec.right = win.el;
  }

  // ---------- MANAGE visual ----------
  function buildManage(sec) {
    const win = UI.windowCard('app.openhexa.org / workspaces / national-malaria', { w: RIGHT.w, h: RIGHT.h });
    win.el.classList.add('abs');
    const b = win.body;
    const V = (sec.v = {});
    const side = h('div', { class: 'side', style: { top: 0 } }, [
      h('div', { class: 'ws' }, [h('div', { class: 'av', text: 'NM' }), 'National malaria']),
      ...['Home', 'Connections', 'Pipelines', 'Datasets', 'Notebooks', 'Database', 'Web apps'].map((n) => h('div', { class: 'it' + (n === 'Datasets' ? ' on' : ''), text: n })),
    ]);
    b.appendChild(side);
    const mainX = 300;
    b.appendChild(h('div', { class: 'abs', style: { left: mainX + 'px', top: '30px', fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em' }, text: 'Workspace data' }));
    V.lock = h('div', { class: 'badge green abs', style: { left: '640px', top: '33px', fontSize: '17px' } }, [UI.svgIcon('lock', 18, '#6ee7a0', 2.2), 'Access controlled']);
    b.appendChild(V.lock);

    const res = [
      ['db', 'Database', 'PostgreSQL · 14 tables', '2.3M rows', '#7b86ff'],
      ['table', 'Dataset', 'malaria_cases_weekly', 'v12 · latest', '#ff459a'],
      ['file', 'Files', 'district_boundaries.geojson', '12.4 MB', '#3ee6c1'],
    ];
    V.res = res.map(([ic, kind, name, meta, col], i) => {
      const el = h('div', { class: 'abs', style: { left: mainX + 'px', top: 100 + i * 118 + 'px', width: '700px', height: '100px', borderRadius: '16px', background: 'rgba(16,21,47,0.6)', border: '1.5px solid rgba(255,255,255,0.13)', display: 'flex', alignItems: 'center', gap: '20px', padding: '0 24px' } }, [
        h('div', { style: { width: '56px', height: '56px', borderRadius: '14px', background: col + '26', border: `1.5px solid ${col}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [UI.svgIcon(ic, 30, col, 2)]),
        h('div', {}, [
          h('div', { style: { fontSize: '15px', fontWeight: 700, letterSpacing: '0.12em', color: '#8d93b8', textTransform: 'uppercase' }, text: kind }),
          h('div', { class: 'mono', style: { fontSize: '23px', color: '#fff', marginTop: '4px' }, text: name }),
        ]),
        h('div', { class: 'badge gray', style: { marginLeft: 'auto' }, text: meta }),
      ]);
      b.appendChild(el);
      return el;
    });

    // Members / access panel
    V.members = h('div', { class: 'abs', style: { left: mainX + 'px', top: '466px', width: '700px', height: '180px', borderRadius: '16px', background: 'rgba(16,21,47,0.6)', border: '1.5px solid rgba(255,255,255,0.13)', padding: '18px 24px' } }, [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 700, letterSpacing: '0.12em', color: '#8d93b8' } }, [UI.svgIcon('users', 20, '#8d93b8', 2), 'MEMBERS & PERMISSIONS']),
    ]);
    const members = [['AK', 'Aminata K.', 'Admin', '#ff459a'], ['JM', 'Jean M.', 'Editor', '#7b86ff'], ['PT', 'Program team', 'Viewer', '#3ee6c1']];
    V.memberRows = members.map(([ini, name, role, col], i) => {
      const row = h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', fontSize: '21px' } }, [
        h('div', { style: { width: '32px', height: '32px', borderRadius: '50%', background: col, color: '#10152f', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }, text: ini }),
        h('span', { style: { fontWeight: 600 }, text: name }),
        h('span', { class: 'badge gray', style: { marginLeft: 'auto', fontSize: '15px', padding: '3px 12px' }, text: role }),
      ]);
      V.members.appendChild(row);
      return row;
    });
    b.appendChild(V.members);

    // Second workspace (sharing target) — sits outside the window, bottom-left overlap
    V.ws2 = h('div', { class: 'card abs', style: { width: '470px', height: '210px', padding: '22px 26px', borderColor: 'rgba(62,230,193,0.45)', background: 'linear-gradient(180deg, rgba(30,60,80,0.97), rgba(22,40,66,0.97))' } }, [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 800, letterSpacing: '0.12em', color: '#7ff0d6' } }, [h('div', { style: { width: '12px', height: '14px', background: '#3ee6c1', clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' } }), 'WORKSPACE · MINISTRY OF HEALTH']),
      V.ws2Row = h('div', { style: { marginTop: '18px', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1.5px dashed rgba(255,255,255,0.25)' } }, [
        UI.svgIcon('table', 26, '#ff8cc0', 2),
        h('span', { class: 'mono', style: { fontSize: '20px' }, text: 'malaria_cases_weekly' }),
      ]),
      V.ws2Badge = h('div', { class: 'badge green', style: { marginTop: '16px', fontSize: '16px' } }, [UI.svgIcon('link', 18, '#6ee7a0', 2.2), 'Shared · read-only · no copies']),
    ]);
    V.linkSvg = h('svg', { width: 1920, height: 1080, class: 'abs', style: { overflow: 'visible', pointerEvents: 'none' } }, [
      V.link = h('path', { fill: 'none', stroke: '#ff459a', 'stroke-width': 3.5, 'stroke-dasharray': '10 10', 'stroke-linecap': 'round' }),
    ]);
    V.traveler = h('div', { class: 'abs', style: { width: '48px', height: '54px' }, html: `<svg width="48" height="54" viewBox="0 0 48 54"><path d="${E.hexPath(48, 54, 0.14)}" fill="#ff459a"/></svg>` });
    const ic = UI.svgIcon('table', 24, '#fff', 2.2);
    Object.assign(ic.style, { position: 'absolute', left: '12px', top: '15px' });
    V.traveler.appendChild(ic);

    sec.right = win.el;
    sec.extra = [V.linkSvg, V.ws2, V.traveler];
  }

  // ---------- PUBLISH visual ----------
  function series() {
    const pts = [];
    for (let i = 0; i < 80; i++) {
      const a = 1150 * Math.exp(-Math.pow((i - 22) / 6.5, 2)) + 360 * Math.exp(-Math.pow((i - 58) / 5, 2)) + 60 + 30 * Math.sin(i * 1.7) + 20 * Math.sin(i * 0.9);
      pts.push(a);
    }
    return pts;
  }
  function buildPublish(sec) {
    const win = UI.windowCard('app.openhexa.org / webapps / dengue-incidence', { w: RIGHT.w, h: RIGHT.h });
    win.el.classList.add('abs');
    const b = win.body;
    const V = (sec.v = {});
    V.live = h('div', { class: 'badge green abs', style: { left: '880px', top: '-42px', fontSize: '16px', padding: '4px 14px' } }, [h('span', { style: { width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' } }), 'Published']);
    b.appendChild(V.live);
    b.appendChild(h('div', { class: 'abs', style: { left: '36px', top: '26px' } }, [
      h('div', { style: { fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em' }, text: 'Dengue incidence dashboard' }),
      h('div', { style: { fontSize: '19px', color: '#8d93b8', marginTop: '4px' }, text: 'Weekly incidence per 100k · Lao PDR' }),
    ]));
    const kpis = [['Total cases', 18057, ''], ['Avg. incidence /100k', 14.9, ''], ['Peak week', 'W29', ''], ['Districts reporting', 122, '']];
    V.kpis = kpis.map(([label, val], i) => {
      const num = h('div', { style: { fontSize: '38px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' } });
      const el = h('div', { class: 'abs', style: { left: 36 + i * 246 + 'px', top: '112px', width: '230px', height: '112px', borderRadius: '14px', background: 'rgba(16,21,47,0.6)', border: '1.5px solid rgba(255,255,255,0.12)', padding: '16px 20px' } }, [
        num, h('div', { style: { fontSize: '16px', color: '#8d93b8', marginTop: '6px', fontWeight: 600 }, text: label }),
      ]);
      b.appendChild(el);
      return { el, num, val };
    });
    // chart
    const cw = 560, ch = 360;
    V.chartBox = h('div', { class: 'abs', style: { left: '36px', top: '246px', width: cw + 'px', height: ch + 'px', borderRadius: '14px', background: 'rgba(16,21,47,0.6)', border: '1.5px solid rgba(255,255,255,0.12)' } });
    V.chartBox.appendChild(h('div', { class: 'abs', style: { left: '20px', top: '16px', fontSize: '18px', fontWeight: 700 }, text: 'Weekly trend' }));
    const data = series();
    const max = 1300;
    const px = (i) => 24 + (i / (data.length - 1)) * (cw - 48);
    const py = (v) => ch - 30 - (v / max) * (ch - 90);
    let d = '';
    data.forEach((v, i) => (d += (i ? 'L' : 'M') + px(i).toFixed(1) + ',' + py(v).toFixed(1)));
    const area = d + `L${px(data.length - 1)},${ch - 30} L${px(0)},${ch - 30}Z`;
    const grid = [0, 1, 2, 3].map((k) => `<line x1="24" x2="${cw - 24}" y1="${py(k * 400)}" y2="${py(k * 400)}" stroke="rgba(255,255,255,0.07)" stroke-width="1.5"/>`).join('');
    V.chartSvg = h('svg', { width: cw, height: ch, class: 'abs', html: `<defs><linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff459a" stop-opacity="0.45"/><stop offset="1" stop-color="#ff459a" stop-opacity="0"/></linearGradient><clipPath id="chartClip"><rect id="chartClipRect" x="0" y="0" width="0" height="${ch}"/></clipPath></defs>${grid}<g clip-path="url(#chartClip)"><path d="${area}" fill="url(#areaG)"/><path d="${d}" fill="none" stroke="#ff459a" stroke-width="3.5" stroke-linejoin="round"/></g>` });
    V.chartBox.appendChild(V.chartSvg);
    b.appendChild(V.chartBox);
    V.chartW = cw;

    // hex map
    const mx = 614, my = 246, mw = 394, mh = 360;
    V.mapBox = h('div', { class: 'abs', style: { left: mx + 'px', top: my + 'px', width: mw + 'px', height: mh + 'px', borderRadius: '14px', background: 'rgba(16,21,47,0.6)', border: '1.5px solid rgba(255,255,255,0.12)' } });
    V.mapBox.appendChild(h('div', { class: 'abs', style: { left: '20px', top: '16px', fontSize: '18px', fontWeight: 700 }, text: 'Incidence by district' }));
    const mapSvg = h('svg', { width: mw, height: mh, class: 'abs' });
    V.hexes = [];
    const r = 13, hw = Math.sqrt(3) * r;
    // Blob shaped like a tall, narrow country (union of ellipses)
    const blobs = [[150, 110, 70, 55], [215, 175, 70, 60], [255, 245, 60, 70], [300, 300, 45, 40], [120, 150, 50, 45]];
    const inside = (x, y) => blobs.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
    const rnd = E.rand(5);
    for (let row = 0; row < 24; row++) {
      for (let col = 0; col < 18; col++) {
        const x = 30 + col * hw + (row % 2) * hw / 2, y = 60 + row * r * 1.5;
        if (!inside(x, y)) continue;
        const v = clamp(0.25 + 0.75 * Math.exp(-(((x - 230) / 90) ** 2 + ((y - 210) / 80) ** 2)) + (rnd() - 0.5) * 0.25);
        const col1 = [255, 69, 154], col0 = [60, 70, 140];
        const c = col0.map((c0, k) => Math.round(lerp(c0, col1[k], v)));
        const p = h('path', { d: E.hexPath(hw * 0.9, r * 2 * 0.9, 0.18), transform: `translate(${(x - hw * 0.45).toFixed(1)},${(y - r * 0.9).toFixed(1)})`, fill: `rgb(${c.join(',')})` });
        mapSvg.appendChild(p);
        V.hexes.push({ p, d: Math.hypot(x - 150, y - 90) });
      }
    }
    V.mapBox.appendChild(mapSvg);
    b.appendChild(V.mapBox);

    // report card (front)
    V.report = h('div', { class: 'card light abs', style: { width: '420px', height: '200px', padding: '24px 26px' } }, [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px' } }, [
        h('div', { style: { width: '52px', height: '60px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }, text: 'PDF' }),
        h('div', {}, [
          h('div', { style: { fontSize: '23px', fontWeight: 800, color: '#111827' }, text: 'Weekly malaria bulletin' }),
          h('div', { style: { fontSize: '17px', color: '#6b7280', marginTop: '3px' }, text: 'Automated report · 12 pages' }),
        ]),
      ]),
      h('div', { style: { display: 'flex', gap: '10px', marginTop: '22px' } }, [
        h('div', { class: 'badge', style: { background: '#eef2ff', color: '#4338ca', fontSize: '16px' } }, [UI.svgIcon('clock', 18, '#4338ca', 2.2), 'Mondays 08:00']),
        h('div', { class: 'badge', style: { background: '#fdf2f8', color: '#db2777', fontSize: '16px' } }, [UI.svgIcon('send', 18, '#db2777', 2.2), '48 recipients']),
      ]),
    ]);

    // prompt bar
    V.prompt = h('div', { class: 'abs', style: { width: '760px', height: '84px', borderRadius: '999px', background: 'rgba(22,26,58,0.97)', border: '2px solid rgba(255,69,154,0.6)', boxShadow: '0 25px 60px -10px rgba(0,0,0,0.7), 0 0 50px -8px rgba(255,69,154,0.45)', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 14px 0 28px', fontSize: '25px' } }, [
      UI.svgIcon('spark', 30, '#ff8cc0'),
      h('span', { style: { color: '#fff', whiteSpace: 'nowrap' } }, [V.promptText = h('span'), V.promptCaret = h('span', { class: 'caret' })]),
      V.promptBtn = h('div', { class: 'btn-primary', style: { marginLeft: 'auto', height: '56px', padding: '0 28px', fontSize: '22px' }, text: 'Build' }),
    ]);

    sec.right = win.el;
    sec.extra = [V.report, V.prompt];
  }

  E.scene({
    name: 'product',
    from: S.integrate - 0.05,
    to: S.trust + 0.7,
    build(root) {
      const cam = h('div', { class: 'cam' });
      root.appendChild(cam);
      R.cam = cam;

      // nav
      const nav = window.NAV_LOGO;
      R.nav = h('div', { class: 'abs' });
      const mark = UI.logoMark(nav.mark, 'nv');
      const word = UI.wordmark(nav.word);
      const mw = h('div', { class: 'abs' }, [mark.el]);
      const ww = h('div', { class: 'abs' }, [word.el]);
      set(mw, { x: nav.x, y: nav.y });
      set(ww, { x: nav.x + nav.mark * (42.4 / 48) + nav.gap, y: nav.y + (nav.mark - nav.word) / 2 });
      R.nav.append(mw, ww);
      R.navLinks = h('div', { class: 'abs', style: { display: 'flex', gap: '40px', fontSize: '21px', fontWeight: 500, color: '#c9cde6' } }, ['Product', 'Solutions', 'AI', 'Open source', 'Pricing', 'Docs'].map((n) => h('span', { text: n })));
      R.navCta = h('div', { class: 'btn-primary abs', style: { height: '56px', padding: '0 30px', fontSize: '21px' }, text: 'Start free' });
      R.navLine = h('div', { class: 'abs', style: { width: '1920px', height: '1.5px', background: 'rgba(255,255,255,0.09)' } });
      cam.append(R.navLine, R.nav, R.navLinks, R.navCta);

      // tabs
      R.tabs = h('div', { class: 'tabs' });
      R.tabActive = h('div', { class: 'tab-active-bg' });
      R.tabs.appendChild(R.tabActive);
      R.tabEls = ['Integrate', 'Manage', 'Publish'].map((n, i) => {
        const tab = h('div', { class: 'tab' }, [UI.numHex(i + 1), h('span', { text: n.toUpperCase() })]);
        R.tabs.appendChild(tab);
        return tab;
      });
      cam.appendChild(R.tabs);

      // sections
      const s0 = { ...SECTIONS[0] }, s1 = { ...SECTIONS[1] }, s2 = { ...SECTIONS[2] };
      cam.appendChild(sectionLeft(s0, 'Integrate', [["Connect", "anything."], [["Automate", 'pink'], ["everything.", 'pink']]], [
        ['Ready-made pipeline <b>templates</b>', 'template'], ['Custom pipelines in <b>Python</b>', 'code'], ['A built-in <b>AI assistant</b>', 'spark'],
      ]));
      buildIntegrate(s0);
      cam.appendChild(s0.right);

      cam.appendChild(sectionLeft(s1, 'Manage', [["One", "secure"], [["workspace.", 'pink']]], [
        ['Databases, datasets & files', 'db'], ['Access control built in', 'shield'], ['Share across organizations', 'link'],
      ]));
      buildManage(s1);
      cam.appendChild(s1.right);
      s1.extra.forEach((x) => cam.appendChild(x));

      cam.appendChild(sectionLeft(s2, 'Publish', [["Dashboards,", "reports"], ["and", ["web", 'pink'], ["apps.", 'pink']]], [
        ['Interactive <b>dashboards</b>', 'chart'], ['Scheduled <b>reports</b>', 'doc'], ['<b>Web apps</b> your teams open', 'globe'],
      ]));
      buildPublish(s2);
      cam.appendChild(s2.right);
      s2.extra.forEach((x) => cam.appendChild(x));
      R.secs = [s0, s1, s2];
    },

    update(t) {
      const t0 = S.integrate;
      // The trust scene wipes over us; hold the camera steady but keep a slow drift.
      set(R.cam, { s: 1 + (t - t0) * 0.0012 });

      // nav appears exactly when the flying logo lands
      const navIn = t >= t0 + 0.55 ? 1 : 0;
      set(R.nav, { o: navIn });
      const nl = prog(t, t0 + 0.3, 0.7, ease.outCubic);
      set(R.navLinks, { x: 520, y: 56 + (1 - nl) * -20, o: nl });
      set(R.navCta, { x: 1664, y: 41 + (1 - nl) * -20, o: nl });
      set(R.navLine, { x: 0, y: 128, o: nl, sx: nl });

      // tabs
      const tp = prog(t, t0 + 0.15, 0.8, ease.outQuart);
      set(R.tabs, { x: 96, y: 162 + (1 - tp) * 30, o: tp });
      R.tabs.style.left = '0px';
      R.tabs.style.top = '0px';
      const tabIdx = t < S.manage - 0.15 ? 0 : t < S.publish - 0.15 ? 1 : 2;
      const m1 = prog(t, S.manage - 0.25, 0.55, ease.inOutCubic), m2 = prog(t, S.publish - 0.25, 0.55, ease.inOutCubic);
      const ax = (m1 + m2) * 316;
      set(R.tabActive, { x: ax });
      R.tabEls.forEach((tab, i) => E.css(tab, 'color', i === tabIdx ? '#ffffff' : '#8d93b8'));
      // tabs sit left; shift to align with the left column — make them compact
      R.tabs.style.transformOrigin = '0 0';

      R.secs.forEach((sec, si) => this.updateSection(sec, si, t));
    },

    updateSection(sec, si, t) {
      const inT = sec.start + (si === 0 ? 0.35 : 0.1);
      const outT = sec.end - 0.35;
      const pin = prog(t, inT, 0.8, ease.outQuart);
      const pout = si === 2 ? 0 : prog(t, outT, 0.45, ease.inCubic);
      const visible = t > sec.start - 0.5 && t < sec.end + 0.6;
      E.show(sec.left, visible);
      E.show(sec.right, visible);
      (sec.extra || []).forEach((x) => E.show(x, visible));
      if (!visible) return;

      // left column
      set(sec.kicker, { x: 96 + (1 - pin) * 30 - pout * 60, y: 290, o: pin * (1 - pout) });
      set(sec.left, { x: -pout * 80, o: 1 - pout, blur: pout * 6 });
      const hlTimes = {
        0: [at('v05', 'connect'), at('v05', 'connect') + 0.2, at('v05', 'automate'), at('v05', 'automate') + 0.2],
        1: [sec.start + 0.25, sec.start + 0.37, sec.start + 0.55],
        2: [sec.start + 0.25, sec.start + 0.4, at('v07', 'reports') - 0.9, at('v07', 'webapps') - 0.5, at('v07', 'webapps') - 0.35],
      }[si];
      E.revealWords(sec.hl.words, t, hlTimes, 0.6);
      const bTimes = {
        0: [at('v05', 'templates') - 0.2, at('v05', 'python') - 0.2, at('v05', 'ai') - 0.2],
        1: [at('v06', 'database') - 0.1, at('v06', 'secure') - 0.2, at('v06', 'shared') - 0.2],
        2: [at('v07', 'dashboards') - 0.2, at('v07', 'reports') - 0.2, at('v07', 'webapps') - 0.2],
      }[si];
      sec.bullets.forEach((b, i) => {
        const p = prog(t, bTimes[i], 0.6, ease.outQuart);
        set(b, { x: 96 + (1 - p) * -30, y: 560 + i * 86, o: p, blur: (1 - p) * 6 });
      });

      // right visual container
      const rx = RIGHT.x + (1 - pin) * 220 - pout * 160;
      set(sec.right, { x: rx, y: RIGHT.y, o: clamp(pin * 1.4) * (1 - pout), blur: (1 - pin) * 14 + pout * 10, r: (1 - pin) * 2.5 });
      const V = sec.v;
      const extraAlpha = clamp(pin * 1.4) * (1 - pout);
      const base = { x: rx, y: RIGHT.y };

      if (si === 0) this.updIntegrate(V, t, base);
      if (si === 1) this.updManage(V, t, base, extraAlpha);
      if (si === 2) this.updPublish(V, t, base, extraAlpha);
    },

    updIntegrate(V, t) {
      // sources pop
      V.srcs.forEach((s, i) => {
        const p = prog(t, at('v05', 'sources') - 0.2 + i * 0.12, 0.6, ease.outBack);
        set(s.el, { x: s.x, y: s.y, s: p, o: clamp(p * 2) });
      });
      // edges draw on "automate pipelines"
      V.edges.forEach((e, i) => {
        const et = i < 3 ? at('v05', 'sources') + 0.2 + i * 0.1 : at('v05', 'pipelines') + (i - 3) * 0.35;
        const p = prog(t, et, 0.6, ease.inOutCubic);
        E.attr(e.p, 'd', e.d); E.attr(e.f, 'd', e.d);
        E.attr(e.p, 'stroke-dasharray', `${(e.len * 1.6 * p).toFixed(1)} 2000`);
        E.attr(e.f, 'opacity', p >= 1 ? 0.7 : 0);
        E.attr(e.f, 'stroke-dashoffset', (-t * 90).toFixed(1));
      });
      // nodes appear, then run: spinner → check sequentially
      V.nodes.forEach((n, i) => {
        const p = prog(t, at('v05', 'automate') - 0.2 + i * 0.2, 0.6, ease.outBack);
        set(n.el, { x: n.x, y: n.y, s: 0.7 + 0.3 * p, o: clamp(p * 2) });
        const done = at('v05', 'pipelines') + 0.9 + i * 0.55;
        const running = t > done - 0.9;
        n.status.style.opacity = running && t < done ? '1' : '0';
        n.status.style.transform = `rotate(${(t * 400) % 360}deg)`;
        const cp = prog(t, done, 0.35, ease.outBack);
        set(n.check, { s: cp, o: clamp(cp * 3) });
        E.css(n.el, 'border-color', t >= done ? 'rgba(34,197,94,0.55)' : running ? 'rgba(255,69,154,0.6)' : 'rgba(255,255,255,0.16)');
      });
      const runP = prog(t, at('v05', 'pipelines') + 0.2, 0.5, ease.outCubic);
      set(V.run, { y: (1 - runP) * 16, o: runP });
      const allDone = t >= at('v05', 'pipelines') + 0.9 + 2 * 0.55;
      E.text(V.runText, allDone ? 'Run #128 · succeeded in 42s' : 'Run #128 · running…');
      E.css(V.runDot, 'background', allDone ? '#22c55e' : '#fbbf24');
      const sp = prog(t, at('v05', 'automate') + 0.1, 0.5, ease.outBack);
      set(V.sched, { s: sp, o: clamp(sp * 2) });
      const tp = prog(t, at('v05', 'templates') - 0.15, 0.55, ease.outBack);
      set(V.tpl, { s: tp, o: clamp(tp * 2) });
      // code panel on "Python"
      const cp = prog(t, at('v05', 'python') - 0.35, 0.6, ease.outQuart);
      set(V.code, { y: (1 - cp) * 60, o: cp, blur: (1 - cp) * 6 });
      V.codeLines.forEach((ln, i) => {
        const lp = prog(t, at('v05', 'python') - 0.1 + i * 0.16, 0.3, ease.outCubic);
        set(ln, { x: (1 - lp) * 14, o: lp });
      });
      // AI assistant on "AI assistant"
      const ap = prog(t, at('v05', 'ai') - 0.45, 0.6, ease.outBack);
      set(V.ai, { s: 0.85 + 0.15 * ap, o: clamp(ap * 2), y: (1 - ap) * 20 });
      V.ai.style.transformOrigin = '100% 0%';
      const tp2 = typeText(V.aiText, 'Pull weekly malaria cases from DHIS2 into our database', t, at('v05', 'ai') - 0.15, 55, V.aiCaret);
      const gp = prog(t, at('v05', 'ai') - 0.15 + 1.05, 0.3);
      V.aiGen.style.opacity = gp.toFixed(3);
      V.aiSpin.style.transform = `rotate(${(t * 400) % 360}deg)`;
      const bw = prog(t, at('v05', 'ai') + 1.0, 1.2, ease.outCubic);
      E.css(V.aiBar1, 'width', (bw * 100).toFixed(1) + '%');
    },

    updManage(V, t, base, alpha) {
      const resT = [at('v06', 'database'), at('v06', 'dataset'), at('v06', 'file')];
      V.res.forEach((el, i) => {
        const p = prog(t, resT[i] - 0.25, 0.6, ease.outBack);
        set(el, { x: (1 - p) * 40, s: 0.94 + 0.06 * p, o: clamp(p * 2) });
      });
      const mp = prog(t, at('v06', 'secure') - 0.3, 0.6, ease.outQuart);
      set(V.members, { y: (1 - mp) * 30, o: mp });
      V.memberRows.forEach((r, i) => {
        const p = prog(t, at('v06', 'secure') - 0.1 + i * 0.12, 0.45, ease.outCubic);
        set(r, { x: (1 - p) * 20, o: p });
      });
      const lp = prog(t, at('v06', 'secure') - 0.1, 0.5, ease.outBack);
      set(V.lock, { s: lp, o: clamp(lp * 2) });
      // sharing
      const sp = prog(t, at('v06', 'shared') - 0.55, 0.7, ease.outQuart);
      const wx = base.x - 330, wy = base.y + 560;
      set(V.ws2, { x: wx - (1 - sp) * 60, y: wy + (1 - sp) * 40, o: sp * alpha, r: (1 - sp) * -3 });
      // link from dataset card to ws2 row
      const a = [base.x + 300 + 30, base.y + 54 + 118 + 150];
      const b = [wx + 470 / 2 + 60, wy + 70];
      const c = [a[0] - 180, b[1] - 40];
      const lk = prog(t, at('v06', 'shared') - 0.1, 0.6, ease.inOutCubic);
      E.attr(V.link, 'd', `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`);
      E.attr(V.link, 'stroke-dasharray', lk > 0 ? '10 10' : '0 10000');
      E.attr(V.link, 'stroke-dashoffset', (-t * 40).toFixed(1));
      V.linkSvg.style.opacity = (lk > 0 ? Math.min(1, lk * 3) * alpha : 0).toFixed(3);
      // clip the link growth using a mask-less trick: interpolate the end point
      const q = lk;
      const e = [lerp(lerp(a[0], c[0], q), lerp(c[0], b[0], q), q), lerp(lerp(a[1], c[1], q), lerp(c[1], b[1], q), q)];
      const q0 = [lerp(a[0], c[0], q), lerp(a[1], c[1], q)];
      E.attr(V.link, 'd', `M${a[0]},${a[1]} Q${q0[0].toFixed(1)},${q0[1].toFixed(1)} ${e[0].toFixed(1)},${e[1].toFixed(1)}`);
      // traveler hex along the path
      const tv = prog(t, at('v06', 'shared') + 0.1, 0.8, ease.inOutCubic);
      const tx = (1 - tv) * (1 - tv) * a[0] + 2 * (1 - tv) * tv * c[0] + tv * tv * b[0];
      const ty = (1 - tv) * (1 - tv) * a[1] + 2 * (1 - tv) * tv * c[1] + tv * tv * b[1];
      set(V.traveler, { x: tx - 24, y: ty - 27, o: tv > 0 && tv < 1 ? alpha : 0, s: 1 + Math.sin(tv * Math.PI) * 0.2 });
      const arrive = prog(t, at('v06', 'shared') + 0.85, 0.35, ease.outBack);
      E.css(V.ws2Row, 'border', arrive > 0 ? '1.5px solid rgba(255,69,154,0.7)' : '1.5px dashed rgba(255,255,255,0.25)');
      E.css(V.ws2Row, 'background', arrive > 0 ? `rgba(255,69,154,${(0.12 + 0.2 * (1 - arrive)).toFixed(3)})` : 'rgba(0,0,0,0.2)');
      set(V.ws2Badge, { s: 0.9 + 0.1 * arrive, o: arrive });
    },

    updPublish(V, t, base, alpha) {
      const dT = at('v07', 'dashboards');
      V.kpis.forEach((k, i) => {
        const p = prog(t, dT - 0.3 + i * 0.1, 0.5, ease.outBack);
        set(k.el, { s: 0.9 + 0.1 * p, o: clamp(p * 2) });
        const c = prog(t, dT - 0.2 + i * 0.1, 1.3, ease.outCubic);
        if (typeof k.val === 'number') E.text(k.num, k.val % 1 ? (k.val * c).toFixed(1) : fmt(k.val * c));
        else E.text(k.num, c > 0.3 ? k.val : '—');
      });
      const cb = prog(t, dT - 0.1, 0.5, ease.outCubic);
      set(V.chartBox, { o: cb, y: (1 - cb) * 20 });
      const draw = prog(t, dT + 0.1, 1.6, ease.inOutCubic);
      const rect = V.chartSvg.querySelector('#chartClipRect');
      E.attr(rect, 'width', (V.chartW * draw).toFixed(1));
      const mb = prog(t, dT + 0.1, 0.5, ease.outCubic);
      set(V.mapBox, { o: mb, y: (1 - mb) * 20 });
      // map hexes are "built by the prompt"
      const mapT = at('v07', 'prompt') + 0.9;
      V.hexes.forEach((hx) => {
        const p = prog(t, mapT + hx.d * 0.0035, 0.35, ease.outBack);
        hx.p.style.opacity = clamp(p * 1.5).toFixed(3);
        hx.p.style.transformBox = 'fill-box';
      });
      const live = prog(t, at('v07', 'webapps') - 0.1, 0.45, ease.outBack);
      set(V.live, { s: live, o: clamp(live * 2) });
      // report card on "reports"
      const rp = prog(t, at('v07', 'reports') - 0.35, 0.7, ease.outBack);
      set(V.report, { x: base.x - 250 + (1 - rp) * -40, y: base.y + 520 + (1 - rp) * 60, r: -3 * rp, o: clamp(rp * 2) * alpha });
      // prompt bar on "with just a prompt"
      const pp = prog(t, at('v07', 'just') - 0.55, 0.6, ease.outBack);
      set(V.prompt, { x: base.x + 250, y: base.y + 640 + (1 - pp) * 50, o: clamp(pp * 2) * alpha, s: 0.9 + 0.1 * pp });
      typeText(V.promptText, 'Add a district map colored by incidence', t, at('v07', 'just') - 0.25, 34, V.promptCaret);
      const press = Math.max(0, 1 - Math.abs(t - (mapT - 0.15)) / 0.12);
      set(V.promptBtn, { s: 1 - press * 0.08 });
      E.css(V.promptBtn, 'box-shadow', press > 0 ? `0 0 0 ${(8 * press).toFixed(1)}px rgba(255,69,154,0.35)` : 'none');
    },
  });
})();
