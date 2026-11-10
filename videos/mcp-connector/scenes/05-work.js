// Scene 5 — "Then just ask. In minutes, your agent explores the data, writes and runs a
// pipeline, and publishes a dashboard. And the result stays in your workspace: a versioned
// pipeline, and a web app your team can open. Every call is logged, and every result is code
// you can read."
// Tool names are the OpenHEXA MCP server's own (backend/hexa/mcp/tools).
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const W = window.WORK_CUES;
  const R = {};

  const CHAT = { x: 96, y: 150, w: 700, h: 760 };
  const FRAME = { x: 860, y: 112, w: 980, h: 866 };
  const DS = { x: 890, y: 196, w: 450 };
  const PIPE = { x: 1366, y: 196, w: 446 };
  const APP = { x: 890, y: 548, w: 922 };
  // Names the agent gives things follow the language of the cut.
  const N = L(
    { ws: 'malaria-burkina-faso', wsName: 'Malaria Burkina Faso', file: 'cases_weekly.csv', pipe: 'weekly-malaria-indicators', fn: 'weekly_malaria_indicators', app: 'malaria-dashboard', cases: 'cases', weekly: 'weekly', week: 'week', out: 'indicators.parquet', rows: 'rows written' },
    { ws: 'paludisme-burkina-faso', wsName: 'Paludisme Burkina Faso', file: 'cas_hebdo.csv', pipe: 'indicateurs-paludisme-hebdo', fn: 'indicateurs_paludisme_hebdo', app: 'tableau-de-bord-paludisme', cases: 'cas', weekly: 'hebdo', week: 'semaine', out: 'indicateurs.parquet', rows: 'lignes écrites' },
  );
  const PROMPT = L('Build a weekly malaria dashboard for Burkina Faso.', 'Crée un tableau de bord hebdomadaire du paludisme pour le Burkina Faso.');
  const CALLS = [
    ['list_datasets', N.ws],
    ['preview_dataset_file', N.file],
    ['create_pipeline', N.pipe],
    ['run_pipeline', N.pipe],
    ['create_static_webapp', N.app],
  ];
  const LOG = [
    ['10:42:03', 'list_datasets', true],
    ['10:42:05', 'preview_dataset_file', true],
    ['10:42:09', 'create_pipeline', true],
    ['10:42:12', 'run_pipeline', true],
    ['10:42:20', 'create_static_webapp', true],
    ['10:42:31', 'update_workspace', false],
  ];
  // The pipeline the agent writes, short enough to type on screen.
  const MINI = [
    [`<span class="d">@pipeline</span>(<span class="s">"${N.pipe}"</span>)`, `@pipeline("${N.pipe}")`],
    [`<span class="k">def</span> <span class="f">${N.fn}</span>():`, `def ${N.fn}():`],
    [`    ${N.cases} = pl.<span class="f">read_csv</span>(…)`, `    ${N.cases} = pl.read_csv(…)`],
    [`    ${N.weekly} = ${N.cases}.<span class="f">group_by</span>(<span class="s">"district"</span>, …)`, `    ${N.weekly} = ${N.cases}.group_by("district", …)`],
    [`    ${N.weekly}.<span class="f">write_parquet</span>(…)`, `    ${N.weekly}.write_parquet(…)`],
  ];
  const CODE = [
    '<span class="k">from</span> openhexa.sdk <span class="k">import</span> current_run, pipeline, workspace',
    '<span class="k">import</span> polars <span class="k">as</span> pl',
    '',
    `<span class="d">@pipeline</span>(<span class="s">"${N.pipe}"</span>)`,
    `<span class="k">def</span> <span class="f">${N.fn}</span>():`,
    `    ${N.cases} = pl.<span class="f">read_csv</span>(<span class="s">f"{workspace.files_path}/${N.file}"</span>)`,
    `    ${N.weekly} = ${N.cases}.<span class="f">group_by</span>(<span class="s">"district"</span>, <span class="s">"${N.week}"</span>).<span class="f">agg</span>(pl.<span class="f">col</span>(<span class="s">"${N.cases}"</span>).<span class="f">sum</span>())`,
    `    ${N.weekly}.<span class="f">write_parquet</span>(<span class="s">f"{workspace.files_path}/${N.out}"</span>)`,
    `    current_run.<span class="f">log_info</span>(<span class="s">f"{${N.weekly}.height} ${N.rows}"</span>)`,
  ];
  const BARS = [0.38, 0.44, 0.41, 0.52, 0.49, 0.58, 0.55, 0.66, 0.62, 0.74, 0.83, 0.92];
  const TEAM = [['AO', '#3ee6c1'], ['FK', '#7b86ff'], ['MS', '#fbbf24'], ['+3', 'rgba(255,255,255,0.18)']];

  function statusDot() {
    const spin = h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.18)', borderTopColor: '#ff459a' } });
    const ok = h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [UI.svgIcon('check', 16, '#fff', 3.2)]);
    const el = h('div', { style: { position: 'relative', width: '26px', height: '26px', flex: 'none' } }, [spin, ok]);
    return { el, spin, ok };
  }

  function bullet(text, icon) {
    const el = h('div', { class: 'abs', style: { display: 'flex', alignItems: 'center', gap: '20px', fontSize: '29px', fontWeight: 600, color: '#e7e9f7', whiteSpace: 'nowrap' } }, [
      h('div', { style: { position: 'relative', width: '52px', height: '58px', flex: 'none' }, html: `<svg width="52" height="58" viewBox="0 0 52 58" style="position:absolute;inset:0"><path d="${E.hexPath(52, 58, 0.14)}" fill="rgba(62,230,193,0.16)" stroke="rgba(62,230,193,0.55)" stroke-width="1.5"/></svg>` }),
      h('span', { html: text }),
    ]);
    const ic = UI.svgIcon(icon, 26, '#7ff0d6', 2);
    Object.assign(ic.style, { position: 'absolute', left: '13px', top: '16px' });
    el.firstChild.appendChild(ic);
    return el;
  }

  // A card materialises: a scan reveal from the top with a pink glow that settles.
  function materialize(el, t, t0, dur = 0.7) {
    const p = prog(t, t0, dur, ease.outCubic);
    E.css(el, 'clip-path', p >= 1 ? 'none' : `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0 round 22px)`);
    const g = p > 0 ? Math.max(0, 1 - (t - t0) / 1.6) : 0;
    E.css(el, 'box-shadow', `0 30px 80px -20px rgba(3,5,20,0.75), 0 0 0 ${(2 * g).toFixed(2)}px rgba(255,69,154,${(0.9 * g).toFixed(2)}), 0 0 ${(70 * g).toFixed(0)}px -6px rgba(255,69,154,${(0.6 * g).toFixed(2)})`);
    return p;
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
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '21px', color: '#fff' } }, [UI.brand('claude', 26), 'Claude']),
          h('div', { class: 'badge green', style: { marginLeft: 'auto', fontSize: '15px' } }, [UI.svgIcon('plug', 16, '#6ee7a0', 2.2), L('OpenHEXA · 2 workspaces', 'OpenHEXA · 2 espaces')]),
        ]),
      ]);
      const body = h('div', { class: 'abs', style: { left: '30px', top: '84px', width: CHAT.w - 60 + 'px' } });
      R.chat.appendChild(body);
      R.bubble = h('div', { style: { marginLeft: '100px', padding: '18px 22px', borderRadius: '18px 18px 4px 18px', background: 'rgba(255,255,255,0.1)', fontSize: '23px', lineHeight: 1.42, minHeight: '68px' } }, [R.ptxt = h('span'), R.pcaret = h('span', { class: 'caret' })]);
      body.appendChild(R.bubble);
      R.rows = CALLS.map(([tool, arg], i) => {
        const st = statusDot();
        const el = h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: i === 0 ? '26px' : '12px', padding: '14px 18px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(255,255,255,0.08)' } }, [
          st.el,
          h('div', { style: { minWidth: 0 } }, [
            h('div', { class: 'mono', style: { fontSize: '20px', color: '#fff' }, text: tool }),
            h('div', { class: 'mono', style: { fontSize: '15px', color: '#8d93b8', marginTop: '2px' }, text: arg }),
          ]),
          h('div', { class: 'mono', style: { marginLeft: 'auto', fontSize: '14px', color: '#8d93b8' }, text: 'openhexa' }),
        ]);
        body.appendChild(el);
        return { el, st };
      });
      R.reply = h('div', { style: { margin: '18px 0 0', fontSize: '21px', lineHeight: 1.45, color: '#e7e9f7', minHeight: '30px' } }, [R.rtxt = h('span')]);
      body.appendChild(R.reply);
      cam.appendChild(R.chat);

      // ---- workspace frame where the work lands ----
      R.frame = h('div', { class: 'abs', style: { width: FRAME.w + 'px', height: FRAME.h + 'px', borderRadius: '28px', border: '2px dashed rgba(255,255,255,0.16)', background: 'rgba(16,21,47,0.25)' } });
      const flag = UI.flag('bf', 30);
      R.frameHead = h('div', { class: 'abs', style: { display: 'flex', alignItems: 'center', gap: '14px', fontSize: '22px', fontWeight: 700 } }, [flag, N.wsName, h('span', { class: 'mono', style: { fontSize: '16px', fontWeight: 500, color: '#8d93b8' }, text: L('workspace', 'espace de travail') })]);
      R.saved = h('div', { class: 'badge abs', style: { fontSize: '17px', background: 'rgba(62,230,193,0.14)', color: '#7ff0d6', border: '1.5px solid rgba(62,230,193,0.45)' } }, [UI.svgIcon('check', 18, '#7ff0d6', 2.6), L('Saved in OpenHEXA', 'Enregistré dans OpenHEXA')]);
      cam.append(R.frame, R.frameHead, R.saved);

      // data flow between the artifacts
      R.svg = h('svg', { width: 1920, height: 1080, class: 'abs', style: { overflow: 'visible' } });
      R.flows = [
        `M${DS.x + DS.w},${DS.y + 150} L${PIPE.x},${DS.y + 150}`,
        `M${PIPE.x + PIPE.w / 2},${PIPE.y + 292} L${PIPE.x + PIPE.w / 2},${APP.y}`,
      ].map((d) => {
        const base = h('path', { d, fill: 'none', stroke: 'rgba(255,69,154,0.55)', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '0 400' });
        const dash = h('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 18' });
        R.svg.append(base, dash);
        return { base, dash };
      });
      cam.appendChild(R.svg);

      // dataset preview
      R.ds = h('div', { class: 'card abs', style: { width: DS.w + 'px', padding: '20px 22px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 700 } }, [UI.svgIcon('dataset', 22, '#3ee6c1', 2), N.file, h('span', { class: 'badge gray', style: { marginLeft: 'auto', fontSize: '13px' }, text: L('dataset', 'jeu de données') })]),
        h('div', { class: 'sheet', style: { marginTop: '14px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.09)', fontSize: '15px' } }, [
          ['district', N.week, N.cases], ...L([['Banfora', 'W42', '1,284'], ['Kaya', 'W42', '962'], ['Ouahigouya', 'W42', '1,107'], ['Dori', 'W42', '873']], [['Banfora', 'S42', '1\u202f284'], ['Kaya', 'S42', '962'], ['Ouahigouya', 'S42', '1\u202f107'], ['Dori', 'S42', '873']]),
        ].map((r, i) => h('div', { class: 'row' + (i === 0 ? ' head' : ''), style: { height: '36px' } }, r.map((c) => h('div', { class: 'c mono', text: c }))))),
      ]);
      // pipeline: code types itself, then the run
      R.mini = MINI.map(([html, plain]) => ({ el: h('div', { class: 'code', style: { fontSize: '14.5px', lineHeight: 1.65, whiteSpace: 'pre' } }), html, plain }));
      R.pipe = h('div', { class: 'card abs', style: { width: PIPE.w + 'px', height: '292px', padding: '20px 22px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 700 } }, [UI.svgIcon('flow', 22, '#b3baff', 2), N.pipe]),
        h('div', { style: { marginTop: '12px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(12,16,38,0.9)', height: '138px', overflow: 'hidden' } }, R.mini.map((m) => m.el)),
        h('div', { style: { marginTop: '14px', height: '10px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' } }, [R.bar = h('div', { style: { height: '100%', width: '0%', borderRadius: '99px', background: 'linear-gradient(90deg,#3ee6c1,#ff459a)' } })]),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' } }, [
          R.ver = h('span', { class: 'badge violet', style: { fontSize: '14px' } }, [UI.svgIcon('code', 15, '#b3baff', 2), 'Version 1']),
          R.runBadge = h('span', { class: 'badge gray', style: { fontSize: '14px' } }, [R.runTxt = h('span', { text: L('Writing…', 'Écriture…') })]),
          R.runMeta = h('span', { class: 'mono', style: { marginLeft: 'auto', fontSize: '13px', color: '#8d93b8' }, text: '70 districts' }),
        ]),
      ]);
      // dashboard web app
      R.bars = BARS.map((v) => h('div', { style: { flex: 1, borderRadius: '5px 5px 0 0', background: 'linear-gradient(180deg,#ff459a,#ff459a55)' }, 'data-v': v }));
      R.kpis = [[18057, L('Cases · W42', 'Cas · S42'), (n) => Math.round(n).toLocaleString(L('en-US', 'fr-FR'))], [12, L('vs last week', 'vs semaine dernière'), (n) => '+' + Math.round(n) + L('%', '\u202f%')], [96, L('Reporting', 'Complétude'), (n) => Math.round(n) + L('%', '\u202f%')]].map(([v, l, f]) => {
        const num = h('div', { style: { fontSize: '30px', fontWeight: 800, color: '#111827', fontVariantNumeric: 'tabular-nums' } });
        const el = h('div', { style: { flex: 1, padding: '12px 16px', borderRadius: '10px', background: '#f9fafb', border: '1.5px solid #e5e7eb' } }, [num, h('div', { style: { fontSize: '14px', color: '#6b7280' }, text: l })]);
        return { el, num, v, f };
      });
      R.team = h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
        h('div', { style: { display: 'flex' } }, TEAM.map(([ini, c], i) => h('span', { style: { width: '38px', height: '38px', borderRadius: '50%', background: c, color: '#111827', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', marginLeft: i ? '-10px' : '0' }, text: ini }))),
        h('span', { style: { fontSize: '16px', color: '#4b5563' }, text: L('Workspace members can open it', "Les membres de l'espace peuvent l'ouvrir") }),
      ]);
      R.open = h('div', { style: { marginLeft: 'auto', height: '44px', padding: '0 22px', borderRadius: '10px', background: '#ff459a', color: '#fff', fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' } }, [L('Open', 'Ouvrir'), UI.svgIcon('send', 18, '#fff', 2.4)]);
      R.app = h('div', { class: 'card light abs', style: { width: APP.w + 'px', padding: '22px 24px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '21px', fontWeight: 700, color: '#111827' } }, [
          UI.svgIcon('app', 24, '#ff459a', 2), L('Malaria dashboard', 'Tableau de bord paludisme'),
          h('span', { class: 'mono', style: { fontSize: '14px', fontWeight: 500, color: '#9ca3af' }, text: L('web app', 'application web') }),
          R.pub = h('span', { class: 'badge', style: { marginLeft: 'auto', fontSize: '14px', background: '#dcfce7', color: '#15803d' }, text: L('Published', 'Publié') }),
        ]),
        h('div', { style: { display: 'flex', gap: '24px', marginTop: '16px' } }, [
          h('div', { style: { display: 'grid', gap: '10px', width: '250px' } }, R.kpis.map((k) => k.el)),
          h('div', { style: { flex: 1, display: 'flex', alignItems: 'flex-end', gap: '9px', height: '232px', padding: '0 4px', borderBottom: '1.5px solid #e5e7eb' } }, R.bars),
        ]),
        h('div', { style: { display: 'flex', alignItems: 'center', marginTop: '16px', height: '44px' } }, [R.team, R.open]),
      ]);
      cam.append(R.ds, R.pipe, R.app);

      // ---- left-column copy for the payoff and the record ----
      R.hlStay = E.headline(L([['It', 'stays', 'in'], [['your', 'teal'], ['workspace.', 'teal']]], [['Tout', 'reste', 'dans'], [['votre', 'teal'], ['espace', 'teal'], ['de', 'teal'], ['travail.', 'teal']]]), 'headline md');
      R.hlStay.el.style.position = 'absolute';
      R.bullets = [[L('A versioned pipeline', 'Un pipeline versionné'), 'flow'], [L('A web app for your team', 'Une application web pour l’équipe'), 'users'], [L('Ready to run again', 'Prêt à être relancé'), 'clock']].map(([txt, ic]) => {
        const b = bullet(txt, ic);
        return b;
      });
      R.hlLog = E.headline(L([['Every', 'call', 'logged.'], [['Every', 'pink'], ['result', 'pink'], ['readable.', 'pink']]], [['Chaque', 'appel', 'journalisé.'], [['Chaque', 'pink'], ['résultat', 'pink'], ['lisible.', 'pink']]]), 'headline md');
      R.hlLog.el.style.position = 'absolute';
      cam.append(R.hlStay.el, ...R.bullets, R.hlLog.el);

      // ---- tool call log ----
      R.log = h('div', { class: 'card abs', style: { width: '900px', padding: '24px 28px 14px', background: 'linear-gradient(180deg, rgba(34,42,85,0.98), rgba(24,30,64,0.98))' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '23px', fontWeight: 700 } }, [UI.svgIcon('log', 26, '#ff8cc0', 2), L('Tool call log', 'Journal des appels'), h('span', { class: 'badge gray', style: { marginLeft: 'auto', fontSize: '15px' }, text: L('every call · success or refusal', 'chaque appel · succès ou refus') })]),
      ]);
      R.logRows = LOG.map(([time, tool, ok]) => {
        const el = h('div', { class: 'mono', style: { display: 'flex', alignItems: 'center', gap: '22px', height: '52px', borderTop: '1.5px solid rgba(255,255,255,0.08)', fontSize: '18px', color: '#c9cde6' } }, [
          h('span', { style: { color: '#8d93b8', width: '96px' }, text: time }),
          h('span', { style: { color: '#fff', width: '280px' }, text: tool }),
          h('span', { style: { color: '#8d93b8' }, text: L('you@health.org', 'vous@sante.org') }),
          h('span', { class: 'badge ' + (ok ? 'green' : ''), style: { marginLeft: 'auto', fontSize: '14px', fontFamily: 'var(--sans)', ...(ok ? {} : { background: 'rgba(242,87,103,0.16)', color: '#ff8f9b', border: '1.5px solid rgba(242,87,103,0.45)' }) }, text: ok ? L('success', 'succès') : L('refused', 'refusé') }),
        ]);
        R.log.appendChild(el);
        return { el, ok };
      });
      cam.appendChild(R.log);

      // ---- code ----
      R.code = h('div', { class: 'card abs', style: { width: '1040px', padding: '26px 30px', background: 'rgba(12,16,38,0.98)', borderColor: 'rgba(255,69,154,0.4)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.85), 0 0 80px -20px rgba(255,69,154,0.35)' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' } }, [h('span', { class: 'badge gray', style: { fontSize: '15px' } }, [UI.svgIcon('code', 18, '#c9cde6', 2), 'pipeline.py']), h('span', { class: 'mono', style: { fontSize: '15px', color: '#8d93b8' }, text: `${N.pipe} · version 1` })]),
      ]);
      R.codeLines = CODE.map((html) => {
        const ln = h('div', { class: 'code', style: { fontSize: '19px' }, html: html || '&nbsp;' });
        R.code.appendChild(ln);
        return ln;
      });
      cam.appendChild(R.code);

      R.kicker = h('div', { class: 'kicker abs' }, [h('span', { class: 'dot' }), L('Your agent at work', 'Votre agent au travail')]);
      cam.appendChild(R.kicker);

      R.cursor = UI.cursor();
      cam.appendChild(R.cursor);
    },

    update(t) {
      const t0 = S.work, tOut = S.control;
      const [c0, c1, c2, c3, c4] = W.calls;
      set(R.cam, { s: 1.015 - prog(t, t0, 8, ease.outCubic) * 0.015 });
      const out = prog(t, tOut - 0.45, 0.45, ease.inCubic);
      const pay = prog(t, W.payoff, 0.8, ease.inOutCubic);
      const rec = prog(t, W.log - 0.15, 0.6, ease.inOutCubic);

      // ---- chat: in, then steps aside for the payoff ----
      const cp = prog(t, t0 - 0.05, 0.75, ease.outQuart);
      set(R.chat, { x: CHAT.x + (1 - cp) * -80 - pay * 140, y: CHAT.y, s: 1 - pay * 0.06, o: cp * (1 - pay) * (1 - out), blur: (1 - cp) * 6 + pay * 8 });
      UI.typeText(R.ptxt, PROMPT, t, t0 + 0.2, 55, R.pcaret);
      if (t > t0 + 0.2 + PROMPT.length / 55 + 0.4) R.pcaret.style.opacity = '0';
      R.rows.forEach((r, i) => {
        const ta = W.calls[i] - 0.6;
        const p = prog(t, ta, 0.35, ease.outCubic);
        set(r.el, { x: (1 - p) * -16, o: p });
        const done = t >= W.calls[i];
        set(r.st.spin, { r: (t * 540) % 360, o: done ? 0 : 1 });
        set(r.st.ok, { o: done ? 1 : 0, s: done ? ease.outBack(prog(t, W.calls[i], 0.3)) : 0 });
      });
      UI.typeText(R.rtxt, L('Done. The dashboard is live in Malaria Burkina Faso.', 'Terminé. Le tableau de bord est en ligne dans Paludisme Burkina Faso.'), t, c4 + 0.15, 60);

      // ---- workspace frame ----
      const fp = prog(t, at('v06', 'ask') - 0.1, 0.7, ease.outCubic);
      const solid = prog(t, W.workspace - 0.2, 0.5);
      const fade = 1 - rec * 0.85;
      set(R.frame, { x: FRAME.x, y: FRAME.y, o: fp * fade * (1 - out) });
      E.css(R.frame, 'border', solid > 0 ? `2px solid rgba(62,230,193,${(0.25 + 0.45 * solid).toFixed(2)})` : '2px dashed rgba(255,255,255,0.16)');
      E.css(R.frame, 'box-shadow', `0 0 ${(80 * solid).toFixed(0)}px -20px rgba(62,230,193,${(0.6 * solid).toFixed(2)})`);
      set(R.frameHead, { x: FRAME.x + 30, y: FRAME.y + 26, o: fp * fade * (1 - out) });
      const sp = prog(t, W.workspace, 0.5, ease.outBack);
      set(R.saved, { x: FRAME.x + FRAME.w - 22 - (R.saved.offsetWidth || 240), y: FRAME.y + 22, s: 0.8 + 0.2 * sp, o: clamp(sp * 2) * fade * (1 - out) });

      // ---- artifacts build ----
      const dim = rec;
      const cardO = (p) => clamp(p * 3) * (1 - dim * 0.8) * (1 - out);
      const dsP = materialize(R.ds, t, c1 - 0.4);
      set(R.ds, { x: DS.x, y: DS.y - dim * 30, o: cardO(dsP), blur: dim * 3 });
      const piP = materialize(R.pipe, t, at('v06', 'writes') - 0.2);
      set(R.pipe, { x: PIPE.x, y: PIPE.y - dim * 30, o: cardO(piP), blur: dim * 3 });
      const apP = materialize(R.app, t, at('v06', 'publishes') - 0.15, 0.8);
      set(R.app, { x: APP.x, y: APP.y - dim * 30, o: cardO(apP), blur: dim * 3 });

      // code types itself
      const tw = at('v06', 'writes') - 0.05;
      let acc = 0;
      R.mini.forEach((m) => {
        const n = Math.max(0, Math.min(m.plain.length, Math.floor((t - tw) * 95) - acc));
        acc += m.plain.length;
        if (n >= m.plain.length) { if (m.el.__done !== true) { m.el.innerHTML = m.html; m.el.__done = true; } }
        else { m.el.__done = false; E.text(m.el, m.plain.slice(0, n)); }
      });
      // run
      const run = prog(t, at('v06', 'runs') - 0.05, c3 - at('v06', 'runs'), ease.inOutSine);
      R.bar.style.width = (run * 100).toFixed(1) + '%';
      E.text(R.runTxt, t < c2 ? L('Writing…', 'Écriture…') : t < at('v06', 'runs') - 0.05 ? L('Created', 'Créé') : run < 1 ? L('Running…', 'En cours…') : L('Run succeeded', 'Exécution réussie'));
      R.runBadge.className = 'badge ' + (run >= 1 ? 'green' : 'gray');
      set(R.runMeta, { o: run > 0 ? 1 : 0 });
      // version badge pulses on "versioned"
      const vp = Math.max(0, 1 - Math.abs(t - W.versioned - 0.2) / 0.5);
      set(R.ver, { s: 1 + 0.12 * vp });
      E.css(R.ver, 'box-shadow', `0 0 0 ${(5 * vp).toFixed(1)}px rgba(123,134,255,${(0.35 * vp).toFixed(2)})`);
      // dashboard: KPIs count, bars grow
      const tb = at('v06', 'publishes') + 0.2;
      R.kpis.forEach((k, i) => E.text(k.num, k.f(k.v * prog(t, tb + i * 0.1, 0.9, ease.outCubic))));
      R.bars.forEach((b, i) => {
        const p = prog(t, tb + i * 0.045, 0.55, ease.outCubic);
        b.style.height = (Number(b.dataset.v) * 100 * p).toFixed(1) + '%';
      });
      const wp = Math.max(0, 1 - Math.abs(t - W.webapp - 0.2) / 0.5);
      set(R.pub, { s: 1 + 0.15 * wp });
      const tp = prog(t, W.team - 0.15, 0.6, ease.outBack);
      set(R.team, { x: (1 - tp) * -20, o: clamp(tp * 2) });
      const op = prog(t, W.team + 0.2, 0.5, ease.outBack);
      const press = Math.max(0, 1 - Math.abs(t - (at('v06b', 'open') + 0.15)) / 0.12);
      set(R.open, { s: (0.85 + 0.15 * op) * (1 - press * 0.06), o: clamp(op * 2) });

      // data flows once both ends exist
      R.flows.forEach((f, i) => {
        const p = prog(t, i === 0 ? at('v06', 'writes') + 0.2 : at('v06', 'publishes') - 0.1, 0.4, ease.inOutCubic);
        E.attr(f.base, 'stroke-dasharray', `${(400 * p).toFixed(1)} 400`);
        E.attr(f.base, 'opacity', ((1 - dim) * (1 - out)).toFixed(3));
        E.attr(f.dash, 'stroke-dashoffset', (-t * 120).toFixed(1));
        E.attr(f.dash, 'opacity', (p >= 1 ? 0.7 : 0) * (1 - dim) * (1 - out));
      });

      // ---- left column: payoff, then the record ----
      set(R.hlStay.el, { x: 96, y: 236 });
      E.revealWords(R.hlStay.words, t, [W.payoff + 0.1, at('v06b', 'stays') - 0.1, at('v06b', 'in') - 0.1, at('v06b', 'your') - 0.1, W.workspace - 0.1], 0.55, W.log - 0.45, 0.35);
      const bt = [W.versioned - 0.2, W.webapp - 0.2, W.team + 0.25];
      R.bullets.forEach((b, i) => {
        const p = prog(t, bt[i], 0.6, ease.outQuart);
        const q = prog(t, W.log - 0.45 + i * 0.04, 0.35, ease.inCubic);
        set(b, { x: 96 + (1 - p) * -24, y: 452 + i * 88, o: p * (1 - q), blur: q * 6 });
      });
      set(R.hlLog.el, { x: 96, y: 236 });
      E.revealWords(R.hlLog.words, t, [at('v06c', 'every') - 0.1, at('v06c', 'call') - 0.1, at('v06c', 'logged') - 0.1, at('v06c', 'every2') - 0.1, at('v06c', 'result') - 0.1, at('v06c', 'code')], 0.55, tOut - 0.45, 0.35);

      // ---- log and code ----
      const lp = prog(t, W.log, 0.7, ease.outQuart);
      const lq = prog(t, W.code - 0.1, 0.6, ease.inOutCubic);
      set(R.log, { x: 900 + (1 - lp) * 80, y: 210 - lq * 60, o: lp * (1 - lq * 0.7) * (1 - out), blur: lq * 3 + out * 6, s: 1 - lq * 0.05 });
      R.logRows.forEach((r, i) => {
        const ta = r.ok ? W.log + 0.1 + i * 0.12 : W.refused;
        const p = prog(t, ta, 0.35, ease.outCubic);
        set(r.el, { x: (1 - p) * 20, o: p });
        E.css(r.el, 'background', !r.ok && p > 0 ? `rgba(242,87,103,${(0.12 + 0.18 * Math.max(0, 1 - (t - ta) / 0.8)).toFixed(3)})` : 'transparent');
      });
      const kp = prog(t, W.code, 0.7, ease.outQuart);
      set(R.code, { x: 840 + (1 - kp) * 60, y: 430 + (1 - kp) * 40, o: kp * (1 - out), s: 0.94 + 0.06 * kp, blur: (1 - kp) * 6 + out * 6 });
      R.codeLines.forEach((ln, i) => set(ln, { x: (1 - prog(t, W.code + 0.1 + i * 0.05, 0.4, ease.outCubic)) * 14, o: prog(t, W.code + 0.1 + i * 0.05, 0.4) }));

      const kk = prog(t, t0 + 0.2, 0.6, ease.outCubic);
      set(R.kicker, { x: 96, y: 1000 + (1 - kk) * 10, o: kk * (1 - pay) * (1 - out) });

      // cursor clicks "Open" on the dashboard
      const ot = at('v06b', 'open') + 0.15;
      const ci = prog(t, ot - 0.9, 0.75, ease.inOutCubic);
      const cx = lerp(1700, APP.x + APP.w - 60, ci), cy = lerp(1060, APP.y + 350, ci);
      set(R.cursor, { x: cx, y: cy, s: 1 - press * 0.15, o: clamp(ci * 3) * (1 - prog(t, ot + 0.5, 0.4)) * (1 - out) });
    },
  });
})();
