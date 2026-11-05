// Timing: lines laid end to end (gaps = silence before each line), scenes from script.json's
// `scene` field, cues from i18n.js. Longer gaps follow lines whose on-screen action needs time to land.
(function (root) {
  const TL = root.TLKit.build({
    gaps: {
      default: 0.9, s01: 1.5, s02: 1.3, s04: 1.4, s05: 1.6, s07: 1.3, s09: 1.4, s11: 1.3,
      s13: 1.4, s14: 2.0, s15: 1.4, s16: 1.4, s17: 1.4, s18: 1.4,
    },
    tail: 3.6,
    lead: { default: 0.7, join: 0.9 },
    hitScene: 'outro',
  });
  const { cue, vo, end, scenes: SC } = TL;

  // Typing and dialog beats that must not collide, however fast the narrator speaks.
  TL.at = {
    regType: cue('yourName') + 0.1,
    regDone: Math.max(cue('land') - 0.35, cue('password') + 0.9),
    uploadOpen: cue('upload') + 0.35,
    uploadSend: cue('drop') + 0.8,
    dsOpen: cue('create') + 0.3,
    dsClose: cue('newVersion') - 0.55,
    verOpen: cue('newVersion') + 0.35,
    verSend: end('s08') + 0.25,
    drawerOpen: cue('pencil') + 0.35,
    drawerSave: end('s10') + 0.35,
    pick: cue('selector') + 0.55,
    linkOpen: cue('share') + 0.3,
    linkDone: Math.max(cue('partners') - 0.2, cue('share') + 1.6),
    runOpen: cue('run') + 0.3,
    runGo: Math.max(cue('outputs') - 0.9, cue('parameters') + 1.0),
    inviteOpen: cue('members') + 0.45,
    inviteDone: end('s15') + 0.2,
  };

  TL.fx(0.9, 'shimmer', 0.5);
  TL.fx(1.15, 'impact', 0.4);
  ['concept', 'join', 'rules', 'outro'].forEach((s) => TL.fx(SC[s], 'whoosh', 0.45));
  [cue('viewers'), cue('editors'), cue('admins')].forEach((x, i) => TL.blip(x - 0.05, [76, 79, 84][i], 0.5, (i - 1) * 0.4));
  TL.fx(cue('datasetMove') + 0.2, 'riser', 0.3, { dur: 0.8 });
  const A = TL.at;
  const clicks = [cue('joinNow') + 0.5, A.regDone, cue('files') - 0.1, A.uploadOpen - 0.3, A.uploadSend, cue('dataset') - 0.2, A.dsOpen - 0.25,
    A.dsClose - 0.2, A.verOpen - 0.3, A.verSend, cue('filesTab') + 0.1, cue('statistics'), A.drawerOpen - 0.3, A.drawerSave,
    cue('selector') + 0.15, A.pick, cue('downloadFile') + 0.2, cue('access') + 0.1, A.linkOpen - 0.25, A.linkDone - 0.3,
    cue('pipelines') - 0.1, A.runOpen - 0.3, A.runGo, cue('template') + 0.05, cue('template') + 0.9, cue('settings') - 0.1, A.inviteOpen - 0.3, A.inviteDone - 0.3,
    cue('describe') - 0.4];
  clicks.forEach((x) => TL.fx(x, 'click', 0.55));
  [A.uploadSend + 0.9, A.verSend + 0.9, A.drawerSave + 0.3, A.linkDone + 0.2, A.runGo + 1.6, cue('template') + 1.2, A.inviteDone + 0.2].forEach((x, i) => TL.blip(x, [79, 81, 84, 86, 88, 84, 79][i], 0.4, ((i % 3) - 1) * 0.3));
  TL.fx(cue('sql') - 0.2, 'shimmer', 0.25);
  [cue('claude'), cue('connect') + 0.7, cue('gemini')].forEach((x, i) => TL.blip(x, [76, 79, 83][i], 0.4, (i - 1) * 0.4));
  [cue('review'), cue('keepOut')].forEach((x, i) => TL.blip(x, [79, 84][i], 0.4));
  TL.fx(TL.outroHit, 'swell', 0.5);
  TL.fx(TL.outroHit, 'impact', 0.5);
  TL.fx(TL.outroHit, 'shimmer', 0.4);
  TL.sfx.sort((a, b) => a.t - b.t);
  void vo;
  root.TL = TL;
})(typeof window !== 'undefined' ? window : globalThis);
