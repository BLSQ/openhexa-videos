// Master timeline shared by the animation and the audio mixer (audio/build-timeline.mjs
// exports it to JSON for the Python mixer). All times are in seconds.
// Music runs at 96 BPM (one beat = 0.625 s); scene cuts sit on beats.
(function (root) {
  const BPM = 96;
  const BEAT = 60 / BPM;

  const TIMELINE = {
    fps: 60,
    width: 1920,
    height: 1080,
    bpm: BPM,
    beat: BEAT,
    duration: 57.5,

    // Scene start times (the next scene's start is this scene's end).
    scenes: {
      chaos: 0,
      grind: 7.5,
      reveal: 15.0,
      integrate: 20.625,
      manage: 28.75,
      publish: 34.375,
      trust: 40.625,
      cta: 46.25,
    },

    // Voiceover clip start times (clips are silence-trimmed WAVs in audio/vo/trim).
    vo: {
      v01: 0.75,
      v02: 2.5,
      v03: 7.9,
      v04: 15.35,
      v05: 20.9,
      v06: 29.0,
      v07: 34.6,
      v08: 40.9,
      v09: 46.6,
      v10: 51.0,
    },

    // Sound-design hits, keyed by type. The mixer synthesises each one.
    sfx: [
      { t: 7.5, type: 'whoosh', gain: 0.5 },
      { t: 12.4, type: 'riser', dur: 2.6, gain: 0.8 },
      { t: 15.0, type: 'impact', gain: 1.0 },
      { t: 15.0, type: 'shimmer', gain: 0.55 },
      { t: 20.625, type: 'whoosh', gain: 0.55 },
      { t: 28.75, type: 'whoosh', gain: 0.5 },
      { t: 34.375, type: 'whoosh', gain: 0.5 },
      { t: 40.625, type: 'swell', gain: 0.6 },
      { t: 46.25, type: 'impact', gain: 0.75 },
      { t: 46.25, type: 'shimmer', gain: 0.4 },
      { t: 52.5, type: 'click', gain: 0.9 },
    ],
  };

  // Word timings inside each VO clip (from Whisper, relative to the trimmed clip start).
  // Used to sync on-screen words to the narration.
  TIMELINE.words = {
    v01: { data: 0.18, lives: 0.48, everywhere: 0.74 },
    v02: { health: 0.0, systems: 0.28, surveys: 1.3, spreadsheets: 1.84, databases: 2.42, none: 3.5, talk: 4.0, other: 4.6 },
    v03: { team: 0.32, weeks: 0.88, copying: 1.24, cleaning: 1.9, exporting: 2.56, instead: 3.6, decisions: 4.32 },
    v04: { openhexa: 0.3, opensource: 2.0, platform: 2.84, brings: 3.52, together: 4.14 },
    v05: { connect: 0.0, sources: 0.62, automate: 1.38, pipelines: 1.68, templates: 3.48, python: 4.7, ai: 6.66, assistant: 6.98 },
    v06: { database: 0.36, dataset: 1.18, file: 1.72, secure: 2.92, workspace: 3.18, shared: 4.2, terms: 4.68 },
    v07: { turn: 0.32, dashboards: 0.96, reports: 2.1, webapps: 2.66, just: 3.7, prompt: 4.0 },
    v08: { trusted: 0.0, who: 0.86, worldbank: 2.5, programs: 3.66, world: 4.68 },
    v09: { openhexa: 0.0, turn: 1.38, data: 1.6, products: 2.12, teams: 2.68, use: 3.38 },
    v10: { start: 0.0, free: 0.48, trial: 0.7, today: 0.92 },
  };


  // Absolute time of a word: TL.at('v05', 'python')
  TIMELINE.at = function (clip, word) {
    return TIMELINE.vo[clip] + (word ? TIMELINE.words[clip][word] : 0);
  };

  // Fine sound design derived from the narration timings (UI pops, chimes, keypresses).
  (function addUiSounds() {
    const at = TIMELINE.at, sfx = TIMELINE.sfx;
    const blip = (t, note, gain = 1, pan = 0) => sfx.push({ t, type: 'blip', note, gain, pan });
    // Scene 1: sources pop in (A minor pentatonic, rising per group)
    const groups = [['health', [0, 0.12, 0.28, 0.4]], ['surveys', [0, 0.12, 0.2]], ['spreadsheets', [0, 0.1, 0.15, 0.25, 0.35]], ['databases', [0, 0.1, 0.2, 0.3]]];
    const penta = [69, 72, 74, 76, 79, 81, 84];
    groups.forEach(([w, offs], g) => offs.forEach((o, i) => blip(at('v02', w) + o, penta[(g + i) % penta.length], 0.55, ((i % 2) * 2 - 1) * 0.5)));
    // failed connections
    [0, 1, 2].forEach((i) => sfx.push({ t: at('v02', 'none') + i * 0.22 + 0.45, type: 'error', gain: 0.7 }));
    // Scene 2: keypress, cell fixes, exported files
    sfx.push({ t: at('v03', 'copying') + 0.45, type: 'key', gain: 0.8 });
    for (let i = 0; i < 6; i++) sfx.push({ t: at('v03', 'cleaning') + i * 0.09, type: 'tick', gain: 0.5 });
    for (let i = 0; i < 5; i++) blip(at('v03', 'exporting') + 0.25 + i * 0.26, 64 + (i % 2) * 3, 0.4, 0.4);
    // Integrate: pipeline steps complete
    [76, 79, 84].forEach((n, i) => blip(at('v05', 'pipelines') + 0.9 + i * 0.55, n, 0.7, (i - 1) * 0.4));
    blip(at('v05', 'templates') - 0.15, 72, 0.45);
    blip(at('v05', 'ai') - 0.45, 88, 0.45);
    // Manage: resources, access, share arrival
    blip(at('v06', 'database') - 0.25, 72, 0.5, -0.3);
    blip(at('v06', 'dataset') - 0.25, 76, 0.5, 0);
    blip(at('v06', 'file') - 0.25, 79, 0.5, 0.3);
    blip(at('v06', 'secure') - 0.1, 84, 0.45);
    blip(at('v06', 'shared') + 0.85, 88, 0.6, -0.3);
    // Publish: dashboards, report, live, map built from the prompt
    blip(at('v07', 'dashboards') - 0.3, 72, 0.45);
    blip(at('v07', 'reports') - 0.35, 76, 0.45, -0.4);
    blip(at('v07', 'webapps') - 0.1, 79, 0.45, 0.4);
    sfx.push({ t: at('v07', 'prompt') + 0.75, type: 'key', gain: 0.6 });
    sfx.push({ t: at('v07', 'prompt') + 0.9, type: 'shimmer', gain: 0.25 });
    // Trust: logo cards
    [at('v08', 'who') - 0.25, at('v08', 'worldbank') - 0.25, at('v08', 'programs') - 0.3, at('v08', 'programs') - 0.15, at('v08', 'programs')].forEach((t, i) => blip(t, [72, 76, 79, 81, 84][i], 0.4, (i - 2) * 0.3));
    // CTA button appears
    blip(at('v10', 'start') - 0.1, 67, 0.6);
    sfx.sort((a, b) => a.t - b.t);
  })();

  root.TL = TIMELINE;
  if (typeof module !== 'undefined') module.exports = TIMELINE;
})(typeof window !== 'undefined' ? window : globalThis);
