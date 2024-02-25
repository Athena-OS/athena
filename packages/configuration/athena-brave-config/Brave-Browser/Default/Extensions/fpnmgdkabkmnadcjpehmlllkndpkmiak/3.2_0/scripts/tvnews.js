// tvnews.js

// from 'utils.js'
/*   global openByWindowSetting, getUrlByParameter */

// from 'test/setup.js'
/*   global isInTestEnv */

function parseDate (date) {
  if (typeof date === 'string') {
    const dateObject = new Date(date)
    if (dateObject.toDateString() !== 'Invalid Date') {
      return dateObject.toDateString()
    }
  }
  return ''
}

function constructArticles (clip) {
  let topElements = $('<div>').addClass('top_elements').append(
    $('<p>').text(clip.show).prepend($('<strong>').text(clip.station + ': '))
  )
  let bottomElements = $('<div>').addClass('bottom_elements').append(
    $('<a>').attr({ 'href': clip.preview_url }).append(
      $('<img class="preview-clips">').attr({ 'src': clip.preview_thumb })
    ).click((e) => {
      e.preventDefault()
      openByWindowSetting(clip.preview_url)
    }),
    $('<p>').text(parseDate(clip.show_date))
  )
  return $('<div>').append(
    topElements,
    bottomElements
  )
}

function getDetails(article) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      message: 'tvnews',
      article: article
    }, (clips) => {
      if (chrome.runtime.lastError) { /* skip */ }
      if (clips.status !== 'error') {
        resolve(clips)
      } else {
        reject(new Error('Clips not found'))
      }
    })
  })
}

function getArticles(url) {
  getDetails(url)
  .then((clips) => {
    $('.loader').hide()
    if (clips && (clips.length > 0)) {
      for (let clip of clips) {
        $('#RecommendationTray').append(constructArticles(clip))
      }
    } else {
      $('#RecommendationTray').css({ 'grid-template-columns': 'none' }).append(
        $('<p>').text('No Related Clips Found...').css({ 'margin': 'auto' })
      )
    }
  })
  .catch((err) => {
    $('.loader').hide()
    $('#RecommendationTray').css({ 'grid-template-columns': 'none' }).append(
      $('<p>').text(err).css({ 'margin': 'auto' })
    )
  })
}

// onload
$(function() {
  // will not run during mocha testing
  if (typeof isInTestEnv === 'undefined') { getArticles(getUrlByParameter('url')) }
})

if (typeof module !== 'undefined') {
  module.exports = {
    getArticles,
    parseDate
  }
}
