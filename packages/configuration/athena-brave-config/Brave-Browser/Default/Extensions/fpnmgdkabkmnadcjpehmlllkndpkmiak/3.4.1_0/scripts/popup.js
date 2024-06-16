// popup.js

// from 'utils.js'
/*   global isArchiveUrl, isValidUrl, makeValidURL, isNotExcludedUrl, getCleanUrl, openByWindowSetting, hostURL */
/*   global feedbackURL, newshosts, dateToTimestamp, timestampToDate, viewableTimestamp, fixedEncodeURIComponent */
/*   global attachTooltip, checkLastError, cropPrefix, cropScheme, hostHeaders, getUserInfo, checkAuthentication */

let searchBoxTimer

// don't reference in setup functions as there's a delay in assignment
let activeURL, activeTab

const ERROR_CODE_DIC = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Auth Required',
  408: 'Request Timeout',
  410: 'Page Gone',
  429: 'Too Many Requests',
  451: 'Unavailable',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  509: 'Bandwidth Limit Exceeded',
  520: 'Unknown Error',
  521: 'Server Is Down',
  522: 'Connection Timed Out',
  523: 'Unreachable Origin',
  524: 'Timout Occurred',
  525: 'SSL Handshake Failed',
  526: 'Invalid SSL Certificate',
  999: 'Server Not Found'
}

function homepage() {
  openByWindowSetting('https://web.archive.org/')
}

// If the popup displays, we know user already agreed in Welcome page.
// This is a fix for Safari resetting the 'agreement' setting.
function initAgreement() {
  chrome.storage.local.set({ agreement: true }, () => { })
}

// Popup tip over settings tab icon after first load.
function showSettingsTabTip() {
  let tt = $('<div>').append($('<p>').text('There are more great features in Settings!').attr({ 'class': 'setting-tip' }))[0].outerHTML
  let tabItem = $('#settings-tab-btn')
  setTimeout(() => {
    tabItem.append(attachTooltip(tabItem, tt, 'top'))
    .tooltip('show')
    .on('mouseenter', () => {
      $(tabItem).tooltip('hide')
      // prevent tooltip from ever showing again once mouse entered
      chrome.storage.local.set({ show_settings_tab_tip: false }, () => { })
    })
  }, 500)
}

function initActiveTabURL() {
  activeTab = null
  activeURL = null
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      activeTab = tabs[0]
      activeURL = tabs[0].url
      setupSaveAction(activeURL)
    }
  })
}

function setupSettingsTabTip() {
  chrome.storage.local.get(['show_settings_tab_tip'], (settings) => {
    if (settings && settings.show_settings_tab_tip) {
      showSettingsTabTip()
    }
  })
}

function doSaveNow() {
  const url = activeURL
  if (url && isValidUrl(url) && isNotExcludedUrl(url) && !isArchiveUrl(url)) {
    let options = { 'capture_all': 1 }
    if ($('#chk-outlinks').prop('checked') === true) {
      options['capture_outlinks'] = 1
      if ($('#email-outlinks-setting').prop('checked') === true) {
        options['email_result'] = 1
      }
    }
    if ($('#chk-screenshot').prop('checked') === true) {
      options['capture_screenshot'] = 1
    }

    chrome.runtime.sendMessage({
      message: 'saveurl',
      page_url: url,
      options: options,
      atab: activeTab
    }, checkLastError)

    // animate SPN button only if logged in
    checkAuthentication((result) => {
      checkLastError()
      if (result && result.auth_check) { showSaving() }
    })
  }
}

// Update UI depending on logged-in state.
function setupLoginState() {
  checkAuthentication((result) => {
    checkLastError()
    if (result && result.auth_check) {
      loginSuccess()
    } else {
      loginError()
    }
  })
}

// Sets up the SPN button click event and Last Saved text.
function setupSaveAction(url) {
  if (url && isValidUrl(url) && isNotExcludedUrl(url) && !isArchiveUrl(url)) {
    $('#spn-btn').off('click').on('click', doSaveNow)
    chrome.storage.local.get(['private_mode_setting'], (settings) => {
      if (settings && (settings.private_mode_setting === false)) {
        chrome.runtime.sendMessage({
          message: 'getCachedWaybackCount',
          url: url
        }, (message) => {
          checkLastError()
          if (message) {
            if (('last_ts' in message) && message.last_ts) {
              $('#last-saved-msg').text('Last Saved ' + viewableTimestamp(message.last_ts)).show()
            } else if (('total' in message) && (message.total === -1)) {
              $('#last-saved-msg').text('URL excluded from viewing').show()
              $('.blocked-dim').attr('disabled', true).css('opacity', '0.66').css('cursor', 'not-allowed')
            } else if ('error' in message) {
              $('#last-saved-msg').text('Wayback Machine Unavailable').show()
            } else {
              $('#last-saved-msg').hide()
            }
          } else {
            $('#last-saved-msg').hide()
          }
        })
      } else {
        $('#last-saved-msg').hide()
      }
    })
  } else {
    showUrlNotSupported(true)
  }
}

// Called when logged-out.
function loginError() {

  // uncomment to restore Bulk Save button
  // $('#bulk-save-btn').attr('disabled', true)
  // $('#bulk-save-btn').attr('title', 'Log in to use')
  // $('#bulk-save-btn').off('click')

  // hide SPN options and show login
  // $('#chk-outlinks-label').css('visibility', 'hidden')
  // $('#chk-screenshot-label').css('visibility', 'hidden')
  // $('#chk-login-btn').css('visibility', '').off('click').on('click', showLoginFromMain)

  // setup login flip button
  // $('#my-archive-btn').off('click')
  // $('#spn-btn').addClass('flip-inside')
  // $('#spn-back-label').text('Log In to Save Page')
  // $('#spn-front-label').parent().attr('disabled', true)
  // $('#spn-btn').off('click').on('click', showLoginPage)

  // setup options that open login page
  $('.auth-icon').addClass('auth-icon-active')
  $('.auth-disabled').attr('disabled', true)
  $('.auth-click1').off('click').on('click', showLoginFromMain)
  $('.auth-click2').off('click').on('click', showLoginFromSettings)

  // add tab login button
  $('.tab-item').css('width', '18%')
  $('#logout-tab-btn').hide()
  $('#login-tab-btn').css('display', 'inline-block').off('click').on('click', showLoginFromTab)

  // setup messages
  if (activeURL && !isNotExcludedUrl(activeURL)) { showUrlNotSupported(true) }
}

// Called when logged-in.
function loginSuccess() {

  // reset options that open login page
  $('.auth-icon').removeClass('auth-icon-active')
  $('.auth-disabled').removeAttr('disabled')
  $('.auth-click1').off('click')
  $('.auth-click2').off('click')
  $('#my-archive-btn').click(openMyWebArchivePage) // keep after above code

  // add tab logout button
  $('.tab-item').css('width', '18%')
  $('#login-tab-btn').hide()
  $('#logout-tab-btn').css('display', 'inline-block')

  // reset login flip button
  // $('#spn-front-label').parent().removeAttr('disabled')
  // $('#spn-btn').off('click')
  // $('#spn-btn').removeClass('flip-inside')

  // uncomment to restore Bulk Save button
  // $('#bulk-save-btn').removeAttr('disabled')
  // $('#bulk-save-btn').attr('title', '')
  // $('#bulk-save-btn').click(bulkSave)

  // show SPN options and hide login
  // $('#chk-outlinks-label').css('visibility', '')
  // $('#chk-screenshot-label').css('visibility', '')
  // $('#chk-login-btn').css('visibility', 'hidden')
}

// Open Wayback Machine website for the given pageURL.
function openWaybackPage(waybackURL, pageURL) {
  if (pageURL) {
    chrome.runtime.sendMessage({
      message: 'openurl',
      wayback_url: waybackURL,
      page_url: pageURL
    }, checkLastError)
  }
}

function openNewestPage() { openWaybackPage('https://web.archive.org/web/2/', activeURL) }
function openOldestPage() { openWaybackPage('https://web.archive.org/web/0/', activeURL) }
function openOverviewPage() { openWaybackPage('https://web.archive.org/web/*/', activeURL) }

function social_share(eventObj) {
  let parent = eventObj.target.parentNode
  let id = eventObj.target.getAttribute('id')
  if (id === null) {
    id = parent.getAttribute('id')
  }
  // Share wayback link to the most recent snapshot of URL at the time this is called.
  let clean_url = getCleanUrl(activeURL)
  if (isValidUrl(clean_url)) {
    let timestamp = dateToTimestamp(new Date())
    let wayback_url = 'https://web.archive.org/web/' + timestamp + '/'
    let sharing_url = wayback_url + clean_url

    // Latest Social Share URLs: https://github.com/bradvin/social-share-urls
    if (id.includes('facebook-share-btn')) {
      openByWindowSetting('https://www.facebook.com/sharer.php?u=' + fixedEncodeURIComponent(sharing_url))
    } else if (id.includes('twitter-share-btn')) {
      openByWindowSetting('https://twitter.com/intent/tweet?url=' + fixedEncodeURIComponent(sharing_url))
    } else if (id.includes('linkedin-share-btn')) {
      openByWindowSetting('https://www.linkedin.com/sharing/share-offsite/?url=' + fixedEncodeURIComponent(sharing_url))
    } else if (id.includes('copy-link-btn') && navigator.clipboard) {
      navigator.clipboard.writeText(sharing_url).then(() => {
        let copiedMsg = $('#link-copied-msg')
        copiedMsg.text('Copied to Clipboard').fadeIn('fast')
        setTimeout(() => {
          copiedMsg.fadeOut('fast')
        }, 1500)
      }).catch(err => {
        console.log('Not copied to clipboard: ', err)
      })
    }
  }
}

function searchTweet() {
  let clean_url = getCleanUrl(activeURL)
  if (isValidUrl(clean_url)) {
    const curl = cropScheme(clean_url)
    if (curl) {
      let surl = curl
      if (surl.slice(-1) === '/') {
        // remove trailing slash if present
        surl = surl.substring(0, surl.length - 1)
      }
      const query = `(${surl} OR https://${curl} OR http://${curl})`
      let open_url = 'https://twitter.com/search?q=' + fixedEncodeURIComponent(query)
      openByWindowSetting(open_url)
    }
  }
}

// Update the UI when user is using the Search Box.
function useSearchURL(flag) {
  if (flag) {
    showUrlNotSupported(false)
    $('#last-saved-msg').hide()
    $('#suggestion-box').text('').hide()
    $('#url-not-supported-msg').hide()
    $('#readbook-container').hide()
    $('#tvnews-container').hide()
    $('#wiki-container').hide()
    $('#fact-check-container').hide()
    $('#using-search-msg').text('Using Search URL').show()
  } else {
    $('#using-search-msg').hide()
    // reassign activeURL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      activeURL = (tabs && tabs[0]) ? tabs[0].url : null
    })
  }
}

// Setup keyboard handler for Search Box.
function setupSearchBox() {
  const search_box = document.getElementById('search-input')
  search_box.addEventListener('keyup', (e) => {
    // exclude UP and DOWN keys from keyup event
    if (!((e.key === 'ArrowUp') || (e.key === 'ArrowDown')) && (search_box.value.length >= 0)) {
      const url = makeValidURL(search_box.value)
      if (url && isNotExcludedUrl(url) && !isArchiveUrl(url)) {
        activeURL = url
        useSearchURL(true)
      } else {
        useSearchURL(false)
      }
    }
  })
}

function arrow_key_access() {
  const list = document.getElementById('suggestion-box')
  const search_box = document.getElementById('search-input')
  let index = search_box

  search_box.addEventListener('keydown', (e) => {
    // listen for up key
    if (e.key === 'ArrowUp') {
      if (index === list.firstChild && index && list.lastChild) {
        if (index.classList.contains('focused')) { index.classList.remove('focused') }
        index = list.lastChild
        if (!index.classList.contains('focused')) { index.classList.add('focused') }
        search_box.value = index.textContent
      } else if (index === search_box) {
        /* skip */
      } else if (index !== search_box && index && index.previousElementSibling) {
        if (index.classList.contains('focused')) { index.classList.remove('focused') }
        index = index.previousElementSibling
        if (!index.classList.contains('focused')) { index.classList.add('focused') }
        search_box.value = index.textContent
      }

      // listen for down key
    } else if (e.key === 'ArrowDown') {
      if (index === search_box && list.firstChild) {
        index = list.firstChild
        if (!index.classList.contains('focused')) { index.classList.add('focused') }
        search_box.value = index.textContent
      } else if (index === list.lastChild && list.lastChild) {
        if (index.classList.contains('focused')) { index.classList.remove('focused') }
        index = list.firstChild
        if (!index.classList.contains('focused')) { index.classList.add('focused') }
        search_box.value = index.textContent
      } else if (index !== search_box && index && index.nextElementSibling) {
        if (index.classList.contains('focused')) { index.classList.remove('focused') }
        index = index.nextElementSibling
        if (!index.classList.contains('focused')) { index.classList.add('focused') }
        search_box.value = index.textContent
      }
    } else {
      index = search_box
    }
  })
}

function display_list(key_word) {
  $('#suggestion-box').text('').hide()
  $.getJSON(hostURL + '__wb/search/host?q=' + key_word, (data) => {
    $('#suggestion-box').text('').hide()
    if (data.hosts.length > 0 && $('#search-input').val() !== '') {
      $('#suggestion-box').show()
      dismissSearchHandler()
      arrow_key_access()
      for (let i = 0; i < data.hosts.length; i++) {
        $('#suggestion-box').append(
          $('<div>').attr('role', 'button').text(data.hosts[i].display_name).click((event) => {
            document.getElementById('search-input').value = event.target.innerHTML
            activeURL = getCleanUrl(makeValidURL(event.target.innerHTML))
            if (activeURL) { useSearchURL(true) }
          })
        )
      }
    }
  })
}

function display_suggestions(e) {
  // exclude arrow keys from keypress event
  if ((e.key === 'ArrowUp') || (e.key === 'ArrowDown')) { return false }
  $('#suggestion-box').text('').hide()
  if (e.key === 'Enter') {
    clearTimeout(searchBoxTimer)
    e.preventDefault()
  } else {
    if ($('#search-input').val().length >= 1) {
      $('#url-not-supported-msg').hide()
    } else {
      $('#url-not-supported-msg').show()
      useSearchURL(false)
    }
    clearTimeout(searchBoxTimer)
    // Call display_list function if the difference between keypress is greater than 300ms (Debouncing)
    searchBoxTimer = setTimeout(() => {
      const query = $('#search-input').val()
      display_list(query)
    }, 300)
  }
}

// Click handler to dismiss search display list when user clicks outside box.
function dismissSearchHandler() {
  $('html').off('click').on('click', (e) => {
    if (!$(e.target).is('#suggestion-box')) {
      $('#suggestion-box').text('').hide()
    }
  })
}

function open_feedback_page() {
  openByWindowSetting(feedbackURL)
}

function open_donations_page() {
  let donation_url = 'https://archive.org/donate/'
  openByWindowSetting(donation_url)
}

function about_support() {
  openByWindowSetting('about.html')
}

function openSitemap() {
  openWaybackPage('https://web.archive.org/web/sitemap/', activeURL)
}

function openCollections() {
  openWaybackPage('https://web.archive.org/web/collections/*/', activeURL)
}

function openURLs() {
  openWaybackPage('https://web.archive.org/web/*/', activeURL + '*')
}

function showSettings() {
  $('#popup-page').hide()
  $('#login-page').hide()
  $('#setting-page').show()
}

function showLoginPage(e) {
  e.preventDefault()
  $('#popup-page').hide()
  $('#setting-page').hide()
  $('#login-message').hide()
  $('#login-page').show()
}

function showLoginFromTab(e) {
  $('#login-label').html('Log in to the<br> Internet Archive')
  $('.back-btn').off('click').on('click', goBackToMain)
  showLoginPage(e)
}

function showLoginFromMain(e) {
  $('#login-label').html('This feature requires logging in to the Internet Archive')
  $('.back-btn').off('click').on('click', goBackToMain)
  showLoginPage(e)
}

function showLoginFromSettings(e) {
  $('#login-label').html('This feature requires logging in to the Internet Archive')
  $('.back-btn').off('click').on('click', goBackToSettings)
  showLoginPage(e)
}

// Returns to the main view.
function goBackToMain() {
  $('#login-page').hide()
  $('#setting-page').hide()
  $('#popup-page').show()
  $('.back-btn').off('click').on('click', goBackToMain)
}

// Returns to the settings view.
function goBackToSettings() {
  $('#login-page').hide()
  $('#popup-page').hide()
  $('#setting-page').show()
  $('.back-btn').off('click').on('click', goBackToMain)
}

// not used
/*
function show_all_screens() {
  const url = getCleanUrl(activeURL)
  if (url) {
    chrome.runtime.sendMessage({ message: 'showall', url: url })
  }
}
*/

// Checks toolbar state if 404 or similar error set, then show 'View Archived Version' button.
//
function setupViewArchived() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      chrome.runtime.sendMessage({ message: 'getToolbarState', atab: tabs[0] }, (result) => {
        checkLastError()
        const state = (result && ('stateArray' in result)) ? new Set(result.stateArray) : new Set()
        if (state.has('V') && ('customData' in result) && ('statusWaybackUrl' in result.customData) &&
          ('statusCode' in result.customData) && (result.customData.statusCode >= 400) &&
          ('statusUrl' in result.customData) && (cropPrefix(result.customData.statusUrl) === cropPrefix(tabs[0].url)))
        {
          // show msg and View Archived button for error status codes
          const statusCode = result.customData.statusCode
          const waybackUrl = result.customData.statusWaybackUrl
          const statusText = ((statusCode < 999) ? statusCode + ' ' : '') + (ERROR_CODE_DIC[statusCode] || 'Error')
          $('#last-saved-msg').hide()
          $('#search-container').hide()
          $('#spn-container').hide()
          $('#view-archived-container').show()
          $('#view-archived-msg').text(statusText)
          $('#view-archived-btn').click(() => {
            openByWindowSetting(waybackUrl)
          })
        }
      })
    }
  })
}

// Displays 'Read Book' button if on Amazon Books.
// May fetch info about Amazon Books if not already cached, then update button click handler.
//
function setupReadBook() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      const url = tabs[0].url
      if (url.includes('www.amazon') && url.includes('/dp/')) {
        chrome.runtime.sendMessage({ message: 'getToolbarState', atab: tabs[0] }, (result) => {
          checkLastError()
          let state = (result && result.stateArray) ? new Set(result.stateArray) : new Set()
          if (state.has('R')) {
            $('#readbook-container').show()
            chrome.storage.local.get(['tab_url', 'detail_url', 'view_setting'], (settings) => {
              if (!settings) { return }
              const stored_url = settings.tab_url
              const detail_url = settings.detail_url
              const context = settings.view_setting
              // Checking if the tab url is the same as the last stored one
              if (stored_url === url) {
                // if same, use the previously fetched url
                $('#readbook-btn').click(() => {
                  openByWindowSetting(detail_url, context)
                })
              } else {
                // if not, fetch it again
                let headers = new Headers(hostHeaders)
                headers.set('backend', 'nomad')
                fetch(hostURL + 'services/context/amazonbooks?url=' + url, {
                  method: 'GET',
                  headers: headers
                })
                .then(res => res.json())
                .then(response => {
                  if (response['metadata'] && response['metadata']['identifier-access']) {
                    const new_details_url = response['metadata']['identifier-access']
                    $('#readbook-btn').click(() => {
                      openByWindowSetting(new_details_url, context)
                    })
                  }
                })
              }
            })
          }
        })
      }
    }
  })
}

// Display 'TV News Clips' button if current url is present in newshosts[]
function setupNewsClips() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      const url = tabs[0].url
      const news_host = new URL(url).hostname
      if (newshosts.has(news_host)) {
        chrome.runtime.sendMessage({ message: 'getToolbarState', atab: tabs[0] }, (result) => {
          checkLastError()
          let state = (result && result.stateArray) ? new Set(result.stateArray) : new Set()
          if (state.has('R')) {
            $('#tvnews-container').show()
            $('#tvnews-btn').click(() => {
              chrome.storage.local.get(['view_setting'], function (settings) {
                if (settings && settings.view_setting) {
                  const URL = chrome.runtime.getURL('tvnews.html') + '?url=' + url
                  openByWindowSetting(URL, settings.view_setting)
                } else {
                  console.log('Missing view_setting!')
                }
              })
            })
          }
        })
      }
    }
  })
}

// Display 'Cited Books' & 'Cited Papers' buttons.
function setupWikiButtons() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      const url = tabs[0].url
      if (url.match(/^https?:\/\/[\w.]*wikipedia.org/)) {
        chrome.runtime.sendMessage({ message: 'getToolbarState', atab: tabs[0] }, (result) => {
          checkLastError()
          let state = (result && result.stateArray) ? new Set(result.stateArray) : new Set()
          if (state.has('R')) {
            // show wikipedia cited books & papers buttons
            $('#wikibooks-btn').click(() => {
              const URL = chrome.runtime.getURL('cited-books.html') + '?url=' + fixedEncodeURIComponent(url)
              openByWindowSetting(URL)
            })
            $('#wikipapers-btn').click(() => {
              const URL = chrome.runtime.getURL('cited-papers.html') + '?url=' + fixedEncodeURIComponent(url)
              openByWindowSetting(URL)
            })
            if (state.has('books') && !state.has('papers')) {
              // books only
              $('#wikibooks-btn').addClass('btn-wide')
              $('#wikipapers-btn').remove()
            } else if (!state.has('books') && state.has('papers')) {
              // papers only
              $('#wikibooks-btn').remove()
              $('#wikipapers-btn').addClass('btn-wide')
            }
            $('#wiki-container').show()
          }
        })
      }
    }
  })
}

// Display 'Contextual Notices' button.
function setupFactCheck() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      chrome.storage.local.get(['fact_check_setting'], (settings) => {
        if (settings && settings.fact_check_setting) {
          chrome.runtime.sendMessage({ message: 'getToolbarState', atab: tabs[0] }, (result) => {
            checkLastError()
            const state = (result && ('stateArray' in result)) ? new Set(result.stateArray) : new Set()
            if (state.has('F') && ('customData' in result) && ('contextUrl' in result.customData)) {
              // show fact-check button
              const contextUrl = result.customData.contextUrl
              $('#fact-check-container').show()
              $('#fact-check-btn').click(() => {
                openByWindowSetting(contextUrl)
              })
            }
          })
        }
      })
    }
  })
}

// Common function to show different context
function showContext(eventObj) {
  const id = eventObj.target.getAttribute('id')
  const url = getCleanUrl(activeURL)
  if (url && isValidUrl(url)) {
    if (id.includes('alexa-btn')) {
      const hostname = new URL(url).hostname
      const alexaUrl = 'https://www.alexa.com/siteinfo/' + hostname
      openByWindowSetting(alexaUrl)
    } else if (id.includes('annotations-btn')) {
      const annotationsUrl = chrome.runtime.getURL('annotations.html') + '?url=' + url
      openByWindowSetting(annotationsUrl)
    } else if (id.includes('tag-cloud-btn')) {
      const tagsUrl = chrome.runtime.getURL('wordcloud.html') + '?url=' + url
      openByWindowSetting(tagsUrl)
    }
  }
}

function openMyWebArchivePage() {
  // retrieve the itemname
  getUserInfo().then(info => {
    if (info && ('itemname' in info)) {
      const url = `https://archive.org/details/${info.itemname}?tab=web-archive`
      openByWindowSetting(url)
    }
  })
}

function showUrlNotSupported(flag) {
  if (flag) {
    $('#spn-btn').off('click')
    $('#spn-btn').addClass('flip-inside')
    $('#last-saved-msg').hide()
    $('#url-not-supported-msg').text('URL not supported')
    $('#spn-back-label').text('URL not supported')
    $('.not-sup-dim').attr('disabled', true).css('opacity', '0.66').css('cursor', 'not-allowed')
  } else {
    $('#spn-btn').off('click').on('click', doSaveNow)
    $('#spn-btn').removeClass('flip-inside')
    $('#url-not-supported-msg').text('').hide()
    $('.not-sup-dim').attr('disabled', false).css('opacity', '1.0').css('cursor', '')
  }
}

// For removing focus outline around buttons on mouse click, while keeping during keyboard use.
function clearFocus() {
  document.activeElement.blur()
}

// Displays and updates or clears the Wayback Count badge.
function setupWaybackCount() {
  chrome.storage.local.get(['wm_count_setting'], (settings) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        // not using activeURL as we don't want wayback count on search url
        const url = tabs[0].url
        if (url && settings && settings.wm_count_setting && isValidUrl(url) && isNotExcludedUrl(url) && !isArchiveUrl(url)) {
          showWaybackCount(url)
          chrome.runtime.sendMessage({ message: 'updateCountBadge' })
        } else {
          clearWaybackCount()
          chrome.runtime.sendMessage({ message: 'clearCountBadge' })
        }
      }
    })
  })
}

// Displays Wayback count, and Oldest and Newest timestamps
function showWaybackCount(url) {
  $('#wayback-count-msg').show()
  chrome.runtime.sendMessage({ message: 'getCachedWaybackCount', url: url }, (result) => {
    checkLastError()
    if (result && ('total' in result) && (result.total >= 0)) {
      // set label
      let text = ''
      if (result.total === 1) {
        text = 'Saved once.'
      } else if (result.total > 1) {
        text = 'Saved ' + result.total.toLocaleString() + ' times.'
      } else {
        text = 'This page has not been archived.'
      }
      $('#wayback-count-msg').text(text)
    } else {
      clearWaybackCount()
    }
    if (result && result.first_ts) {
      let date = timestampToDate(result.first_ts)
      $('#oldest-btn').attr('title', date.toLocaleString())
    }
    if (result && result.last_ts) {
      let date = timestampToDate(result.last_ts)
      $('#newest-btn').attr('title', date.toLocaleString())
    }
  })
}

function clearWaybackCount() {
  $('#wayback-count-msg').html('').hide()
  $('#oldest-btn').attr('title', 'Display the earliest archive of a URL')
  $('#newest-btn').attr('title', 'Display the most recent archive of a URL')
}

// not used right now
/*
function bulkSave() {
  openByWindowSetting('../bulk-save.html', 'windows')
}
*/

// Displays animated 'Archiving...' for Save Button if in save state.
function setupSaveButton() {
  // not using activeTab here as it may not be assigned yet
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      chrome.runtime.sendMessage({ message: 'getToolbarState', atab: tabs[0] }, (result) => {
        checkLastError()
        let state = (result && result.stateArray) ? new Set(result.stateArray) : new Set()
        if (state.has('S')) {
          showSaving()
        }
      })
    }
  })
}

function showSaving(count) {
  $('#save-progress-bar').show()
  $('#spn-btn').off('click')
  disableWhileSaving()
  const text = $('#spn-front-label').text()
  if (count) {
    $('#spn-front-label').text(`Archiving URL... ${count}`)
  } else if (!text.startsWith('Archiving')) {
    // only set if not already set so as to not replace archive count
    $('#spn-front-label').text('Archiving URL...')
  }
}

function disableWhileSaving() {
  $('#search-input').attr('disabled', 'disabled')
  $('#chk-outlinks').attr('disabled', 'disabled')
  $('#chk-screenshot').attr('disabled', 'disabled')
}

function enableAfterSaving() {
  $('#search-input').removeAttr('disabled')
  $('#chk-outlinks').removeAttr('disabled')
  $('#chk-screenshot').removeAttr('disabled')
}

// respond to Save Page Now success
function setupSaveListener() {
  chrome.runtime.onMessage.addListener(
    (message) => {
      if (activeURL === message.url) {
        if (message.message === 'save_success') {
          $('#save-progress-bar').hide()
          $('#spn-front-label').text('Save successful')
          $('#last-saved-msg').text('Last Saved ' + viewableTimestamp(message.timestamp)).show()
          $('#spn-btn').removeClass('flip-inside')
          setupWaybackCount()
          enableAfterSaving()
        } else if (message.message === 'save_archived') {
          // snapshot already archived within timeframe
          $('#save-progress-bar').hide()
          $('#spn-front-label').text('Recently Saved')
          $('#spn-btn').attr('title', message.error)
          enableAfterSaving()
        } else if (message.message === 'save_start') {
          showSaving()
        } else if (message.message === 'save_error') {
          $('#save-progress-bar').hide()
          $('#spn-front-label').text('Save Failed')
          $('#spn-btn').attr('title', message.error)
          enableAfterSaving()
        } else if ((message.message === 'resource_list_show')) {
          // show resource count from SPN status in SPN button
          const vdata = message.data
          if (('resources' in vdata) && vdata.resources.length) {
            showSaving(vdata.resources.length)
          }
        }
      }
    }
  )
}

// onload
$(function() {
  $('#setting-page').hide()
  $('#login-page').hide()
  initAgreement()
  initActiveTabURL()
  setupViewArchived()
  setupNewsClips()
  setupWikiButtons()
  setupReadBook()
  setupFactCheck()
  setupSearchBox()
  setupSaveButton()
  setupLoginState()
  setupWaybackCount()
  setupSaveListener()
  setupSettingsTabTip()
  $('.logo-wayback-machine').click(homepage)
  $('#newest-btn').click(openNewestPage)
  $('#oldest-btn').click(openOldestPage)
  $('#overview-btn').click(openOverviewPage)
  $('#facebook-share-btn').click(social_share)
  $('#twitter-share-btn').click(social_share)
  $('#linkedin-share-btn').click(social_share)
  $('#copy-link-btn').click(social_share)
  $('#tweets-btn').click(searchTweet)
  $('#about-tab-btn').click(about_support)
  $('#donate-tab-btn').click(open_donations_page)
  $('#settings-tab-btn').click(showSettings)
  $('#feedback-tab-btn').click(open_feedback_page)
  $('#site-map-btn').click(openSitemap)
  $('#collections-btn').click(openCollections)
  $('#urls-btn').click(openURLs)
  $('#search-input').keydown(display_suggestions)
  $('.btn').click(clearFocus)
  $('#annotations-btn').click(showContext)
  $('#tag-cloud-btn').click(showContext)
})
