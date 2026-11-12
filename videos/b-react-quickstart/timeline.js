// Timing: lines laid end to end (gaps = silence before each line), scenes from script.json's
// `scene` field, cues from i18n.js. Longer gaps follow lines whose on-screen action needs time to land.
(function (root) {
  const TL = root.TLKit.build({
    gaps: {
      default: 0.9, s01: 1.5, s02: 1.3, s04: 2.0, s05: 1.4, s06: 1.6, s07: 1.3, s09: 1.4, s11: 1.3,
      b01: 1.8, b02: 1.0, b03: 1.0, b04: 1.4, b05: 1.3, b06: 1.3, b07: 1.3, b08: 1.5, b09: 1.4,
      s13: 1.8, s14: 1.2, s15: 1.6, s16: 1.0, s17: 1.2, s18: 1.6, s19: 1.4, s20: 1.6, s21: 2.0,
      s22: 1.4, s23: 1.4, s24: 1.6, s25: 1.4, s26: 1.4, s27: 2.6,
    },
    tail: 3.6,
    lead: { default: 0.7, join: 0.9, breact: 1.0, rstudio: 0.9 },
    hitScene: 'outro',
  });
  const { cue, end, scenes: SC } = TL;

  // Typing and dialog beats that must not collide, however fast the narrator speaks.
  TL.at = {
    regType: cue('yourName') + 0.1,
    regDone: Math.max(cue('land') - 0.35, cue('password') + 0.9),
    uploadOpen: cue('upload') + 0.35,
    uploadSend: cue('drop') + 0.8,
    // "click Create, then Create new version" is under a second: the dataset dialog keeps its own pace.
    dsOpen: cue('create') + 0.25,
    dsClose: Math.max(cue('newVersion') - 0.4, cue('create') + 1.6),
    verOpen: Math.max(cue('newVersion') + 0.35, cue('create') + 2.5),
    verSend: end('s08') + 0.3,
    drawerOpen: cue('pencil') + 0.35,
    drawerSave: end('s10') + 0.35,
    pick: cue('selector') + 0.55,
    linkOpen: cue('share') + 0.3,
    linkDone: Math.max(cue('partners') - 0.2, cue('share') + 1.6),
    // B-REACT chapter: Oxford's pipeline page, then Imperial's Available Templates.
    tplSwitch: Math.max(cue('createTpl') - 0.35, cue('publishTpl') + 1.0),
    tplCreate: Math.max(cue('availTpl') + 0.55, cue('createTpl') + 1.4),
    nbOpen: cue('python') - 0.1,
    tokenEye: cue('eye') + 0.15,
    tokenCopy: cue('copy') + 0.2,
    dlgOpen: cue('loginDlg') + 0.45,
    dlgPaste: cue('paste') + 0.15,
    dlgLogIn: Math.max(cue('pick') - 0.3, cue('paste') + 0.8),
    dlgContinue: Math.max(cue('youreIn') - 0.1, cue('pick') + 0.8),
    runOpen: cue('run') + 0.3,
    runGo: Math.max(cue('outputs') - 0.9, cue('parameters') + 1.0),
    createOpen: cue('editorsCreate') + 0.35,
    createClose: end('s21') + 0.6,
    inviteOpen: cue('members') + 0.45,
    inviteDone: end('s22') + 0.2,
    appOpen: cue('createApp') + 0.3,
    appAi: cue('createApp') + 0.85,
    appSend: Math.max(cue('builds') - 0.3, cue('describeApp') + 1.4),
    appDone: end('s23') + 0.4,
  };

  TL.fx(0.9, 'shimmer', 0.5);
  TL.fx(1.15, 'impact', 0.4);
  ['concept', 'join', 'breact', 'notebooks', 'rstudio', 'pipelines', 'rules', 'org', 'outro'].forEach((s) => TL.fx(SC[s], 'whoosh', 0.45));
  [cue('viewers'), cue('editors'), cue('admins')].forEach((x, i) => TL.blip(x - 0.05, [76, 79, 84][i], 0.5, (i - 1) * 0.4));
  TL.fx(cue('datasetMove') + 0.2, 'riser', 0.3, { dur: 0.8 });
  const A = TL.at;
  const clicks = [cue('joinNow') + 0.5, A.regDone, cue('files') - 0.1, A.uploadOpen - 0.3, A.uploadSend, cue('dataset') - 0.2, A.dsOpen - 0.25,
    A.dsClose - 0.2, A.verOpen - 0.3, A.verSend, cue('filesTab') + 0.1, cue('statistics'), A.drawerOpen - 0.3, A.drawerSave,
    cue('selector') + 0.15, A.pick, cue('downloadFile') + 0.2, cue('access') + 0.1, A.linkOpen - 0.25, A.linkDone - 0.3,
    cue('jupyter') - 0.1, A.tokenEye, A.tokenCopy, A.dlgLogIn, A.dlgContinue,
    cue('pipelines') - 0.1, A.runOpen - 0.3, A.runGo, A.createOpen - 0.3, cue('settings') - 0.1, A.inviteOpen - 0.3, A.inviteDone - 0.3,
    cue('webapps') - 0.1, A.appOpen - 0.3, A.appAi - 0.1, A.appSend, cue('studio') - 0.3, cue('ownOrg') + 0.4];
  clicks.forEach((x) => TL.fx(x, 'click', 0.55));
  [A.uploadSend + 0.9, A.verSend + 0.9, A.drawerSave + 0.3, A.linkDone + 0.2, A.dlgContinue + 0.4, A.runGo + 1.6, A.inviteDone + 0.2, A.appDone].forEach((x, i) => TL.blip(x, [79, 81, 84, 86, 88, 84, 79, 86][i], 0.4, ((i % 3) - 1) * 0.3));
  TL.fx(A.appSend + 0.3, 'shimmer', 0.25);
  [cue('claude'), cue('connect') + 0.7, cue('gemini')].forEach((x, i) => TL.blip(x, [76, 79, 83][i], 0.4, (i - 1) * 0.4));
  TL.blip(cue('review'), 84, 0.4);
  // B-REACT chapter.
  TL.fx(cue('restrictedWs'), 'riser', 0.25, { dur: 0.6 });
  [cue('wsColumn'), cue('cleaned'), cue('sharesIt') + 1.2, A.tplCreate + 0.3].forEach((x, i) => TL.blip(x, [79, 81, 84, 86][i], 0.4, ((i % 3) - 1) * 0.3));
  TL.fx(A.tplCreate, 'click', 0.55);
  [cue('dpa') - 0.4, cue('dsa') - 0.2].forEach((x, i) => TL.blip(x, [76, 83][i], 0.45, (i - 0.5) * 0.6));
  TL.fx(cue('console') - 0.1, 'swell', 0.35);
  TL.fx(TL.outroHit, 'swell', 0.5);
  TL.fx(TL.outroHit, 'impact', 0.5);
  TL.fx(TL.outroHit, 'shimmer', 0.4);
  TL.sfx.sort((a, b) => a.t - b.t);
  root.TL = TL;
})(typeof window !== 'undefined' ? window : globalThis);
