// On-screen copy per language, and `cues`: the narration words visual beats sync to,
// as [lineId, wordPrefix, nth]. Word prefixes are matched accent- and case-insensitively against
// the Whisper transcript; `npm run v -- <id> check` lists cues that matched nothing.
// App mock-up labels come from core/app-strings.js; override any key here if needed.
(function (root) {
  root.I18N = {
    en: {
      intro: { kicker: 'New in OpenHEXA', title: ['The new', 'FEATURE'], sub: 'One line on what it gives you' },
      feature: { title: 'Files', desc: 'Shared storage for <b>all your files</b>.', doc: 'docs.openhexa.com/files/' },
      outro: { title: ['Try it', 'today'], button: 'Open OpenHEXA' },
      cues: {
        introTitle: ['s01', 'meet'],
        openFiles: ['s02', 'files'],
        upload: ['s02', 'upload'],
        tryIt: ['s03', 'try'],
      },
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
