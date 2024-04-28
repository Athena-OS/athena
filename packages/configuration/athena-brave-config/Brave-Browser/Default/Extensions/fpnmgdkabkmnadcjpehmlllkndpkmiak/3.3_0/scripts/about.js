// about.js

// from 'utils.js'
/*   global feedbackURL, newshosts */

const VERSION = chrome.runtime.getManifest().version
const YEAR = new Date().getFullYear()

// onload
$(function() {
  $('#version').text(VERSION)
  $('#year').text(YEAR)
  $('#reviews-page').attr('href', feedbackURL)
  updateNewsList(Array.from(newshosts).sort())
})

function updateNewsList(sitelist) {
  const linklist = sitelist.map((e) => {
    return `<a href="https://${e}" target="_blank">${e}</a>`
  })
  $('#about-news-list').html(linklist.join(', '))
}
