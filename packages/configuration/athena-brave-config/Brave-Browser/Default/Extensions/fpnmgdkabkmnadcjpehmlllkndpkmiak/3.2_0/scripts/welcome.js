// welcome.js

// from 'utils.js'
/*   global afterAcceptTerms, checkLastError */

$('#accept-btn').click(() => {
  afterAcceptTerms()
  chrome.tabs.getCurrent((tab) => {
    chrome.tabs.remove(tab.id, checkLastError)
  })
})
$('#decline-btn').click(() => {
  chrome.tabs.getCurrent((tab) => {
    chrome.tabs.remove(tab.id, checkLastError)
  })
})
