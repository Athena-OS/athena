// background.js
//
// License: AGPL-3
// Copyright 2016-2020, Internet Archive

// from 'utils.js'
/*   global isNotExcludedUrl, getCleanUrl, isArchiveUrl, isValidUrl, notifyMsg, openByWindowSetting, sleep, wmAvailabilityCheck, hostURL */
/*   global initDefaultOptions, badgeCountText, getWaybackCount, newshosts, dateToTimestamp, fixedEncodeURIComponent, checkLastError */
/*   global hostHeaders, gCustomUserAgent, timestampToDate, isBadgeOnTop, isUrlInList, getTabKey, saveTabData, readTabData, initAutoExcludeList */
/*   global isDevVersion, checkAuthentication, setupContextMenus, cropPrefix, alertMsg */

// Used to store the statuscode of the if it is a httpFailCodes
let gStatusCode = 0
let gToolbarStates = {}
let waybackCountCache = {}
let globalAPICache = new Map()
const API_CACHE_SIZE = 5
const API_LOADING = 'LOADING'
const API_TIMEOUT = 10000
const API_RETRY = 1000
const SPN_RETRY = 6000
let tabIdPromise

// updates User-Agent header in Chrome & Firefox, but not in Safari
function rewriteUserAgentHeader(e) {
  for (let header of e.requestHeaders) {
    if (header.name.toLowerCase() === 'user-agent') {
      const customUA = gCustomUserAgent
      const statusUA = 'Status-code/' + gStatusCode
      // add customUA only if not yet present in user-agent
      header.value += ((header.value.indexOf(customUA) === -1) ? ' ' + customUA : '') + (gStatusCode ? ' ' + statusUA : '')
    }
  }
  return { requestHeaders: e.requestHeaders }
}

/* * * API Calls * * */

// First checks for login state before calling savePageNow()
//
function savePageNowChecked(atab, pageUrl, silent, options) {
  checkAuthentication((results) => {
    if (results && ('auth_check' in results)) {
      savePageNow(atab, pageUrl, silent, options, results.auth_check)
    }
  })
}

/**
 * Calls Save Page Now API.
 * If response OK, calls SPN Status API after a delay.
 * @param atab {Tab}: Current tab used to update toolbar icon.
 * @param pageUrl {string}: URL to save.
 * @param silent {bool}: if false, include notify popup if supported by browser/OS, and open Resource List window if setting is on.
 * @param options {Object}: key/value pairs to send in POST data. See SPN API spec.
 */
function savePageNow(atab, pageUrl, silent = false, options = {}, loggedInFlag = true) {

  if (!(isValidUrl(pageUrl) && isNotExcludedUrl(pageUrl))) {
    console.log('savePageNow URL excluded')
    return
  }

  // setup api
  const postData = new URLSearchParams(options)
  postData.set('url', pageUrl)
  // const queryParams = '?url=' + fixedEncodeURIComponent(pageUrl) // log URL only
  const queryParams = '?' + postData.toString() // log URL + all options
  let headers = new Headers(hostHeaders)
  headers.set('Content-Type', 'application/x-www-form-urlencoded')
  if (!loggedInFlag) {
    headers.set('Accept', 'text/html,application/xhtml+xml,application/xml') // required when logged-out
  } // else Accept: application/json
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => { reject(new Error('timeout')) }, API_TIMEOUT)
    fetch(hostURL + 'save/' + queryParams, {
      credentials: 'include',
      method: 'POST',
      body: postData,
      headers: headers
    })
    .then(resolve, reject)
  })

  // call api
  timeoutPromise
    .then(response => (loggedInFlag ? response.json() : response.text()))
    .then(async (data) => {
      // get response info
      const errMsg = (loggedInFlag && ('message' in data)) ? data.message : 'Please Try Again'
      const jobId = loggedInFlag ? data.job_id : extractJobIdFromHTML(data)
      // notifications depending on status
      if (jobId) {
        if (errMsg.indexOf('same snapshot') !== -1) {
          // snapshot already archived within timeframe
          chrome.runtime.sendMessage({ message: 'save_archived', error: errMsg, url: pageUrl, atab: atab }, checkLastError)
          if (!silent) { notifyMsg(errMsg) }
        } else {
          // update UI
          addToolbarState(atab, 'S')
          updateWaybackCountBadge(atab, null)
          chrome.runtime.sendMessage({ message: 'save_start', atab: atab, url: pageUrl }, checkLastError)
          // show resources during save
          if (!silent) {
            notifyMsg('Saving ' + pageUrl)
            chrome.storage.local.get(['resource_list_setting'], (settings) => {
              if (settings && settings.resource_list_setting) {
                const resource_list_url = chrome.runtime.getURL('resource-list.html') + '?url=' + pageUrl + '&job_id=' + jobId + '#not_refreshed'
                openByWindowSetting(resource_list_url, 'windows')
              }
            })
          }
          // call status after SPN response
          await sleep(SPN_RETRY)
          savePageStatus(atab, pageUrl, silent, jobId)
        }
      } else {
        // missing jobId error
        chrome.runtime.sendMessage({ message: 'save_error', error: errMsg, url: pageUrl, atab: atab }, checkLastError)
        if (!silent) { notifyMsg('Error: ' + errMsg) }
      }
    })
    .catch((err) => {
      // http error
      console.log(err)
      chrome.runtime.sendMessage({ message: 'save_error', error: 'Save Error', url: pageUrl, atab: atab }, checkLastError)
    })
}

// Parse HTML text and return job id string. Returns null if not found.
//
function extractJobIdFromHTML(html) {
  // match the spn id pattern
  const jobRegex = /spn2-[a-z0-9-]*/g
  const jobIds = html.match(jobRegex)
  return (jobIds && (jobIds.length > 0)) ? jobIds[0] : null
}

/**
 * Calls SPN Status API.
 * If 'pending' status response, recursevely calls itself after a delay.
 * @param atab {Tab}: Current tab used to update toolbar icon.
 * @param pageUrl {string}: URL to save.
 * @param silent {bool}: to pass to statusSuccess() or statusFailed().
 * @param jobId {string}: job_id returned by SPN response, passed to Status API.
 */
function savePageStatus(atab, pageUrl, silent = false, jobId) {

  // setup api
  // Accept header required when logged-out, even though response is in JSON.
  let headers = new Headers(hostHeaders)
  headers.set('Accept', 'text/html,application/xhtml+xml,application/xml')

  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => { reject(new Error('timeout')) }, API_TIMEOUT)
    fetch(hostURL + 'save/status/' + jobId, {
      credentials: 'include',
      method: 'GET',
      headers: headers
    })
    .then(resolve, reject)
  })

  // call api
  let retryAfter = SPN_RETRY
  timeoutPromise
    .then((response) => {
      // reassign retryAfter from header value
      const retryValue = parseInt(response.headers.get('Retry-After'), 10)
      if (!Number.isNaN(retryValue)) { retryAfter = retryValue * 1000 }
      return response.json()
    })
    .then(async (json) => {
      const status = json.status || 'error'
      chrome.runtime.sendMessage({ message: 'resource_list_show', data: json, url: pageUrl }, checkLastError)
      if (status === 'success') {
        statusSuccess(atab, pageUrl, silent, json)
      } else if (status === 'pending') {
        await sleep(retryAfter)
        savePageStatus(atab, pageUrl, silent, jobId)
      } else {
        statusFailed(atab, pageUrl, silent, json)
      }
    })
    .catch((err) => {
      statusFailed(atab, pageUrl, silent, null, err)
    })
}

/**
 * Call this to update UI, including toolbar icon, after SPN Status returns success.
 * @param atab {Tab}: Current tab used to update toolbar icon.
 * @param pageUrl {string}: URL saved.
 * @param silent {bool}: set false to include notify popup.
 * @param data {Object}: Response data from Status API.
 */
function statusSuccess(atab, pageUrl, silent, data) {

  // update UI
  removeToolbarState(atab, 'S')
  addToolbarState(atab, 'check')
  incrementCount(data.original_url)
  updateWaybackCountBadge(atab, data.original_url)
  chrome.runtime.sendMessage({
    message: 'save_success',
    timestamp: data.timestamp,
    atab: atab,
    url: pageUrl
  }, checkLastError)

  // notify
  if (!silent && data && ('timestamp' in data)) {
    // since not silent, saves to My Web Archive only if SPN explicitly clicked and turned on
    checkSaveToMyWebArchive(pageUrl, data.timestamp)
    // replace message if present in result
    let msg = 'Successfully saved! Click to view snapshot.'
    if (('message' in data) && (data.message.length > 0)) {
      msg = data.message
    }
    notifyMsg(msg, (notificationId) => {
      chrome.notifications && chrome.notifications.onClicked.addListener((newNotificationId) => {
        if (notificationId === newNotificationId) {
          openByWindowSetting('https://web.archive.org/web/' + data.timestamp + '/' + data.original_url)
        }
      })
    })
  }
}

/**
 * Call this to update UI, including toolbar icon, after SPN Status fails.
 * @param atab {Tab}: Current tab used to update toolbar icon.
 * @param pageUrl {string}: URL saved.
 * @param silent {bool}: set false to include notify popup.
 * @param data {Object}: Response data from Status API. (optional)
 * @param err {Error}: Error from a catch block. (optional)
 */
function statusFailed(atab, pageUrl, silent, data, err) {

  removeToolbarState(atab, 'S')
  if (err) {
    chrome.runtime.sendMessage({
      message: 'resource_list_show_error',
      url: pageUrl,
      data: err
    }, checkLastError)
  }
  if (data && ('message' in data)) {
    chrome.runtime.sendMessage({
      message: 'save_error',
      error: data.message,
      url: pageUrl,
      atab: atab
    }, checkLastError)
    // notify
    if (!silent) {
      notifyMsg('Error: ' + data.message, (notificationId) => {
        chrome.notifications && chrome.notifications.onClicked.addListener((newNotificationId) => {
          if (notificationId === newNotificationId) {
            openByWindowSetting('https://archive.org/account/login')
          }
        })
      })
    }
  }
}

/**
 * Saves URL to user's My Web Archive list.
 * This assumes user is logged in with cookies set, and params are valid.
 * @param url {string}: Original URL to save.
 * @param timestamp {string}: Wayback timestamp as "yyyyMMddHHmmss" in UTC.
 * @return Promise: which should return this JSON on success: { "success": true }
 */
function saveToMyWebArchive(url, timestamp) {
  const postData = { 'url': url, 'snapshot': timestamp, 'tags': [] }
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => { reject(new Error('timeout')) }, API_TIMEOUT)
    let headers = new Headers(hostHeaders)
    headers.set('Content-Type', 'application/json')
    fetch(hostURL + '__wb/web-archive', {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: headers
    })
    .then(resolve, reject)
  })
  return timeoutPromise
}

/**
 * Encapsulate fetching a url with a timeout promise object.
 * @param url {string}
 * @param onSuccess(json): json = root object from API call.
 * @param onFail(error): error = Error object or null.
 * @param postData {object}: if present, uses POST instead of GET and sends postData object converted to json.
 * @return Promise
 */
function fetchAPI(url, onSuccess, onFail, postData = null) {
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => { reject(new Error('timeout')) }, API_TIMEOUT)
    let headers = new Headers(hostHeaders)
    headers.set('backend', 'nomad')
    headers.set('Content-Type', 'application/json')
    fetch(url, {
      method: (postData) ? 'POST' : 'GET',
      body: (postData) ? JSON.stringify(postData) : null,
      headers: headers
    })
    .then(resolve, reject)
  })
  return timeoutPromise
    .then(response => response.json())
    .then(data => {
      if (data) {
        onSuccess(data)
      } else {
        if (onFail) { onFail(null) }
      }
    })
    .catch(error => {
      if (onFail) { onFail(error) }
    })
}

/**
 * Returns cached API call, or fetches url if not in cache.
 * @param url {string}
 * @param onSuccess(json): json = root object from API call.
 * @param onFail(error): error = Error object or null.
 * @param postData {object}: uses POST if present.
 * @return Promise if calls API, json data if in cache, null if loading in progress.
 */
function fetchCachedAPI(url, onSuccess, onFail, postData = null) {
  let data = globalAPICache.get(url)
  if (data === API_LOADING) {
    // re-call after delay if previous fetch hadn't returned yet
    setTimeout(() => {
      fetchCachedAPI(url, onSuccess, onFail, postData)
    }, API_RETRY)
    return null
  } else if (data !== undefined) {
    onSuccess(data)
    return data
  } else {
    // if cache full, remove first object which is the oldest from the cache
    if (globalAPICache.size >= API_CACHE_SIZE) {
      globalAPICache.delete(globalAPICache.keys().next().value)
    }
    globalAPICache.set(url, API_LOADING)
    return fetchAPI(url, (json) => {
      globalAPICache.set(url, json)
      onSuccess(json)
    }, (error) => {
      globalAPICache.delete(url)
      onFail(error)
    }, postData)
  }
}

/**
 * The books API uses both GET, and POST with isbns array as the body.
 * @param url {string}: Must include '?url=' as entire url is used as cache key.
 * @param onSuccess(json): json = root object from API call.
 * @param onFail(error): error = Error object or null.
 * @param isbns: (optional) array of isbn strings.
 */
function getCachedBooks(url, onSuccess, onFail, isbns = null) {
  const requestUrl = hostURL + 'services/context/books?url=' + fixedEncodeURIComponent(url)
  if (isbns) {
    fetchCachedAPI(requestUrl, onSuccess, onFail, { isbns: isbns })
  } else {
    fetchCachedAPI(requestUrl, onSuccess, onFail)
  }
}

function getCachedPapers(url, onSuccess, onFail) {
  const requestUrl = hostURL + 'services/context/papers?url=' + fixedEncodeURIComponent(url)
  fetchCachedAPI(requestUrl, onSuccess, onFail)
}

function getCachedTvNews(url, onSuccess, onFail) {
  const requestUrl = hostURL + 'services/context/tvnews?url=' + fixedEncodeURIComponent(url)
  fetchCachedAPI(requestUrl, onSuccess, onFail)
}

function getCachedFactCheck(url, onSuccess, onFail) {
  const requestUrl = hostURL + 'services/context/notices?url=' + fixedEncodeURIComponent(url)
  fetchCachedAPI(requestUrl, onSuccess, onFail)
}

/* * * Startup related * * */

// Setup toolbar button action.
chrome.storage.local.get({ agreement: false }, (settings) => {
  if (settings && settings.agreement) {
    chrome.browserAction.setPopup({ popup: chrome.runtime.getURL('index.html') }, checkLastError)
    setupContextMenus(true)
  } else {
    setupContextMenus(false)
  }
})

// Runs whenever extension starts up, except during incognito mode.
chrome.runtime.onStartup.addListener((details) => {

})

// Runs when extension first installed or updated, or browser updated.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    initDefaultOptions()
    initAutoExcludeList()
  }
})

// Opens Welcome page on toolbar click if terms not yet accepted.
chrome.browserAction.onClicked.addListener((tab) => {
  chrome.storage.local.get({ agreement: false }, (settings) => {
    if (settings && (settings.agreement === false)) {
      openByWindowSetting(chrome.runtime.getURL('welcome.html'), 'tab')
    }
  })
})

chrome.webRequest.onBeforeSendHeaders.addListener(
  rewriteUserAgentHeader,
  { urls: [hostURL + '*'] },
  ['blocking', 'requestHeaders'] // FIXME: not supported in Safari
)

// Checks for error in page loading such as when a domain doesn't exist.
//
chrome.webRequest.onErrorOccurred.addListener((details) => {
  if ((['net::ERR_ABORTED', 'net::ERR_NAME_NOT_RESOLVED', 'net::ERR_NAME_RESOLUTION_FAILED',
    'net::ERR_CONNECTION_TIMED_OUT', 'net::ERR_NAME_NOT_RESOLVED', 'NS_ERROR_UNKNOWN_HOST'].indexOf(details.error) >= 0) && (details.tabId >= 0) && (details.parentFrameId < 1)) {
    // note: testing parentFrameId prevents false positives
    const url = details.url
    if (isNotExcludedUrl(url) && isValidUrl(url)) {
      chrome.tabs.get(details.tabId, (tab) => {
        gStatusCode = 999
        saveTabData(tab, { 'statusCode': 999, 'statusUrl': url })
      })
    }
  }
}, { urls: ['<all_urls>'], types: ['main_frame'] })

// Listens for website loading completed for 404-Not-Found popups.
//
chrome.webRequest.onCompleted.addListener((details) => {
  const url = details.url

  // checking statusCode >= 400 here or else tab data may be overwritten with status 200 URLs.
  // another solution may be to forget using tab ids and use URLs for the key in saveTabData()
  if (isNotExcludedUrl(url) && isValidUrl(url) && details.statusCode && (details.statusCode >= 400)) {
    // must be > 0 and not => 0 or else tab may be undefined in Safari
    if (details.tabId > 0) {
      // normally go here
      chrome.tabs.get(details.tabId, (tab) => {
        saveTabData(tab, { 'statusCode': details.statusCode, 'statusUrl': url, 'statusWaybackUrl': null })
      })
    } else {
      // fixes case where tabId is -1 on first load in Firefox, which is likely a bug
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        saveTabData(tabs[0], { 'statusCode': details.statusCode, 'statusUrl': url, 'statusWaybackUrl': null })
      })
    }
  }

}, { urls: ['<all_urls>'], types: ['main_frame'] })

// Check for 404 Not Found and other status errors.
// pass these keys in details: { tabId, statusCode, url }
//
function checkNotFound(details) {
  if (!details) { return }

  // save status, display 'V' toolbar icon and banner
  function update(tab, statusUrl, waybackUrl, statusCode, bannerFlag) {
    checkLastError()
    addToolbarState(tab, 'V')
    gStatusCode = statusCode
    // need the following to store statusWaybackUrl, other keys are overwritten with the same values.
    saveTabData(tab, { 'statusCode': statusCode, 'statusUrl': statusUrl, 'statusWaybackUrl': waybackUrl })
    if (bannerFlag && ('id' in tab)) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_BANNER',
        wayback_url: waybackUrl,
        status_code: statusCode
      })
    }
  }

  // check if wayback machine has a copy
  function checkWM(tab, details2, bannerFlag) {
    wmAvailabilityCheck(details2.url, (wayback_url, url) => {
      if (bannerFlag && ('id' in tab)) {
        chrome.tabs.executeScript(tab.id, { file: '/scripts/archive.js' }, () => {
          update(tab, url, wayback_url, details2.statusCode, bannerFlag)
        })
      } else {
        update(tab, url, wayback_url, details2.statusCode, bannerFlag)
      }
    })
  }

  gStatusCode = 0
  chrome.storage.local.get(['agreement', 'not_found_setting', 'embed_popup_setting'], (settings) => {
    if (settings && settings.agreement && settings.not_found_setting && isNotExcludedUrl(details.url)) {
      if (details.statusCode && (details.statusCode >= 400)) {
        const bannerFlag = (settings.embed_popup_setting && (details.statusCode !== 999)) || false
        chrome.tabs.get(details.tabId, (tab) => {
          checkWM(tab, details, bannerFlag)
        })
      }
    }
  })
}

// Calls saveToMyWebArchive() if setting is set, and outputs errors to console.
//
function checkSaveToMyWebArchive(url, timestamp) {
  chrome.storage.local.get(['my_archive_setting'], (settings) => {
    if (settings && settings.my_archive_setting) {
      saveToMyWebArchive(url, timestamp)
      .then(response => response.json())
      .then(data => {
        if (!(data && (data['success'] === true))) {
          console.log('Save to My Web Archive FAILED: ', data.error)
        }
      })
      .catch(error => {
        console.log('Save to My Web Archive FAILED: ', error)
      })
    }
  })
}

// Listens for messages to call background functions from other scripts.
// note: return true only if sendResponse() needs to be kept around.
//
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) { return }
  if (message.message === 'saveurl') {
    // Save Page Now
    if (isValidUrl(message.page_url) && isNotExcludedUrl(message.page_url)) {
      let page_url = getCleanUrl(message.page_url)
      let silent = message.silent || false
      let options = (message.options && (message.options !== null)) ? message.options : {}
      savePageNowChecked(message.atab, page_url, silent, options)
    }
  }
  else if (message.message === 'openurl') {
    // open URL in new tab or window depending on setting
    let page_url = getCleanUrl(message.page_url)
    if (isValidUrl(page_url) && isNotExcludedUrl(page_url)) {
      openByWindowSetting(message.wayback_url + page_url)
    }
  } else if (message.message === 'getWikipediaBooks') {
    // retrieve wikipedia books
    getCachedBooks(message.query,
      (json) => { sendResponse(json) },
      (error) => { sendResponse({ error: error }) },
      message.isbns
    )
    return true
  } else if (message.message === 'getCitedPapers') {
    // retrieve wikipedia papers
    getCachedPapers(message.query,
      (json) => { sendResponse(json) },
      (error) => { sendResponse({ error: error }) }
    )
    return true
  } else if (message.message === 'tvnews') {
    // retrieve tv news clips
    getCachedTvNews(message.article,
      (json) => { sendResponse(json) },
      (error) => { sendResponse({ error: error }) }
    )
    return true
  } else if (message.message === 'sendurl') {
    // sends a url to webpage under current tab (not used)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        let url = getCleanUrl(tabs[0].url)
        chrome.tabs.sendMessage(tabs[0].id, { url: url })
      }
    })
  } else if (message.message === 'showall' && isNotExcludedUrl(message.url)) {
    // show all contexts (not used)
    const context_url = chrome.runtime.getURL('context.html') + '?url=' + fixedEncodeURIComponent(message.url)
    tabIdPromise = new Promise((resolve) => {
      openByWindowSetting(context_url, null, resolve)
    })
  } else if (message.message === 'getToolbarState') {
    // retrieve the toolbar state set & custom tab data
    let state = getToolbarState(message.atab)
    readTabData(message.atab, (data) => {
      sendResponse({ stateArray: Array.from(state), customData: data })
    })
    return true
  } else if (message.message === 'addToolbarStates') {
    // add one or more states to the toolbar
    // States will fail to show if tab is loading but not in focus!
    // Content scripts cannot use tabs.query and send the tab, so it must be called here.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && (tabs[0].url === message.url)) {
        for (let state of message.states) {
          addToolbarState(tabs[0], state)
        }
      }
    })
  } else if (message.message === 'clearCountBadge') {
    // wayback count settings unchecked
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        updateWaybackCountBadge(tabs[0], null)
      }
    })
  } else if (message.message === 'updateCountBadge') {
    // update wayback count badge
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && isNotExcludedUrl(tabs[0].url)) {
        let url = getCleanUrl(tabs[0].url)
        updateWaybackCountBadge(tabs[0], url)
      }
    })
  } else if (message.message === 'clearResource') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        if (message.settings) {
          // clear 'R' state if wiki, amazon, or tvnews settings have been cleared
          const news_host = new URL(tabs[0].url).hostname
          if (((message.settings.wiki_setting === false) && tabs[0].url.match(/^https?:\/\/[\w.]*wikipedia.org/)) ||
              ((message.settings.amazon_setting === false) && tabs[0].url.includes('www.amazon')) ||
              ((message.settings.tvnews_setting === false) && newshosts.has(news_host))) {
            removeToolbarState(tabs[0], 'R')
          }
        } else {
          // clear 'R' if settings not provided
          removeToolbarState(tabs[0], 'R')
        }
      }
    })
  } else if (message.message === 'clearFactCheck') {
    // fact check settings unchecked
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        removeToolbarState(tabs[0], 'F')
      }
    })
  } else if (message.message === 'getCachedWaybackCount') {
    // retrieve wayback count
    getCachedWaybackCount(message.url,
      (values) => { sendResponse(values) },
      (error) => { sendResponse({ error }) }
    )
    return true
  } else if (message.message === 'clearCountCache') {
    clearCountCache()
  } /* else if (message.message === 'getFactCheckResults') {
    // retrieve fact check results
    getCachedFactCheck(message.url,
      (json) => { sendResponse({ json }) },
      (error) => { sendResponse({ error }) }
    )
    return true
  }
  */
  return false
})

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  const url = tab.url
  if (!(isNotExcludedUrl(url) && isValidUrl(url)) || isArchiveUrl(url)) { return }

  if (info.status === 'complete') {
    updateWaybackCountBadge(tab, url)

    chrome.storage.local.get(['not_found_setting', 'auto_archive_setting', 'auto_archive_age', 'fact_check_setting', 'wiki_setting'], (settings) => {
      // auto save page
      if (settings && settings.auto_archive_setting) {
        let beforeDate = null
        if (settings.auto_archive_age) {
          // auto_archive_age is an int of days before now
          const days = parseInt(settings.auto_archive_age, 10)
          if (!isNaN(days)) {
            const milisecs = days * 24 * 60 * 60 * 1000
            beforeDate = new Date(Date.now() - milisecs)
          }
        }
        autoSave(tab, url, beforeDate)
      }

      // 404 not found
      if (settings && settings.not_found_setting) {
        readTabData(tab, (data) => {
          // cropPrefix used because Wayback's URL may not match exactly (e.g. "http" != "https")
          if (data && ('statusCode' in data) && (cropPrefix(data.statusUrl) === cropPrefix(url))) {
            if (data.statusCode >= 400) {
              checkNotFound({ 'tabId': tabId, 'statusCode': data.statusCode, 'url': data.statusUrl })
            } else {
              removeToolbarState(tab, 'V')
            }
          }
        })
      }

      // fact check
      if (settings && settings.fact_check_setting) {
        factCheck(tab, url)
      }

      // wikipedia papers
      if (settings && settings.wiki_setting && url.match(/^https?:\/\/[\w.]*wikipedia.org/)) {
        // if the papers API were to be updated similar to books API, then this would move to wikipedia.js
        getCachedPapers(url,
          (data) => {
            if (data && (data.status !== 'error')) {
              addToolbarState(tab, 'R')
              addToolbarState(tab, 'papers')
            }
          }, () => {}
        )
      }
    })
  } else if (info.status === 'loading') {
    let received_url = url
    clearToolbarState(tab)

    if (received_url && !isArchiveUrl(received_url)) {
      let open_url = received_url.replace(/^https?:\/\//, '')
      if (open_url.slice(-1) === '/') { open_url = received_url.substring(0, open_url.length - 1) }

      chrome.storage.local.get(['amazon_setting', 'tvnews_setting'], (settings) => {

        // checking amazon books
        if (settings && settings.amazon_setting) {
          // checking resource of amazon books
          if (url.includes('www.amazon') && url.includes('/dp/')) {
            let headers = new Headers(hostHeaders)
            headers.set('backend', 'nomad')
            fetch(hostURL + 'services/context/amazonbooks?url=' + url, {
              method: 'GET',
              headers: headers
            })
            .then(resp => resp.json())
            .then(resp => {
              if (('metadata' in resp && 'identifier' in resp['metadata']) || 'ocaid' in resp) {
                addToolbarState(tab, 'R')
                // Storing the tab url as well as the fetched archive url for future use
                chrome.storage.local.set({ 'tab_url': url, 'detail_url': resp['metadata']['identifier-access'] }, () => {})
              }
            })
          }
        }

        // checking tv news
        const news_host = new URL(url).hostname // FIXME
        if (settings && settings.tvnews_setting && newshosts.has(news_host)) {
          getCachedTvNews(url,
            (clips) => {
              if (clips && (clips.status !== 'error')) {
                addToolbarState(tab, 'R')
              }
            }, () => {}
          )
        }

      })
    }
  }
})

// Called whenever a browser tab is selected
chrome.tabs.onActivated.addListener((info) => {
  chrome.storage.local.get(['fact_check_setting', 'wiki_setting', 'amazon_setting', 'tvnews_setting'], (settings) => {
    checkLastError()
    chrome.tabs.get(info.tabId, (tab) => {
      checkLastError()
      if (typeof tab === 'undefined') { return }
      // fact check settings unchecked
      if (settings && (settings.fact_check_setting === false) && getToolbarState(tab).has('F')) {
        removeToolbarState(tab, 'F')
      }
      // wiki_setting settings unchecked
      if (settings && (settings.wiki_setting === false) && getToolbarState(tab).has('R')) {
        if (tab.url.match(/^https?:\/\/[\w.]*wikipedia.org/)) { removeToolbarState(tab, 'R') }
      }
      // amazon_setting settings unchecked
      if (settings && (settings.amazon_setting === false) && getToolbarState(tab).has('R')) {
        if (tab.url.includes('www.amazon')) { removeToolbarState(tab, 'R') }
      }
      // tvnews_setting settings unchecked
      if (settings && (settings.tvnews_setting === false) && getToolbarState(tab).has('R')) {
        const news_host = new URL(tab.url).hostname
        if (newshosts.has(news_host)) { removeToolbarState(tab, 'R') }
      }
      // clear '404 not found' dot if tab URL doesn't match stored URL
      readTabData(tab, (data) => {
        if (data && ('statusUrl' in data) && (cropPrefix(data.statusUrl) !== cropPrefix(tab.url))) {
          removeToolbarState(tab, 'V')
        }
      })
      updateToolbar(tab)
      // update or clear count badge
      updateWaybackCountBadge(tab, tab.url)
    })
  })
})

/**
 * Runs savePageNow if given tab not currently in saving state.
 * First checks if url available in WM, and only saves if beforeDate is prior
 * to last save date, or saves if never been saved before, or beforeDate not provided.
 * Will not save URLs blocked by the WM API, or URLs in the Auto Exclude List.
 * @param atab {Tab}: Current tab, required to check save status.
 * @param url {string}: URL to save.
 * @param beforeDate {Date}: Date that will be checked only if url previously saved in WM.
 * Leave empty to always save. Set to null to save only if hadn't been previously saved.
 */
function autoSave(atab, url, beforeDate = new Date()) {
  if (isValidUrl(url) && isNotExcludedUrl(url) && !getToolbarState(atab).has('S')) {
    chrome.storage.local.get(['auto_exclude_list'], (items) => {
      if (!('auto_exclude_list' in items) ||
       (('auto_exclude_list' in items) && items.auto_exclude_list && !isUrlInList(url, items.auto_exclude_list))) {
        // checking against cached time will prevent recent auto-saves from re-saving again.
        getCachedWaybackCount(url, (values) => {
          if (('total' in values) && (values.total === -1)) {
            // don't auto save since this is a blocked URL
          } else if (('total' in values) && (values.total === 0)) {
            // save since url hasn't been saved before
            savePageNowChecked(atab, url, true)
          } else if (beforeDate && ('last_ts' in values) && values.last_ts) {
            // save if timestamp from wayback count is older than beforeDate
            const checkDate = timestampToDate(values.last_ts)
            if (checkDate.getTime() < beforeDate.getTime()) {
              savePageNowChecked(atab, url, true)
            }
          }
        },
        (error) => {
          console.log('wayback count error: ' + error)
        })
      }
    })
  }
}

// Call autoSave() only if logged in.
//
/*
function autoSaveChecked(atab, url, beforeDate) {
  checkAuthentication((results) => {
    if (results && ('auth_check' in results) && (results.auth_check === true)) {
      autoSave(atab, url, beforeDate)
    }
  })
}
*/

// Add a listener for handling Auto Save Bookmarks.
function autoBookmarksListener(id, bookmark) {
  // This runs whenever a bookmark is saved.
  if (('url' in bookmark) && isValidUrl(bookmark.url) && isNotExcludedUrl(bookmark.url) && !isArchiveUrl(bookmark.url)) {
    chrome.storage.local.get(['auto_bookmark_setting'], (settings) => {
      if (settings && settings.auto_bookmark_setting) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          // The check here that current tab URL == bookmark URL is a temp solution to
          // the issue caused when bookmarking "All Tabs" which could cause too many saves at once.
          // This forces only 1 URL to be saved. Also prevents importing URLs from saving any.
          // Trying to solve multiple URLs would require a queue. Could open a Bulk Save window?
          if (tabs && tabs[0] && (tabs[0].url === bookmark.url)) {
            autoSave(tabs[0], bookmark.url)
          }
        })
      }
    })
  }
}

// Should call this after 'bookmarks' permission Allowed and on start.
function setupAutoSaveBookmarks() {
  // adding a named function instead of anonymous function should prevent multiple listeners from being added.
  // safari doesn't support chrome.bookmarks
  chrome.bookmarks && chrome.bookmarks.onCreated && chrome.bookmarks.onCreated.addListener(autoBookmarksListener)
}

// Called when an optional permission is acquired such as 'bookmarks'.
chrome.permissions.onAdded.addListener((permissions) => {
  if (permissions.permissions.indexOf('bookmarks') >= 0) {
    setupAutoSaveBookmarks()
    // Bug fix to set setting value because when popup goes away, code in settings.js won't run.
    // FIXME: This is a Hack which may be unintended if any other code attempts to request the
    // 'bookmarks' permission (or ANY optional permission!) in the future. (e.g. Bulk Save)
    // It's hard to see a solution without major refactoring since dependent functions are all in background.js
    chrome.storage.local.set({ auto_bookmark_setting: true })
  }
})

// Called once on extension load, in case permission allowed on start.
setupAutoSaveBookmarks()

// Call Context Notices API, parse and store results if success, then set the toolbar state.
//
function factCheck(atab, url) {
  if (isValidUrl(url) && isNotExcludedUrl(url)) {
    // retrieve fact check results
    getCachedFactCheck(url,
      (json) => {
        // json is an object containing:
        //   "notices": [ { "notice": "...", "where": { "timestamp": [ "-yyyymmdd123456" ] } } ],
        //   "status": "success"

        // parse notices from result
        if (json && ('status' in json) && (json.status === 'success') && ('notices' in json) && json.notices && (json.notices.length > 0)) {
          // Create a Wayback Machine URL from most recent timestamp, or the latest capture if no timestamp returned.
          // If multiple notices, pick notice with most recent timestamp.

          // let latestTimestamp = '2' // latest capture in Wayback Machine URL
          // let latestDate = new Date(0) // epoch 1/1/1970

          // loop through every timestamp present
          // json.notices.forEach(ntc => {
          //   if (('where' in ntc) && ntc.where && ('timestamp' in ntc.where)) {
          //     const tstamps = ntc.where.timestamp || []
          //     tstamps.forEach(tstamp => {
          //       // compare each timestamp to latest
          //       const timestamp = (tstamp.charAt(0) === '-') ? tstamp.slice(1) : tstamp // remove leading dash
          //       const date = timestampToDate(timestamp)
          //       if (date.getTime() > latestDate.getTime()) {
          //         latestDate = date
          //         latestTimestamp = timestamp
          //       }
          //     })
          //   }
          // })

          // extract context URL from notice text, if present
          if ('notice' in json.notices[0]) {
            const aMatch = (json.notices[0]['notice']).match(/href="([^"]*)/)
            if (aMatch) {
              const contextUrl = aMatch[1]
              if (contextUrl !== url) {
                // only show context button if URL different than current URL in address bar
                saveTabData(atab, { 'contextUrl': contextUrl })
                addToolbarState(atab, 'F')
              }
            }
          }
        }
      },
      (error) => {
        console.log('factcheck error: ', error)
      }
    )
  }
}

/* * * Wayback Count * * */

function getCachedWaybackCount(url, onSuccess, onFail) {
  let cacheValues = waybackCountCache[url]
  if (cacheValues) {
    onSuccess(cacheValues)
  } else {
    getWaybackCount(url, (values) => {
      waybackCountCache[url] = values
      onSuccess(values)
    }, onFail)
  }
}

function clearCountCache() {
  waybackCountCache = {}
}

/**
 * Adds +1 to url in cache, or set to 1 if it doesn't exist.
 * Also updates "last_ts" with current timestamp.
 * Doesn't update if cached "total" value was < 0.
 * @param url {string}
 */
function incrementCount(url) {
  let cacheValues = waybackCountCache[url]
  let timestamp = dateToTimestamp(new Date())
  if (cacheValues && cacheValues.total) {
    if (cacheValues.total > 0) {
      cacheValues.total += 1
      cacheValues.last_ts = timestamp
      waybackCountCache[url] = cacheValues
    }
    // else don't update if total is a special value < 0
  } else {
    waybackCountCache[url] = { total: 1, last_ts: timestamp }
  }
}

function updateWaybackCountBadge(atab, url) {
  if (!atab) { return }
  chrome.storage.local.get(['wm_count_setting'], (settings) => {
    if (settings && settings.wm_count_setting && isValidUrl(url) && isNotExcludedUrl(url) && !isArchiveUrl(url)) {
      getCachedWaybackCount(url, (values) => {
        if ((values.total >= 0) && !getToolbarState(atab).has('S')) {
          // display badge
          let text = badgeCountText(values.total)
          chrome.browserAction.setBadgeBackgroundColor({ color: '#9A3B38' }, checkLastError) // red
          chrome.browserAction.setBadgeText({ tabId: atab.id, text: text }, checkLastError)
        } else {
          chrome.browserAction.setBadgeText({ tabId: atab.id, text: '' }, checkLastError)
        }
      },
      (error) => {
        console.log('wayback count error: ' + error)
        chrome.browserAction.setBadgeText({ tabId: atab.id, text: '' }, checkLastError)
      })
    } else {
      chrome.browserAction.setBadgeText({ tabId: atab.id, text: '' }, checkLastError)
    }
  })
}

/* * * Toolbar * * */

/**
 * Sets the toolbar icon.
 * Name string is based on PNG image filename in images/toolbar/
 * @param name {string} = one of 'archive', 'check', 'R', or 'S'
 * @param tabId {int} (optional) = tab id, else sets current or global icon.
 */
function setToolbarIcon(name, tabId = null) {
  const validToolbarIcons = new Set(['R', 'S', 'F', 'V', 'check', 'archive'])
  const checkBadgePos = new Set(['R', 'F', 'V'])
  const path = 'images/toolbar/'
  const n = validToolbarIcons.has(name) ? name : 'archive'
  const ab = checkBadgePos.has(name) ? (isBadgeOnTop() ? 'b' : 'a') : ''
  const prefix = isDevVersion() ? 'dev-icon-' : 'toolbar-icon-'
  const allPaths = {
    '16': (path + prefix + n + ab + '16.png'),
    '24': (path + prefix + n + ab + '24.png'),
    '32': (path + prefix + n + ab + '32.png'),
    '64': (path + prefix + n + ab + '64.png')
  }
  let details = (tabId) ? { path: allPaths, tabId: tabId } : { path: allPaths }
  chrome.browserAction.setIcon(details, checkLastError)
}

// Add state to the state set for given Tab, and update toolbar.
// state is 'S', 'R', or 'check'
// Add 'books' or 'papers' to display popup buttons for wikipedia resources.
function addToolbarState(atab, state) {
  if (!atab) { return }
  const tabKey = getTabKey(atab)
  if (!gToolbarStates[tabKey]) {
    gToolbarStates[tabKey] = new Set()
  }
  gToolbarStates[tabKey].add(state)
  updateToolbar(atab)
}

// Remove state from the state set for given Tab, and update toolbar.
function removeToolbarState(atab, state) {
  if (!atab) { return }
  const tabKey = getTabKey(atab)
  if (gToolbarStates[tabKey]) {
    gToolbarStates[tabKey].delete(state)
  }
  updateToolbar(atab)
}

// Returns a Set of toolbar states, or an empty set.
function getToolbarState(atab) {
  if (!atab) { return new Set() }
  const tabKey = getTabKey(atab)
  return (gToolbarStates[tabKey]) ? gToolbarStates[tabKey] : new Set()
}

// Clears state for given Tab and update toolbar icon.
function clearToolbarState(atab) {
  if (!atab) { return }
  const tabKey = getTabKey(atab)
  if (gToolbarStates[tabKey]) {
    gToolbarStates[tabKey].clear()
    delete gToolbarStates[tabKey]
  }
  updateToolbar(atab)
}

/**
 * Updates the toolbar icon using the state set stored in gToolbarStates.
 * Only updates icon if atab is the currently active tab, else does nothing.
 * @param atab {Tab}
 */
function updateToolbar(atab) {
  if (!atab) { return }
  const tabKey = getTabKey(atab)
  // type 'normal' prevents updation of toolbar icon when it's a popup window
  chrome.tabs.query({ active: true, windowId: atab.windowId, windowType: 'normal' }, (tabs) => {
    if (tabs && tabs[0] && (tabs[0].id === atab.id) && (tabs[0].windowId === atab.windowId)) {
      let state = gToolbarStates[tabKey]
      // this order defines the priority of what icon to display
      if (state && state.has('S')) {
        setToolbarIcon('S', atab.id)
      } else if (state && state.has('V')) {
        setToolbarIcon('V', atab.id)
      } else if (state && state.has('F')) {
        setToolbarIcon('F', atab.id)
      } else if (state && state.has('R')) {
        setToolbarIcon('R', atab.id)
      } else if (state && state.has('check')) {
        setToolbarIcon('check', atab.id)
      } else {
        setToolbarIcon('archive', atab.id)
      }
    }
  })
}

/* * * Right-click Menu * * */

// Right-click context menu "Wayback Machine" inside the page.
chrome.contextMenus.onClicked.addListener((click) => {
  if (['first', 'recent', 'save', 'all'].indexOf(click.menuItemId) >= 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let url = click.linkUrl || tabs[0].url
      if (isValidUrl(url) && isNotExcludedUrl(url)) {
        let page_url = getCleanUrl(url)
        let wayback_url
        if (click.menuItemId === 'first') {
          wayback_url = 'https://web.archive.org/web/0/'
        } else if (click.menuItemId === 'recent') {
          wayback_url = 'https://web.archive.org/web/2/'
        } else if (click.menuItemId === 'all') {
          wayback_url = 'https://web.archive.org/web/*/'
        } else if (click.menuItemId === 'save') {
          let atab = tabs[0]
          let options = { 'capture_all': 1 }
          savePageNowChecked(atab, page_url, false, options)
          return true
        }
        openByWindowSetting(wayback_url + page_url)
      } else {
        alertMsg('URL not supported.')
      }
    })
  } else if (click.menuItemId === 'welcome') {
    openByWindowSetting(chrome.runtime.getURL('welcome.html'), 'tab')
  }
})

if (typeof module !== 'undefined') {
  module.exports = {
    tabIdPromise
  }
}
