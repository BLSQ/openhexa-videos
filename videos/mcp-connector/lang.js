// L(en, fr): pick the string (or any value) for the language the kit selected (window.LANG).
(function (root) {
  root.L = (en, fr) => (root.LANG === 'fr' && fr !== undefined ? fr : en);
})(typeof window !== 'undefined' ? window : globalThis);
