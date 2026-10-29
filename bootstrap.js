
/* ===== LANGUAGE CONFIGURATION: ENGLISH ONLY ===== */

(function () {
  // English is the only enabled language.
  window.LANGS = [['en', 'English']];
  window.LANG = 'en';

  // Clear previously saved language selections.
  try {
    localStorage.setItem('wb_lang', 'en');
  } catch (e) {}

  // Load JavaScript files in the required order.
  function load(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.src = src + '?v=20261029-english-fix';

      script.onload = resolve;

      script.onerror = () => {
        console.error('[BOOTSTRAP] Failed to load:', script.src);
        reject(new Error('Failed to load ' + src));
      };

      document.body.appendChild(script);
    });
  }

  (async () => {
    try {
      await load('chat_times.js');
      await load('data.en.js');
      await load('i18n.js');
      await load('app.js');

      console.log('[BOOTSTRAP] English simulator loaded successfully.');
    } catch (error) {
      console.error('[BOOTSTRAP]', error);
      alert('Load error: ' + error.message);
    }
  })();
})();

// Keep the existing language button compatible.
function setLang() {
  try {
    localStorage.setItem('wb_lang', 'en');
  } catch (e) {}

  const url = new URL(location.href);
  url.searchParams.delete('lang');
  location.replace(url.toString());
}
