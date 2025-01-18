// ---------- Polyfill (Side Effect) -----------------------
// Promise based 'browser' namespace is used to avoid conflict between
// callback 'chrome' API in MV2 & promise 'chrome' API in MV3
// In case of callback 'chrome' API in MV3, 'chrome' namespace is used
// Firefox & Edge: browser namespace
// Chrome & Opera: chrome namespace
typeof globalThis.browser === 'undefined' && (globalThis.browser = globalThis.chrome);
// MV3 action API
!browser.action && (browser.action = browser.browserAction);

// ---------- Default Preferences --------------------------
export const pref = {
  mode: 'disable',
  sync: false,
  autoBackup: false,
  passthrough: '',
  theme: '',
  container: {},
  commands: {},
  data: []
};
// ---------- /Default Preferences -------------------------

// ---------- App ------------------------------------------
export class App {

  static firefox = navigator.userAgent.includes('Firefox');
  static android = navigator.userAgent.includes('Android');
  // static chrome = navigator.userAgent.includes('Chrome');
  static basic = browser.runtime.getManifest().name === browser.i18n.getMessage('extensionNameBasic');

  // ---------- User Preferences ---------------------------
  static defaultPref = JSON.stringify(pref);
  // not syncing mode & sync (to have a choice), data (will be broken into parts)
  static syncProperties = Object.keys(pref).filter(i => !['mode', 'sync', 'data'].includes(i));

  static getDefaultPref() {
    return JSON.parse(this.defaultPref);
  }

  static getPref() {
    // update pref with the saved version
    return browser.storage.local.get().then(result => {
      Object.keys(result).forEach(i => pref[i] = result[i]);
    });
  }

  // ---------- Helper functions ---------------------------
  // https://bugs.chromium.org/p/chromium/issues/detail?id=478654
  // Add support for SVG images in Web Notifications API -> CH107
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1353252
  // svg broken from bg service worker
  static notify(message, title = browser.i18n.getMessage('extensionName'), id = '') {
    browser.notifications.create(id, {
      type: 'basic',
      iconUrl: '/image/icon48.png',
      title,
      message
    });
  }

  static equal(a, b) {                                      // bg options
    return JSON.stringify(a) === JSON.stringify(b);
  }

  static getFlag(cc) {
    cc = /^[A-Z]{2}$/i.test(cc) && cc.toUpperCase();
    return cc ? String.fromCodePoint(...[...cc].map(i => i.charCodeAt() + 127397)) : '🌎';
  }

  static parseURL(url) {
    // rebuild file://
    url.startsWith('file://') && (url = 'http' + url.substring(4));

    try { url = new URL(url); }
    catch (error) {
      alert(`${url} ➜ ${error.message}`);
      return {};
    }

    // check protocol
    if (!['http:', 'https:', 'file:'].includes(url.protocol)) {
      alert(`${url} ➜ Unsupported Protocol ${url.protocol}`);
      return {};
    }

    return url;
  }
}