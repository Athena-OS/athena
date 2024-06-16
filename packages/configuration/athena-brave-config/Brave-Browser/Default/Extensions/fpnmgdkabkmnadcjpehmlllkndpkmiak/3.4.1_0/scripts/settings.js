// settings.js

// from 'utils.js'
/*   global attachTooltip, openByWindowSetting, isSafari */

// from 'popup.js'
/*   global setupWaybackCount, goBackToMain */

// onload
$(function() {
  initSettings()
  setupPrivateMode()
  setupSettingsChange()
  setupPanelSwitch()
  setupHelpDocs()
  $('#exclude-urls-btn').click(showExcludeList)
  $('.back-btn').off('click').on('click', goBackToMain)
})

function initSettings() {
  chrome.storage.local.get(null, restoreSettings)
}

function restoreSettings(items) {
  // SPN
  $('#chk-screenshot').prop('checked', items.spn_screenshot)
  $('#chk-outlinks').prop('checked', items.spn_outlinks)
  // first panel
  $('#private-mode-setting').prop('checked', items.private_mode_setting)
  $('#not-found-setting').prop('checked', items.not_found_setting)
  $('#wm-count-setting').prop('checked', items.wm_count_setting)
  $('#fact-check-setting').prop('checked', items.fact_check_setting)
  $('#wiki-setting').prop('checked', items.wiki_setting)
  $('#amazon-setting').prop('checked', items.amazon_setting)
  $('#tvnews-setting').prop('checked', items.tvnews_setting)
  // second panel
  $('#auto-archive-setting').prop('checked', items.auto_archive_setting)
  $('#auto-archive-age').val(items.auto_archive_age || '99999')
  $('#auto-bookmark-setting').prop('checked', items.auto_bookmark_setting)
  $('#email-outlinks-setting').prop('checked', items.email_outlinks_setting)
  $('#my-archive-setting').prop('checked', items.my_archive_setting)
  $('#resource-list-setting').prop('checked', items.resource_list_setting)
  $('#notify-setting').prop('checked', items.notify_setting)
  $('#embed-popup-setting').prop('checked', items.embed_popup_setting)
  $(`input[name=view-setting-input][value=${items.view_setting}]`).prop('checked', true)
  // update UI
  enableEmbedPopupSetting(items.not_found_setting)
}

function saveSettings() {
  let settings = {
    // SPN
    spn_outlinks: $('#chk-outlinks').prop('checked'),
    spn_screenshot: $('#chk-screenshot').prop('checked'),
    // first panel
    private_mode_setting: $('#private-mode-setting').prop('checked'),
    not_found_setting: $('#not-found-setting').prop('checked'),
    wm_count_setting: $('#wm-count-setting').prop('checked'),
    fact_check_setting: $('#fact-check-setting').prop('checked'),
    wiki_setting: $('#wiki-setting').prop('checked'),
    amazon_setting: $('#amazon-setting').prop('checked'),
    tvnews_setting: $('#tvnews-setting').prop('checked'),
    // second panel
    auto_archive_setting: $('#auto-archive-setting').prop('checked'),
    auto_archive_age: $('#auto-archive-age').val(),
    auto_bookmark_setting: $('#auto-bookmark-setting').prop('checked'),
    email_outlinks_setting: $('#email-outlinks-setting').prop('checked'),
    my_archive_setting: $('#my-archive-setting').prop('checked'),
    resource_list_setting: $('#resource-list-setting').prop('checked'),
    notify_setting: $('#notify-setting').prop('checked'),
    embed_popup_setting: $('#embed-popup-setting').prop('checked'),
    view_setting: $('input[name=view-setting-input]:checked').val()
  }
  chrome.storage.local.set(settings)
}

// clears settings that should be clear when logged out.
function clearSettingsOnLogout() {
  $('.clear-on-logout').prop('checked', false)
  saveSettings()
}

function setupPrivateMode() {
  $('#private-mode-setting').change(onPrivateModeChange)
  $('.private-setting').change(onPrivateSettingChange)
}

// When Private Mode turned on, clear all private checkboxes and clear cached data.
function onPrivateModeChange(e) {
  if ($('#private-mode-setting').prop('checked') === true) {
    $('.private-setting').prop('checked', false).trigger('change')
    chrome.runtime.sendMessage({ message: 'clearCountCache' })
  }
}

// Turn off private mode if any private checkbox is set.
function onPrivateSettingChange(e) {
  if ($(e.target).prop('checked') === true) {
    $('#private-mode-setting').prop('checked', false)
  }
}

// Enable or disable setting when flag is true or false.
function enableEmbedPopupSetting(flag) {
  if (flag) {
    $('#embed-popup-setting').attr('disabled', false)
    $('#embed-popup-label').css('opacity', '1.0').css('cursor', '')
  } else {
    $('#embed-popup-setting').attr('disabled', true)
    $('#embed-popup-label').css('opacity', '0.66').css('cursor', 'not-allowed')
  }
}

// Save settings on change and other actions on particular settings.
function setupSettingsChange() {

  // save settings whenever one changes
  $('.saved-setting').change(saveSettings)

  // auto save page
  $('#auto-archive-age').change((e) => {
    $('#auto-archive-setting').prop('checked', true).trigger('change')
    e.target.blur()
  })

  // auto save bookmarks
  if (isSafari) {
    // Tried alternatives to test bookmarks support, but none worked out.
    // hide setting if bookmarks unsupported
    $('#auto-bookmark-label').hide()
  } else {
    // before setting Auto Save Bookmarks, check optional 'bookmarks' permission and popup request if not yet acquired.
    $('#auto-bookmark-setting').click((e) => {
      if ($(e.target).prop('checked') === true) {
        e.preventDefault()
        chrome.permissions.request({ permissions: ['bookmarks'] }, (granted) => {
          if (granted) {
            // Set checkmark and save it since it was prevented.
            // Permissions popup will cause main popup to disappear, preventing this code from running.
            // Fixed by saving auto_bookmark_setting to true in background.js when permission granted.
            $('#auto-bookmark-setting').prop('checked', true)
            saveSettings()
          }
        })
      }
    })
  }

  // notify setting
  // hide setting if notifications unsupported (e.g. Safari)
  if (!chrome.notifications) {
    $('#notify-label').hide()
  }

  // view setting
  $('#view-setting').click(switchTabWindow)
  $('#view-setting').children('input,label').click((e) => { e.stopPropagation() })

  // wayback count
  $('#wm-count-setting').change((e) => {
    // displays or clears the count badge, label, oldest and newest tooltips
    setupWaybackCount()
  })

  // 404 embed-popup-setting
  $('#not-found-setting').change((e) => {
    enableEmbedPopupSetting($(e.target).prop('checked') === true)
  })

  // resources
  $('#wiki-setting').change((e) => {
    if ($(e.target).prop('checked') === false) {
      $('#wiki-container').hide()
      chrome.runtime.sendMessage({ message: 'clearResource', settings: { wiki_setting: false } })
    }
  })
  $('#amazon-setting').change((e) => {
    if ($(e.target).prop('checked') === false) {
      $('#readbook-container').hide()
      chrome.runtime.sendMessage({ message: 'clearResource', settings: { amazon_setting: false } })
    }
  })
  $('#tvnews-setting').change((e) => {
    if ($(e.target).prop('checked') === false) {
      $('#tvnews-container').hide()
      chrome.runtime.sendMessage({ message: 'clearResource', settings: { tvnews_setting: false } })
    }
  })

  // context notices
  $('#fact-check-setting').change((e) => {
    if ($(e.target).prop('checked') === false) {
      $('#fact-check-container').hide()
      chrome.runtime.sendMessage({ message: 'clearFactCheck' })
    }
  })
}

function showExcludeList() {
  openByWindowSetting(chrome.runtime.getURL('exclude-list.html'), 'windows')
}

// Prepares the top tab bar for switching between setting panels.
function setupPanelSwitch() {
  if (!$('#panel2-btn').hasClass('selected')) { $('#panel2-btn').addClass('selected') }
  $('#first-panel').hide()
  $('#panel1-btn').click(() => {
    $('#second-panel').hide()
    $('#first-panel').show()
    if (!$('#panel1-btn').hasClass('selected')) { $('#panel1-btn').addClass('selected') }
    if ($('#panel2-btn').hasClass('selected')) { $('#panel2-btn').removeClass('selected') }
  })
  $('#panel2-btn').click(() => {
    $('#first-panel').hide()
    $('#second-panel').show()
    if (!$('#panel2-btn').hasClass('selected')) { $('#panel2-btn').addClass('selected') }
    if ($('#panel1-btn').hasClass('selected')) { $('#panel1-btn').removeClass('selected') }
  })
}

// Cycles the Tab/Window setting.
function switchTabWindow() {
  let idx = 0, inputs = $('input[name=view-setting-input]')
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].checked) { idx = i }
  }
  let j = (idx + 1) % inputs.length // wrap around using mod
  $(inputs[j]).prop('checked', true).trigger('change')
}

function setupHelpDocs() {
  let docs = {
    // context tab
    'private-mode-setting': 'Don\'t initiate automatic communications between this extension and the Internet Archive.',
    'not-found-setting': 'If server returns a 4xx or 5xx then check the Wayback Machine for archives.',
    'wm-count-setting': 'Show number of times the current URL has been archived in the Wayback Machine.',
    'fact-check-setting': 'Check for contextual information from fact checking organizations and origin websites.',
    'wiki-setting': 'Check for books and academic papers from the Internet Archive referenced in Wikipedia articles. ',
    'amazon-setting': 'Check if books from Amazon are available from the Internet Archive.',
    'tvnews-setting': 'Auto check for related TV News Clips while visiting selected news websites.',
    // general tab
    'auto-archive-setting': 'Archive URLs that have not previously been archived to the Wayback Machine.',
    'auto-bookmark-setting': 'Archive when bookmarking a website, except Excluded URLs.',
    'email-outlinks-setting': 'Send an email of results when Outlinks option is selected.',
    'my-archive-setting': 'Adds URL to My Web Archive when Save Page Now is selected.',
    'notify-setting': 'Turn off all notifications.',
    'resource-list-setting': 'Display embedded URLs archived with Save Page Now.'
  }
  let labels = $('label')
  for (let i = 0; i < labels.length; i++) {
    let docFor = $(labels[i]).attr('for')
    if (docs[docFor]) {
      let tt = $('<div>').append($('<p>').text(docs[docFor]).attr({ 'class': 'setting-tip' }))[0].outerHTML
      let docBtn = $('<button>').addClass('btn-docs').text('?')
      $(labels[i]).append(attachTooltip(docBtn, tt, 'top'))
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    clearSettingsOnLogout
  }
}
