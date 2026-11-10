// Master timeline shared by the animation and the audio mixer (tools/export-timeline.mjs
// exports it to JSON for the Python mixer). All times are in seconds.
// Music runs at 96 BPM (one beat = 0.625 s); scene cuts sit on beats.
(function (root) {
  const BPM = 96;
  const BEAT = 60 / BPM;
  const b = (n) => n * BEAT;

  // Per-language cut: French narration runs longer, so its scenes are longer too.
  const CUTS = {
    en: {
      duration: b(111),
      scenes: { hook: 0, connect: b(13), scope: b(32), ceiling: b(44), work: b(58), control: b(86), vision: b(95), cta: b(99) },
      click: b(107),
      vo: { v01: 0.6, v02: 3.0, v03: 8.4, v04: 20.2, v05: 27.65, v06: 36.5, v06b: 44.2, v06c: 50.3, v07: 53.9, v08: 59.5, v09: 62.1, v10: 65.15 },
    },
    fr: {
      duration: b(133),
      scenes: { hook: 0, connect: b(17), scope: b(36), ceiling: b(51), work: b(68), control: b(102), vision: b(113), cta: b(118) },
      click: b(129),
      vo: { v01: 0.5, v02: 3.95, v03: 10.9, v04: 22.7, v05: 32.05, v06: 42.75, v06b: 51.9, v06c: 59.15, v07: 63.9, v08: 70.75, v09: 74.0, v10: 77.75 },
    },
  };
  const LANG = root.LANG === 'fr' ? 'fr' : 'en';
  const cut = CUTS[LANG];

  const TIMELINE = {
    lang: LANG,
    fps: 60,
    width: 1920,
    height: 1080,
    bpm: BPM,
    beat: BEAT,
    duration: cut.duration,
    // Scene start times (the next scene's start is this scene's end).
    scenes: cut.scenes,
    // The CTA button click lands on the final chord.
    click: cut.click,
    // Voiceover clip start times (clips are silence-trimmed WAVs in vo/<lang>/trim).
    vo: cut.vo,
    // Sound-design hits, keyed by type. The mixer synthesises each one.
    sfx: [],
  };

  // Scenes cue their animation on English words. For French, each English key points at the
  // French word spoken at the same moment of the sentence.
  const FR_ANCHORS = {
    v01: { ai: 'les', agents: 'agents', can: 'peuvent', now: 'desormais', do: 'travailler', real: 'sur', data: 'vos', work: 'donnees' },
    v02: { but: 'mais', would: 'confieriez', you: 'vous', hand: 'a', one: 'un', the: 'les', keys: 'cles', to: 'de', your: 'vos', health: 'donnees', data: 'sante', what: 'que', can: 'peut', it: 'il', see: 'voir', what2: 'que2', change: 'modifier' },
    v03: { with: 'avec', open: 'open', mcp: 'mcp', connector: 'connecteur', bring: 'utilisez', the2: 'l', agent: 'agent', already: 'connaissez', use: 'deja', claude: 'claude', chatgpt: 'chatgpt', gemini: 'gemini', or: 'ou', any: 'tout', agent2: 'agent2', speaks: 'compatible', mcp2: 'mcp2', with2: 'avec2', governance: 'gouvernance', built: 'integree', in: 'integree' },
    v04: { you: 'vous', choose: 'choisissez', exactly: 'precisement', which: 'les', workspaces: 'espaces', reach: 'atteindre', which2: 'les2', resources: 'ressources', use: 'utiliser', only: 'seulement', read: 'lire', also: 'aussi', write: 'ecrire' },
    v05: { your: 'vos', acts: 'agit', permissions: 'permissions', never: 'jamais', more: 'au', if: 'si', cant: 'ne', neither: 'votre', and: 'et', connection: 'connexion', secrets: 'secrets', stay: 'restent', reach: 'portee' },
    v06: { ask: 'demander', explores: 'explore', data: 'donnees', writes: 'ecrit', runs: 'execute', pipeline: 'pipeline', publishes: 'publie', dashboard: 'tableau' },
    v06b: { and: 'et', stays: 'reste', in: 'dans', your: 'votre', workspace: 'espace', versioned: 'versionne', web: 'application', team: 'equipe', open: 'ouvrir' },
    v06c: { every: 'chaque', call: 'appel', logged: 'journalise', every2: 'chaque2', result: 'resultat', code: 'code' },
    v07: { change: 'vous', narrow: 'restreignez', revoke: 'revoquez', access: 'acces', any: 'tout', time: 'moment', next: 'appel', call: 'suivant' },
    v08: { responsible: 'une', ai: 'ia', by: 'des', design: 'conception' },
    v09: { open: 'open', bring: 'amenez', your: 'vos', agents: 'agents', keep: 'gardez', control: 'controle' },
    v10: { start: 'commencez', free: 'essai', trial: 'gratuit', today: 'aujourd' },
  };
  function frenchWords() {
    const fr = root.VO_WORDS_FR, out = {};
    for (const [clip, words] of Object.entries(fr)) {
      out[clip] = { ...words };
      for (const [en, key] of Object.entries(FR_ANCHORS[clip] || {})) {
        if (!(key in words)) throw new Error(`FR anchor ${clip}.${en} → ${key} is not a spoken word`);
        out[clip][en] = words[key];
      }
    }
    return out;
  }
  TIMELINE.words = LANG === 'fr' ? frenchWords() : root.VO_WORDS;

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
    [['claude', 74], ['chatgpt', 77], ['gemini', 81], ['any', 84]].forEach(([w, n], i) => blip(at('v03', w) - 0.05, n, 0.6, (i - 1.5) * 0.4));
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

    // Work: prompt typing, tool calls completing as the artifacts build, the workspace payoff,
    // then the log and the code. calls[i] is when call i completes (times mirrored in scenes/05-work.js).
    for (let i = 0; i < 12; i++) cue(S.work + 0.2 + i * 0.075, 'key', 0.3);
    const W = root.WORK_CUES = {
      calls: [
        at('v06', 'explores') + 0.25,
        at('v06', 'data') + 0.2,
        at('v06', 'writes') + 0.45,
        at('v06', 'pipeline') + 0.55,
        at('v06', 'dashboard') + 0.3,
      ],
      payoff: at('v06b', 'and') - 0.3,
      workspace: at('v06b', 'workspace'),
      versioned: at('v06b', 'versioned'),
      webapp: at('v06b', 'web'),
      team: at('v06b', 'team'),
      log: at('v06c', 'every') - 0.1,
      refused: at('v06c', 'logged') + 0.35,
      code: at('v06c', 'result') - 0.1,
    };
    W.calls.forEach((t, i) => blip(t, [72, 74, 76, 79, 84][i], 0.55, (i - 2) * 0.25));
    // artifacts materialise: dataset, pipeline (code typing), dashboard
    cue(W.calls[1] - 0.35, 'shimmer', 0.18);
    for (let i = 0; i < 10; i++) cue(at('v06', 'writes') - 0.05 + i * 0.07, 'key', 0.22);
    cue(W.calls[2] - 0.3, 'shimmer', 0.18);
    for (let i = 0; i < 6; i++) cue(at('v06', 'runs') + 0.1 + i * 0.12, 'tick', 0.35);
    cue(at('v06', 'publishes') - 0.1, 'shimmer', 0.3);
    cue(W.payoff, 'whoosh', 0.35);
    blip(W.workspace, 76, 0.45, -0.2);
    blip(W.versioned, 79, 0.45, 0.2);
    blip(W.webapp, 83, 0.45, -0.2);
    blip(W.team, 86, 0.4, 0.2);
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
