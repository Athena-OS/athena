// login.js

// from 'utils.js'
/*   global openByWindowSetting, hostHeaders */

// from 'popup.js'
/*   global loginSuccess, loginError */

// from 'settings.js'
/*   global clearSettingsOnLogout */

// onload
$(function() {
  $('#signup-btn').click(signUp)
  $('#forgot-pw-btn').click(forgotPassword)
  $('#login-btn').click(doLogin)
  $('#logout-tab-btn').click(doLogout)
})

function signUp() {
  openByWindowSetting('https://archive.org/account/signup')
}

function forgotPassword() {
  openByWindowSetting('https://archive.org/account/forgot-password')
}

function doLogin(e) {
  e.preventDefault()
  $('#login-message').hide()
  let email = $('#email-input').val()
  let password = $('#password-input').val()
  if (email.length === 0) {
    $('#login-message').show().text('Please type an email')
    return
  }
  if (password.length === 0) {
    $('#login-message').show().text('Please type a password')
    return
  }
  $('#login-btn').val('Please Wait...')
  // need to set test-cookie for login API to return json instead of html
  chrome.cookies.set({ url: 'https://archive.org', name: 'test-cookie', value: '1' })
  let data = JSON.stringify({ email: email, password: password })
  const loginPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('timeout'))
    }, 5000)
    let headers = new Headers(hostHeaders)
    headers.set('Content-Type', 'application/json')
    fetch('https://archive.org/services/xauthn?op=login', {
      method: 'POST',
      body: data,
      headers: headers
    })
    .then(resolve, reject)
  })
  loginPromise
    .then(response => response.json())
    .then((res) => {
      $('#login-btn').val('Login')
      if (res.success === false) {
        // login failed
        $('#login-message').show().text('Incorrect Email or Password')
      } else {
        // login success
        $('#login-message').show().addClass('login-success').text('Success')
        loginSuccess()
        setTimeout(() => {
          $('#login-page').hide()
          $('#setting-page').hide()
          $('#popup-page').show()
          $('#login-message').removeClass('login-success').hide()
        }, 500)
        $('#email-input').val('')
        $('#password-input').val('')
      }
    })
    .catch((e) => {
      console.log(e)
      $('#login-message').show().text('Login Error')
      $('#login-btn').val('Login')
    })
}

function doLogout() {
  // set cookies to empty values for Safari
  chrome.cookies.set({ domain: '.archive.org', name: 'logged-in-user', url: 'https://archive.org' })
  chrome.cookies.set({ domain: '.archive.org', name: 'logged-in-sig', url: 'https://archive.org' })
  // removes cookies in Chrome & Firefox
  chrome.cookies.remove({ url: 'https://archive.org', name: 'logged-in-user' })
  chrome.cookies.remove({ url: 'https://archive.org', name: 'logged-in-sig' })
  // remove auth cookies from storage
  chrome.storage.local.remove(['auth_cookies'])
  // update UI
  loginError()
  clearSettingsOnLogout()
}
