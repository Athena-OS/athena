// https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onAuthRequired
// webRequest.onAuthRequired on Firefox applies to HTTP/HTTPS/WS/WSS (not SOCKS)

// https://bugs.chromium.org/p/chromium/issues/detail?id=1135492
// webRequest.onAuthRequired on Chrome mv3 is not usable due to removal of 'blocking'
// https://source.chromium.org/chromium/chromium/src/+/main:extensions/browser/api/web_request/web_request_api.cc;l=2857
// Chrome 108 new permission 'webRequestAuthProvider'

import './app.js';

export class Authentication {

  static {
    this.data = {};
    this.pending = {};                                      // prevent bad authentication loop
    const urls = ['*://*/*'];                               // limit to HTTP, HTTPS and WebSocket URLs
    browser.webRequest.onAuthRequired.addListener(e => this.process(e), {urls}, ['blocking']);
    browser.webRequest.onCompleted.addListener(e => this.clearPending(e), {urls});
    browser.webRequest.onErrorOccurred.addListener(e => this.clearPending(e), {urls});
  }

  static init(data) {
    this.data = {};                                         // reset data
    data.forEach(item => {                                  // filter out no user/pass or host
      item.hostname && item.port && item.username && item.password &&
        (this.data[`${item.hostname}:${item.port}`] = {username: item.username, password: item.password});
    });
  }

  static process(e) {
    if (!e.isProxy) { return; }                             // true for Proxy-Authenticate, false for WWW-Authenticate
    if (this.pending[e.requestId]) { return {cancel: true}; } // already sent once and pending

    const {host, port} = e.challenger;
    const authCredentials = this.data[`${host}:${port}`];
    if (authCredentials) {
      this.pending[e.requestId] = 1;                        // prevent bad authentication loop
      return {authCredentials};
    }
  }

  static clearPending(e) {
    delete this.pending[e.requestId];
  }
}