// Scene 3 — "You choose exactly which workspaces it can reach, which resources it can use,
// and whether it can only read, or also write."
// The right side recreates OpenHEXA's MCP consent screen (pages/mcp/authorize.tsx and
// MCPPermissionMatrix): workspaces to authorize, then one access level per resource.
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const C = window.SCOPE_CUES;
  const R = { bullets: [] };

  const WIN = { x: 790, y: 112, w: 1040, h: 900 };
  const PAD = 44, INNER = WIN.w - PAD * 2;
  const WS_BOX = { y: 172, h: 156 };
  const TABLE_Y = 396, HEAD_H = 62, ROW_H = 66;
  const SEG_W = 384, SEG_X = INNER - 20 - SEG_W;
  const BTN_Y = TABLE_Y + HEAD_H + ROW_H * 9 + 34;

  const WORKSPACES = [
    { name: 'Malaria Burkina Faso', slug: 'malaria-burkina-faso', flag: 'bf', col: 0, row: 0 },
    { name: "HIV Côte d'Ivoire", slug: 'hiv-cote-divoire', flag: 'ci', col: 1, row: 0, off: 'untick2' },
    { name: 'Immunization Senegal', slug: 'immunization-senegal', flag: 'sn', col: 0, row: 1 },
    { name: 'Nutrition Mali', slug: 'nutrition-mali', flag: 'ml', col: 1, row: 1, off: 'untick', viewer: true },
  ];
  // Labels and descriptions as in MCPPermissionMatrix.tsx. Level index: 0 write, 1 read, 2 none.
  const RESOURCES = [
    { label: 'Workspaces', desc: 'Let the assistant see your workspaces and change their settings.' },
    { label: 'Files', desc: 'Let the assistant browse and read files in workspace buckets, and add new ones.', to: [['filesOff', 2]] },
    { label: 'Datasets', desc: 'Let the assistant list datasets, preview their contents, and publish new versions.' },
    { label: 'Pipelines', desc: 'Let the assistant inspect pipelines and their runs, and create, edit or run them.', to: [['writePipes', 0]] },
    { label: 'Pipeline templates', desc: 'Let the assistant browse pipeline templates and read their source code.', readOnly: true },
    { label: 'Web apps', desc: 'Let the assistant read web apps and edit the files they are built from.', to: [['writeApps', 0]] },
    { label: 'Databases', desc: 'Let the assistant read the structure of your workspace databases.', readOnly: true },
    { label: 'Saved queries', desc: 'Let the assistant read the saved SQL queries of the Data Studio, and save or edit them.' },
    { label: 'Connections', desc: 'Let the assistant list the external connections a workspace holds.', readOnly: true },
  ];

  const CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function seg(x, y, readOnly) {
    const el = h('div', { class: 'seg', style: { left: x + 'px', top: y + 'px', width: SEG_W + 'px' } });
    const colW = (SEG_W - 6 - 6) / 3;
    const sel = h('div', { class: 'sel', style: { width: colW + 'px' } });
    el.appendChild(sel);
    const lbls = ['Read & Write', 'Read', 'No access'].map((txt, i) => {
      const s = h('span', { class: 'lbl' + (readOnly && i === 0 ? ' off' : ''), text: txt });
      el.appendChild(s);
      return s;
    });
    return { el, sel, lbls, colW, x, y };
  }
  // pos is a continuous level index so the highlight can slide between options.
  function setSeg(sg, pos, glow = 0) {
    E.css(sg.sel, 'left', (3 + pos * (sg.colW + 3)).toFixed(2) + 'px');
    const idx = Math.round(pos);
    sg.lbls.forEach((l, i) => l.classList.toggle('on', i === idx));
    E.css(sg.sel, 'box-shadow', glow > 0 ? `0 0 0 ${(4 * glow).toFixed(1)}px rgba(37,99,235,${(0.25 * glow).toFixed(2)})` : '0 1px 2px rgba(0,0,0,0.15)');
  }
  const segCenter = (sg, idx) => ({ x: sg.x + 3 + idx * (sg.colW + 3) + sg.colW / 2, y: sg.y + 21 });

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

  E.scene({
    name: 'scope',
    from: S.scope - 0.3,
    to: S.ceiling + 0.3,
    build(root) {
      const cam = (R.cam = h('div', { class: 'cam' }));
      root.appendChild(cam);

      // ---- left column ----
      R.kicker = h('div', { class: 'kicker abs' }, [h('span', { class: 'dot' }), 'You set the scope']);
      R.hl = E.headline([['You', 'choose'], ['exactly', 'what'], ['it', 'can', ['touch.', 'pink']]], 'headline md');
      R.hl.el.style.position = 'absolute';
      cam.append(R.kicker, R.hl.el);
      R.bullets = [['Which workspaces', 'globe'], ['Which resources', 'list'], ['Read, or read &amp; write', 'pencil']].map(([txt, ic]) => {
        const b = bullet(txt, ic);
        cam.appendChild(b);
        return b;
      });
      R.note = h('div', { class: 'badge violet abs', style: { fontSize: '19px', padding: '10px 16px' } }, [UI.svgIcon('shield', 22, '#b3baff', 2), 'New connections start read-only']);
      cam.appendChild(R.note);

      // ---- consent screen ----
      const win = UI.windowCard('app.openhexa.org / mcp / authorize', { w: WIN.w, h: WIN.h, light: true });
      win.el.classList.add('abs');
      R.win = win.el;
      cam.appendChild(win.el);
      win.body.style.overflow = 'hidden';
      const app = (R.app = h('div', { class: 'app', style: { left: PAD + 'px', top: '0px', width: INNER + 'px', height: BTN_Y + 120 + 'px' } }));
      win.body.appendChild(app);

      const mark = UI.logoMark(54, 'sc');
      app.appendChild(h('div', { class: 'abs', style: { left: '0px', top: '34px' } }, [mark.el]));
      app.appendChild(h('div', { class: 'abs', style: { left: '72px', top: '30px', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.01em' }, text: 'Authorize Claude' }));
      app.appendChild(h('div', { class: 'abs muted', style: { left: '72px', top: '74px', fontSize: '19px' }, text: 'Choose what it may do on your behalf. You can change this at any time.' }));

      app.appendChild(h('div', { class: 'abs', style: { left: '0px', top: '134px', fontSize: '21px', fontWeight: 600 }, text: 'Authorize access for' }));
      R.count = h('span', { class: 'muted', style: { fontSize: '18px' } });
      app.appendChild(h('div', { class: 'abs', style: { left: 'auto', right: '0px', top: '137px', display: 'flex', gap: '20px', alignItems: 'baseline' } }, [R.count, h('span', { class: 'link', style: { fontSize: '18px' }, text: 'Select all' })]));
      const wsBox = h('div', { class: 'box', style: { left: '0px', top: WS_BOX.y + 'px', width: INNER + 'px', height: WS_BOX.h + 'px' } });
      app.appendChild(wsBox);
      R.ws = WORKSPACES.map((w) => {
        const x = 20 + w.col * (INNER / 2), y = 18 + w.row * 64;
        const cb = h('div', { class: 'cb on', html: CHECK, style: { left: x + 'px', top: y + 14 + 'px' } });
        const fl = UI.flag(w.flag, 30);
        Object.assign(fl.style, { position: 'absolute', left: x + 40 + 'px', top: y + 16 + 'px' });
        const txt = h('div', { class: 'abs', style: { left: x + 86 + 'px', top: y + 2 + 'px' } }, [
          h('div', { style: { fontSize: '20px' }, text: w.name }),
          h('div', { class: 'mono faint', style: { fontSize: '14px', marginTop: '2px' }, text: w.slug }),
        ]);
        wsBox.append(cb, fl, txt);
        if (w.viewer) wsBox.appendChild(h('div', { class: 'amber abs', style: { left: x + 350 + 'px', top: y + 16 + 'px' }, text: 'Viewer' }));
        return { ...w, cb, txt, cx: x + 12, cy: WS_BOX.y + y + 26 };
      });

      app.appendChild(h('div', { class: 'abs', style: { left: '0px', top: TABLE_Y - 40 + 'px', fontSize: '21px', fontWeight: 600 }, text: 'Permissions' }));
      const table = h('div', { class: 'box', style: { left: '0px', top: TABLE_Y + 'px', width: INNER + 'px', height: HEAD_H + ROW_H * RESOURCES.length + 'px', overflow: 'hidden' } });
      app.appendChild(table);
      const head = h('div', { class: 'abs', style: { left: 0, top: 0, width: INNER + 'px', height: HEAD_H + 'px', background: '#f9fafb' } });
      R.custom = h('span', { class: 'faint', style: { fontSize: '15px', fontWeight: 400, marginLeft: '10px' }, text: 'Custom' });
      head.appendChild(h('div', { class: 'abs', style: { left: '20px', top: '19px', fontSize: '19px', fontWeight: 600 } }, ['All resources', R.custom]));
      table.appendChild(head);
      R.allSeg = seg(SEG_X, (HEAD_H - 44) / 2, false);
      head.appendChild(R.allSeg.el);
      R.rows = RESOURCES.map((r, i) => {
        const y = HEAD_H + i * ROW_H;
        const row = h('div', { class: 'row', style: { top: y + 'px', height: ROW_H + 'px' } });
        row.appendChild(h('div', { class: 'abs', style: { left: '20px', top: '12px', width: SEG_X - 40 + 'px', fontSize: '17px', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, [
          h('span', { style: { fontWeight: 600, fontSize: '19px' }, text: r.label }),
          h('br'),
          h('span', { class: 'muted', text: r.desc }),
        ]));
        const sg = seg(SEG_X, (ROW_H - 44) / 2, r.readOnly);
        row.appendChild(sg.el);
        table.appendChild(row);
        return { ...r, row, sg, y: TABLE_Y + y };
      });

      R.cancel = h('div', { class: 'btn white', style: { left: INNER - 300 + 'px', top: BTN_Y + 'px', width: '120px' }, text: 'Cancel' });
      R.auth = h('div', { class: 'btn blue', style: { left: INNER - 164 + 'px', top: BTN_Y + 'px', width: '164px' }, text: 'Authorize' });
      app.append(R.cancel, R.auth);

      R.cursor = UI.cursor();
      cam.appendChild(R.cursor);
    },

    update(t) {
      const t0 = S.scope, tOut = S.ceiling;
      set(R.cam, { s: 1.02 - prog(t, t0 - 0.3, 7, ease.outCubic) * 0.02 });
      const out = prog(t, tOut - 0.4, 0.4, ease.inCubic);

      // left column
      const kp = prog(t, t0 - 0.1, 0.6, ease.outCubic);
      set(R.kicker, { x: 96, y: 236 + (1 - kp) * 14, o: kp * (1 - out) });
      set(R.hl.el, { x: 96, y: 282 });
      E.revealWords(R.hl.words, t, [at('v04', 'you') - 0.15, at('v04', 'choose') - 0.1, at('v04', 'exactly') - 0.1, at('v04', 'exactly') + 0.12, at('v04', 'which') - 0.05, at('v04', 'which') + 0.08, at('v04', 'which') + 0.2], 0.55, tOut - 0.4, 0.35);
      const bt = [at('v04', 'workspaces') - 0.2, at('v04', 'resources') - 0.2, at('v04', 'only') - 0.2];
      R.bullets.forEach((b, i) => {
        const p = prog(t, bt[i], 0.6, ease.outQuart);
        const q = prog(t, tOut - 0.4 + i * 0.04, 0.35, ease.inCubic);
        set(b, { x: 96 + (1 - p) * -24, y: 548 + i * 86, o: p * (1 - q), blur: q * 6 });
      });
      const np = prog(t, C.readAll + 0.1, 0.6, ease.outBack);
      set(R.note, { x: 96, y: 832 + (1 - np) * 14, s: 0.9 + 0.1 * np, o: clamp(np * 2) * (1 - out) });

      // window entrance and scroll
      const wp = prog(t, t0 - 0.05, 0.85, ease.outQuart);
      set(R.win, { x: WIN.x + (1 - wp) * 120, y: WIN.y, o: clamp(wp * 1.5) * (1 - out), blur: (1 - wp) * 8 + out * 8, s: 1 - out * 0.03 });
      const scroll = lerp(0, 250, prog(t, at('v04', 'resources') - 0.45, 0.8, ease.inOutCubic));
      set(R.app, { x: 0, y: -scroll });
      const toScreen = (x, y) => ({ x: WIN.x + PAD + x, y: WIN.y + 54 - scroll + y });

      // workspaces
      let selected = 0;
      R.ws.forEach((w) => {
        const off = w.off && t >= C[w.off];
        if (!off) selected++;
        w.cb.classList.toggle('on', !off);
        w.cb.innerHTML = off ? '' : CHECK;
        E.css(w.txt, 'opacity', off ? '0.55' : '1');
      });
      E.text(R.count, `${selected} of 4 workspaces selected`);

      // permission levels
      const levelAt = (r) => {
        let pos = 1;
        for (const [cue, lvl] of r.to || []) {
          const p = prog(t, C[cue], 0.28, ease.inOutCubic);
          pos = lerp(pos, lvl, p);
        }
        return pos;
      };
      const readGlow = Math.max(0, 1 - Math.abs(t - C.readAll - 0.25) / 0.5);
      let custom = false;
      R.rows.forEach((r) => {
        const pos = levelAt(r);
        if (Math.round(pos) !== 1) custom = true;
        setSeg(r.sg, pos, Math.round(pos) === 1 ? readGlow : 0);
      });
      setSeg(R.allSeg, 1, readGlow);
      E.css(R.allSeg.sel, 'opacity', custom ? '0' : '1');
      R.allSeg.lbls[1].classList.toggle('on', !custom);
      E.css(R.custom, 'opacity', custom ? '1' : '0');

      // cursor path through the cue targets
      const mali = R.ws.find((w) => w.off === 'untick'), civ = R.ws.find((w) => w.off === 'untick2');
      const files = R.rows[1], pipes = R.rows[3], apps = R.rows[5];
      const sc = (r, idx) => { const c = segCenter(r.sg, idx); return toScreen(c.x, r.y + c.y - 22); };
      const pts = [
        [t0 - 0.2, { x: 1900, y: 1000 }],
        [C.untick - 0.05, toScreen(mali.cx + 20 * 0 + 4, mali.cy)],
        [C.untick2 - 0.05, toScreen(civ.cx + 4, civ.cy)],
        [C.filesOff - 0.05, sc(files, 2)],
        [C.writePipes - 0.05, sc(pipes, 0)],
        [C.writeApps - 0.05, sc(apps, 0)],
        [C.writeApps + 1.2, sc(apps, 0)],
      ];
      let cp = pts[0][1];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ta, a] = pts[i], [tb, b] = pts[i + 1];
        if (t >= ta) {
          const travel = Math.min(0.55, (tb - ta) * 0.8);
          const p = prog(t, tb - travel, travel, ease.inOutCubic);
          cp = { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) };
        }
      }
      const clicks = [C.untick, C.untick2, C.filesOff, C.writePipes, C.writeApps];
      const press2 = Math.max(0, ...clicks.map((c) => 1 - Math.abs(t - c) / 0.1));
      set(R.cursor, { x: cp.x - 8, y: cp.y - 4, s: 1 - press2 * 0.15, o: prog(t, t0 + 0.2, 0.4) * (1 - out) });
    },
  });
})();
