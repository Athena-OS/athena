/* Author: Denis Podgurskii */

jQuery(function () {
    $('.menu .item').tab()

    $('.parent_url').on('change', function (evt) {
        document.getElementById('macro_frame').contentWindow.postMessage({ url: $('.parent_url').val() }, '*')
        document.getElementById('traffic_frame').contentWindow.postMessage({ url: $('.parent_url').val() }, '*')
    })

    $('.button.traffic').on('click', function (evt) {
        document.getElementById('traffic_frame').src = 'traffic.html'
    })

    window.addEventListener('message', function (msg) {
        if (msg.data.url)
            $('.parent_url').val(msg.data.url)
    })
})