// annotations.js

// from 'utils.js'
/*   global getUrlByParameter, openByWindowSetting */

// from 'test/setup.js'
/*   global isInTestEnv */

/**
 * Prepare hypothes.is URL to request API.
 */
function hypothesisApiUrl(url, type) {
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url
  }
  if (type === 'domain') {
    const urlObj = new URL(url)
    const query = 'uri.parts=' + urlObj.host.split('.').join('&uri.parts=')
    return 'https://hypothes.is/api/search?' + query
  } else if (type === 'url') {
    return 'https://hypothes.is/api/search?uri=' + url
  }
}

/**
 * Get hypothes.is data and render results.
 */
function getAnnotations(type = 'url') {
  const url = getUrlByParameter('url')
  $('.url').text(url).attr('href', url)
  const newUrl = hypothesisApiUrl(url, type)
  $.getJSON(newUrl, (data) => {
    const length = data.rows.length
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        const rowData = data.rows[i]
        const date = rowData.created.substring(0, 10)
        const source = rowData.target[0].source
        const exactData = rowData.text
        const user = rowData.user.substring(5, rowData.user.indexOf('@'))
        let title = ''
        if (rowData.document.title) {
          title = rowData.document.title[0]
        }
        let row = $('#row_contain-' + type)
        let item = row.clone()
        item.attr('id', 'row-' + i)
        item.find('.date').html('Dated on ' + date)
        item.find('.userinfo').html(user)
        item.find('#source-contain').append(
          $('<a>').attr({ 'href': source, 'target': '_blank' }).html(title)
        )
        item.find('#text-contain').html(exactData)
        item.find('.links').append(
          $('<button>').attr({ 'class': 'btn btn-red btn-auto' }).text('Show in Context').click(() => {
            openByWindowSetting(rowData.links.incontext)
          })
          // , $('<button>').attr({ 'class': 'btn btn-red btn-auto' }).text('Show in HTML').click(() => {
          //   openByWindowSetting(rowData.links.html)
          // })
        )

        if ('selector' in rowData.target[0]) {
          let selector_length = rowData.target[0].selector.length
          let exact = rowData.target[0].selector[selector_length - 1].exact
          item.find('.target-selector-exact').html(exact)
        } else {
          item.find('.target-selector-exact').hide()
        }
        $('#container-whole-' + type).append(item)
      }
    } else {
      let error_msg
      if (type === 'domain') {
        error_msg = 'There are no annotations for the current domain.'
      } else {
        error_msg = 'There are no annotations for the current URL.'
      }
      let row = $('#row_contain-' + type)
      let item = row.clone()
      item.html(
        $('<div>').addClass('text-center')
          .html(error_msg)
      )
      item.css('display', 'block')
      $('#container-whole-' + type).append(item)
    }
  })
}

function showAnnotations(type) {
  $('.tabcontent').hide()
  $('.tablink').removeClass('active')
  $('.tablink[value="' + type + '"]').addClass('active')
  $('#' + type).show()
}

function get_hypothesis() {
  let hypo_domain = getAnnotations('domain')
  let hypo_url = getAnnotations('url')
  $('#loader_annotations').hide()
  if (hypo_url && hypo_domain) {
    $('#annotations_status').show()
  }
}

// onload
$(function() {
  $('.tablink').click(() => {
    showAnnotations($(this).attr('value'))
  })
  // will not run during mocha testing
  if (typeof isInTestEnv === 'undefined') { get_hypothesis() }
})

if (typeof module !== 'undefined') {
  module.exports = {
    hypothesisApiUrl,
    getAnnotations
  }
}
