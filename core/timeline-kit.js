// Data-driven timeline for narrated videos (the approach getting-started uses): narration lines are
// laid end to end with gaps, and scene cuts, visual cues and the music grid derive from the clip
// durations and word timings, so every language gets timing that fits its own voiceover.
//
//   window.TL = TLKit.build({
//     gaps: { default: 0.8, s01: 1.5 },   // silence before each line (s)
//     tail: 3.5,                           // hold after the last line
//     lead: { default: 0.6 },              // a scene starts this long before its first line
//     hitScene: 'outro',                   // the end-card hit (music downbeat) lands just after this scene starts
//   });
//
// Needs, loaded before it: gen/script.js (SCRIPT: lines with `id` and `scene`), gen/vo-<lang>.js
// (VO_DATA: durations + Whisper words), and optionally I18N[LANG].cues = { name: [lineId, wordPrefix, nth] }.
// TL.cue('name') -> absolute time of that word; TL.word(id, prefix) for ad-hoc lookups; TL.end(id).
(function (root) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  function build(opts = {}) {
    const LANG = root.LANG;
    const VO = root.VO_DATA;
    const lines = root.SCRIPT[LANG].lines;
    const S = (root.I18N && root.I18N[LANG]) || {};
    const gaps = { default: 0.8, ...(opts.gaps || {}) };
    const lead = { default: 0.6, ...(opts.lead || {}) };

    const vo = {}, voDur = {};
    let t = 0;
    for (const l of lines) {
      t += gaps[l.id] ?? gaps.default;
      vo[l.id] = +t.toFixed(3);
      voDur[l.id] = VO[l.id].dur;
      t += VO[l.id].dur;
    }
    const duration = +(t + (opts.tail ?? 3.5)).toFixed(2);
    const end = (id) => vo[id] + voDur[id];

    const scenes = {};
    lines.forEach((l, i) => {
      if (!l.scene || l.scene in scenes) return;
      scenes[l.scene] = i === 0 ? 0 : +(vo[l.id] - (lead[l.scene] ?? lead.default)).toFixed(3);
    });

    function word(id, needle, nth = 0) {
      const n = norm(needle);
      let seen = 0;
      for (const [w, ws] of VO[id].words) if (norm(w).startsWith(n) && seen++ === nth) return vo[id] + ws;
      // Not transcribed: estimate from where the word sits in the script text.
      const txt = norm((lines.find((l) => l.id === id) || {}).text || '');
      const i = txt.indexOf(n);
      return vo[id] + (i < 0 ? 0 : (i / Math.max(1, txt.length)) * voDur[id]);
    }
    const cues = { ...(S.cues || {}), ...(opts.cues || {}) };
    function cue(name) {
      const c = cues[name];
      if (!c) throw new Error('missing cue ' + name);
      return word(c[0], c[1], c[2] || 0);
    }

    // Music grid: shifted so a downbeat falls exactly on the end-card hit.
    const bpm = opts.bpm || 100, BEAT = 60 / bpm, BAR = 4 * BEAT;
    const sceneNames = Object.keys(scenes);
    const hitScene = opts.hitScene || sceneNames[sceneNames.length - 1];
    const outroHit = +((scenes[hitScene] ?? duration - 4) + (opts.hitOffset ?? 0.5)).toFixed(3);
    const gridOrigin = +((outroHit % BAR) - BAR).toFixed(3);

    const sfx = [];
    const TL = {
      lang: LANG, fps: opts.fps || 60, width: 1920, height: 1080, duration, bpm, beat: BEAT, outroHit, gridOrigin,
      vo, voDur, scenes, end, word, cue, sfx,
      // Sound-design helpers: TL.fx(t, 'whoosh', 0.5); TL.blip(t, 79, 0.5, -0.3). Types: see tools/audio/synth.py render_sfx.
      fx: (time, type, gain = 1, extra = {}) => sfx.push({ t: time, type, gain, ...extra }),
      blip: (time, note, gain = 1, pan = 0) => sfx.push({ t: time, type: 'blip', note, gain, pan }),
    };
    return TL;
  }

  root.TLKit = { build };
})(typeof window !== 'undefined' ? window : globalThis);
