// Master timeline shared by the animation and the audio mixer (audio/export-timeline.mjs exports it
// to JSON per language). Narration lines are laid end to end with the gaps below; scene cuts and
// every visual cue derive from the clip durations and Whisper word timings, so EN and FR each get
// a timeline that fits their own voiceover. All times are in seconds.
(function (root) {
  const LANG = root.LANG;
  const VO = root.VO_DATA;
  const S = root.I18N[LANG];

  // Silence before each line. Longer gaps leave room for on-screen actions between sentences.
  const GAP = {
    s01: 1.6, s02: 0.9, s03: 1.2, s04: 1.2, s05: 1.5, s06: 1.4,
    s07: 0.75, s08: 0.75, s09: 1.2, s10: 0.75, s11: 0.75, s12: 0.75, s13: 0.75, s14: 0.75,
    s15: 1.4, s16: 1.7,
  };
  const TAIL = 3.6;
  const ids = Object.keys(GAP);

  const vo = {};
  let t = 0;
  for (const id of ids) {
    t += GAP[id];
    vo[id] = +t.toFixed(3);
    t += VO[id].dur;
  }
  const end = (id) => vo[id] + VO[id].dur;
  const duration = +(t + TAIL).toFixed(2);

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  // Absolute start time of the first word in `id` that begins with `needle` (searching from the
  // nth match). Falls back to a position proportional to where the needle sits in the script text.
  function word(id, needle, nth = 0) {
    const words = VO[id].words;
    const n = norm(needle);
    let seen = 0;
    for (const [w, ws] of words) {
      if (norm(w).startsWith(n) && seen++ === nth) return vo[id] + ws;
    }
    const txt = norm(S.lines[id] || '');
    const i = txt.indexOf(n);
    return vo[id] + (i < 0 ? 0 : (i / Math.max(1, txt.length)) * VO[id].dur);
  }
  // Language-specific cue names map to [lineId, needle, nth] in src/i18n.js.
  function cue(name) {
    const c = S.cues[name];
    if (!c) throw new Error('missing cue ' + name);
    return word(c[0], c[1], c[2] || 0);
  }

  const scenes = {
    welcome: 0,
    concept: vo.s02 - 0.55,
    create: vo.s03 - 0.7,
    tour: vo.s06 - 0.9,
    docs: vo.s15 - 0.75,
    outro: vo.s16 - 0.6,
  };

  // Music grid: 100 BPM, 4/4. The grid is shifted (gridOrigin <= 0) so that a downbeat falls exactly on the
  // end-card hit: the music moves to meet the picture, never the other way round.
  const BEAT = 0.6, BAR = 4 * BEAT;
  const outroHit = +(scenes.outro + 0.5).toFixed(3);
  const gridOrigin = +((outroHit % BAR) - BAR).toFixed(3);

  // Create-dialog beats that must not collide however fast the narrator speaks.
  const nameAt = cue('name') + 0.15;
  const typeDur = Math.min(0.055 * S.workspaceName.length, cue('country') - nameAt - 0.15);
  const tickAt = Math.max(cue('tutorial') + 0.3, cue('country') + 1.4);

  const TL = {
    lang: LANG, nameAt, typeDur, tickAt, fps: 60, width: 1920, height: 1080, duration, bpm: 100, beat: BEAT, outroHit, gridOrigin,
    vo, voDur: Object.fromEntries(ids.map((id) => [id, VO[id].dur])),
    scenes, end, word, cue, sfx: [],
  };

  // Sound design, derived from the same cues the scenes animate on.
  (function addSfx() {
    const sfx = TL.sfx;
    const blip = (time, note, gain = 1, pan = 0) => sfx.push({ t: time, type: 'blip', note, gain, pan });
    sfx.push({ t: 0.9, type: 'shimmer', gain: 0.5 });
    sfx.push({ t: 1.15, type: 'impact', gain: 0.45 });
    sfx.push({ t: scenes.concept, type: 'whoosh', gain: 0.45 });
    [cue('data'), cue('code'), cue('results')].forEach((x, i) => blip(x - 0.05, [76, 79, 84][i], 0.55, (i - 1) * 0.4));
    sfx.push({ t: scenes.create, type: 'whoosh', gain: 0.5 });
    sfx.push({ t: cue('clickCreate') + 0.55, type: 'click', gain: 0.9 });
    sfx.push({ t: cue('clickCreate') + 0.62, type: 'pop', gain: 0.6 });
    for (let i = 0; i < S.workspaceName.length; i++) sfx.push({ t: nameAt + (i / S.workspaceName.length) * typeDur, type: 'key', gain: 0.22 + ((i * 7) % 5) * 0.03 });
    sfx.push({ t: cue('country') + 0.25, type: 'click', gain: 0.6 });
    sfx.push({ t: tickAt, type: 'click', gain: 0.7 });
    blip(tickAt + 0.02, 79, 0.5);
    sfx.push({ t: end('s04') + 0.55, type: 'click', gain: 0.9 });
    sfx.push({ t: vo.s05 - 0.3, type: 'swell', gain: 0.4 });
    [cue('database'), cue('storage')].forEach((x, i) => blip(x, [79, 84][i], 0.6, (i - 0.5) * 0.6));
    blip(end('s05') + 0.2, 88, 0.45);
    sfx.push({ t: scenes.tour, type: 'whoosh', gain: 0.5 });
    for (let i = 7; i <= 14; i++) {
      const id = 's' + String(i).padStart(2, '0');
      blip(vo[id] - 0.32, [72, 74, 76, 79, 81, 84, 86, 88][i - 7], 0.5, ((i % 3) - 1) * 0.35);
    }
    sfx.push({ t: cue('generateSql') + 0.2, type: 'shimmer', gain: 0.22 });
    sfx.push({ t: cue('runPipeline') + 0.1, type: 'click', gain: 0.5 });
    sfx.push({ t: scenes.docs, type: 'whoosh', gain: 0.5 });
    sfx.push({ t: cue('helpButton') - 0.15, type: 'click', gain: 0.8 });
    sfx.push({ t: cue('helpButton') - 0.08, type: 'pop', gain: 0.5 });
    sfx.push({ t: outroHit, type: 'swell', gain: 0.5 });
    sfx.push({ t: outroHit, type: 'impact', gain: 0.5 });
    sfx.push({ t: outroHit, type: 'shimmer', gain: 0.4 });
    sfx.sort((a, b) => a.t - b.t);
  })();

  root.TL = TL;
})(typeof window !== 'undefined' ? window : globalThis);
