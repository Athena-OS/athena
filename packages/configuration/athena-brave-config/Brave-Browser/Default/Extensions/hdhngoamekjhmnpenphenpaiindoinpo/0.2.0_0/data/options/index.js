/* global cookies */
'use strict';

document.getElementById('import').addEventListener('change', ({target}) => {
  if (target.value !== target.initialValue) {
    const file = target.files[0];
    if (file.size > 10e6) {
      console.warn('10MB of cookies? I don\'t believe you.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = event => {
      const json = JSON.parse(event.target.result);
      json.forEach(c => cookies.replace(c.origin, c, c));

      const log = document.getElementById('log');
      log.textContent = json.length + ' cookie(s) are imported';

      window.setTimeout(() => log.textContent = '', 2000);
    };
    reader.readAsText(file, 'utf-8');
  }
});
