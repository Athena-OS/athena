// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/commands/onCommand
// https://developer.chrome.com/docs/extensions/reference/commands/#event-onCommand
// https://bugzilla.mozilla.org/show_bug.cgi?id=1843866
// Add tab parameter to commands.onCommand
// Firefox commands only returns command name
// Chrome commands returns command, tab

import {App} from './app.js';
import {Proxy} from './proxy.js';
import {OnRequest} from './on-request.js';

// ---------- Commands (Side Effect) ------------------------
// eslint-disable-next-line no-unused-vars
class Commands {

  static {
    // commands is not supported on Android
    browser.commands?.onCommand.addListener((...e) => this.process(...e));
  }

  static async process(name, tab) {
    const pref = await browser.storage.local.get();
    const host = pref.commands[name];

    switch (name) {
      case 'proxyByPatterns':
        this.set(pref, 'pattern');
        break;

      case 'disable':
        this.set(pref, 'disable');
        break;

      case 'setProxy':
        host && this.set(pref, host);
        break;

      case 'quickAdd':
        host && Proxy.quickAdd(pref, host);
        break;

      case 'excludeHost':
        Proxy.excludeHost(pref, tab);
        break;

      case 'setTabProxy':
        if (!App.firefox || !host) { break; }               // firefox only

        const proxy = pref.data.find(i => i.active && host === `${i.hostname}:${i.port}`);
        proxy && OnRequest.setTabProxy(proxy);
        break;

      case 'unsetTabProxy':
        if (!App.firefox) { break; }                        // firefox only

        OnRequest.unsetTabProxy();
        break;
    }
  }

  static set(pref, mode) {
    pref.mode = mode;
    browser.storage.local.set({mode});                      // save mode
    Proxy.set(pref);
  }
}