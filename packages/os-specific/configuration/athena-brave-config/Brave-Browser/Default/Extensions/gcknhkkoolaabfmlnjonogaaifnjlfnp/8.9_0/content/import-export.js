import {App} from './app.js';

// ---------- Import/Export Preferences --------------------
export class ImportExport {
  // 'pref' references the same object in the memory and its value gets updated
  static init(pref, callback) {
    this.callback = callback;
    document.getElementById('file').addEventListener('change', e => this.import(e, pref));
    document.getElementById('export').addEventListener('click', () => this.export(pref));
  }

  // import preferences
  static import(e, pref) {
    const file = e.target.files[0];
    switch (true) {
      case !file: App.notify(browser.i18n.getMessage('error')); return;
      case !['text/plain', 'application/json'].includes(file.type): // check file MIME type
        App.notify(browser.i18n.getMessage('fileTypeError'));
        return;
    }

    this.fileReader(file, r => this.readData(r, pref));
  }

  static readData(data, pref) {
    try { data = JSON.parse(data); }
    catch(e) {
      App.notify(browser.i18n.getMessage('fileParseError')); // display the error
      return;
    }

    // update pref with the saved version
    Object.keys(pref).forEach(item => Object.hasOwn(data, item) && (pref[item] = data[item]));

    this.callback();                                        // successful import
  }

  // export preferences
  static export(pref, saveAs = true) {
    const data = JSON.stringify(pref, null, 2);
    const filename = `${browser.i18n.getMessage('extensionName')}_${new Date().toISOString().substring(0, 10)}.json`;
    this.saveFile({data, filename, type: 'application/json', saveAs});
  }

  static saveFile({data, filename, saveAs = true, type = 'text/plain'}) {
    if (!browser.downloads) {
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data);
      a.setAttribute('download', filename);
      a.dispatchEvent(new MouseEvent('click'));
      return;
    }

    const blob = new Blob([data], {type});
    browser.downloads.download({
      url: URL.createObjectURL(blob),
      filename,
      saveAs,
      conflictAction: 'uniquify'
    })
    .catch(() => {});                                       // Suppress Error: Download canceled by the user
  }

  static fileReader(file, callback) {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.onerror = () => App.notify(browser.i18n.getMessage('fileReadError'));
    reader.readAsText(file);
  }
}