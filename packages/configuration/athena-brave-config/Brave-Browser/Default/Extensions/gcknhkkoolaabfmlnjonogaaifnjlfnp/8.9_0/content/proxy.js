// https://bugzilla.mozilla.org/show_bug.cgi?id=1804693
// Setting single proxy for all fails
// https://bugs.chromium.org/p/chromium/issues/detail?id=1495756
// Issue 1495756: Support bypassList for PAC scripts in the chrome.proxy API
// Chrome bypassList applies to 'fixed_servers', not 'pac_script' or URL
// Firefox passthrough applies to all set in proxy.settings.set, i.e. PAC URL
// manual bypass list:
// Chrome: pac_script data, not possible for URL
// Firefox proxy.onRequest

import {App} from './app.js';
import {Pattern} from './pattern.js';
import {Authentication} from './authentication.js';
import {OnRequest} from './on-request.js';
import {Action} from './action.js';

export class Proxy {

  static {
    browser.runtime.onMessage.addListener((...e) => this.onMessage(...e)); // from popup options
  }

  static onMessage(message) {
    const {id, pref, host, proxy, dark} = message;
    switch (id) {
      case 'setProxy':
        Action.dark = dark;
        this.set(pref);
        break;

      case 'quickAdd':
        this.quickAdd(pref, host);
        break;

      case 'excludeHost':
        this.excludeHost(pref);
        break;

      case 'setTabProxy':
        OnRequest.setTabProxy(proxy);
        break;

      case 'unsetTabProxy':
        OnRequest.unsetTabProxy();
        break;
    }
  }

  // https://searchfox.org/mozilla-central/source/toolkit/components/extensions/parent/ext-proxy.js#207
  // throw new ExtensionError("proxy.settings is not supported on android.");
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1725981
  // proxy.settings is not supported on Android
  static async getSettings() {
    if (App.android) { return {}; }

    const conf = await browser.proxy.settings.get({});

    // https://developer.chrome.com/docs/extensions/mv3/manifest/icons/
    // https://bugs.chromium.org/p/chromium/issues/detail?id=29683
    // Issue 29683: Extension icons should support SVG (Dec 8, 2009)
    // SVG is not supported by Chrome
    // Firefox: If each one of imageData and path is one of undefined, null or empty object,
    // the global icon will be reset to the manifest icon
    // Chrome -> Error: Either the path or imageData property must be specified.

    // check if proxy.settings is controlled_by_this_extension
    const ext = App.firefox ? 'svg' : 'png';
    const control = ['controlled_by_this_extension', 'controllable_by_this_extension'].includes(conf.levelOfControl);
    const path = control ? `/image/icon.${ext}` : `/image/icon-off.${ext}`;
    browser.action.setIcon({path});
    !control && browser.action.setTitle({title: browser.i18n.getMessage('controlledByOtherExtensions')});

    // return null if Chrome and no control, allow Firefox to continue regardless
    return !App.firefox && !control ? null : conf;
  }

  static async set(pref) {
    // check if proxy.settings is controlled_by_this_extension
    const conf = await this.getSettings();
    if (!conf) { return; }                                  // not controlled_by_this_extension

    // --- update authentication data
    Authentication.init(pref.data);

    // --- check mode
    switch (true) {
      // no proxy, set to disable
      case !pref.data[0]:
        pref.mode = 'disable';
        break;

      // no include pattern, set proxy to the first entry
      case pref.mode === 'pattern' && !pref.data.some(i => i.include[0] || i.exclude[0]):
        const pxy = pref.data[0];
        pref.mode = pxy.type === 'pac' ? pxy.pac : `${pxy.hostname}:${pxy.port}`;
        break;
    }

    App.firefox ? this.setFirefox(pref, conf) : this.setChrome(pref);
    Action.set(pref);
  }

  static async setFirefox(pref, conf) {
    // update OnRequest
    OnRequest.init(pref);

    if (App.android) { return; }

    // Incognito Access
    const allowed = await browser.extension.isAllowedIncognitoAccess();
    if (!allowed) { return; }

    // retain settings as Network setting is partially customisable
    const value = conf.value;

    switch (true) {
      // https://github.com/foxyproxy/browser-extension/issues/47
      // Unix domain socket SOCKS proxy support
      // regard file:///run/user/1000/proxy.socks:9999 as normal proxy (not PAC)

      // --- Proxy Auto-Configuration (PAC) URL
      case pref.mode.includes('://') && !/:\d+$/.test(pref.mode):
        value.proxyType = 'autoConfig';
        value.autoConfigUrl = pref.mode;
        value.passthrough = pref.passthrough.split(/[\s,;]+/).join(', '); // convert to standard comma-separated
        value.proxyDNS = pref.proxyDNS;
        browser.proxy.settings.set({value});                // no error if levelOfControl: "controlled_by_other_extensions"
        break;

      // --- disable, direct, pattern, or single proxy
      default:
        browser.proxy.settings.clear({});
        // if (conf.value.proxyType === 'system') { return; }  // no need to set again
        // value.proxyType = 'system';
    }
  }

  static async setChrome(pref) {
    // https://developer.chrome.com/docs/extensions/reference/types/
    // Scope and life cycle: regular | regular_only | incognito_persistent | incognito_session_only
    const config = {value: {}, scope: 'regular'};
    switch (true) {
      case pref.mode === 'disable':
      case pref.mode === 'direct':
        config.value.mode = 'system';
        break;

      // --- Proxy Auto-Configuration (PAC) URL
      case pref.mode.includes('://') && !/:\d+$/.test(pref.mode):
        config.value.mode = 'pac_script';
        config.value.pacScript = {mandatory: true};
        config.value.pacScript.url = pref.mode;
        break;

      // --- single proxy
      case pref.mode.includes(':'):
        const pxy = this.findProxy(pref);
        if (!pxy) { return; }

        config.value.mode = 'fixed_servers';
        config.value.rules = this.getSingleProxyRule(pref, pxy);
        break;

      // --- pattern
      default:
        config.value.mode = 'pac_script';
        config.value.pacScript = {mandatory: true};
        config.value.pacScript.data = this.getPacString(pref);
    }

    browser.proxy.settings.set(config);

    // --- incognito
    this.setChromeIncognito(pref);
  }

  static findProxy(pref, mode = pref.mode) {
    return pref.data.find(i =>
      i.active && i.type !== 'pac' && i.hostname && mode === `${i.hostname}:${i.port}`);
  }

  static getSingleProxyRule(pref, pxy) {
    return {
      singleProxy: {
        scheme: pxy.type,
        host: pxy.hostname,
        port: parseInt(pxy.port)                            // must be number, prepare for augmented port
      },
      bypassList: pref.passthrough ? pref.passthrough.split(/[\s,;]+/) : []
    };
  }

  static async setChromeIncognito(pref) {
    // Incognito Access
    const allowed = await browser.extension.isAllowedIncognitoAccess();
    if (!allowed) { return; }

    const pxy = pref.container?.incognito && this.findProxy(pref, pref.container?.incognito);
    if (!pxy) {
      browser.proxy.settings.clear({scope: 'incognito_persistent'}); // unset incognito
      return;
    }

    const config = {value: {}, scope: 'incognito_persistent'};
    config.value.mode = 'fixed_servers';
    config.value.rules = this.getSingleProxyRule(pref, pxy);
    browser.proxy.settings.set(config);
  }

  static getPacString(pref) {
    // --- proxy by pattern
    const [passthrough, net] = Pattern.getPassthrough(pref.passthrough);

    // filter data
    let data = pref.data.filter(i => i.active && i.type !== 'pac' && i.hostname);
    data = data.filter(i => i.include[0] || i.exclude[0]).map(item => {
      return {
        str: this.getProxyString(item),
        include: item.include.filter(i => i.active).map(i => Pattern.get(i.pattern, i.type)),
        exclude: item.exclude.filter(i => i.active).map(i => Pattern.get(i.pattern, i.type))
      };
    });

    // add PAC rules from pacString
    let pacData = pref.data.filter(i => i.active && i.type === 'pac' && i.pacString);
    pacData = pacData.map((i, idx) => i.pacString.replace('FindProxyForURL', '$&' + idx) +
`\nconst find${idx} = FindProxyForURL${idx}(url, host);
if (find${idx} !== 'DIRECT') { return find${idx}; }`).join('\n\n');
    pacData &&= `\n${pacData}\n`;

    // https://developer.chrome.com/docs/extensions/reference/proxy/#type-PacScript
    // https://github.com/w3c/webextensions/issues/339
    // Chrome pacScript doesn't support bypassList

    // isInNet(host, "192.0.2.172", "255.255.255.255")

    const pacString =
String.raw`function FindProxyForURL(url, host) {
  const data = ${JSON.stringify(data)};
  const passthrough = ${JSON.stringify(passthrough)};
  const net = ${JSON.stringify(net)};
  const match = array => array.some(i => new RegExp(i, 'i').test(url));
  const inNet = () => net[0] && /^[\d.]+$/.test(host) && net.some(([ip, mask]) => isInNet(host, ip, mask));

  if (match(passthrough) || inNet()) { return 'DIRECT'; }
  for (const proxy of data) {
    if (!match(proxy.exclude) && match(proxy.include)) { return proxy.str; }
  }
  ${pacData}
  return 'DIRECT';
}`;

    return pacString;
  }

  static getProxyString(proxy) {
    let {type, hostname, port} = proxy;
    switch (type) {
      case 'direct':
        return 'DIRECT';

      case 'http':
        type = 'PROXY';                                     // chrome PAC doesn't support HTTP
        break;

      default:
        type = type.toUpperCase();
    }
    return `${type} ${hostname}:${parseInt(port)}`;           // prepare for augmented port
  }

  // ---------- Quick Add/Exclude Host ---------------------
  static async quickAdd(pref, host) {
    const activeTab = await this.getActiveTab();
    const url = this.getURL(activeTab[0].url);
    if (!url) { return; }

    const pattern = '^' + url.origin.replaceAll('.', '\\.') + '/';
    const pat = {
      active: true,
      pattern,
      title: url.hostname,
      type: 'regex',
    };

    const pxy = pref.data.find(i => host === `${i.hostname}:${i.port}`);
    if (!pxy) { return; }

    pxy.include.push(pat);
    browser.storage.local.set({data: pref.data});
    pref.mode === 'pattern' && pxy.active && this.set(pref); // update Proxy
  }

  // Chrome commands returns command, tab
  static async excludeHost(pref, tab) {
    const activeTab = tab ? [tab] : await this.getActiveTab();
    const url = this.getURL(activeTab[0].url);
    if (!url) { return; }

    const pattern = url.host;

    // add host pattern, remove duplicates
    const [separator] = pref.passthrough.match(/[\s,;]+/) || ['\n'];
    const arr = pref.passthrough.split(/[\s,;]+/);
    if (arr.includes(pattern)) { return; }                  // already added

    arr.push(pattern);
    pref.passthrough = [...new Set(arr)].join(separator).trim(); // remove duplicates

    browser.storage.local.set({passthrough: pref.passthrough});
    this.set(pref);                                         // update Proxy
  }

  static getActiveTab() {
    return browser.tabs.query({currentWindow: true, active: true});
  }

  static getURL(str) {
    const url = new URL(str);
    if (!['http:', 'https:'].includes(url.protocol)) { return; } // unacceptable URLs

    return url;
  }
}