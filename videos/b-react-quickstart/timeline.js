// Timing: lines laid end to end (gaps = silence before each line), scenes from script.json's
// `scene` field, cues from i18n.js. Longer gaps follow lines whose on-screen action needs time to land.
// v4 runs slower on purpose (reviewer feedback): roomier gaps here, and the voice is slowed in video.json.
(function (root) {
  const TL = root.TLKit.build({
    gaps: {
      default: 1.2, s01: 1.8, s02: 1.6, s03: 1.2, s04: 2.3, s05: 1.7, s06: 1.9, x01: 1.6, s07: 1.6, s09: 2.2, s11: 1.6,
      s13: 2.0, s14: 1.5, s15: 1.9, s16: 1.3, s17: 1.5, s18: 1.9, s19: 1.7, s20: 1.9, s21: 2.3,
      d01: 2.0, s10: 2.6, s12: 1.6,
      b01: 2.1, b02: 1.3, b03: 1.3, b04: 1.7, b05: 1.6, b06: 1.6, b07: 1.6, b08: 1.8, b09: 1.7,
      s22: 2.0, s23: 1.7, s24: 1.9, s25: 1.7, s27: 2.6,
    },
    tail: 3.6,
    lead: { default: 0.9, join: 1.1, breact: 1.2, rstudio: 1.1, members: 1.1 },
    hitScene: 'outro',
  });
  const { cue, end, scenes: SC } = TL;

  // Typing and dialog beats that must not collide, however fast the narrator speaks.
  TL.at = {
    regType: cue('yourName') + 0.1,
    regDone: Math.max(cue('land') - 0.35, cue('password') + 0.9),
    uploadOpen: cue('upload') + 0.35,
    uploadSend: cue('drop') + 0.8,
    // Data chapter: open a dataset from the list, then the Files tab.
    dsRow: Math.max(end('s07') + 0.3, cue('dsEach') + 0.6),
    pick: cue('selector') + 0.55,
    // Datasets chapter: back on the run page, View opens the version the pipeline published.
    viewClick: Math.max(cue('viewBtn') + 0.35, cue('runOutputs') + 0.9),
    dsFilesTab: end('d01') + 0.7,
    drawerOpen: cue('pencil') + 0.35,
    drawerSave: end('s10') + 0.35,
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
  ['concept', 'join', 'rstudio', 'pipelines', 'breact', 'members', 'rules', 'outro'].forEach((s) => TL.fx(SC[s], 'whoosh', 0.45));
  [cue('viewers'), cue('editors'), cue('admins')].forEach((x, i) => TL.blip(x - 0.05, [76, 79, 84][i], 0.5, (i - 1) * 0.4));
  TL.fx(cue('datasetMove') + 0.2, 'riser', 0.3, { dur: 0.8 });
  const A = TL.at;
  const clicks = [cue('joinNow') + 0.5, A.regDone, cue('files') - 0.1, A.uploadOpen - 0.3, A.uploadSend, cue('dbNav') - 0.1,
    cue('dataset') - 0.2, A.dsRow, cue('filesTab') + 0.1, cue('statistics'), cue('selector') + 0.15, A.pick, cue('downloadFile') + 0.2,
    cue('jupyter') - 0.1, A.tokenEye, A.tokenCopy, A.dlgLogIn, A.dlgContinue,
    cue('pipelines') - 0.1, A.runOpen - 0.3, A.runGo, A.createOpen - 0.3,
    A.viewClick, A.dsFilesTab, A.drawerOpen - 0.3, A.drawerSave, cue('access') + 0.1, A.linkOpen - 0.25, A.linkDone - 0.3,
    cue('settings') - 0.1, A.inviteOpen - 0.3, A.inviteDone - 0.3,
    cue('webapps') - 0.1, A.appOpen - 0.3, A.appAi - 0.1, A.appSend, cue('studio') - 0.3];
  clicks.forEach((x) => TL.fx(x, 'click', 0.55));
  [A.uploadSend + 0.9, A.runGo + 1.6, A.viewClick + 0.3, A.drawerSave + 0.3, A.linkDone + 0.2, A.dlgContinue + 0.4, A.inviteDone + 0.2, A.appDone].forEach((x, i) => TL.blip(x, [79, 84, 81, 84, 86, 88, 79, 86][i], 0.4, ((i % 3) - 1) * 0.3));
  TL.fx(A.appSend + 0.3, 'shimmer', 0.25);
  [cue('claude'), cue('connect') + 0.7, cue('gemini')].forEach((x, i) => TL.blip(x, [76, 79, 83][i], 0.4, (i - 1) * 0.4));
  TL.blip(cue('review'), 84, 0.4);
  // B-REACT chapter.
  TL.fx(cue('restrictedWs'), 'riser', 0.25, { dur: 0.6 });
  [cue('wsColumn'), cue('cleaned'), cue('sharesIt') + 1.2, A.tplCreate + 0.3].forEach((x, i) => TL.blip(x, [79, 81, 84, 86][i], 0.4, ((i % 3) - 1) * 0.3));
  TL.fx(A.tplCreate, 'click', 0.55);
  [cue('dpa') - 0.4, cue('dsa') - 0.2].forEach((x, i) => TL.blip(x, [76, 83][i], 0.45, (i - 0.5) * 0.6));
  TL.fx(TL.outroHit, 'swell', 0.5);
  TL.fx(TL.outroHit, 'impact', 0.5);
  TL.fx(TL.outroHit, 'shimmer', 0.4);
  TL.sfx.sort((a, b) => a.t - b.t);
  root.TL = TL;
})(typeof window !== 'undefined' ? window : globalThis);
