/* Author: Denis Podgurskii */
import { ptk_controller_settings } from "../../../controller/settings.js"
const controller = new ptk_controller_settings()


jQuery(function () {


    $('#mainMenu a.item').each(function (i, obj) {
        if (window.location.pathname.indexOf($(obj).attr('href')) > 0)
            $(obj).addClass('active').siblings().removeClass('active')
    });

    //Submenu all pages
    $('.ui.menu a.item').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active')
        let forItem = $(this).attr('forItem')
        $('.ui.menu a.item').each(function (i, obj) {
            let f = $(obj).attr('forItem')
            if (f != forItem) $('#' + f).hide()
        })
        $('#' + forItem).fadeIn("slow")
    })

    $('#settings_save').on('click', function () {

        let $form = $('#main_form'), values = $form.form('get values')
        Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })
        controller.save('main', values)

        $form = $('#proxy_form'), values = $form.form('get values')
        Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })
        controller.save('proxy', values)

        $form = $('#recorder_form'), values = $form.form('get values')
        Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })
        controller.save('recorder', values)

        $form = $('#privacy_form'), values = $form.form('get values')
        Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })
        controller.save('privacy', values)

        const supported_types = ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]

        $form = $('#rattacker_form'), values = $form.form('get values')
        Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })
        values['max_requests'] = parseInt(values['max_requests'])
        values['blacklist'] = values['blacklist'].split(',').filter(item => supported_types.includes(item))

        controller.save('rattacker', values)

        controller.restore().then(function (s) {
            controller.on_updated_settings(s)
        })

        $(".modal").fadeIn("slow").delay(2000).fadeOut()
    })

    $('#settings_reset').on('click', function () {
        controller.reset().then(function (s) {
            $(document).trigger("init_forms", s.settings)
            $(".modal").fadeIn("slow").delay(2000).fadeOut()
        })
    })
    controller.restore().then(function (s) {
        $(document).trigger("init_forms", s)
    })
})


$(document).on("init_forms", function (e, s) {
    $('#main_form').form('set values', s.main)
    $('#proxy_form').form('set values', s.proxy)
    $('#recorder_form').form('set values', s.recorder)
    $('#rattacker_form').form('set values', s.rattacker)
    $('#privacy_form').form('set values', s.privacy)
})
