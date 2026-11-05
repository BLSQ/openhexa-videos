// Scene 6 — "Change your mind? Narrow or revoke access at any time. It applies on the very
// next call." Recreates Account → MCP connections (AccountMCPConnections.tsx): narrowing
// Pipelines to read-only removes run_pipeline, so the agent's next call is refused.
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const C = window.CONTROL_CUES;
  const R = {};

  const WIN = { x: 96, y: 150, w: 1060, h: 800 };
  const PAD = 40, INNER = WIN.w - PAD * 2;
  const SEG_W = 384;
  const SAVE_T = C.save;

  function seg(readOnly) {
    const el = h('div', { class: 'seg', style: { position: 'relative', width: SEG_W + 'px' } });
    const colW = (SEG_W - 12) / 3;
    const sel = h('div', { class: 'sel', style: { width: colW + 'px' } });
    el.appendChild(sel);
    const lbls = ['Read & Write', 'Read', 'No access'].map((txt, i) => {
      const s = h('span', { class: 'lbl' + (readOnly && i === 0 ? ' off' : ''), text: txt });
      el.appendChild(s);
      return s;
    });
    return { el, sel, lbls, colW };
  }
  function setSeg(sg, pos) {
    E.css(sg.sel, 'left', (3 + pos * (sg.colW + 3)).toFixed(2) + 'px');
    sg.lbls.forEach((l, i) => l.classList.toggle('on', i === Math.round(pos)));
  }

  function connRow(name, summary, used, expanded) {
    const chev = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(${expanded ? 0 : -90}deg)"><path d="M6 9l6 6 6-6"/></svg>`;
    const sum = h('div', { class: 'muted', style: { fontSize: '18px', marginTop: '3px' }, text: summary });
    const unsaved = h('span', { class: 'amber', style: { fontSize: '13px', marginLeft: '10px' }, text: 'Unsaved' });
    const head = h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 22px' } }, [
      h('span', { html: chev, style: { display: 'inline-flex' } }),
      h('div', { style: { flex: 1 } }, [h('div', { style: { display: 'flex', alignItems: 'baseline' } }, [h('span', { style: { fontSize: '21px', fontWeight: 600 }, text: name }), unsaved]), sum]),
      h('span', { class: 'faint', style: { fontSize: '17px' }, text: used }),
    ]);
    const el = h('div', { style: { border: '1.5px solid #e5e7eb', borderRadius: '12px', marginTop: '16px', background: '#fff', overflow: 'hidden' } }, [head]);
    return { el, sum, unsaved };
  }

  E.scene({
    name: 'control',
    from: S.control - 0.3,
    to: S.vision + 0.3,
    build(root) {
      const cam = (R.cam = h('div', { class: 'cam' }));
      root.appendChild(cam);

      const win = UI.windowCard('app.openhexa.org / user / account', { w: WIN.w, h: WIN.h, light: true });
      win.el.classList.add('abs');
      R.win = win.el;
      cam.appendChild(win.el);
      const app = h('div', { class: 'app', style: { left: PAD + 'px', top: '30px', width: INNER + 'px' } });
      win.body.appendChild(app);
      app.appendChild(h('div', { style: { fontSize: '26px', fontWeight: 700 }, text: 'MCP connections' }));

      R.claude = connRow('Claude', '26 of 36 tools · 2 workspaces', 'Last used 2 minutes ago', true);
      const body = h('div', { style: { borderTop: '1.5px solid #f3f4f6', padding: '8px 22px 20px' } });
      R.rows = [['Datasets', 1, false], ['Pipelines', 0, false], ['Web apps', 0, false], ['Connections', 1, true]].map(([label, lvl, ro]) => {
        const sg = seg(ro);
        setSeg(sg, lvl);
        const row = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', borderBottom: '1.5px solid #f3f4f6' } }, [h('span', { style: { fontSize: '19px', fontWeight: 600 }, text: label }), sg.el]);
        body.appendChild(row);
        return { sg, lvl, row };
      });
      R.revoke = h('div', { style: { height: '50px', padding: '0 26px', borderRadius: '10px', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', fontSize: '19px', fontWeight: 600 }, text: 'Revoke' });
      R.save = h('div', { style: { height: '50px', padding: '0 30px', borderRadius: '10px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', fontSize: '19px', fontWeight: 600 }, text: 'Save' });
      body.appendChild(h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px' } }, [R.revoke, R.save]));
      R.claude.el.appendChild(body);
      app.appendChild(R.claude.el);
      R.gpt = connRow('ChatGPT', '12 of 36 tools · 1 workspace', 'Last used yesterday', false);
      R.gem = connRow('Gemini CLI', '15 of 36 tools · 3 workspaces', 'Never used', false);
      app.append(R.gpt.el, R.gem.el);
      R.gpt.unsaved.style.display = 'none';
      R.gem.unsaved.style.display = 'none';

      R.saved = h('div', { class: 'abs', style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderRadius: '12px', background: '#111827', color: '#fff', fontSize: '19px', fontWeight: 600, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' } }, [UI.svgIcon('check', 22, '#4ade80', 3), 'Permissions saved']);
      cam.appendChild(R.saved);

      // right column: headline + the agent's next call
      R.kicker = h('div', { class: 'kicker abs' }, [h('span', { class: 'dot' }), 'Always in your hands']);
      R.hl = E.headline([['Narrow', 'it.'], ['Revoke', 'it.'], [['Any', 'pink'], ['time.', 'pink']]], 'headline md');
      R.hl.el.style.position = 'absolute';
      cam.append(R.kicker, R.hl.el);

      R.status = { spin: null };
      const spin = h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.18)', borderTopColor: '#ff459a' } });
      const no = h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', background: '#f25767', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [UI.svgIcon('x', 16, '#fff', 3.2)]);
      R.spin = spin;
      R.no = no;
      R.call = h('div', { class: 'card abs', style: { width: '640px', padding: '20px 24px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '19px', fontWeight: 700, color: '#c9cde6' } }, [UI.svgIcon('spark', 22, '#ff8a5c'), 'Claude', h('span', { class: 'mono', style: { marginLeft: 'auto', fontSize: '15px', color: '#8d93b8' }, text: 'next call' })]),
        R.callRow = h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', padding: '14px 18px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(255,255,255,0.08)' } }, [
          h('div', { style: { position: 'relative', width: '26px', height: '26px', flex: 'none' } }, [spin, no]),
          h('div', {}, [h('div', { class: 'mono', style: { fontSize: '20px' }, text: 'run_pipeline' }), h('div', { class: 'mono', style: { fontSize: '15px', color: '#8d93b8' }, text: 'weekly-malaria-indicators' })]),
        ]),
        R.msg = h('div', { style: { marginTop: '14px', fontSize: '18px', lineHeight: 1.45, color: '#ff8f9b' }, text: 'The OpenHEXA connection for Claude is not authorized to call run_pipeline.' }),
      ]);
      cam.appendChild(R.call);

      R.cursor = UI.cursor();
      cam.appendChild(R.cursor);
    },

    update(t) {
      const t0 = S.control, tOut = S.vision;
      set(R.cam, { s: 1.02 - prog(t, t0 - 0.3, 6, ease.outCubic) * 0.02 });
      const out = prog(t, tOut - 0.4, 0.4, ease.inCubic);

      const wp = prog(t, t0 - 0.05, 0.75, ease.outQuart);
      set(R.win, { x: WIN.x + (1 - wp) * -80, y: WIN.y, o: wp * (1 - out), blur: (1 - wp) * 6 + out * 6 });

      // narrow: Pipelines Read & Write → Read; save
      const np = prog(t, C.narrow, 0.28, ease.inOutCubic);
      setSeg(R.rows[1].sg, lerp(0, 1, np));
      const dirty = t >= C.narrow && t < SAVE_T;
      E.css(R.claude.unsaved, 'display', dirty ? 'inline-flex' : 'none');
      E.css(R.save, 'opacity', dirty || Math.abs(t - SAVE_T) < 0.15 ? '1' : '0.45');
      E.text(R.claude.sum, t >= SAVE_T ? '21 of 36 tools · 2 workspaces' : '26 of 36 tools · 2 workspaces');
      const hov = Math.max(0, 1 - Math.abs(t - (C.revoke + 0.2)) / 0.55);
      E.css(R.revoke, 'box-shadow', `0 0 0 ${(6 * hov).toFixed(1)}px rgba(220,38,38,${(0.3 * hov).toFixed(2)})`);
      const sp = prog(t, SAVE_T + 0.1, 0.4, ease.outBack);
      const sq = prog(t, C.call - 0.2, 0.4, ease.inCubic);
      set(R.saved, { x: WIN.x + WIN.w - 262, y: WIN.y + WIN.h + 22 + (1 - sp) * 20, o: clamp(sp * 2) * (1 - sq) * (1 - out) });

      // right column
      const kp = prog(t, t0 - 0.1, 0.6, ease.outCubic);
      set(R.kicker, { x: 1230, y: 196 + (1 - kp) * 14, o: kp * (1 - out) });
      set(R.hl.el, { x: 1230, y: 242 });
      E.revealWords(R.hl.words, t, [at('v07', 'narrow') - 0.15, at('v07', 'narrow') + 0.1, at('v07', 'revoke') - 0.1, at('v07', 'revoke') + 0.15, at('v07', 'any') - 0.12, at('v07', 'time') - 0.1], 0.5, tOut - 0.4, 0.35);

      const cp = prog(t, C.call - 0.15, 0.55, ease.outQuart);
      set(R.call, { x: 1190 + (1 - cp) * 60, y: 560, o: cp * (1 - out), blur: (1 - cp) * 6 });
      const refused = t >= C.refuse;
      set(R.spin, { r: (t * 540) % 360, o: refused ? 0 : 1 });
      set(R.no, { o: (refused) ? 1 : 0 });
      const shake = refused && t < C.refuse + 0.35 ? Math.sin(t * 90) * 5 * (1 - (t - C.refuse) / 0.35) : 0;
      set(R.callRow, { x: shake });
      E.css(R.callRow, 'background', refused ? 'rgba(242,87,103,0.14)' : 'rgba(0,0,0,0.2)');
      E.css(R.callRow, 'border-color', refused ? 'rgba(242,87,103,0.5)' : 'rgba(255,255,255,0.08)');
      const mp = prog(t, C.refuse + 0.05, 0.4, ease.outCubic);
      set(R.msg, { y: (1 - mp) * 8, o: mp });

      // cursor: Pipelines "Read", hover Revoke, click Save
      const toScreen = (x, y) => ({ x: WIN.x + x, y: WIN.y + y });
      const rowsTop = 54 + 30 + 34 + 16 + 98 + 8;
      const pts = [
        [t0 - 0.2, { x: 1300, y: 1060 }],
        [C.narrow - 0.05, toScreen(PAD + 22 + INNER - 44 - SEG_W + 3 + (SEG_W - 12) / 3 * 1.5 + 3, rowsTop + 64 + 32)],
        [C.revoke + 0.15, toScreen(PAD + INNER - 22 - 112 - 12 - 60, rowsTop + 64 * 4 + 45)],
        [SAVE_T, toScreen(PAD + INNER - 22 - 50, rowsTop + 64 * 4 + 45)],
        [C.call, toScreen(PAD + INNER - 10, rowsTop + 64 * 4 + 160)],
      ];
      let p = pts[0][1];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ta, a] = pts[i], [tb, b] = pts[i + 1];
        if (t >= ta) {
          const travel = Math.min(0.5, (tb - ta) * 0.8);
          const q = prog(t, tb - travel, travel, ease.inOutCubic);
          p = { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q) };
        }
      }
      const press = Math.max(0, ...[C.narrow, SAVE_T].map((c) => 1 - Math.abs(t - c) / 0.1));
      set(R.cursor, { x: p.x - 8, y: p.y - 4, s: 1 - press * 0.15, o: prog(t, t0, 0.4) * (1 - prog(t, C.call, 0.4)) * (1 - out) });
    },
  });
})();
