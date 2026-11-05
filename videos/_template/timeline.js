// Timing: lines laid end to end (gaps = silence before each line), scenes from script.json's
// `scene` field, cues from i18n.js. See core/timeline-kit.js for every option.
(function (root) {
  const TL = root.TLKit.build({
    gaps: { default: 0.8, s01: 1.5, s03: 1.2 },
    tail: 3.5,
    hitScene: 'outro',
  });
  // Sound design (types: whoosh riser impact shimmer swell click blip error key tick pop).
  TL.fx(0.9, 'shimmer', 0.5);
  TL.fx(TL.scenes.feature, 'whoosh', 0.5);
  TL.fx(TL.cue('openFiles') - 0.1, 'click', 0.7);
  TL.blip(TL.cue('upload') + 0.3, 79, 0.5);
  TL.fx(TL.outroHit, 'impact', 0.5);
  TL.fx(TL.outroHit, 'shimmer', 0.4);
  root.TL = TL;
})(typeof window !== 'undefined' ? window : globalThis);
