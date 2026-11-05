// Master timeline shared by the animation and the audio mixer (audio/export-timeline.mjs
// exports it to JSON for the Python mixer). All times are in seconds.
// Music runs at 96 BPM (one beat = 0.625 s); scene cuts sit on beats.
(function (root) {
  const BPM = 96;
  const BEAT = 60 / BPM;
  const b = (n) => n * BEAT;

  const TIMELINE = {
    fps: 60,
    width: 1920,
    height: 1080,
    bpm: BPM,
    beat: BEAT,
    duration: b(96),

    // Scene start times (the next scene's start is this scene's end).
    scenes: {
      hook: 0,
      connect: b(13),
      scope: b(28),
      ceiling: b(40),
      work: b(54),
      control: b(71),
      vision: b(80),
      cta: b(84),
    },

    // The CTA button click lands on the final chord.
    click: b(92),

    // Voiceover clip start times (clips are silence-trimmed WAVs in audio/vo/trim).
    vo: {
      v01: 0.6,
      v02: 3.0,
      v03: 8.4,
      v04: 17.7,
      v05: 25.15,
      v06: 33.85,
      v07: 44.5,
      v08: 50.15,
      v09: 52.75,
      v10: 55.8,
    },

    // Sound-design hits, keyed by type. The mixer synthesises each one.
    sfx: [],
  };

  TIMELINE.words = root.VO_WORDS;

  // Absolute time of a word: TL.at('v05', 'secrets')
  TIMELINE.at = function (clip, word) {
    return TIMELINE.vo[clip] + (word ? TIMELINE.words[clip][word] : 0);
  };

  (function addSounds() {
    const at = TIMELINE.at, S = TIMELINE.scenes, sfx = TIMELINE.sfx;
    const cue = (t, type, gain = 1, extra = {}) => sfx.push({ t, type, gain, ...extra });
    const blip = (t, note, gain = 1, pan = 0) => cue(t, 'blip', gain, { note, pan });

    // Scene transitions
    cue(S.connect - 2.5, 'riser', 0.8, { dur: 2.5 });
    cue(S.connect, 'impact', 1.0);
    cue(S.connect, 'shimmer', 0.5);
    for (const k of ['scope', 'ceiling', 'work', 'control']) cue(S[k], 'whoosh', 0.5);
    cue(S.vision, 'swell', 0.6);
    cue(S.cta, 'impact', 0.7);
    cue(S.cta, 'shimmer', 0.4);
    cue(TIMELINE.click, 'click', 0.9);

    // Hook: agent typing, data cards, alarm on "see" / "change"
    for (let i = 0; i < 14; i++) cue(at('v01', 'agents') + i * 0.07, 'key', 0.25 + (i % 3) * 0.08);
    [0, 1, 2, 3].forEach((i) => blip(at('v02', 'keys') + i * 0.16, [69, 72, 76, 79][i], 0.5, (i - 1.5) * 0.4));
    cue(at('v02', 'see') + 0.05, 'error', 0.45);
    cue(at('v02', 'change') + 0.05, 'error', 0.6);

    // Connect: agent chips, connector lights up, shield closes
    [['claude', 74], ['chatgpt', 77], ['gemini', 81]].forEach(([w, n], i) => blip(at('v03', w) - 0.05, n, 0.6, (i - 1) * 0.5));
    blip(at('v03', 'mcp') - 0.05, 72, 0.6);
    blip(at('v03', 'governance'), 84, 0.6);
    cue(at('v03', 'governance') + 0.1, 'shimmer', 0.25);

    // Scope: checkbox clicks and selector changes (times mirrored in scenes/03-scope.js)
    const sc = root.SCOPE_CUES = {
      untick: at('v04', 'workspaces') + 0.45,
      untick2: at('v04', 'reach') + 0.2,
      filesOff: at('v04', 'resources') + 0.35,
      readAll: at('v04', 'read') - 0.1,
      writePipes: at('v04', 'also') - 0.1,
      writeApps: at('v04', 'write') + 0.1,
    };
    for (const k of ['untick', 'untick2', 'filesOff', 'readAll', 'writePipes', 'writeApps']) cue(sc[k], 'tick', 0.9);
    blip(sc.untick, 67, 0.35);
    blip(sc.untick2, 65, 0.35);
    blip(sc.filesOff, 64, 0.4);
    blip(sc.readAll, 76, 0.45);
    blip(sc.writePipes, 79, 0.45);
    blip(sc.writeApps, 83, 0.45);

    // Ceiling: rings settle, locked workspace bounce, secrets masked
    blip(at('v05', 'permissions'), 72, 0.5, -0.3);
    blip(at('v05', 'never') + 0.1, 76, 0.5, 0.3);
    cue(at('v05', 'neither') + 0.35, 'error', 0.55);
    for (let i = 0; i < 3; i++) blip(at('v05', 'secrets') + 0.05 + i * 0.13, [84, 81, 77][i], 0.4, 0.4);

    // Work: prompt typing, tool calls completing, log rows, code
    for (let i = 0; i < 12; i++) cue(S.work + 0.25 + i * 0.075, 'key', 0.3);
    const W = root.WORK_CUES = {
      calls: [
        at('v06', 'exploring') - 0.15,
        at('v06', 'datasets') + 0.25,
        at('v06', 'building') - 0.05,
        at('v06', 'pipelines') + 0.45,
        at('v06', 'publishing') + 0.1,
      ],
      log: at('v06', 'every') - 0.1,
      refused: at('v06', 'logged') + 0.35,
      code: at('v06', 'result') - 0.1,
    };
    W.calls.forEach((t, i) => blip(t + 0.35, [72, 74, 76, 79, 84][i], 0.55, (i - 2) * 0.25));
    for (let i = 0; i < 4; i++) cue(W.log + 0.1 + i * 0.12, 'tick', 0.6);
    cue(W.refused, 'error', 0.4);
    blip(W.code, 88, 0.35);

    // Control: narrow, revoke, refused next call
    const C = root.CONTROL_CUES = {
      narrow: at('v07', 'narrow') + 0.1,
      revoke: at('v07', 'revoke') + 0.2,
      save: at('v07', 'time') - 0.1,
      call: at('v07', 'next') - 0.35,
      refuse: at('v07', 'call') + 0.05,
    };
    cue(C.narrow, 'tick', 0.9);
    blip(C.narrow, 74, 0.4);
    cue(C.save, 'click', 0.45);
    blip(C.save + 0.12, 76, 0.4);
    cue(C.call, 'whoosh', 0.18);
    cue(C.refuse, 'error', 0.7);

    // Vision: four pillars
    [0, 1, 2, 3].forEach((i) => blip(at('v08', 'responsible') + 0.25 + i * 0.22, [72, 76, 79, 84][i], 0.45, (i - 1.5) * 0.35));

    // CTA button appears
    blip(at('v10', 'start') - 0.1, 67, 0.6);
    sfx.sort((a, c) => a.t - c.t);
  })();

  root.TL = TIMELINE;
  if (typeof module !== 'undefined') module.exports = TIMELINE;
})(typeof window !== 'undefined' ? window : globalThis);
