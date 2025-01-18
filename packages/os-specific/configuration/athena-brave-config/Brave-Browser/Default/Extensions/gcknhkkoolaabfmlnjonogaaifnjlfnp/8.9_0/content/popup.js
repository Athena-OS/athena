import {pref, App} from './app.js';
import {Location} from './location.js';
import './show.js';
import './i18n.js';

// ---------- User Preferences -----------------------------
await App.getPref();

// ---------- Popup ----------------------------------------
// eslint-disable-next-line no-unused-vars
class Popup {

  static {
    // --- theme
    pref.theme && (document.documentElement.className = pref.theme);
    document.body.style.opacity = 1;                        // show after

    document.querySelectorAll('button').forEach(i => i.addEventListener('click', e => this.processButtons(e)));

    this.list = document.querySelector('div.list');
    this.select = document.querySelector('select');
    this.proxyCache = {};                                   // used to find proxy

    // disable buttons on storage.managed
    pref.managed && document.body.classList.add('managed');

    // --- proxy filter
    const filter = document.querySelector('#filter');
    filter.value = '';                                      // reset after reload
    filter.addEventListener('input', e => this.filterProxy(e));

    // --- store details open toggle
    const details = document.querySelector('details');
    details.open = localStorage.getItem('more') !== 'false';    // defaults to true
    details.addEventListener('toggle', e => localStorage.setItem('more', details.open));

    this.process();
  }

  static process() {
    const labelTemplate = document.querySelector('template').content.firstElementChild;
    const docFrag = document.createDocumentFragment();

    // check if there are patterns
    if (!pref.data.some(i => i.active && i.include[0])) {
      this.list.children[0].style.display = 'none';         // hide option if there are no patterns
      pref.mode === 'pattern' && (pref.mode = 'disable');   // show as disable
    }

    pref.mode === 'pattern' && (this.list.children[0].children[2].checked = true);

    pref.data.filter(i => i.active).forEach(item => {
      const id = item.type === 'pac' ? item.pac : `${item.hostname}:${item.port}`;
      const label = labelTemplate.cloneNode(true);
      const [flag, title, portNo, radio, data] = label.children;
      flag.textContent = App.getFlag(item.cc);
      title.textContent = item.title || id;
      portNo.textContent = item.port;
      radio.value = item.type === 'direct' ? 'direct' : id;
      radio.checked = id === pref.mode;
      data.textContent = [item.city, ...Location.get(item.cc)].filter(Boolean).join('\n');
      docFrag.appendChild(label);
    });

    this.list.appendChild(docFrag);
    this.list.addEventListener('click', e =>
      // fires twice (click & label -> input)
      e.target.name === 'server' && this.processSelect(e.target.value)
    );

    // --- Add Hosts to select
    // filter out PAC, limit to 10
    pref.data.filter(i => i.active && i.type !== 'pac').filter((i, idx) => idx < 10).forEach(item => {
      const flag = App.getFlag(item.cc);
      const value = `${item.hostname}:${item.port}`;
      const opt = new Option(flag + ' ' + (item.title || value), value);
      // opt.style.color = item.color;                         // supported on Chrome, not on Firefox
      docFrag.appendChild(opt);

      this.proxyCache[value] = item;                        // cache to find later
    });

    // add a DIRECT option to the end
    // const opt = new Option('⮕ Direct', 'DIRECT');
    // docFrag.appendChild(opt);
    // this.proxyCache['DIRECT'] = {
    //   type: 'direct',
    //   hostname: 'DIRECT'
    // };

    this.select.appendChild(docFrag);
  }

  static processSelect(mode) {
    if (mode === pref.mode) { return; }                     // disregard re-click
    if (pref.managed) { return; }                           // not for storage.managed

    // check 'prefers-color-scheme' since it is not available in background service worker
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    pref.mode = mode;
    browser.storage.local.set({mode});                      // save mode
    browser.runtime.sendMessage({id: 'setProxy', pref, dark});
  }

  static processButtons(e) {
    switch (e.target.dataset.i18n) {
      case 'options':
        browser.runtime.openOptionsPage();
        window.close();
        break;

      case 'location':
        browser.tabs.create({url: 'https://getfoxyproxy.org/geoip/'});
        window.close();
        break;

      case 'ip':
        this.getIP();
        break;

      case 'log':
        browser.tabs.create({url: '/content/options.html?log'});
        window.close();
        break;

      case 'quickAdd':
        if (!this.select.value) { break; }
        if (pref.managed) { break; }                        // not for storage.managed

        browser.runtime.sendMessage({id: 'quickAdd', pref, host: this.select.value});
        this.select.selectedIndex = 0;                      // reset select option
        break;

      case 'excludeHost':
        if (pref.managed) { break; }                        // not for storage.managed

        browser.runtime.sendMessage({id: 'excludeHost', pref});
        break;

      case 'setTabProxy':
        if (!App.firefox || !this.select.value) { break; }  // firefox only
        if (pref.managed) { break; }                        // not for storage.managed

        browser.runtime.sendMessage({id: 'setTabProxy', proxy: this.proxyCache[this.select.value]});
        this.select.selectedIndex = 0;                      // reset select option
        break;

      case 'unsetTabProxy':
        if (!App.firefox) { break; }                        // firefox only
        if (pref.managed) { break; }                        // not for storage.managed

        browser.runtime.sendMessage({id: 'unsetTabProxy'});
        break;
    }
  }

  static filterProxy(e) {
    const str = e.target.value.toLowerCase().trim();
    if (!str) {
      [...this.list.children].forEach(i => i.classList.remove('off'));
      return;
    }

    [...this.list.children].forEach((item, idx) => {
      if (idx < 2) { return; }                              // not the first 2

      const title = item.children[1].textContent;
      const host = item.children[3].value;
      item.classList.toggle('off', ![title, host].some(i => i.toLowerCase().includes(str)));
    });
  }

  static getIP() {
    fetch('https://getfoxyproxy.org/webservices/lookup.php')
    .then(response => response.json())
    .then(data => {
      if (!Object.keys(data)) {
        App.notify(browser.i18n.getMessage('error'));
        return;
      }

      const [ip, {cc, city}] = Object.entries(data)[0];
      const text = [ip, , city, ...Location.get(cc)].filter(Boolean).join('\n');
      App.notify(text);
    })
    .catch(error => App.notify(browser.i18n.getMessage('error') + '\n\n' + error.message));
  }
}
// ---------- /Popup ---------------------------------------