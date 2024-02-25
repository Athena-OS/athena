
// onload
$(function() {
  let url = new URL(window.location.href)
  let url_name = url.searchParams.get('url')
  if (document.location.hash === '#not_refreshed') {
    showResourceData(url_name)
  } else {
    showError('Looks like you have reloaded the page. Please close and try again!')
  }
})

function showResourceData(url_name) {
  const status_list = {
    pending: 'Processing...',
    success: 'Save Successful.',
    error: 'An Error Occurred. Please Try Again.'
  }
  let vdata = {}
  let status = 'start'
  let resource_list_data = new Set()
  let old_resource_length = 0
  let new_resource_length
  $('#current-url').text(url_name)
  chrome.runtime.onMessage.addListener(
    (message) => {
      if (message.message === 'resource_list_show' && message.url === url_name) {
        vdata = message.data
        status = message.data.status
        $('#current-status').text(status_list[status])
        if ('message' in vdata) {
          $('#message').text(vdata.message)
          $('#message').show()
        }
        if ('resources' in vdata) {
          new_resource_length = vdata.resources.length
          vdata.resources.forEach((element) => {
            resource_list_data.add(element)
          })
          $('#spn-elements-counter').text(new_resource_length)
          $('#counter-container').show()
        }
        if (new_resource_length > old_resource_length) {
          for (let item of Array.from([...resource_list_data]).slice(old_resource_length, new_resource_length)) {
            $('#resource-list-container').append(
              $('<p>').append(item)
            )
          }
          old_resource_length = new_resource_length
        }
        if (status === 'success') {
          $('.loader').hide()
          new_resource_length = vdata.resources.length
          $('#spn-elements-counter').text(new_resource_length)
          $('#status-title').text('Done.')
          document.location.hash = '#refreshed'
          let snapshot_url = 'https://web.archive.org/web/' + vdata.timestamp + '/' + vdata.original_url
          $('#snapshot-url').text('Click to view snapshot').attr('href', snapshot_url).show()
          $('#snapshot-url').click(function(e) {
            // forces open in new window in Safari
            e.preventDefault()
            window.open(this.href, '_blank')
          })
        } else if (status === 'error') {
          showError()
          document.location.hash = '#refreshed'
        }
      } else if (message.message === 'resource_list_show_error' && message.url === url_name) {
        showError(message.data.message)
      }
    }
  )
}

function showError(text = null) {
  $('.loader').hide()
  $('#resource-list-container').hide()
  $('#counter-container').hide()
  $('#status-title').text('Error')
  if (text !== null) {
    $('#message').text(text)
    $('#message').show()
  }
}
