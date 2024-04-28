// utils.js

// from 'test/setup.js'
/*   global isInTestEnv */

// default exclude list for auto-save
const defaultAutoExcludeList = [
  'archive.org*',
  'web.archive.org*',
  'google.com*',
  '*.google.com*',
  'mail.yahoo.com*',
  'duckduckgo.com/?q=*'
]

// list of excluded URLs
const excluded_urls = [
  '127.0.0.1',
  'localhost',
  '0.0.0.0',
  'chrome:',
  'chrome-extension:',
  'about:',
  'moz-extension:',
  '192.168.',
  '10.',
  'file:',
  'edge:',
  'extension:',
  'safari-web-extension:',
  'chrome-error:'
]

const newshosts = new Set([
  'apnews.com',
  'www.factcheck.org',
  'www.forbes.com',
  'www.huffpost.com',
  'www.nytimes.com',
  'www.politico.com',
  'www.politifact.com',
  'www.snopes.com',
  'www.theverge.com',
  'www.usatoday.com',
  'www.vox.com',
  'www.washingtonpost.com',
  'edition.cnn.com'
])

let isArray = (a) => (!!a) && (a.constructor === Array)
let isObject = (a) => (!!a) && (a.constructor === Object)

// Use this instead of encodeURIComponent()
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

/* * * Browser Detection * * */

function getBrowser() {
  // the order of these is important!
  if (navigator.brave) { return 'brave' }
  else if (navigator.userAgent.indexOf('Edg') !== -1) { return 'edge' }
  else if (navigator.userAgent.indexOf('OPR') !== -1) { return 'opera' }
  else if (navigator.userAgent.indexOf('Firefox') !== -1) { return 'firefox' }
  else if (navigator.userAgent.indexOf('Chromium') !== -1) { return 'chromium' }
  else if (navigator.userAgent.indexOf('Chrome') !== -1) { return 'chrome' }
  else if (navigator.userAgent.indexOf('Safari') !== -1) { return 'safari' }
  else if ((navigator.userAgent.indexOf('Trident') !== -1) || (navigator.userAgent.indexOf('MSIE'))) { return 'ie' }
  else { return '' }
}

const hostURLs = {
  chrome: 'https://chrome-api.archive.org/',
  chromium: 'https://chrome-api.archive.org/',
  firefox: 'https://firefox-api.archive.org/',
  safari: 'https://safari-api.archive.org/',
  brave: 'https://brave-api.archive.org/',
  edge: 'https://edge-api.archive.org/',
  ie: 'https://edge-api.archive.org/',
  opera: 'https://opera-api.archive.org/'
}

const feedbackURLs = {
  chrome: 'https://chrome.google.com/webstore/detail/wayback-machine/fpnmgdkabkmnadcjpehmlllkndpkmiak/reviews',
  chromium: 'https://chrome.google.com/webstore/detail/wayback-machine/fpnmgdkabkmnadcjpehmlllkndpkmiak/reviews',
  firefox: 'https://addons.mozilla.org/en-US/firefox/addon/wayback-machine_new/',
  safari: 'https://apps.apple.com/us/app/wayback-machine/id1472432422',
  brave: 'https://chrome.google.com/webstore/detail/wayback-machine/fpnmgdkabkmnadcjpehmlllkndpkmiak/reviews',
  edge: 'https://microsoftedge.microsoft.com/addons/detail/wayback-machine/kjmickeoogghaimmomagaghnogelpcpn',
  opera: 'https://chrome.google.com/webstore/detail/wayback-machine/fpnmgdkabkmnadcjpehmlllkndpkmiak/reviews'
}

const gBrowser = getBrowser()
const isChrome = (gBrowser === 'chrome') || (gBrowser === 'chromium')
const isFirefox = (gBrowser === 'firefox')
const isEdge = (gBrowser === 'edge')
const isSafari = (gBrowser === 'safari')

const hostURL = hostURLs[gBrowser] || hostURLs['chrome']
const feedbackURL = feedbackURLs[gBrowser] || '#'

let gVersion = ''
function getManifestVersion() {
  let ver = ''
  const manifest = chrome.runtime.getManifest()
  if (manifest) {
    ver = manifest.version
  }
  return ver
}

let gCustomUserAgent = ''
function getCustomUserAgent() {
  let uAgent = ''
  const manifest = chrome.runtime.getManifest()
  if (manifest) {
    uAgent = 'Wayback_Machine_' + gBrowser.charAt(0).toUpperCase() + gBrowser.slice(1) + '/' + manifest.version
  }
  return uAgent
}

let hostHeaders = new Headers({
  'Accept': 'application/json'
})

// will not run during mocha testing
if (typeof isInTestEnv === 'undefined') {
  gVersion = getManifestVersion()
  gCustomUserAgent = getCustomUserAgent()
  // Chrome ignores this being set. Works in Firefox & Safari.
  hostHeaders.set('User-Agent', navigator.userAgent + ' ' + gCustomUserAgent)
}

/* * * Archive APIs * * */

/**
 * Get User info 'whoami'.
 * Requires cookies of logged-in user are set.
 * @return {Promise}
 */
function getUserInfo() {
  const apiPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('timeout'))
    }, 5000)
    let headers = new Headers(hostHeaders)
    headers.set('Content-Type', 'application/json')
    fetch('https://archive.org/services/user.php?op=whoami', {
      method: 'GET',
      headers: headers
    })
    .then(resolve, reject)
  })
  return apiPromise
  .then(response => response.json())
  .then((res) => {
    if (res && res.success && ('value' in res)) {
      // success
      return res.value
    } else {
      console.log('getUserInfo failed')
    }
  })
  .catch((e) => {
    console.log(e)
  })
}

/**
 * Check if user is logged in by checking cookies.
 * Will retrieve auth cookies from storage and restore cookies if missing.
 * @param callback(result) : returns object { auth_check: bool } where auth_check == true if logged in, false if not.
 */
function checkAuthentication(acallback) {
  chrome.cookies.getAll({ url: 'https://archive.org' }, (cookies) => {
    let loggedIn = false, ia_auth = false
    cookies.forEach(cookie => {
      if ((cookie.name === 'logged-in-sig') && cookie.value && (cookie.value.length > 0)) { loggedIn = true }
      else if ((cookie.name === 'ia-auth') && cookie.value && (cookie.value.length > 0)) { ia_auth = true }
    })
    if (loggedIn) {
      // store auth cookies in storage
      chrome.storage.local.set({ auth_cookies: cookies })
      acallback({ 'auth_check': true })
    } else {
      // if cookies not set but found in storage, then restore cookies from storage,
      // but if user previously logged out of archive.org on the web (ia_auth == true), then don't restore cookies from storage.
      chrome.storage.local.get(['auth_cookies'], (items) => {
        if (items.auth_cookies && !ia_auth) {
          items.auth_cookies.forEach(authCookie => {
            // set only a subset of keys to avoid TypeErrors
            const newCookie = Object.fromEntries(
              ['domain', 'expirationDate', 'httpOnly', 'name', 'path', 'sameSite', 'secure', 'storeId', 'url', 'value']
              .filter(k => k in authCookie).map(k => [k, authCookie[k]])
            )
            newCookie.url = 'https://archive.org'
            chrome.cookies.set(newCookie)
            if ((authCookie.name === 'logged-in-sig') && authCookie.value && (authCookie.value.length > 0)) { loggedIn = true }
          })
        }
        acallback({ 'auth_check': loggedIn })
      })
    }
  })
}

/* * * Storage functions * * */

// Returns a string key from a Tab windowId and tab id, and maybe a slice of URL.
function getTabKey(atab) {
  return (atab) ? '' + (('windowId' in atab) ? atab.windowId : '') + 'i' + (('id' in atab) ? atab.id : '') : ''
}

/**
 * Saves key/value pairs in storage for other files to read for given tab.
 * @param atab {Tab}: Current tab which includes .windowId and .id values.
 * @param data: Object of key:value pairs to store. Appends or writes over existing key:value pairs.
 */
function saveTabData(atab, data) {
  if (!(atab && ('id' in atab) && ('windowId' in atab))) { return }
  let key = 'tab_' + getTabKey(atab)
  // take exisiting data in storage and overwrite with new data
  chrome.storage.local.get([key], (result) => {
    let exdata = result[key] || {}
    for (let [k, v] of Object.entries(data)) { exdata[k] = v }
    let obj = {}
    obj[key] = exdata
    chrome.storage.local.set(obj, () => {})
  })
}

/**
 * Clears keys in storage for given tab.
 * @param atab {Tab}: Current tab which includes .windowId and .id values.
 * @param keylist: Array of keys to delete.
 */
function clearTabData(atab, keylist) {
  if (!(atab && ('id' in atab) && ('windowId' in atab))) { return }
  let key = 'tab_' + getTabKey(atab)
  // take exisiting data in storage and delete any items from keylist
  chrome.storage.local.get([key], (result) => {
    let exdata = result[key] || {}
    for (let k of keylist) {
      if (k in exdata) { delete exdata[k] }
    }
    let obj = {}
    obj[key] = exdata
    chrome.storage.local.set(obj, () => {})
  })
}

/**
 * Reads key/value pairs from storage for given tab.
 * @param atab {Tab}: Current tab which includes .windowId and .id values.
 * @param callback(data): Function called with data object of key:value pairs returned.
 */
function readTabData(atab, callback) {
  if (!(atab && ('id' in atab) && ('windowId' in atab))) { return }
  let key = 'tab_' + getTabKey(atab)
  chrome.storage.local.get([key], (result) => {
    callback(result[key])
  })
}

/* * * Toolbar icon functions * * */

/**
 * Return true if version has 4 numbers, which means it's a development build not for release.
 */
function isDevVersion() {
  return (gVersion && (gVersion.split('.').length === 4))
}

/**
 * Return true if toolbar badge position is along top of icon, false or undefined if along bottom.
 */
function isBadgeOnTop() {
  // TODO: check other browsers
  const badgeOnTop = { firefox: true, safari: true, chrome: false, edge: false }
  return badgeOnTop[gBrowser]
}

/* * * Wayback functions * * */

/**
 * Convert given int to a string with metric suffix, separators localized.
 * Used for toolbar button badge.
 * @param count {int}
 * @return {string}
 */
function badgeCountText(count) {
  let text = ''
  if (count < 1000) {
    text = count.toLocaleString()
  } else if (count < 10000) {
    text = (Math.round(count / 100) / 10.0).toLocaleString() + 'K'
  } else if (count < 1000000) {
    text = Math.round(count / 1000).toLocaleString() + 'K'
  } else if (count >= 1000000) {
    text = Math.round(count / 1000000).toLocaleString() + 'M'
  }
  return text
}

/**
 * Retrieves total count of snapshots stored in the Wayback Machine for given url.
 * Includes first and last timestamp.
 * @param url {string}
 * @return Promise
 * onSuccess is an object { "total": int, "first_ts": string, "last_ts": string }
 * onFail is an Error object or null.
 */
function getWaybackCount(url, onSuccess, onFail) {
  if (isValidUrl(url) && isNotExcludedUrl(url)) {
    const requestUrl = hostURL + '__wb/sparkline'
    const requestParams = '?collection=web&output=json&url=' + fixedEncodeURIComponent(url)
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('timeout'))
      }, 30000)
      fetch(requestUrl + requestParams, {
        method: 'GET',
        headers: hostHeaders
      })
      .then(resolve, reject)
    })
    return timeoutPromise
    .then(response => response.json())
    .then(json => {
      const years = json.years
      let total = 0
      if (isObject(years)) {
        for (let y in years) {
          for (let c of years[y]) {
            total += c
          }
        }
      }
      // set total to special value if URL is excluded from viewing
      if (json.error && json.error.type && (json.error.type === 'blocked')) {
        total = -1
      }
      let values = { total: total, first_ts: json.first_ts, last_ts: json.last_ts }
      onSuccess(values)
    })
    .catch(error => {
      console.log('getWaybackCount FAILED: ', error)
      if (onFail) { onFail(error) }
    })
  } else {
    console.log('getWaybackCount: not a valid URL')
    if (onFail) { onFail(null) }
  }
}

/**
 * Checks Wayback Machine API for url snapshot
 */
function wmAvailabilityCheck(url, onsuccess, onfail) {
  const requestUrl = hostURL + 'wayback/available'
  const requestParams = '?url=' + fixedEncodeURIComponent(url)
  fetch(requestUrl + requestParams, {
    method: 'GET',
    headers: hostHeaders
  })
  .then(response => response.json())
  .then((json) => {
    let wayback_url = getWaybackUrlFromResponse(json)
    let timestamp = getWaybackTimestampFromResponse(json)
    if (wayback_url !== null) {
      onsuccess(wayback_url, url, timestamp)
    } else if (onfail) {
      onfail()
    }
  })
  .catch((err) => {
    // catch the error in case of api failure
    console.log(err)
  })
}

/**
 * Checks that url isn't an archive.org domain.
 * @param url {string}
 * @return {bool}
 */
function isArchiveUrl(url) {
  if (typeof url !== 'string') { return false }
  try {
    const hostname = new URL(url).hostname
    return (hostname === 'web.archive.org')
  } catch (e) {
    // url not formated correctly
    return false
  }
}

/**
 * Makes sure response is a valid URL to prevent code injection
 * @param url {string}
 * @return {bool}
 */
function isValidUrl(url) {
  return ((typeof url) === 'string' &&
    (url.indexOf('http://') === 0 || url.indexOf('https://') === 0))
}

/**
 * Returns a URL, adding 'https' if schema part missing, else null.
 * @param url {string}
 * @return {string} or null
 */
function makeValidURL(url) {
  return isValidUrl(url) ? url : (url.includes('.') ? 'https://' + url : null)
}

// Returns substring of URL after :// not including "www." if present.
// Also crops trailing slash.
// Returns null if match not found, or if url is not a string.
function cropPrefix(url) {
  if (typeof url === 'string') {
    if (url.slice(-1) === '/') { url = url.slice(0, -1) }
    let re = /^(?:[a-z]+:\/\/)?(?:www\.)?(.*)$/
    let match = re.exec(url)
    return match[1]
  }
  return null
}

// Returns substring of url after :// only, or null if url is not a string.
function cropScheme(url) {
  if (typeof url === 'string') {
    let re = /^(?:[a-z]+:\/\/)?(.*)$/
    let match = re.exec(url)
    return match[1]
  }
  return null
}

// Function to check whether it is a valid URL or not.
// Returns: true = good, false = excluded URL.
function isNotExcludedUrl(url) {
  if (typeof url !== 'string') { return false }
  if (url.trim() === '') { return false }
  for (const exUrl of excluded_urls) {
    if (url.startsWith(exUrl) || url.startsWith('http://' + exUrl) || url.startsWith('https://' + exUrl)) {
      return false
    }
  }
  return true
}

function remove_port(url) {
  if (url.substr(-4) === ':80/') {
    url = url.substring(0, url.length - 4)
  }
  return url
}

function remove_wbm(url) {
  let pos = url.indexOf('/http')
  let new_url = ''
  if (pos !== -1) {
    new_url = url.substring(pos + 1)
  } else {
    pos = url.indexOf('/www')
    new_url = url.substring(pos + 1)
  }
  return remove_port(new_url)
}

/**
* Extracts URL from web.archive.org or extension page, otherwise the url passed in.
* @param url {string}
* @return {string}
*/
function getCleanUrl(url) {
  let rurl = url || ''
  if (rurl.includes('extension:')) {
    // return url param from extension page
    const url_param = new URL(url)
    rurl = url_param.searchParams.get('url')
  } else if (rurl.includes('web.archive.org')) {
    // return url from archive.org page
    rurl = remove_wbm(url)
  }
  return rurl
}

/**
 * Extracts the latest saved Wayback URL from wmAvailabilityCheck() response.
 * @param json {object}
 * @return {string or null}
 */
function getWaybackUrlFromResponse(json) {
  if (json && json.archived_snapshots &&
    json.archived_snapshots.closest &&
    json.archived_snapshots.closest.available &&
    json.archived_snapshots.closest.available === true &&
    json.archived_snapshots.closest.status.indexOf('2') === 0 &&
    isValidUrl(json.archived_snapshots.closest.url)) {
    // not sure why we're replacing http: with https: here
    return json.archived_snapshots.closest.url.replace(/^http:/, 'https:')
  } else {
    return null
  }
}

/**
 * Extracts latest saved timestamp from wmAvailabilityCheck() response.
 * @param json {object}
 * @return {string or null} as "yyyyMMddHHmmss"
 */
function getWaybackTimestampFromResponse(json) {
  if (json && json.archived_snapshots &&
    json.archived_snapshots.closest &&
    json.archived_snapshots.closest.available &&
    json.archived_snapshots.closest.available === true &&
    json.archived_snapshots.closest.status.indexOf('2') === 0 &&
    isValidUrl(json.archived_snapshots.closest.url)) {
    return json.archived_snapshots.closest.timestamp
  } else {
    return null
  }
}

/**
 * Converts a Wayback timestamp string into a Date object.
 * @param timestamp {string} as "yyyyMMddHHmmss" in UTC time zone.
 * @return {Date or null}
 */
function timestampToDate(timestamp) {
  let date = null
  if (timestamp && timestamp.length >= 4) {
    date = new Date(Date.UTC(
      Number(timestamp.substring(0, 4)), // year
      (Number(timestamp.substring(4, 6)) || 1) - 1, // month
      (Number(timestamp.substring(6, 8)) || 1), // day
      Number(timestamp.substring(8, 10)), // hours
      Number(timestamp.substring(10, 12)), // min
      Number(timestamp.substring(12, 14)) // sec
    ))
    if (isNaN(date)) { return null }
  }
  return date
}

/**
 * Converts a Date object into a Wayback timestamp string.
 * @param {Date}
 * @return timestamp {string} as "yyyyMMddHHmmss" in UTC time zone, or null.
 */
function dateToTimestamp(date) {
  let timestamp = null
  function pad(num) {
    return (num < 10) ? ('0' + num) : ('' + num)
  }
  if (date instanceof Date) {
    let yyyy = date.getUTCFullYear()
    let MM = date.getUTCMonth() + 1
    let dd = date.getUTCDate()
    let HH = date.getUTCHours()
    let mm = date.getUTCMinutes()
    let ss = date.getUTCSeconds()
    timestamp = yyyy + pad(MM) + pad(dd) + pad(HH) + pad(mm) + pad(ss)
  }
  return timestamp
}

/**
 * Return localized date string, or time if within last 24 hours.
 * @param timestamp {string} as "yyyyMMddHHmmss" in UTC time zone.
 * @return string or ''
 */
function viewableTimestamp(timestamp) {
  let date = timestampToDate(timestamp)
  let text = ''
  if (date) {
    if ((Date.now() - date.getTime()) > 86400000) {
      // over 24 hours
      text = date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) // e.g.'Mar 5, 2021'
    } else {
      // under 24 hours
      text = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) // e.g.'7:00 PM'
    }
  }
  return text
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Recursive test to see if text matches pattern string.
 * Runs in O(n^2) time?
 * @param text {string}: string to test which doesn't have any wildcards.
 * @param pattern {string}: to match which may contain 1 or more '*' as wildcards.
 * @return {bool}: true if matches, false if doesn't.
 */
function matchWildcard(text, pattern) {
  if ((pattern.length === 0) && (text.length === 0)) { return true }
  if ((pattern.length === 1) && (pattern[0] === '*')) { return true }
  if ((pattern.length > 1) && (pattern[0] === '*') && (text.length === 0)) { return false }
  if ((pattern.length > 0) && (text.length > 0) && (pattern[0] === text[0])) {
    return matchWildcard(text.substring(1), pattern.substring(1))
  }
  if ((pattern.length > 0) && (pattern[0] === '*')) {
    return matchWildcard(text, pattern.substring(1)) || matchWildcard(text.substring(1), pattern)
  }
  return false
}

/**
 * Checks URL against given list of URL patterns.
 * @param url {string}: URL to check against list.
 * @param patterns {array of strings}: List of patterns that may include '*' wildcards.
 * @returns {bool}: true if URL matches any pattern in the list.
 */
function isUrlInList(url, patterns) {
  const curl = cropPrefix(url)
  const matched = patterns.some(pat => matchWildcard(curl, pat))
  return matched
}

/**
 * Customizes error handling
 * @param status {string}
 * @return {string}
 */
function getErrorMessage(req) {
  return 'The requested service ' + req.url + ' failed: ' + req.status + ', ' + req.statusText
}

function getUrlByParameter(name) {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

function openByWindowSetting(url, op = null, cb) {
  if (op === null) {
    chrome.storage.local.get(['view_setting'], (settings) => {
      checkLastError()
      if (settings) { // OK if view_setting undefined
        opener(url, settings.view_setting, cb)
      }
    })
  } else {
    opener(url, op, cb)
  }
}

function opener(url, option, callback) {
  if (option === 'tab' || option === undefined) {
    chrome.tabs.create({ url: url }, (tab) => {
      if (callback) { callback(tab.id) }
    })
  } else if (option === 'replace') {
    // Back button may not work due to a bug in Chrome, but works fine in Firefox.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        chrome.tabs.update(tabs[0].id, { active: true, url: url }, (tab) => {
          if (callback) { callback(tab.id) }
        })
      }
    })
  } else {
    let w = window.screen.availWidth, h = window.screen.availHeight
    if (w > h) {
      // landscape screen
      const maxW = 1200
      w = Math.floor(((w > maxW) ? maxW : w) * 0.666)
      h = Math.floor(w * 0.75)
    } else { // option === 'window'
      // portrait screen (likely mobile)
      w = Math.floor(w * 0.9)
      h = Math.floor(h * 0.9)
    }
    chrome.windows.create({ url: url, width: w, height: h, type: 'popup' }, (window) => {
      if (callback) { callback(window.tabs[0].id) }
    })
  }
}

// Displays a notification by the OS.
// Unless Disable Notificaions setting is true.
// Safari doesn't support notifications so this will do nothing.
//
function notifyMsg(msg, callback) {
  if (chrome.notifications) {
    chrome.storage.local.get(['notify_setting'], (settings) => {
      if (settings && !settings.notify_setting) {
        const options = {
          type: 'basic',
          title: 'Wayback Machine',
          message: msg,
          iconUrl: chrome.runtime.getURL('images/app-icon/app-icon96.png')
        }
        chrome.notifications.create(options, callback)
      }
    })
  }
}

// Pop up an alert message.
//   Chrome & Edge: Popup alert modal.
//   Firefox: Errors on alert(), so show notification instead.
//   Safari: Ignores alert()
//
function alertMsg(msg) {
  if (isFirefox) { notifyMsg(msg) } else { alert(msg) }
}

function checkLastError() {
  if (chrome.runtime.lastError) {
    if (chrome.runtime.lastError.message.startsWith('No tab with id:')) {
      // Skip
    } else {
      console.log(chrome.runtime.lastError.message)
      // console.trace() // uncomment while debugging
    }
  } else {
    // No error occurred
  }
}

function attachTooltip (anchor, tooltip, pos = 'right', time = 200) {
  // Modified code from https://embed.plnkr.co/plunk/HLqrJ6 to get tooltip to stay
  return anchor.attr({
    'data-toggle': 'tooltip',
    'title': tooltip
  })
  .tooltip({
    animated: false,
    placement: `${pos} auto`,
    html: true,
    trigger: 'manual'
  })
  // Handles staying open
  .on('mouseenter click', () => {
    $(anchor).tooltip('show')
    $('.popup_box').on('mouseleave', () => {
      setTimeout(() => {
        if (!$(`.${anchor.attr('class')}[href*="${anchor.attr('href')}"]:hover`).length) {
          $(anchor).tooltip('hide')
        }
      }, time)
    })
  })
  .on('mouseleave blur', () => {
    setTimeout(() => {
      if (!$('.popup_box:hover').length) {
        $(anchor).tooltip('hide')
      }
    }, time)
  })
}

// Saves the defaultAutoExcludeList[] to storage if 'auto_exclude_list' hasn't been set.
function initAutoExcludeList() {
  chrome.storage.local.get(['auto_exclude_list'], (items) => {
    if (('auto_exclude_list' in items) === false) {
      chrome.storage.local.set({ 'auto_exclude_list': defaultAutoExcludeList })
    }
  })
}

function setupContextMenus(enabled) {
  chrome.contextMenus.removeAll(() => {
    if (enabled) {
      chrome.contextMenus.create({
        'id': 'save',
        'title': 'Save Page Now',
        'contexts': ['page', 'frame', 'link'],
        'documentUrlPatterns': ['*://*/*', 'ftp://*/*']
      }, checkLastError)
      chrome.contextMenus.create({
        'type': 'separator',
        'contexts': ['page', 'frame', 'link'],
        'documentUrlPatterns': ['*://*/*', 'ftp://*/*']
      })
      chrome.contextMenus.create({
        'id': 'first',
        'title': 'Oldest Version',
        'contexts': ['page', 'frame', 'link'],
        'documentUrlPatterns': ['*://*/*', 'ftp://*/*']
      }, checkLastError)
      chrome.contextMenus.create({
        'id': 'recent',
        'title': 'Newest Version',
        'contexts': ['page', 'frame', 'link'],
        'documentUrlPatterns': ['*://*/*', 'ftp://*/*']
      }, checkLastError)
      chrome.contextMenus.create({
        'id': 'all',
        'title': 'All Versions',
        'contexts': ['page', 'frame', 'link'],
        'documentUrlPatterns': ['*://*/*', 'ftp://*/*']
      }, checkLastError)
    } else {
      chrome.contextMenus.create({
        'id': 'welcome',
        'title': 'Welcome to the Wayback Machine',
        'contexts': ['page', 'frame', 'link'],
        'documentUrlPatterns': ['*://*/*', 'ftp://*/*']
      }, checkLastError)
    }
  })
}

// Default Settings prior to accepting terms.
function initDefaultOptions () {
  chrome.storage.local.set({
    agreement: false, // needed for firefox
    spn_outlinks: false,
    spn_screenshot: false,
    selectedFeature: null,
    /* Features */
    private_mode_setting: true,
    not_found_setting: false,
    embed_popup_setting: false,
    wm_count_setting: false,
    wiki_setting: false,
    amazon_setting: false,
    tvnews_setting: false,
    auto_archive_setting: false,
    auto_archive_age: '99999',
    fact_check_setting: false,
    /* General */
    resource_list_setting: false,
    email_outlinks_setting: false,
    my_archive_setting: false,
    view_setting: 'tab',
    show_settings_tab_tip: true
  })
}

// Turn on these Settings and toolbar popup after accepting terms.
function afterAcceptTerms () {
  chrome.storage.local.set({
    agreement: true,
    private_mode_setting: false,
    not_found_setting: true
  })
  chrome.browserAction.setPopup({ popup: chrome.runtime.getURL('index.html') }, checkLastError)
  setupContextMenus(true)
}

if (typeof module !== 'undefined') {
  module.exports = {
    isArray,
    isObject,
    getErrorMessage,
    getUrlByParameter,
    getWaybackUrlFromResponse,
    isArchiveUrl,
    isValidUrl,
    isUrlInList,
    matchWildcard,
    makeValidURL,
    cropPrefix,
    cropScheme,
    isNotExcludedUrl,
    getCleanUrl,
    wmAvailabilityCheck,
    openByWindowSetting,
    sleep,
    notifyMsg,
    alertMsg,
    attachTooltip,
    getUserInfo,
    checkAuthentication,
    getTabKey,
    saveTabData,
    clearTabData,
    readTabData,
    getWaybackCount,
    badgeCountText,
    isBadgeOnTop,
    isDevVersion,
    isChrome,
    isFirefox,
    isEdge,
    isSafari,
    hostURL,
    hostHeaders,
    getCustomUserAgent,
    gCustomUserAgent,
    timestampToDate,
    dateToTimestamp,
    viewableTimestamp,
    initAutoExcludeList,
    initDefaultOptions,
    afterAcceptTerms,
    feedbackURL,
    newshosts,
    fixedEncodeURIComponent,
    isInTestEnv,
    checkLastError
  }
}
