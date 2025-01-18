import {pref, App} from './app.js';
import {ProgressBar} from './progress-bar.js';
import {ImportExport} from './import-export.js';
import {Pattern} from './pattern.js';
import {Migrate} from './migrate.js';
import {Color} from './color.js';
import {Nav} from './nav.js';
import {Spinner} from './spinner.js';
import {Log} from './log.js';
import './show.js';
import './i18n.js';

// ---------- Popup --------------------------------------
export class Popup {

  static popup = document.querySelector('.popup');

  static {
    this.popup.children[0].addEventListener('click', () => this.hide());
  }

  static show(text) {
    this.popup.children[1].value = text;
    this.popup.classList.add('on');
  }

  static hide() {
    this.popup.classList.remove('on');
  }
}

// ---------- User Preferences -----------------------------
await App.getPref();

// ---------- Incognito Access -----------------------------
// eslint-disable-next-line no-unused-vars
class IncognitoAccess {

  static {
    // https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/proxy/settings
    // Changing proxy settings requires private browsing window access because proxy settings affect private and non-private windows.
    // https://github.com/w3c/webextensions/issues/429
    // Inconsistency: incognito in proxy.settings
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1725981
    // proxy.settings is not supported on Android
    App.firefox && App.hasProxySettings && browser.extension.isAllowedIncognitoAccess()
    .then(response => !response && alert(browser.i18n.getMessage('incognitoAccessError')));
  }
}
// ---------- /Incognito Access ----------------------------

// ---------- Toggle ---------------------------------------
class Toggle {

  static password(elem) {
    elem.addEventListener('click', () => {
      const input = elem.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  }
}
// ---------- /Toggle --------------------------------------

// ---------- Theme ----------------------------------------
// eslint-disable-next-line no-unused-vars
class Theme {
  static {
    this.elem = [document, ...[...document.querySelectorAll('iframe')].map(i => i.contentDocument)];
    pref.theme && this.set(pref.theme);
    document.body.style.opacity = 1;                        // show after
    document.getElementById('theme').addEventListener('change', e => this.set(e.target.value));
  }

  static set(value) {
    this.elem.forEach(i => i.documentElement.className = value);
  }
}
// ---------- /Theme ---------------------------------------

// ---------- Options --------------------------------------
class Options {

  static {
    // --- container
    this.container = document.querySelectorAll('.options .container select');

    // --- keyboard Shortcut
    this.commands = document.querySelectorAll('.options .commands select');

    // --- global passthrough
    this.passthrough = document.getElementById('passthrough');

    // --- buttons
    document.querySelector('.options button[data-i18n="restoreDefaults"]').addEventListener('click', () => this.restoreDefaults());

    this.init(['sync', 'autoBackup', 'theme', 'showPatternProxy', 'passthrough']);
  }

  static init(keys = Object.keys(pref)) {
    this.prefNode = document.querySelectorAll('#' + keys.join(',#')); // defaults to pref keys
    document.querySelectorAll('button[type="submit"]').forEach(i => i.addEventListener('click', () => this.check())); // submit button

    this.process();
  }

  static process(save) {
    // 'save' is only set when clicking the button to save options
    this.prefNode.forEach(node => {
      // value: 'select-one', 'textarea', 'text', 'number'
      const attr = node.type === 'checkbox' ? 'checked' : 'value';
      save ? pref[node.id] = node[attr] : node[attr] = pref[node.id];
    });

    save && !ProgressBar.show() && browser.storage.local.set(pref); // update saved pref
    this.fillContainerCommands();
  }

  static async check() {
    if (pref.managed) { return; }                           // not for storage.managed

    // --- global exclude, clean up, remove path, remove duplicates
    const passthrough = this.passthrough.value.trim();
    const [separator] = passthrough.match(/[\s,;]+/) || ['\n'];
    const arr = passthrough.split(/[\s,;]+/)
      .map(i => /[\d.]+\/\d+/.test(i) ? i : i.replace(/(?<=[a-z\d])\/[^\s,;]*/gi, '')); // remove path
    this.passthrough.value = [...new Set(arr)].join(separator); // remove duplicates
    pref.passthrough = this.passthrough.value;

    // --- check and build proxies & patterns
    const data = [];
    const cache = {};
    // using for loop to be able to break early
    for (const item of document.querySelectorAll('div.proxy-div details')) {
      const pxy = await this.getProxyDetails(item);
      if (!pxy) { return; }

      data.push(pxy);

      // cache to update Proxies cache
      const id = pxy.type === 'pac' ? pxy.pac : `${pxy.hostname}:${pxy.port}`;
      cache[id] = pxy;
    }

    // no errors, update pref.data
    pref.data = data;

    // update Log proxyCache
    Log.proxyCache = cache;                                 // used to get the details for the log

    // helper: remove if proxy is deleted or disabled
    const checkSelect = i => i.value && !cache[i.value]?.active && (i.value = '');

    // --- container proxy
    const container = {};
    this.container.forEach(i => {
      checkSelect(i);
      container[i.name] = i.value;
    });
    pref.container = container;                             // set to pref

    // --- keyboard shortcut proxy
    const commands = {};
    this.commands.forEach(i => {
      checkSelect(i);
      commands[i.name] = i.value;
    });
    pref.commands = commands;                               // set to pref

    // --- check mode
    // get from storage in case it was changed while options page has been open
    let {mode} = await browser.storage.local.get({mode: 'disable'});
    switch (true) {
      case pref.mode.includes('://') && !/:\d+$/.test(pref.mode) && !pref.data.some(i => i.active && i.type === 'pac' && mode === i.pac):
      case pref.mode.includes(':') && !pref.data.some(i => i.active && i.type !== 'pac' && mode === `${i.hostname}:${i.port}`):
      case pref.mode === 'pattern' && !pref.data.some(i => i.active && i.include[0]):
        mode = 'disable';
        break;
    }
    pref.mode = mode;

    // --- save options
    this.process(true);

    // --- update Proxy
    browser.runtime.sendMessage({id: 'setProxy', pref});

    // --- Auto Backup
    pref.autoBackup && ImportExport.export(pref, false);

    // --- Sync
    this.sync(pref);
  }

  // https://github.com/w3c/webextensions/issues/510
  // Proposal: Increase maximum item size in Storage sync quotas
  static sync(pref) {
    if (!pref.sync) { return; }

    // convert array to object {...data} to avoid sync maximum item size limit
    const obj = {...pref.data};

    // add other sync properties
    App.syncProperties.forEach(i => obj[i] = pref[i]);

    // save changes to sync
    browser.storage.sync.set(obj)
    .then(() => {
      // delete left-over proxies
      browser.storage.sync.get()
      .then(syncObj => {
        // get & delete numerical keys that are equal or larger than data length, the rest are overwritten
        const del = Object.keys(syncObj).filter(i => /^\d+$/.test(i) && i*1 >= pref.data.length);
        del[0] && browser.storage.sync.remove(del);
      });
    })
    .catch(error => {
      App.notify(browser.i18n.getMessage('syncError') + '\n\n' + error.message);
      // disabling sync option to avoid repeated errors
      document.getElementById('sync').checked = false;
      browser.storage.local.set({sync: false});
    });
  }

  static async getProxyDetails(elem) {
    // blank proxy
    const obj = {
      active: true,
      title: '',
      type: 'http',
      hostname: '',
      port: '',
      username: '',
      password: '',
      cc: '',
      city: '',
      color: '',
      pac: '',
      pacString: '',
      proxyDNS: true,
      include: [],
      exclude: [],
    };

    // --- populate values
    elem.querySelectorAll('[data-id]').forEach(i => {
      i.classList.remove('invalid');                        // reset
      Object.hasOwn(obj, i.dataset.id) && (obj[i.dataset.id] = i.type === 'checkbox' ? i.checked : i.value.trim());
    });

    // --- check type: http | https | socks4 | socks5 | pac | direct
    switch (true) {
      // DIRECT
      case obj.type === 'direct':
        obj.hostname = 'DIRECT';
        break;

      // PAC
      case obj.type === 'pac':
        const {hostname, port} = App.parseURL(obj.pac);
        if (!hostname) {
          this.setInvalid(elem, 'pac');
          // alert(browser.i18n.getMessage('pacUrlError'));
          return;
        }
        obj.hostname = hostname;
        obj.port = port;
        break;

      // http | https | socks4 | socks5
      case !obj.hostname:
        this.setInvalid(elem, 'hostname');
        alert(browser.i18n.getMessage('hostnamePortError'));
        return;

      case !obj.port:
        this.setInvalid(elem, 'port');
        alert(browser.i18n.getMessage('hostnamePortError'));
        return;
    }

    // --- title check
    if (!obj.title) {
      const id = obj.type === 'pac' ? obj.pac : `${obj.hostname}:${obj.port}`;
      elem.children[0].children[1].textContent = id;
    }

    // --- check store locally for active PAC
    if (obj.active && obj.pac) {
      const storeLocally = elem.querySelector('.pac input[type="checkbox"]');
      if (storeLocally.checked) {
        const str = await Proxies.getPAC(obj.pac);
        /function\s+FindProxyForURL\s*\(/.test(str) && (obj.pacString = str.trim());
      }
    }

    // --- check & build patterns
    const cache = [];
    for (const item of elem.querySelectorAll('.pattern-box .pattern-row')) {
      const [, inc, type, title, pattern, active] = item.children;
      pattern.classList.remove('invalid');                    // reset
      const pat = {
        type: type.value,
        title: title.value.trim(),
        pattern: pattern.value.trim(),
        active: active.checked,
      };

      // --- test pattern
      if (!pat.pattern) { continue; }                         // blank pattern

      if (!Pattern.validate(pat.pattern, pat.type, true)) {
        Nav.get('proxies');                                   // show Proxy tab
        const details = item.closest('details');
        details.open = true;                                  // open proxy
        pattern.classList.add('invalid');
        pattern.scrollIntoView({behavior: 'smooth'});
        return;
      }

      // check for duplicate
      if (cache.includes(pat.pattern)) {
        item.remove();
        continue;
      }

      cache.push(pat.pattern);                                // cache to check for duplicates
      obj[inc.value].push(pat);
    }
    return obj;
  }

  static setInvalid(parent, id) {
    parent.open = true;
    const elem = parent.querySelector(`[data-id="${id}"]`);
    elem.classList.add('invalid');
    parent.scrollIntoView({behavior: 'smooth'});
  }

  static restoreDefaults() {
    if (!confirm(browser.i18n.getMessage('restoreDefaultsConfirm'))) { return; }

    const db = App.getDefaultPref();
    Object.keys(db).forEach(i => pref[i] = db[i]);
    this.process();
    Proxies.process();
  }

  // --- container & commands
  static fillContainerCommands() {
    // reset
    this.clearSelect(this.container);
    this.clearSelect(this.commands);

    const docFrag = document.createDocumentFragment();

    // filter out PAC
    pref.data.filter(i => i.active && i.type !== 'pac').forEach(item => {
      const flag = App.getFlag(item.cc);
      const value = `${item.hostname}:${item.port}`;
      const opt = new Option(flag + ' ' + (item.title || value), value);
      // opt.style.color = item.color;                         // supported on Chrome, not on Firefox

      docFrag.appendChild(opt.cloneNode(true));
    });

    this.container.forEach(i => {
      i.appendChild(docFrag.cloneNode(true));
      pref.container[i.name] && (i.value = pref.container[i.name]);
    });

    this.commands.forEach(i => {
      i.appendChild(docFrag.cloneNode(true));
      pref.commands[i.name] && (i.value = pref.commands[i.name]);
    });
  }

  static clearSelect(elem) {
    // remove children except the first one
    elem.forEach(i =>
      [...i.children].forEach((opt, idx) => idx && opt.remove())
    );
  }
}
// ---------- /Options -------------------------------------

// ---------- browsingData ---------------------------------
// eslint-disable-next-line no-unused-vars
class BrowsingData {

  static {
    document.querySelector('#deleteBrowsingData').addEventListener('click', () => this.process());
    this.init();
  }

  static async init() {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/request
    // Any permissions granted are retained by the extension, even over upgrade and disable/enable cycling.
    // check if permission is granted
    this.permission = await browser.permissions.contains({permissions: ['browsingData']});
  }

  static async process() {
    if (!this.permission) {
      // request permission
      // Chrome appears to return true, granted silently without a popup prompt
      this.permission = await browser.permissions.request({permissions: ['browsingData']});
      if (!this.permission) { return; }
    }

    if (!confirm(browser.i18n.getMessage('deleteBrowsingDataConfirm'))) { return; }

    browser.browsingData.remove({}, {
      cookies: true,
      indexedDB: true,
      localStorage: true
    })
   .catch(error => App.notify(browser.i18n.getMessage('deleteBrowsingData') + '\n\n' + error.message));
 }
}
// ---------- /browsingData --------------------------------

// ---------- WebRTC ---------------------------------------
// eslint-disable-next-line no-unused-vars
class WebRTC {

  static {
    this.webRTC = document.querySelector('#limitWebRTC');
    this.webRTC.addEventListener('change', () => this.process());
    this.init();
  }

  static async init() {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/request
    // Any permissions granted are retained by the extension, even over upgrade and disable/enable cycling.
    // check if permission is granted
    this.permission = await browser.permissions.contains({permissions: ['privacy']});

    // check webRTCIPHandlingPolicy
    if (this.permission) {
      this.result = await browser.privacy.network.webRTCIPHandlingPolicy.get({});
      this.webRTC.checked = this.result.value !== 'default';
    }
  }

  static async process() {
    if (!this.permission) {
      // request permission, Firefox for Android version 102
      this.permission = await browser.permissions.request({permissions: ['privacy']});
      if (!this.permission) {
        this.webRTC.checked = false;
        return;
      }
    }

    // https://bugzilla.mozilla.org/show_bug.cgi?id=1790270
    // WebRTC bypasses Network settings & proxy.onRequest
    // {"levelOfControl": "controllable_by_this_extension", "value": "default"}
    this.result ||= await browser.privacy.network.webRTCIPHandlingPolicy.get({});
    const def = this.result.value === 'default';
    const value = def ? 'default_public_interface_only' : 'default';
    this.result.value = value;
    this.webRTC.checked = def;                              // was default but now changed
    browser.privacy.network.webRTCIPHandlingPolicy.set({value});
  }
}
// ---------- /WebRTC --------------------------------------

// ---------- Proxies --------------------------------------
class Proxies {

  static {
    this.docFrag = document.createDocumentFragment();
    this.proxyDiv = document.querySelector('div.proxy-div');
    const temp = document.querySelector('.proxySection template').content;
    this.proxyTemplate = temp.firstElementChild;
    this.patternTemplate = temp.lastElementChild;

    // --- buttons
    document.querySelector('.proxySection .proxy-top button[data-i18n="getLocation"]').addEventListener('click', () => this.getLocation());
    document.querySelector('.proxySection .proxy-top button[data-i18n="add"]').addEventListener('click', () => this.addProxy());

    // --- proxy filter
    const filter = document.querySelector('#filter');
    filter.value = '';                                      // reset after reload
    filter.addEventListener('input', e => this.filterProxy(e));

    this.proxyCache = {};                                   // used to find proxy
    Log.proxyCache = this.proxyCache;                       // used to get the details for the log
    Log.mode = pref.mode;

    // --- hide elements for Basic
    // const showJS = document.querySelector('.show-js');
    // App.basic && showJS.classList.add('basic');
    // !App.firefox && showJS.classList.add('chrome');

    this.process();
  }

  static process() {
    this.proxyDiv.textContent = '';                         // reset
    pref.data.forEach(i => this.addProxy(i));
    this.proxyDiv.appendChild(this.docFrag);
  }

  static addProxy(item) {
    // --- details: make a blank proxy with all event listeners
    const pxy = this.proxyTemplate.cloneNode(true);
    const summary = pxy.children[0];
    const proxyBox = pxy.children[1].children[0];
    const patternBox = pxy.children[1].children[2];

    // disable draggable when details is open
    summary.addEventListener('click', () => pxy.draggable = pxy.open);

    // --- summary
    const [flag, sumTitle, active, dup, del, up, down] = summary.children;
    dup.addEventListener('click', () => this.duplicateProxy(pxy));
    del.addEventListener('click', () => confirm(browser.i18n.getMessage('deleteConfirm')) && pxy.remove());
    up.addEventListener('click', () => pxy.previousElementSibling?.before(pxy));
    down.addEventListener('click', () => pxy.nextElementSibling?.after(pxy));

    // proxy data
    const [title, hostname, type, port, cc, username, city, passwordSpan, colorSpan, pacSpan, proxyDNS] = [...proxyBox.children].filter((e, i) => i%2);
    title.addEventListener('change', e => sumTitle.textContent = e.target.value);

    const [pac, storeLocallyLabel, view] = pacSpan.children;

    type.addEventListener('change', e => {
      pxy.dataset.type = e.target.value;                    // show/hide elements

      switch (e.target.options[e.target.selectedIndex].textContent) {
        case 'TOR':
          flag.textContent = '🌎';
          sumTitle.textContent = 'TOR';
          title.value = 'TOR';
          hostname.value = '127.0.0.1';
          port.value = '9050';
          break;

        case 'Psiphon':
          flag.textContent = '🌎';
          sumTitle.textContent = 'Psiphon';
          title.value = 'Psiphon';
          hostname.value = '127.0.0.1';
          port.value = '60351';
          break;

        case 'Privoxy':
          flag.textContent = '🌎';
          sumTitle.textContent = 'Privoxy';
          title.value = 'Privoxy';
          hostname.value = '127.0.0.1';
          port.value = '8118';
          break;

        case 'PAC':
          flag.textContent = '🌎';
          sumTitle.textContent = 'PAC';
          title.value = 'PAC';
          break;

        case 'DIRECT':
          flag.textContent = '⮕';
          sumTitle.textContent = 'DIRECT';
          title.value = 'DIRECT';
          hostname.value = 'DIRECT';
          break;
        }
    });

    cc.addEventListener('change', () => flag.textContent = App.getFlag(cc.value));
    Toggle.password(passwordSpan.children[1]);

    // random color
    const color = item?.color || Color.getRandom();
    summary.style.borderLeftColor = color;
    const [colorInput, colorButton] = colorSpan.children;
    colorInput.value = color;
    colorInput.addEventListener('change', e => summary.style.borderLeftColor = e.target.value);

    colorButton.addEventListener('click', e => {
      e.target.previousElementSibling.value = Color.getRandom();
      summary.style.borderLeftColor = e.target.previousElementSibling.value;
    });

    pac.addEventListener('change', e => {
      const {hostname: h, port: p} = App.parseURL(e.target.value);
      if (!h) {
        e.target.classList.add('invalid');
        return;
      }
      hostname.value = h;
      port.value = p;
      type.value = 'pac';
      title.value ||= 'PAC';
      sumTitle.textContent ||= 'PAC';
    });

    // patterns
    pxy.querySelector('button[data-i18n="add|title"]').addEventListener('click', () => {
      this.addPattern(patternBox);
      patternBox.lastElementChild.scrollIntoView(false);
      patternBox.lastElementChild.children[4].focus();
    });
    pxy.querySelector('input[type="file"]').addEventListener('change', e => this.importPattern(e, patternBox));
    pxy.querySelector('button[data-i18n^="export"]').addEventListener('click', () =>
      this.exportPattern(patternBox, title.value.trim() || hostname.value.trim()));

    // from add button
    if (!item) {
      this.proxyDiv.appendChild(pxy);                       // insert blank proxy
      pxy.open = true;                                      // open the proxy details
      pxy.draggable = false;                                // disable draggable
      title.focus();
      pxy.scrollIntoView({behavior: 'smooth'});
      return;
    }

    // show/hide elements
    pxy.dataset.type = item.type;

    const id = item.type === 'pac' ? item.pac : `${item.hostname}:${item.port}`;
    this.proxyCache[id] = item;                             // cache to find later

    // --- populate with data
    const pxyTitle = item.title || id;

    // --- summary
    flag.textContent = App.getFlag(item.cc);
    sumTitle.textContent = pxyTitle;
    active.checked = item.active;

    // proxy details
    title.value = item.title;
    hostname.value = item.hostname;
    type.value = item.type;
    port.value = item.port;
    cc.value = item.cc;
    cc.dataset.hostname = item.hostname;                    // for "Get Location"
    username.value = item.username;
    city.value = item.city;
    city.dataset.hostname = item.hostname;                  // for "Get Location"
    passwordSpan.children[0].value = item.password;

    pac.value = item.pac;
    storeLocallyLabel.children[0].checked = !!item.pacString;
    view.addEventListener('click', () => this.viewPac(pac.value.trim()));

    proxyDNS.checked = item.proxyDNS;

    // patterns
    item.include.forEach(i => this.addPattern(patternBox, i, 'include'));
    item.exclude.forEach(i => this.addPattern(patternBox, i, 'exclude'));

    // return pxy;
    this.docFrag.appendChild(pxy);
  }

  static async getPAC(url) {
    Spinner.show();
    const text = await fetch(url)
    .then(response => response.text())
    .catch(error => error);
    Spinner.hide();
    return text;
  }

  static async viewPac(url) {
    if (!url) { return; }

    const text = await this.getPAC(url);
    Popup.show(text);
  }

  static addPattern(parent, item, inc) {
    // --- make a blank pattern with all event listeners
    const div = this.patternTemplate.cloneNode(true);
    const [quickAdd, include, type, title, pattern, active, test, del] = div.children;

    quickAdd.addEventListener('change', e => {
      const opt = e.target.options[e.target.selectedIndex];
      type.value = opt.dataset.type;
      title.value = opt.textContent;
      pattern.value = opt.value;
      e.target.selectedIndex = 0;                           // reset select option
    });

    test.addEventListener('click', () => {
      Tester.select.value = type.value;
      Tester.pattern.value = pattern.value;
      Tester.target = pattern;
      Nav.get('tester');                                    // navigate to Tester tab
    });

    // del.addEventListener('click', () => confirm(browser.i18n.getMessage('deleteConfirm')) && div.remove());
    del.addEventListener('click', () => div.remove());

    if (item) {
      include.value = inc;
      type.value = item.type;
      title.value = item.title;
      pattern.value = item.pattern;
      active.checked = item.active;
    }

    parent.appendChild(div);
  }

  static async duplicateProxy(item) {
    const pxy = await Options.getProxyDetails(item);
    if (!pxy) { return; }

    this.addProxy(pxy);
    item.after(this.docFrag);
  }

  static importPattern(e, patternBox) {
    const file = e.target.files[0];
    switch (true) {
      case !file: App.notify(browser.i18n.getMessage('error')); return;
      case !['text/plain', 'application/json'].includes(file.type): // check file MIME type
        App.notify(browser.i18n.getMessage('fileTypeError'));
        return;
    }

    ImportExport.fileReader(file, data => {
      try { data = JSON.parse(data); }
      catch(e) {
        App.notify(browser.i18n.getMessage('fileParseError')); // display the error
        return;
      }

      Array.isArray(data) && data.forEach(i => this.addPattern(patternBox, i, i.include));
    });
  }

  static exportPattern(patternBox, title = '') {
    const arr = [...patternBox.children].map(item => {
      const elem = item.children;
      return {
        include: elem[1].value,
        type: elem[2].value,
        title: elem[3].value.trim(),
        pattern: elem[4].value.trim(),
        active: elem[5].checked,
      };
    });

    if (!arr[0]) { return; }                                // no patterns to export

    title &&= '_' + title;
    const data = JSON.stringify(arr, null, 2);
    const filename = `${browser.i18n.getMessage('pattern')}${title}_${new Date().toISOString().substring(0, 10)}.json`;
    ImportExport.saveFile({data, filename, type: 'application/json'});
  }

  static getLocation() {
    // filter & remove duplicates
    const ignore = ['DIRECT', '127.0.0.1', 'localhost'];
    const list = pref.data.filter(i => !ignore.includes(i.hostname)).map(i => i.hostname);
    const hosts = [...new Set(list)];
    if (!hosts[0]) { return; }

    Spinner.show();

    fetch('https://getfoxyproxy.org/webservices/lookup.php?' + hosts.join('&'))
    .then(response => response.json())
    .then(json => this.updateLocation(json))
    .catch(error => {
      Spinner.hide();
      alert(error);
    });
  }

  static updateLocation(json) {
    // update display
    this.proxyDiv.querySelectorAll('[data-id="cc"], [data-id="city"]').forEach(item => {
      const {hostname, id} = item.dataset;
      const value = item.value;                             // cache old value to compare
      json[hostname]?.[id] && (item.value = json[hostname][id]);
      id === 'cc' && item.value !== value && item.dispatchEvent(new Event('change')); // dispatch change event
    });

    Spinner.hide();
  }

  static filterProxy(e) {
    const str = e.target.value.toLowerCase().trim();
    if (!str) {
      [...this.proxyDiv.children].forEach(i => i.classList.remove('off'));
      return;
    }

    [...this.proxyDiv.children].forEach(item => {
      const proxyBox = item.children[1].children[0];
      const title = proxyBox.children[1].value;
      const hostname = proxyBox.children[3].value;
      const port = ':' + proxyBox.children[7].value;
      item.classList.toggle('off', ![title, hostname, port].some(i => i.toLowerCase().includes(str)));
    });
  }
}
// ---------- /Proxies -------------------------------------

// ---------- Drag and Drop --------------------------------
// eslint-disable-next-line no-unused-vars
class Drag {

  static {
    this.proxyDiv = document.querySelector('div.proxy-div');
    this.proxyDiv.addEventListener('dragover', e => this.dragover(e));
    this.proxyDiv.addEventListener('dragend', e => this.dragend(e));
    this.target = null;
  }

  static dragover(e) {
    const target = e.target.closest('details');
    target && (this.target = target);
  }

  static dragend(e) {
    if (!this.target) { return; }

    const arr = [...this.proxyDiv.children];
    arr.indexOf(e.target) > arr.indexOf(this.target) ? this.target.before(e.target) : this.target.after(e.target);
  }
}
// ---------- /Drag and Drop -------------------------------

// ---------- Import FP Account ----------------------------
// eslint-disable-next-line no-unused-vars
class ImportFoxyProxyAccount {

  static {
    this.username = document.querySelector('.import-account #username');
    this.password = document.querySelector('.import-account #password');
    Toggle.password(this.password.nextElementSibling);
    document.querySelector('.import-account button[data-i18n="import"]').addEventListener('click', () => this.process());
  }

  static async process() {
    // --- check username/password
    const username = this.username.value.trim();
    const password = this.password.value.trim();
    if (!username || !password) {
      alert(browser.i18n.getMessage('userPassError'));
      return;
    }

    Spinner.show();

    // --- fetch data
    const data = await this.getAccount(username, password);
    if (data) {
      data.forEach(item => {
        // proxy template
        const pxy = {
          active: true,
          title: '',
          type: 'https',
          hostname: item.hostname,
          port: '443',
          username: item.username,
          password: item.password,
          cc: item.country_code === 'UK' ? 'GB' : item.country_code, // convert UK to ISO 3166-1 GB
          city: item.city,
          color: '',                                        // random color will be set
          pac: '',
          pacString: '',
          proxyDNS: true,
          include: [],
          exclude: [],
        };

        const [title] = item.hostname.split('.');

        // --- add http port
        pxy.type = 'http';
        pxy.port = item.port[0];
        // pxy.title = title + '.' + item.port[0];
        pxy.title = title;                                  // no need to add port if SSL is not added
        Proxies.addProxy(pxy);

        // --- add SSL port
        // pxy.type = 'https';
        // pxy.port = item.ssl_port;
        // pxy.title = title + '.' + item.ssl_port;
        // Proxies.addProxy(pxy);
      });

      Proxies.proxyDiv.appendChild(Proxies.docFrag);
      Nav.get('proxies');
    }

    Spinner.hide();
  }

  static async getAccount(username, password) {
    // --- fetch data
    return fetch('https://getfoxyproxy.org/webservices/get-accounts.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `username=${encodeURIComponent(username)}&password=${(encodeURIComponent(password))}`
    })
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data) || !data[0]?.hostname) {
        App.notify(browser.i18n.getMessage('error'));
        return;
      }

      data = data.filter(i => i.active === 'true');         // import active accounts only
      data.sort((a, b) => a.country.localeCompare(b.country)); // sort by country
      return data;
    })
    .catch(error => App.notify(browser.i18n.getMessage('error') + '\n\n' + error.message));
  }
}
// ---------- /Import FP Account ---------------------------

// ---------- Import From URL ------------------------------
// eslint-disable-next-line no-unused-vars
class importFromUrl {

  static {
    this.input = document.querySelector('.import-from-url input');
    document.querySelector('.import-from-url button').addEventListener('click', () => this.process());
  }

  static process() {
    this.input.value = this.input.value.trim();
    if (!this.input.value) { return; }

    Spinner.show();

    // --- fetch data
    fetch(this.input.value)
    .then(response => response.json())
    .then(data => {
      // update pref with the saved version
      Object.keys(pref).forEach(i => Object.hasOwn(data, i) && (pref[i] = data[i]));

      Options.process();                                    // set options after the pref update
      Proxies.process();                                    // update page display
      Nav.get('proxies');                                   // show Proxy tab
      Spinner.hide();
    })
    .catch(error => {
      App.notify(browser.i18n.getMessage('error') + '\n\n' + error.message);
      Spinner.hide();
    });
  }
}
// ---------- /Import From URL -----------------------------

// ---------- Import List ----------------------------------
// eslint-disable-next-line no-unused-vars
class ImportProxyList {

  static {
    this.textarea = document.querySelector('.import-proxy-list textarea');
    document.querySelector('.import-proxy-list button').addEventListener('click', () => this.process());
  }

  static process() {
    this.textarea.value = this.textarea.value.trim();
    if (!this.textarea.value) { return; }

   for (const item of this.textarea.value.split(/\n+/)) {
      // simple vs Extended format
      const pxy = item.includes('://') ? this.parseExtended(item) : this.parseSimple(item);
      if (!pxy) {
        // end on error
        Proxies.docFrag.textContent = '';
        return;
      }

      Proxies.addProxy(pxy);
    }

    Proxies.proxyDiv.appendChild(Proxies.docFrag);
    Nav.get('proxies');
  }

  static parseSimple(item) {
    // example.com:3128:user:pass
    const [hostname, port, username = '', password = ''] = item.split(':');
    if (!hostname || !port || !(port*1)) {
      alert(`Error: ${item}`);
      return;
    }

    // proxy template
    const pxy = {
      active: true,
      title: '',
      type: 'http',
      hostname,
      port,
      username,
      password,
      cc: '',
      city: '',
      color: '',
      pac: '',
      pacString: '',
      proxyDNS: true,
      include: [],
      exclude: [],
    };

    return pxy;
  }

  static parseExtended(item) {
    // https://user:password@78.205.12.1:21?color=ff00bc&title=work%20proxy
    // https://example.com:443?active=false&title=Work&username=abcd&password=1234&cc=US&city=Miami
    let url;
    try { url = new URL(item); }
    catch (error) {
      alert(`${error}\n\n${item}`);
      return;
    }

    // convert old schemes to type
    let type = url.protocol.slice(0, -1);
    const scheme = {
      proxy: 'http',
      ssl: 'https',
      socks: 'socks5',
    };
    scheme[type] && (type = scheme[type]);
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1851426
    // Reland URL: protocol setter needs to be more restrictive around file (fixed in Firefox 120)
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1603699
    // Enable DefaultURI use for unknown schemes (fixed in Firefox 122)
    // missing hostname, port with socks protocol (#120)
    !url.hostname && (url = new URL('http:' + item.substring(url.protocol.length)));

    const {hostname, port, username, password} = url;
    // set to pram, can be overridden in searchParams
    const pram = {type, hostname, port, username, password};

    // prepare object, make parameter keys case-insensitive
    for (const [key, value] of url.searchParams) {
      pram[key.toLowerCase()] = value;
    }

    // fix missing default port
    const defaultPort = {
      http: '80',
      https: '443',
      ws: '80',
      wss: '443'
    };
    !pram.port && defaultPort[type] && (pram.port = defaultPort[type]);

    // proxy template
    const pxy = {
      active: pram.active !== 'false',                      // defaults to true
      title: pram.title || '',
      type: pram.type.toLowerCase(),
      hostname: pram.hostname,
      port: pram.port,
      username: decodeURIComponent(pram.username),
      password: decodeURIComponent(pram.password),
      cc: (pram.cc || pram.countrycode || '').toUpperCase(),
      city: pram.city || '',
      color: pram.color ? '#' + pram.color : '',
      pac: pram.pac || (pram.type === 'pac' && url.origin + url.pathname) || '',
      pacString: '',
      proxyDNS: pram.proxydns !== 'false',                  // defaults to true
      include: [],
      exclude: [],
    };

    return pxy;
  }
}
// ---------- /Import List ---------------------------------

// ---------- Import Older Export --------------------------
// eslint-disable-next-line no-unused-vars
class importFromOlder {

  static {
    document.querySelector('.import-from-older input').addEventListener('change', e => this.process(e));
  }

  static process(e) {
    const file = e.target.files[0];
    switch (true) {
      case !file: App.notify(browser.i18n.getMessage('error')); return;
      case !['text/plain', 'application/json'].includes(file.type): // check file MIME type
        App.notify(browser.i18n.getMessage('fileTypeError'));
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => this.parseJSON(reader.result);
    reader.onerror = () => App.notify(browser.i18n.getMessage('fileReadError'));
    reader.readAsText(file);
  }

  static parseJSON(data) {
    try { data = JSON.parse(data); }
    catch(e) {
      App.notify(browser.i18n.getMessage('fileParseError')); // display the error
      return;
    }

    data = Object.hasOwn(data, 'settings') ? Migrate.convert3(data) : Migrate.convert7(data);
    // update pref with the saved version
    Object.keys(pref).forEach(i => Object.hasOwn(data, i) && (pref[i] = data[i]));

    Options.process();                                      // set options after the pref update
    Proxies.process();                                      // update page display
    Nav.get('proxies');                                     // show Proxy tab
  }
}
// ---------- /Import Older Export -------------------------

// ---------- Tester ---------------------------------------
class Tester {

  static {
    this.url = document.querySelector('.tester input[type="url"]');
    this.select = document.querySelector('.tester select');
    this.pattern = document.querySelector('.tester input[type="text"]');
    this.result = document.querySelector('.tester .test-result');
    document.querySelector('.tester button[data-i18n="back"]').addEventListener('click', () => this.back());
    document.querySelector('.tester button[data-i18n="test"]').addEventListener('click', () => this.process());
  }

  static process() {
    // --- reset
    this.pattern.classList.remove('invalid');
    this.result.textContent = '';

    this.url.value = this.url.value.trim();
    this.pattern.value = this.pattern.value.trim();
    if(!this.url.value || !this.pattern.value ) {
      this.result.textContent = '❌';
      return;
    }

    // convert wildcard to regex string if needed
    const str = Pattern.get(this.pattern.value, this.select.value);

    // test regex string
    let regex;
    try {
      regex = new RegExp(str, 'i');
    }
    catch (error) {
      this.pattern.classList.add('invalid');
      this.result.textContent = error;
      return;
    }

    this.result.textContent = regex.test(this.url.value) ? '✅' : '❌';
  }

  static back() {
    if (!this.target) { return; }

    Nav.get('proxies');                                     // show Proxy tab
    const details = this.target.closest('details');
    details.open = true;                                    // open proxy
    this.target.scrollIntoView({behavior: 'smooth'});
    this.target.focus();
  }
}
// ---------- /Tester --------------------------------------

// ---------- Import/Export Preferences --------------------
ImportExport.init(pref, () => {
  Options.process();                                        // set options after the pref update
  Proxies.process();                                        // update page display
});
// ---------- /Import/Export Preferences -------------------

// ---------- Navigation -----------------------------------
Nav.get();