// cited-books.js

// from 'utils.js'
/*   global openByWindowSetting, getUrlByParameter, checkLastError */

function getWikipediaBooks(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      message: 'getWikipediaBooks',
      query: url
    }, (books) => {
      checkLastError()
      if (books) {
        resolve(books)
      } else {
        reject(new Error('error'))
      }
    })
  })
}

function bookMetadata(book) {
  const MAX_TITLE_LEN = 300
  if (book && book.metadata) {
    return {
      'title': (book.metadata.title.length > MAX_TITLE_LEN) ? book.metadata.title.slice(0, MAX_TITLE_LEN) + '...' : book.metadata.title,
      'author': book.metadata.creator,
      'image': 'https://archive.org/services/img/' + book.metadata.identifier,
      'link': book.metadata['identifier-access'],
      'button_text': 'Read Book',
      'button_class': 'btn btn-auto btn-blue',
      'readable': true
    }
  }
  return false
}

// This runs every time cited-books.html is viewed.
// It retrieves a list of book cover images.
function populateBooks(url) {
  // Gets the data for each book on the wikipedia url
  getWikipediaBooks(url).then(data => {
    $('.loader').hide()
    if (data && data.message !== 'No ISBNs found in page' && data.status !== 'error') {
      for (let isbn of Object.keys(data)) {
        let metadata = bookMetadata(data[isbn])
        if (metadata) {
          let book_element = addBook(metadata)
          $('#resultsTray').append(book_element)
        }
      }
    } else {
      $('.loader').hide()
      $('#resultsTray').css('grid-template-columns', 'none').append(
        $('<div>').html(data.message)
      )
    }
  }).catch((error) => {
    $('.loader').hide()
    $('#resultsTray').css('grid-template-columns', 'none').append(
      $('<div>').html(error)
    )
  })
}

function addBook(metadata) {
  let text_elements = $('<div>').attr({ 'class': 'text-elements' }).append(
    $('<h3>').text(metadata.title),
    $('<p>').text(metadata.author)
  )
  let details = $('<div>').attr({ 'class': 'bottom-details' }).append(
    metadata.image ? $('<img>').attr({ 'class': 'cover-img', 'src': metadata.image }) : $('<p>').attr({ 'class': 'cover-img' }).text('No cover available'),
    $('<button>').attr({ 'class': metadata.button_class }).text(metadata.button_text).click(() => {
      openByWindowSetting(metadata.link)
    })
  )
  return $('<div>').append(text_elements, details)
}

// onload
$(function() {
  let url = getUrlByParameter('url')
  populateBooks(url)
})

if (typeof module !== 'undefined') {
  module.exports = {
    populateBooks
  }
}
