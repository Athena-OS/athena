// cited-papers.js

// from 'utils.js'
/*   global getUrlByParameter, openByWindowSetting, checkLastError */

// from 'test/setup.js'
/*   global isInTestEnv */

function getMetadata(entry) {
  const MAX_TITLE_LEN = 300
  let title = entry.title
  if (title.length > MAX_TITLE_LEN) {
    title = title.slice(0, MAX_TITLE_LEN) + '...'
  }
  let author = ''
  if (entry.authors && entry.authors[0]) {
    author = entry.authors[0]
    if (entry.authors.length > 1) {
      author = author + ' et al.'
    }
  } else if (entry.contribs && entry.contribs[0]) {
    author = entry.contribs[0].raw_name
    if (entry.contribs.length > 1) {
      author = author + ' et al.'
    }
  }
  let journal = entry.journal
  let url = '#'
  if (entry.url) {
    url = entry.url
  }
  return {
    'title': title,
    'author': author,
    'journal': journal,
    'url': url,
    'source': entry.source
  }
}

function makeEntry (data) {
  let paper = $('<div>').append(
    $('<p class="text-elements">').append(
      $('<h3>').text(data.title),
      $('<p>').append(data.author)
      // Journal was also commented out in the previous version.
      // $('<p>').append(journal)
    )
  )
  let bottom_details = $('<div>').addClass('bottom-details')
  if (data.url !== '#') {
    bottom_details.append(
      $('<button>').attr({ 'class': 'btn btn-auto btn-blue' }).text('Read Paper').click(() => {
        openByWindowSetting(data.url)
      }),
      $('<div>').addClass('small text-muted').text('source: ' + data.source)
    )
  } else {
    bottom_details.append($('<p>').text('Paper Unavailable').addClass('unavailable-label'))
  }
  paper.append(bottom_details)
  return paper
}

function createPage () {
  let container = $('#container-whole-doi')
  const url = getUrlByParameter('url')
  getPapers(url)
  .then((papers) => {
    $('.loader').hide()
    for (let i = 0; i < papers.length; i++) {
      if (papers[i]) {
        let data = getMetadata(papers[i])
        let paper = makeEntry(data)
        // add to list
        if (data.url !== '#') {
          container.prepend(paper)
        } else {
          container.append(paper)
        }
      }
    }
  })
  .catch((err) => {
    $('.loader').hide()
    $('#error-msg').html(err)
  })
}

function getPapers(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      message: 'getCitedPapers',
      query: url
    }, (papers) => {
      checkLastError()
      if (papers && papers.status !== 'error') {
        resolve(papers)
      } else {
        reject(new Error('Papers not found'))
      }
    })
  })
}

// onload
$(function() {
  // will not run during mocha testing
  if (typeof isInTestEnv === 'undefined') { createPage() }
})

if (typeof module !== 'undefined') {
  module.exports = {
    getMetadata,
    makeEntry,
    createPage
  }
}
