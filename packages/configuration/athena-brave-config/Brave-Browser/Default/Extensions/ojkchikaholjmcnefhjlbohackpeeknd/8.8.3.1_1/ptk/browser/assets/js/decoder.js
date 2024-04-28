/* Author: Denis Podgurskii */

import { ptk_controller_decoder } from "../../../controller/decoder.js"
const controller = new ptk_controller_decoder()

jQuery(function () {

    $('.reset').on('click', function () {
        $('.buttons .button').removeClass('active')
        $(document).trigger("toggleDecode", false)
        $(document).trigger("toggleEncode", false)
        $('#decodePanel').val("")
        $('#encodePanel').val("")
        controller.reset()
    })

    $('.oneway .button').on('click', function () {
        $('.buttons .button').removeClass('active')
        $(this).addClass('active')
        $(document).trigger("toggleDecode", false)
        $(document).trigger("toggleEncode", true)
    })

    $('.twoway .button').on('click', function () {
        $('.buttons .button').removeClass('active')
        $(this).addClass('active')
        $(document).trigger("toggleDecode", true)
        $(document).trigger("toggleEncode", true)
    })

    $(document).on("toggleDecode", function (e, show) {
        if (show)
            $('.decoderDecodeBtn').removeClass('disabled')
        else
            $('.decoderDecodeBtn').addClass('disabled')
    })

    $(document).on("toggleEncode", function (e, show) {
        if (show)
            $('.decoderEncodeBtn').removeClass('disabled')
        else
            $('.decoderEncodeBtn').addClass('disabled')
    })

    $('.decoderDecodeBtn').on('click', function () {
        let method = $('.buttons .button.active').attr('data-value')
        let text = $('#decodePanel').val()
        controller.decode(method, text).then(function (result) {
            $('#encodePanel').val(result)
        })
    })

    $('.decoderEncodeBtn').on('click', function () {
        let method = $('.buttons .button.active').attr('data-value')
        let text = $('#encodePanel').val()
        controller.encode(method, text).then(function (result) {
            $('#decodePanel').val(result)
        })
    })

    controller.init().then(function(result){
        if(result.storage?.method){
            $('.buttons .button').removeClass('active')
            $('[data-value="'+result.storage?.method+'"]').addClass('active')
            $('[data-value="'+result.storage?.method+'"]').trigger('click')
            if(result.storage?.decode){
                $('#decodePanel').val(result.storage.decode)
            }
            if(result.storage?.encode){
                $('#encodePanel').val(result.storage.encode)
            }
        }
    })
})
