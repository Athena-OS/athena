import {Sync} from "./sync.js";
import {Migrate} from './migrate.js';
import {Proxy} from './proxy.js';
import './commands.js';

// ---------- Process Preferences --------------------------
// eslint-disable-next-line no-unused-vars
class ProcessPref {

  static {
    this.init();
  }

  static async init() {
    const pref = await browser.storage.local.get();

    // storage sync -> local update
    await Sync.get(pref);

    // migrate after storage sync check
    await Migrate.init(pref);

    // set proxy
    Proxy.set(pref);

    // add listener after migrate
    Sync.init(pref);
  }
}
// ---------- /Process Preferences -------------------------

// ---------- Initialisation -------------------------------
// browser.runtime.onInstalled.addListener(e => {
//   // show help
//   ['install', 'update'].includes(e.reason) && browser.tabs.create({url: '/content/help.html'});
// });