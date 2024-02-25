// wordcloud.js

// from 'index.js'
/*   global Levenshtein */

// from 'utils.js'
/*   global getUrlByParameter, hostURL, hostHeaders */

// from 'test/setup.js'
/*   global isInTestEnv */

function getTags() {
  let mynewTags = []
  const url = getUrlByParameter('url')
  let hostname = new URL(url).hostname
  let toBeUsedAsURL = hostname.replace(/^www./, '')
  let y = hostname.split('.')
  let not_display4 = y.join(' ')
  let not_display1 = y.join(' ')
  $('.url').text(hostname).attr('href', url)
  if (url.includes('https')) {
    not_display1 = 'https ' + not_display1
  } else {
    not_display1 = 'http ' + not_display1
  }
  let not_display2 = not_display1 + ' extension'
  let not_display3 = not_display4 + ' extension'
  let dontarray = ['view page', 'open', 'read more', not_display1, not_display2, not_display3, not_display4]

  let new_url = hostURL + 'services/context/tagcloud?url=' + toBeUsedAsURL
  $('#loader_tagcloud').show()
  let headers = new Headers(hostHeaders)
  headers.set('backend', 'nomad')
  fetch(new_url, {
    method: 'GET',
    headers: headers
  })
    .then(response => response.json())
    .then((data) => {
      $('#loader_tagcloud').hide()
      if (!data.error && data.length > 0) {
        $('.wordcloud').css('display', 'inline-block')
        $('#container-wordcloud').show()
        for (let i = 0; i < data.length; i++) {
          let b = {}
          let text = decodeURIComponent(data[i][0])
          if (dontarray.indexOf(text) <= 0) {
            mynewTags[i] = text
            b.text = text
            b.weight = (data[i][1])
            mynewTags.push(b)
          }
        }
        let coefOfDistance
        if (data.length < 500) {
          coefOfDistance = 1 / 40
        } else {
          coefOfDistance = 3 / 4
        }
        let arr = mynewTags.reduce((acc, newTag) => {
          let minDistance = 0
          if (acc.length > 0) {
            minDistance = Math.min.apply(Math, toConsumableArray(acc.map((oldTag) => {
              return Levenshtein.get(oldTag, newTag)
            })))
          } else {
            minDistance = newTag.length
          }
          if (minDistance > coefOfDistance * newTag.length) {
            acc.push(newTag)
          }
          return acc
        }, []).sort()
        let result = []

        // Filtering out the elements from data which aren't in arr
        data = data.filter((el) => {
          return arr.indexOf(el[0]) >= 0
        }).sort()

        // Mapping the weights to higher values
        result = data.map((el) => {
          if (el[1] === 1) { el[1] = el[1] * 10 } else if (el[1] === 2) { el[1] = el[1] * 40 } else if (el[1] === 3) { el[1] = el[1] * 60 } else if (el[1] === 4) { el[1] = el[1] * 90 }
          return { 'text': el[0], 'weight': el[1] }
        })

        for (let i = 0; i < result.length; i++) {
          let span = document.createElement('span')
          span.setAttribute('data-weight', result[i].weight)
          span.appendChild(document.createTextNode(result[i].text))
          document.getElementById('container-wordcloud').appendChild(span)
        }
        $('#container-wordcloud').awesomeCloud({
          'size': {
            'grid': 1,
            'factor': 4
          },
          'options': {
            'color': 'random-light',
            'rotationRatio': 0.5,
            'printMultiplier': 3
          },
          'font': "'Times New Roman', Times, serif",
          'shape': 'square'
        })
      } else {
        $('.wordcloud').hide()
        $('#tagcloud-not-found').show()
        $('#message_tagcloud').text('Tags not found. Please try again later.')
      }
    })
}

function toConsumableArray (arr) {
  if (Array.isArray(arr)) {
    let arr2 = Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
      arr2[i] = arr[i]
    }
    return arr2
  } else {
    return Array.from(arr)
  }
}

// onload
$(function() {
  // will not run during mocha testing
  if (typeof isInTestEnv === 'undefined') { getTags() }
})

if (typeof module !== 'undefined') {
  module.exports = {
    toConsumableArray,
    getTags
  }
}
