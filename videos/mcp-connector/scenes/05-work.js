// Scene 5 — "Then it gets real work done. Exploring datasets, building pipelines, publishing
// web apps. Every call is logged, and every result is code you can read."
// Tool names are the OpenHEXA MCP server's own (backend/hexa/mcp/tools).
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const W = window.WORK_CUES;
  const R = {};

  const CHAT = { x: 96, y: 128, w: 720, h: 840 };
  const PROMPT = 'Build a weekly malaria dashboard for Burkina Faso.';
  const CALLS = [
    ['list_datasets', 'malaria-burkina-faso'],
    ['preview_dataset_file', 'cases_weekly.csv'],
    ['create_pipeline', 'weekly-malaria-indicators'],
    ['run_pipeline', 'weekly-malaria-indicators'],
    ['create_static_webapp', 'malaria-dashboard'],
  ];
  const LOG = [
    ['10:42:03', 'list_datasets', true],
    ['10:42:05', 'preview_dataset_file', true],
    ['10:42:09', 'create_pipeline', true],
    ['10:42:12', 'run_pipeline', true],
    ['10:42:20', 'create_static_webapp', true],
    ['10:42:31', 'update_workspace', false],
  ];
  const CODE = [
    '<span class="k">from</span> openhexa.sdk <span class="k">import</span> current_run, pipeline, workspace',
    '<span class="k">import</span> polars <span class="k">as</span> pl',
    '',
    '<span class="d">@pipeline</span>(<span class="s">"weekly-malaria-indicators"</span>)',
    '<span class="k">def</span> <span class="f">weekly_malaria_indicators</span>():',
    '    cases = pl.<span class="f">read_csv</span>(<span class="s">f"{workspace.files_path}/cases_weekly.csv"</span>)',
    '    weekly = cases.<span class="f">group_by</span>(<span class="s">"district"</span>, <span class="s">"week"</span>).<span class="f">agg</span>(pl.<span class="f">col</span>(<span class="s">"cases"</span>).<span class="f">sum</span>())',
    '    weekly.<span class="f">write_parquet</span>(<span class="s">f"{workspace.files_path}/indicators.parquet"</span>)',
    '    current_run.<span class="f">log_info</span>(<span class="s">f"{weekly.height} rows written"</span>)',
  ];

  function statusDot() {
    const spin = h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.18)', borderTopColor: '#ff459a' } });
    const ok = h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [UI.svgIcon('check', 16, '#fff', 3.2)]);
    const no = h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', background: '#f25767', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [UI.svgIcon('x', 16, '#fff', 3.2)]);
    const el = h('div', { style: { position: 'relative', width: '26px', height: '26px', flex: 'none' } }, [spin, ok, no]);
    return { el, spin, ok, no };
  }

  E.scene({
    name: 'work',
    from: S.work - 0.3,
    to: S.control + 0.3,
    build(root) {
      const cam = (R.cam = h('div', { class: 'cam' }));
      root.appendChild(cam);

      // ---- chat ----
      R.chat = h('div', { class: 'card abs', style: { width: CHAT.w + 'px', height: CHAT.h + 'px' } }, [
        h('div', { class: 'chrome' }, [
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '21px', color: '#fff' } }, [UI.svgIcon('spark', 26, '#ff8a5c'), 'Claude']),
          h('div', { class: 'badge green', style: { marginLeft: 'auto', fontSize: '15px' } }, [UI.svgIcon('plug', 16, '#6ee7a0', 2.2), 'OpenHEXA · 2 workspaces']),
        ]),
      ]);
      const body = h('div', { class: 'abs', style: { left: '30px', top: '84px', width: CHAT.w - 60 + 'px' } });
      R.chat.appendChild(body);
      R.bubble = h('div', { style: { marginLeft: '110px', padding: '18px 22px', borderRadius: '18px 18px 4px 18px', background: 'rgba(255,255,255,0.1)', fontSize: '23px', lineHeight: 1.42, minHeight: '68px' } }, [R.ptxt = h('span'), R.pcaret = h('span', { class: 'caret' })]);
      body.appendChild(R.bubble);
      R.rows = [...CALLS, ['update_workspace', 'not authorized']].map(([tool, arg], i) => {
        const st = statusDot();
        const denied = i === CALLS.length;
        const el = h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: i === 0 ? '28px' : '12px', padding: '14px 18px', borderRadius: '14px', background: denied ? 'rgba(242,87,103,0.12)' : 'rgba(0,0,0,0.2)', border: `1.5px solid ${denied ? 'rgba(242,87,103,0.45)' : 'rgba(255,255,255,0.08)'}` } }, [
          st.el,
          h('div', { style: { minWidth: 0 } }, [
            h('div', { class: 'mono', style: { fontSize: '20px', color: '#fff' }, text: tool }),
            h('div', { class: 'mono', style: { fontSize: '15px', color: denied ? '#ff8f9b' : '#8d93b8', marginTop: '2px' }, text: arg }),
          ]),
          h('div', { class: 'mono', style: { marginLeft: 'auto', fontSize: '14px', color: '#8d93b8' }, text: 'openhexa' }),
        ]);
        return { el, st, denied };
      });
      R.reply = h('div', { style: { margin: '16px 0 4px', fontSize: '21px', lineHeight: 1.45, color: '#e7e9f7', minHeight: '30px' } }, [R.rtxt = h('span')]);
      body.append(...R.rows.slice(0, CALLS.length).map((r) => r.el), R.reply, R.rows[CALLS.length].el);
      cam.appendChild(R.chat);

      // ---- artifacts on the right ----
      // dataset preview
      R.ds = h('div', { class: 'card abs', style: { width: '560px', padding: '22px 24px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '21px', fontWeight: 700 } }, [UI.svgIcon('dataset', 24, '#3ee6c1', 2), 'cases_weekly.csv', h('span', { class: 'badge gray', style: { marginLeft: 'auto', fontSize: '14px' }, text: 'dataset · v3' })]),
        h('div', { class: 'sheet', style: { marginTop: '16px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.09)' } }, [
          ['district', 'week', 'cases'], ['Bobo-Dioulasso', '2026-W42', '1,284'], ['Kaya', '2026-W42', '962'], ['Ouahigouya', '2026-W42', '1,107'], ['Fada N’Gourma', '2026-W42', '873'],
        ].map((r, i) => h('div', { class: 'row' + (i === 0 ? ' head' : '') }, r.map((c) => h('div', { class: 'c mono', text: c }))))),
      ]);
      // pipeline
      R.pipe = h('div', { class: 'card abs', style: { width: '560px', padding: '22px 24px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '21px', fontWeight: 700 } }, [UI.svgIcon('flow', 24, '#b3baff', 2), 'weekly-malaria-indicators']),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '18px' } }, [
          h('span', { class: 'badge violet', style: { fontSize: '15px' } }, [UI.svgIcon('code', 16, '#b3baff', 2), 'v1 · pipeline.py']),
          R.runBadge = h('span', { class: 'badge gray', style: { fontSize: '15px' } }, [R.runTxt = h('span', { text: 'Run queued' })]),
        ]),
      ]);
      // web app
      const bars = [0.42, 0.55, 0.48, 0.7, 0.62, 0.86, 0.74, 0.92].map((v) => h('div', { style: { flex: 1, borderRadius: '5px 5px 0 0', background: 'linear-gradient(180deg,#ff459a,#ff459a66)', transformOrigin: '50% 100%' }, 'data-v': v }));
      R.bars = bars;
      R.app = h('div', { class: 'card light abs', style: { width: '560px', padding: '22px 24px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '21px', fontWeight: 700, color: '#111827' } }, [UI.svgIcon('app', 24, '#ff459a', 2), 'Malaria dashboard', h('span', { class: 'badge', style: { marginLeft: 'auto', fontSize: '14px', background: '#dcfce7', color: '#15803d' }, text: 'Published' })]),
        h('div', { style: { display: 'flex', gap: '12px', marginTop: '16px' } }, [['18,057', 'Cases · W42'], ['+12%', 'vs last week'], ['96%', 'Reporting']].map(([v, l]) => h('div', { style: { flex: 1, padding: '12px 14px', borderRadius: '10px', background: '#f9fafb', border: '1.5px solid #e5e7eb' } }, [h('div', { style: { fontSize: '26px', fontWeight: 800, color: '#111827' }, text: v }), h('div', { style: { fontSize: '14px', color: '#6b7280' }, text: l })]))),
        h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px', marginTop: '16px', padding: '0 4px', borderBottom: '1.5px solid #e5e7eb' } }, bars),
      ]);
      cam.append(R.ds, R.pipe, R.app);

      // ---- tool call log ----
      R.log = h('div', { class: 'card abs', style: { width: '900px', padding: '24px 28px 14px', background: 'linear-gradient(180deg, rgba(34,42,85,0.98), rgba(24,30,64,0.98))' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '23px', fontWeight: 700 } }, [UI.svgIcon('log', 26, '#ff8cc0', 2), 'Tool call log', h('span', { class: 'badge gray', style: { marginLeft: 'auto', fontSize: '15px' }, text: 'every call · success or refusal' })]),
      ]);
      R.logRows = LOG.map(([time, tool, ok]) => {
        const el = h('div', { class: 'mono', style: { display: 'flex', alignItems: 'center', gap: '22px', height: '52px', borderTop: '1.5px solid rgba(255,255,255,0.08)', fontSize: '18px', color: '#c9cde6' } }, [
          h('span', { style: { color: '#8d93b8', width: '96px' }, text: time }),
          h('span', { style: { color: '#fff', width: '280px' }, text: tool }),
          h('span', { style: { color: '#8d93b8' }, text: 'you@health.org' }),
          h('span', { class: 'badge ' + (ok ? 'green' : ''), style: { marginLeft: 'auto', fontSize: '14px', fontFamily: 'var(--sans)', ...(ok ? {} : { background: 'rgba(242,87,103,0.16)', color: '#ff8f9b', border: '1.5px solid rgba(242,87,103,0.45)' }) }, text: ok ? 'success' : 'refused' }),
        ]);
        R.log.appendChild(el);
        return { el, ok };
      });
      cam.appendChild(R.log);

      // ---- code ----
      R.code = h('div', { class: 'card abs', style: { width: '1040px', padding: '26px 30px', background: 'rgba(12,16,38,0.98)', borderColor: 'rgba(255,69,154,0.4)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.85), 0 0 80px -20px rgba(255,69,154,0.35)' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' } }, [h('span', { class: 'badge gray', style: { fontSize: '15px' } }, [UI.svgIcon('code', 18, '#c9cde6', 2), 'pipeline.py']), h('span', { class: 'mono', style: { fontSize: '15px', color: '#8d93b8' }, text: 'weekly-malaria-indicators · v1' })]),
      ]);
      R.codeLines = CODE.map((html) => {
        const ln = h('div', { class: 'code', style: { fontSize: '19px' }, html: html || '&nbsp;' });
        R.code.appendChild(ln);
        return ln;
      });
      cam.appendChild(R.code);

      // left-bottom caption
      R.kicker = h('div', { class: 'kicker abs' }, [h('span', { class: 'dot' }), 'Real work, on the record']);
      cam.appendChild(R.kicker);
    },

    update(t) {
      const t0 = S.work, tOut = S.control;
      set(R.cam, { s: 1.015 - prog(t, t0, 10, ease.outCubic) * 0.015 });
      const out = prog(t, tOut - 0.45, 0.45, ease.inCubic);

      // chat window
      const cp = prog(t, t0 - 0.05, 0.75, ease.outQuart);
      set(R.chat, { x: CHAT.x + (1 - cp) * -80, y: CHAT.y, o: cp * (1 - out), blur: (1 - cp) * 6 + out * 6 });
      UI.typeText(R.ptxt, PROMPT, t, t0 + 0.2, 52, R.pcaret);
      if (t > t0 + 0.2 + PROMPT.length / 52 + 0.4) R.pcaret.style.opacity = '0';

      const ends = [...W.calls, W.refused];
      R.rows.forEach((r, i) => {
        const ta = ends[i] - (r.denied ? 0.3 : 0.55);
        const p = prog(t, ta, 0.35, ease.outCubic);
        set(r.el, { x: (1 - p) * -16, o: p });
        const done = t >= ends[i];
        set(r.st.spin, { r: (t * 540) % 360, o: done ? 0 : 1 });
        set(r.st.ok, { o: (done && !r.denied) ? 1 : 0 });
        set(r.st.no, { o: (done && r.denied) ? 1 : 0 });
      });
      UI.typeText(R.rtxt, 'Done. The dashboard is live in Malaria Burkina Faso.', t, W.calls[4] + 0.6, 50);

      // artifacts cascade on the right
      const dim = prog(t, W.log - 0.1, 0.5, ease.inOutCubic);
      const cards = [[R.ds, W.calls[1] - 0.1, 900, 140], [R.pipe, W.calls[2] - 0.1, 1200, 462], [R.app, W.calls[4] - 0.1, 1010, 622]];
      cards.forEach(([el, ta, x, y], i) => {
        const p = prog(t, ta, 0.7, ease.outBack);
        set(el, { x: x + (1 - p) * 60, y: y + (1 - p) * 30 - dim * 40, s: (0.9 + 0.1 * p) * (1 - dim * 0.08), o: clamp(p * 2) * (1 - dim * 0.75) * (1 - out), blur: dim * 3 });
      });
      const ran = t >= W.calls[3] + 0.1;
      E.text(R.runTxt, t >= W.calls[3] - 0.5 ? (ran ? 'Run succeeded' : 'Running…') : 'Created');
      R.runBadge.className = 'badge ' + (ran ? 'green' : 'gray');
      R.bars.forEach((b, i) => {
        const p = prog(t, W.calls[4] + 0.1 + i * 0.05, 0.5, ease.outCubic);
        b.style.height = (Number(b.dataset.v) * 100 * p).toFixed(1) + '%';
      });

      // log slides over the artifacts
      const lp = prog(t, W.log, 0.7, ease.outQuart);
      const lq = prog(t, W.code - 0.1, 0.6, ease.inOutCubic);
      set(R.log, { x: 900 + (1 - lp) * 80, y: 210 - lq * 60, o: lp * (1 - lq * 0.7) * (1 - out), blur: lq * 3 + out * 6, s: 1 - lq * 0.05 });
      R.logRows.forEach((r, i) => {
        const ta = r.ok ? W.log + 0.1 + i * 0.12 : W.refused;
        const p = prog(t, ta, 0.35, ease.outCubic);
        set(r.el, { x: (1 - p) * 20, o: p });
        E.css(r.el, 'background', !r.ok && p > 0 ? `rgba(242,87,103,${(0.12 + 0.18 * Math.max(0, 1 - (t - ta) / 0.8)).toFixed(3)})` : 'transparent');
      });

      // code comes forward
      const kp = prog(t, W.code, 0.7, ease.outQuart);
      set(R.code, { x: 840 + (1 - kp) * 60, y: 420 + (1 - kp) * 40, o: kp * (1 - out), s: 0.94 + 0.06 * kp, blur: (1 - kp) * 6 + out * 6 });
      R.codeLines.forEach((ln, i) => set(ln, { x: (1 - prog(t, W.code + 0.1 + i * 0.05, 0.4, ease.outCubic)) * 14, o: prog(t, W.code + 0.1 + i * 0.05, 0.4) }));

      const kk = prog(t, t0 + 0.2, 0.6, ease.outCubic);
      set(R.kicker, { x: 96, y: 1000 + (1 - kk) * 10, o: kk * (1 - out) });
    },
  });
})();
