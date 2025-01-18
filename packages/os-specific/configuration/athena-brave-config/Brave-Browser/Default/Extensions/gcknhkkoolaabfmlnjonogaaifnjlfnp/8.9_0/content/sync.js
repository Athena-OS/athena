import {App} from './app.js';

// ---------- Storage Sync ---------------------------------
export class Sync {

  static init(pref) {
    if (pref.managed) { return; }                           // not for storage.managed

    // Chrome 73, Firefox 101
    // browser.storage.sync.onChanged.addListener(e => this.onChanged(e));
    // Firefox 45
    browser.storage.onChanged.addListener((...e) => this.onChanged(...e));
  }

  static async onChanged(changes, area) {
    if (area !== 'sync') { return; }

    const pref = await browser.storage.local.get();
    this.getSync(pref);
  }

  static async get(pref) {
    await this.getManaged(pref);                            // check storage.managed
    await this.getSync(pref);                               // check storage.sync
  }

  // https://bugzilla.mozilla.org/show_bug.cgi?id=1868153
  // On Firefox storage.managed returns undefined if not found
  static async getManaged(pref) {
    const result = await browser.storage.managed.get().catch(() => {});
    if (!Array.isArray(result?.data) || !result.data[0]) {  // storage.managed not found
      if (Object.hasOwn(pref, 'managed')) {                 // clean up
        delete pref.managed;
        await browser.storage.local.remove('managed');
      }
      return;
    }

    const db = App.getDefaultPref();                        // get default pref
    Object.keys(db).forEach(i => pref[i] = db[i]);          // revert pref to default values

    Object.keys(result).forEach(i => Object.hasOwn(pref, i) && (pref[i] = result[i]));  // set data from storage.managed
    pref.managed = true;                                    // set pref.managed to use in options.js, popup.js
    pref.sync = false;                                      // no sync for storage.managed

    // --- update database
    await browser.storage.local.set(pref);
  }

  static hasOldData(obj) {
    // FP v3 OR FP v7, null value causes an error
    return Object.hasOwn(obj, 'settings') || Object.values(obj).some(i => i && Object.hasOwn(i, 'address'));
  }

  static async getSync(pref) {
    if (!pref.sync) { return; }
    if (pref.managed) { return; }

    const syncPref = await browser.storage.sync.get();

    // check sync from old version 3-7
    if ((!Object.keys(pref)[0] || this.hasOldData(pref)) && this.hasOldData(syncPref)) { // (local has no data OR has old data) AND sync has old data
      Object.keys(syncPref).forEach(i => pref[i] = syncPref[i]); // set sync data to pref to migrate next in background.js
      return;
    }

    // convert object to array & filter proxies
    const data = Object.values(syncPref).filter(i => Object.hasOwn(i, 'hostname'));

    const obj = {};
    if (data[0] && !App.equal(pref.data, data)) {
      obj.data = data;
      pref.data = data;
    }

    App.syncProperties.forEach(item => {
      if (Object.hasOwn(syncPref, item)) {
        obj[item] = syncPref[item];
        pref[item] = syncPref[item];
      }
    });

    Object.keys(obj)[0] && await browser.storage.local.set(obj); // update saved pref
  }
}