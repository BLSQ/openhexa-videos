// Scene 4 — "It acts with your permissions, never more. If you can't open a workspace,
// neither can your agent. And connection secrets stay out of reach."
(function () {
  const { h, set, prog, ease, clamp, lerp } = E;
  const at = TL.at;
  const S = TL.scenes;
  const R = { inside: [] };

  const CX = 1130, CY = 560;
  const OUT_W = 560, OUT_H = OUT_W * 1.155;
  const IN_W = 250, IN_H = IN_W * 1.155;
  const LOCKED = { x: 1500, y: 300, w: 330 };

  const hexSvg = (w, hh, fill, stroke, sw, dash = '') => `<svg width="${w}" height="${hh}" viewBox="0 0 ${w} ${hh}" style="overflow:visible;position:absolute;inset:0"><path d="${E.hexPath(w, hh, 0.08)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash}/></svg>`;

  function wsTile(name, flag, locked = false) {
    return h('div', { class: 'chip abs', style: { padding: '14px 20px 14px 14px', gap: '14px', fontSize: '21px' } }, [
      locked ? h('div', { class: 'ico', style: { width: '40px', height: '40px', background: 'rgba(255,255,255,0.08)' } }, [UI.svgIcon('lock', 22, '#8d93b8', 2)]) : UI.flag(flag, 34),
      h('span', { text: name }),
    ]);
  }

  E.scene({
    name: 'ceiling',
    from: S.ceiling - 0.3,
    to: S.work + 0.3,
    build(root) {
      const cam = (R.cam = h('div', { class: 'cam' }));
      root.appendChild(cam);

      R.kicker = h('div', { class: 'kicker abs' }, [h('span', { class: 'dot' }), 'Access ceiling']);
      R.hl = E.headline([['Your', 'permissions.'], [['Never', 'pink'], ['more.', 'pink']]], 'headline md');
      R.hl.el.style.position = 'absolute';
      R.sub = h('div', { class: 'sub abs', style: { width: '600px' }, text: 'Every call runs the same permission checks as the OpenHEXA web app.' });
      cam.append(R.kicker, R.hl.el, R.sub);

      // outer hex: what the person can access
      R.outer = h('div', { class: 'abs', style: { width: OUT_W + 'px', height: OUT_H + 'px' }, html: hexSvg(OUT_W, OUT_H, 'rgba(62,230,193,0.06)', '#3ee6c1', 3) });
      R.outerLbl = h('div', { class: 'badge abs', style: { fontSize: '19px', background: 'rgba(62,230,193,0.14)', color: '#7ff0d6', border: '1.5px solid rgba(62,230,193,0.45)' } }, [UI.svgIcon('user', 20, '#7ff0d6', 2.2), 'Your access · Editor']);
      // inner hex: what the agent was granted
      R.inner = h('div', { class: 'abs', style: { width: IN_W + 'px', height: IN_H + 'px' }, html: hexSvg(IN_W, IN_H, 'rgba(255,69,154,0.16)', '#ff459a', 3) });
      R.innerIn = h('div', { class: 'abs', style: { width: IN_W + 'px', height: IN_H + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' } }, [UI.svgIcon('spark', 48, '#ff8cc0'), h('div', { style: { fontSize: '24px', fontWeight: 700 }, text: 'Claude' }), h('div', { class: 'mono', style: { fontSize: '15px', color: '#ff8cc0' }, text: 'granted scope' })]);
      R.ripple = h('div', { class: 'abs', style: { width: OUT_W + 'px', height: OUT_H + 'px' }, html: hexSvg(OUT_W, OUT_H, 'none', '#f25767', 6) });
      cam.append(R.outer, R.ripple, R.inner, R.innerIn, R.outerLbl);

      // workspaces inside the person's access
      R.inside = [['Malaria Burkina Faso', 'bf', -150, -240], ['Immunization Senegal', 'sn', -170, 180]].map(([n, f, dx, dy]) => {
        const el = wsTile(n, f);
        cam.appendChild(el);
        return { el, dx, dy };
      });
      // a workspace outside it
      R.locked = wsTile('Finance HQ', null, true);
      R.lockedNo = h('div', { class: 'badge abs', style: { background: 'rgba(242,87,103,0.18)', color: '#ff8f9b', border: '1.5px solid rgba(242,87,103,0.5)', fontSize: '17px' } }, [UI.svgIcon('ban', 18, '#ff8f9b', 2.4), 'Not accessible']);
      cam.append(R.locked, R.lockedNo);

      // probe from the agent towards the locked workspace
      R.svg = h('svg', { width: 1920, height: 1080, class: 'abs', style: { overflow: 'visible' } });
      R.probe = h('path', { fill: 'none', stroke: '#ff8cc0', 'stroke-width': 3.5, 'stroke-dasharray': '3 12', 'stroke-linecap': 'round' });
      R.probeDot = h('circle', { r: 9, fill: '#ff459a' });
      R.svg.append(R.probe, R.probeDot);
      cam.appendChild(R.svg);

      // connection card with masked secrets
      const field = (k, v, secret) => h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', height: '50px', borderTop: '1.5px solid rgba(255,255,255,0.08)', fontSize: '19px' } }, [
        h('span', { class: 'mono', style: { width: '120px', color: '#8d93b8' }, text: k }),
        secret ? h('span', { class: 'mono secret', style: { color: '#fff', letterSpacing: '0.12em' }, text: v }) : h('span', { class: 'mono', style: { color: '#c9cde6' }, text: v }),
        secret ? h('span', { style: { marginLeft: 'auto', display: 'inline-flex' } }, [UI.svgIcon('lock', 22, '#3ee6c1', 2.2)]) : null,
      ]);
      R.conn = h('div', { class: 'card abs', style: { width: '440px', padding: '22px 24px 10px' } }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' } }, [
          h('div', { class: 'ico', style: { width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(123,134,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [UI.svgIcon('link', 24, '#b3baff', 2)]),
          h('div', {}, [h('div', { style: { fontSize: '22px', fontWeight: 700 }, text: 'DHIS2 Burkina Faso' }), h('div', { class: 'mono', style: { fontSize: '15px', color: '#8d93b8' }, text: 'connection · DHIS2' })]),
        ]),
        field('url', 'dhis2.example.org', true),
        R.user = field('username', 'hmis_reader', true),
        R.pass = field('password', 's3cr3t-Pa55', true),
      ]);
      R.secrets = [...R.conn.querySelectorAll('.secret')];
      R.secretsText = ['dhis2.example.org', 'hmis_reader', 's3cr3t-Pa55'];
      R.connTag = h('div', { class: 'badge abs', style: { background: 'rgba(62,230,193,0.14)', color: '#7ff0d6', border: '1.5px solid rgba(62,230,193,0.45)', fontSize: '18px' } }, [UI.svgIcon('shield', 20, '#7ff0d6', 2.2), 'Field names only. Values never reach it.']);
      R.sqlTag = h('div', { class: 'badge gray abs', style: { fontSize: '18px' } }, [UI.svgIcon('ban', 20, '#c9cde6', 2.2), 'No SQL execution']);
      cam.append(R.conn, R.connTag, R.sqlTag);
    },

    update(t) {
      const t0 = S.ceiling, tOut = S.work;
      set(R.cam, { s: 1 + prog(t, t0, 9, ease.linear) * 0.03 });
      const out = prog(t, tOut - 0.45, 0.45, ease.inCubic);

      // left column
      const kp = prog(t, t0 - 0.15, 0.6, ease.outCubic);
      set(R.kicker, { x: 96, y: 330 + (1 - kp) * 14, o: kp * (1 - out) });
      set(R.hl.el, { x: 96, y: 376 });
      E.revealWords(R.hl.words, t, [at('v05', 'your') - 0.15, at('v05', 'permissions') - 0.1, at('v05', 'never') - 0.1, at('v05', 'more') - 0.1], 0.55, tOut - 0.45, 0.35);
      const sp = prog(t, at('v05', 'more') + 0.4, 0.7, ease.outCubic);
      set(R.sub, { x: 96, y: 540 + (1 - sp) * 14, o: sp * (1 - out) });

      // outer hex (person's access)
      const op = prog(t, t0, 0.9, ease.outQuart);
      set(R.outer, { x: CX - OUT_W / 2, y: CY - OUT_H / 2, s: 0.85 + 0.15 * op, o: op * (1 - out) });
      set(R.outerLbl, { x: CX - 130, y: CY + OUT_H / 2 - 18 + (1 - op) * 20, o: prog(t, at('v05', 'your'), 0.5) * (1 - out) });

      // inner hex grows on "permissions", hits the ceiling on "never more" and springs back
      const ip = prog(t, at('v05', 'acts'), 0.8, ease.outBack);
      const push = prog(t, at('v05', 'never') - 0.2, 0.35, ease.inQuad);
      const back = prog(t, at('v05', 'more') + 0.05, 0.8, ease.outSpring);
      const grow = lerp(1, OUT_W / IN_W * 0.97, push) - (OUT_W / IN_W * 0.97 - 1) * back;
      set(R.inner, { x: CX - IN_W / 2, y: CY - IN_H / 2, s: ip * grow, o: clamp(ip * 2) * (1 - out) });
      R.inner.style.transformOrigin = '50% 50%';
      set(R.innerIn, { x: CX - IN_W / 2, y: CY - IN_H / 2, s: ip * (1 + (grow - 1) * 0.12), o: clamp(ip * 2) * (1 - out) });
      const hit = Math.max(0, 1 - Math.abs(t - (at('v05', 'never') + 0.15)) / 0.45);
      const hit2 = Math.max(0, 1 - Math.abs(t - (at('v05', 'neither') + 0.4)) / 0.4);
      set(R.ripple, { x: CX - OUT_W / 2, y: CY - OUT_H / 2, s: 1 + (1 - Math.max(hit, hit2)) * 0.04, o: Math.max(hit, hit2) * (1 - out) });

      // workspaces inside
      R.inside.forEach((w, i) => {
        const p = prog(t, at('v05', 'if') + i * 0.15, 0.6, ease.outBack);
        set(w.el, { x: CX + w.dx, y: CY + w.dy, s: 0.8 + 0.2 * p, o: clamp(p * 2) * (1 - out) });
      });

      // locked workspace and the probe that bounces off the ceiling
      const lp = prog(t, at('v05', 'cant') - 0.1, 0.6, ease.outBack);
      const fade = prog(t, at('v05', 'and') - 0.1, 0.5);
      set(R.locked, { x: LOCKED.x, y: LOCKED.y, s: 0.8 + 0.2 * lp, o: clamp(lp * 2) * (1 - fade * 0.65) * (1 - out) });
      const np = prog(t, at('v05', 'neither') + 0.4, 0.5, ease.outBack);
      set(R.lockedNo, { x: LOCKED.x + 20, y: LOCKED.y + 84 + (1 - np) * 10, s: 0.8 + 0.2 * np, o: clamp(np * 2) * (1 - fade) * (1 - out) });

      const ax = CX + 60, ay = CY - 80;
      const wallX = CX + OUT_W * 0.33, wallY = CY - OUT_H * 0.36;
      const go = prog(t, at('v05', 'neither') - 0.1, 0.5, ease.inCubic);
      const ret = prog(t, at('v05', 'neither') + 0.4, 0.6, ease.outCubic);
      const px = lerp(ax, wallX, go - ret), py = lerp(ay, wallY, go - ret);
      E.attr(R.probe, 'd', `M${ax},${ay} L${px.toFixed(1)},${py.toFixed(1)}`);
      E.attr(R.probe, 'opacity', (go > 0 && ret < 1 ? 1 : 0) * (1 - out));
      E.attr(R.probeDot, 'cx', px.toFixed(1));
      E.attr(R.probeDot, 'cy', py.toFixed(1));
      E.attr(R.probeDot, 'fill', ret > 0 ? '#f25767' : '#ff459a');
      E.attr(R.probeDot, 'opacity', (go > 0 && ret < 1 ? 1 : 0) * (1 - out));

      // connection secrets
      const cp = prog(t, at('v05', 'connection') - 0.2, 0.7, ease.outQuart);
      set(R.conn, { x: 1450 + (1 - cp) * 80, y: 560, o: cp * (1 - out), blur: (1 - cp) * 6 });
      R.secrets.forEach((el, i) => {
        const mask = prog(t, at('v05', 'secrets') + 0.05 + i * 0.13, 0.3);
        const full = R.secretsText[i];
        const n = Math.round(full.length * mask);
        E.text(el, '•'.repeat(n) + full.slice(n));
        E.css(el, 'color', mask >= 1 ? '#8d93b8' : '#fff');
      });
      const tp = prog(t, at('v05', 'stay') - 0.1, 0.6, ease.outBack);
      set(R.connTag, { x: 1450, y: 840 + (1 - tp) * 12, s: 0.85 + 0.15 * tp, o: clamp(tp * 2) * (1 - out) });
      const qp = prog(t, at('v05', 'reach'), 0.6, ease.outBack);
      set(R.sqlTag, { x: 1450, y: 902 + (1 - qp) * 12, s: 0.85 + 0.15 * qp, o: clamp(qp * 2) * (1 - out) });
    },
  });
})();
