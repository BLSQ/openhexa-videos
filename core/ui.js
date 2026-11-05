// Reusable visual components in the OpenHEXA website's design language.
(function () {
  const { h } = E;
  const UI = {};

  UI.icon = (name) => `assets/icons/${name}`;

  // White hexagon tile with a connector icon (website "Connect anything" diagram style).
  UI.hexTile = (iconFile, size = 112, fill = '#ffffff') => {
    const w = size, hh = size * 1.1547;
    const el = h('div', { class: 'hex-tile', style: { width: w + 'px', height: hh + 'px' } });
    const svg = h('svg', { class: 'hx', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, [h('path', { d: E.hexPath(w, hh, 0.1), fill })]);
    el.appendChild(svg);
    if (iconFile) el.appendChild(h('img', { src: UI.icon(iconFile), style: { width: size * 0.48 + 'px', height: size * 0.48 + 'px' } }));
    return el;
  };

  // Logo mark (hexagon + glyph) as an SVG sized by height.
  UI.logoMark = (height = 120, id = 'lm') => {
    const w = height * (42.4 / 48);
    const svg = h('svg', { width: w, height, viewBox: '0 0 42.4 48', style: { overflow: 'visible' } }, [
      h('defs', {}, [
        h('linearGradient', { id: id + 'g', x1: 32, y1: 5.4, x2: 10.5, y2: 42.6, gradientUnits: 'userSpaceOnUse' }, [
          h('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0.4 }),
          h('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }),
        ]),
      ]),
    ]);
    const hex = h('path', { d: LOGO.hex, fill: '#FF3E96' });
    const sheen = h('path', { d: LOGO.hex, fill: `url(#${id}g)` });
    const outline = h('path', { d: LOGO.hex, fill: 'none', stroke: '#ff7ab8', 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
    const glyph = h('path', { d: LOGO.glyph, fill: '#fff' });
    const gGlyph = h('g', { style: { transformOrigin: '21.2px 24px', transformBox: 'view-box' } }, [glyph]);
    const gHex = h('g', { style: { transformOrigin: '21.2px 24px', transformBox: 'view-box' } }, [hex, sheen]);
    svg.append(gHex, outline, gGlyph);
    return { el: svg, hex: gHex, outline, glyph: gGlyph, width: w, height };
  };

  // Wordmark "OpenHEXA" letters as separate paths (for staggered reveals).
  UI.wordmark = (height = 60) => {
    // Letters live in x 56..163 of the 163x48 logo; crop the viewBox to them.
    const vb = [55.5, 12.5, 108, 23];
    const w = height * (vb[2] / vb[3]);
    const svg = h('svg', { width: w, height, viewBox: vb.join(' '), style: { overflow: 'visible' } });
    const letters = LOGO.word.map((d) => {
      const g = h('g', { style: { transformBox: 'fill-box', transformOrigin: '50% 100%' } }, [h('path', { d, fill: '#fff' })]);
      svg.appendChild(g);
      return g;
    });
    return { el: svg, letters, width: w, height };
  };

  // Browser-ish window card with url bar.
  UI.windowCard = (url, { w, h: hgt, light = false } = {}) => {
    const parts = url.split(' / ');
    const urlHtml = parts.map((p, i) => (i === parts.length - 1 ? `<b>${p}</b>` : p)).join(' / ');
    const body = E.h('div', { class: 'win-body', style: { position: 'absolute', left: 0, right: 0, top: '54px', bottom: 0 } });
    const el = E.h('div', { class: 'card' + (light ? ' light' : ''), style: { width: w + 'px', height: hgt + 'px' } }, [
      E.h('div', { class: 'chrome' }, [E.h('i'), E.h('i'), E.h('i'), E.h('div', { class: 'url', html: urlHtml })]),
      body,
    ]);
    return { el, body };
  };

  // Simple inline icons (stroke style, 24px grid)
  const I = {
    db: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    file: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5"/>',
    table: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    shield: '<path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>',
    spark: '<path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" fill="currentColor" stroke="none"/><path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor" stroke="none"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    doc: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9s1-6.3 3.5-9z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14.3c2.5.2 4.2 1.9 4.6 4.7"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    template: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9h17M9 9v11.5"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    pencil: '<path d="M16.5 3.5l4 4L8 20H4v-4z"/><path d="M14 6l4 4"/>',
    alert: '<path d="M12 3.5L22 20.5H2z"/><path d="M12 10v4.5M12 17.6v.2"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>',
    flow: '<rect x="3" y="4" width="6" height="5" rx="1.5"/><rect x="15" y="15" width="6" height="5" rx="1.5"/><path d="M6 9v3.5a2 2 0 0 0 2 2h7"/>',
    terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15H17"/>',
    list: '<path d="M8 6.5h12M8 12h12M8 17.5h12"/><circle cx="4" cy="6.5" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="17.5" r="1" fill="currentColor"/>',
    unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.4 4-7 8-7s7.2 2.6 8 7"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    dataset: '<path d="M4 6.5C4 4.6 7.6 3 12 3s8 1.6 8 3.5S16.4 10 12 10 4 8.4 4 6.5z"/><path d="M4 6.5v5C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-5"/><path d="M4 11.5v6c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-6"/>',
    app: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18M7 13h4M7 16.5h7M14.5 12.5h3v4.5h-3z"/>',
    log: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M8.5 12.5h1M11.5 12.5h4M8.5 16h1M11.5 16h4"/>',
  };
  UI.svgIcon = (name, size = 24, color = 'currentColor', sw = 1.8) =>
    E.h('span', { style: { display: 'inline-flex', width: size + 'px', height: size + 'px', color, flex: 'none' }, html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${I[name]}</svg>` });

  // Mouse cursor (macOS style arrow)
  UI.cursor = () =>
    E.h('div', { class: 'abs', style: { width: '44px', height: '44px', zIndex: 50 }, html: '<svg width="44" height="44" viewBox="0 0 28 28"><path d="M6 3.5v19.2l4.9-4.6 3 6.9 3.3-1.4-3-6.8 6.8-.4z" fill="#fff" stroke="#10152f" stroke-width="1.6" stroke-linejoin="round"/></svg>' });

  // Number badge in a small violet hexagon (website tabs/steps)
  UI.numHex = (n, color = '#7b86ff', size = 34) =>
    E.h('div', { class: 'num', style: { width: size + 'px', height: size * 1.12 + 'px' }, html: `<svg width="${size}" height="${size * 1.12}" viewBox="0 0 ${size} ${size * 1.12}"><path d="${E.hexPath(size, size * 1.12, 0.14)}" fill="${color}"/></svg><span>${n}</span>` });

  // SVG hex-grid pattern layer (crisp at any scale)
  UI.hexPattern = (w, h, r = 46, stroke = 'rgba(255,255,255,0.05)', sw = 2) => {
    const hw = Math.sqrt(3) * r, vh = 1.5 * r;
    const id = 'hp' + Math.round(Math.random() * 1e6);
    const d = E.hexPath(hw, 2 * r, 0.12);
    return E.h('svg', { width: w, height: h, style: { position: 'absolute', left: 0, top: 0 } , html:
      `<defs><pattern id="${id}" width="${hw}" height="${vh * 2}" patternUnits="userSpaceOnUse">` +
      `<path d="${d}" transform="translate(0,${-r * 0.5}) scale(0.94) translate(${hw * 0.03},${r * 0.06})" fill="none" stroke="${stroke}" stroke-width="${sw}"/>` +
      `<path d="${d}" transform="translate(${hw / 2},${vh - r * 0.5}) scale(0.94) translate(${hw * 0.03},${r * 0.06})" fill="none" stroke="${stroke}" stroke-width="${sw}"/>` +
      `<path d="${d}" transform="translate(${-hw / 2},${vh - r * 0.5}) scale(0.94) translate(${hw * 0.03},${r * 0.06})" fill="none" stroke="${stroke}" stroke-width="${sw}"/>` +
      `</pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/>` });
  };

  // Simple country flags drawn with CSS (workspaces in the consent screen).
  const FLAGS = {
    bf: 'linear-gradient(180deg,#ef2b2d 0 50%,#009e49 50% 100%)',
    ci: 'linear-gradient(90deg,#f77f00 0 33.3%,#fff 33.3% 66.6%,#009e60 66.6% 100%)',
    sn: 'linear-gradient(90deg,#00853f 0 33.3%,#fdef42 33.3% 66.6%,#e31b23 66.6% 100%)',
    ml: 'linear-gradient(90deg,#14b53a 0 33.3%,#fcd116 33.3% 66.6%,#ce1126 66.6% 100%)',
    ne: 'linear-gradient(180deg,#e05206 0 33.3%,#fff 33.3% 66.6%,#0db02b 66.6% 100%)',
  };
  UI.flag = (code, w = 30) => {
    const el = E.h('span', { style: { display: 'inline-block', width: w + 'px', height: Math.round(w * 0.68) + 'px', borderRadius: '3px', background: FLAGS[code], boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)', flex: 'none', position: 'relative' } });
    if (code === 'bf' || code === 'sn') el.appendChild(E.h('span', { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-52%)', color: code === 'bf' ? '#fcd116' : '#00853f', fontSize: Math.round(w * 0.36) + 'px', lineHeight: 1 }, text: '★' }));
    if (code === 'ne') el.appendChild(E.h('span', { style: { position: 'absolute', left: '50%', top: '50%', width: Math.round(w * 0.2) + 'px', height: Math.round(w * 0.2) + 'px', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: '#e05206' } }));
    return el;
  };

  // Typewriter: shows the first n characters of `full` at time t; returns progress 0..1.
  UI.typeText = (el, full, t, t0, cps = 40, caret = null) => {
    const n = Math.max(0, Math.min(full.length, Math.floor((t - t0) * cps)));
    E.text(el, t < t0 ? '' : full.slice(0, n));
    if (caret) caret.style.opacity = t >= t0 - 0.3 && (n < full.length || Math.floor(t * 2.5) % 2 === 0) ? '1' : '0';
    return n / full.length;
  };

  window.UI = UI;
})();

// Heroicon (24/outline, the set the OpenHEXA app uses) as an inline SVG element.
UI.heroIcon = (name, size = 24, color = 'currentColor', sw = 1.5) =>
  E.h('span', { style: { display: 'inline-flex', width: size + 'px', height: size + 'px', color, flex: 'none' }, html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${HERO[name].map((d) => `<path d="${d}"/>`).join('')}</svg>` });

// Small inline SVG flags (3:2) for the sample workspaces.
window.FLAGS = {
  bf: '<svg viewBox="0 0 30 20" width="100%" height="100%"><rect width="30" height="10" fill="#EF2B2D"/><rect y="10" width="30" height="10" fill="#009E49"/><path d="M15 6.2l1.06 3.27h3.44l-2.78 2.02 1.06 3.27L15 12.74l-2.78 2.02 1.06-3.27-2.78-2.02h3.44z" fill="#FCD116"/></svg>',
  sl: '<svg viewBox="0 0 30 20" width="100%" height="100%"><rect width="30" height="6.67" fill="#1EB53A"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><rect y="13.33" width="30" height="6.67" fill="#0072C6"/></svg>',
  ci: '<svg viewBox="0 0 30 20" width="100%" height="100%"><rect width="10" height="20" fill="#F77F00"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#009E60"/></svg>',
};
