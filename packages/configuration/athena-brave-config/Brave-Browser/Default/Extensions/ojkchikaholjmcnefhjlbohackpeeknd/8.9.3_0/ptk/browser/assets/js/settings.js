/* Author: Denis Podgurskii */
import { ptk_controller_settings } from "../../../controller/settings.js"
import { ptk_controller_rattacker } from "../../../controller/rattacker.js"


const controller = new ptk_controller_settings()
const rattacker = new ptk_controller_rattacker()

var loginLink, registerLink

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
        if (forItem == 'profile_form') {
            $('#settings_header').hide()
            $('#settings_footer').hide()
        }
        else {
            $('#settings_header').show()
            $('#settings_footer').show()
        }
    })

    //PTK+
    $('.ptk_login').on('click', function () {
        window.open(loginLink)
    })

    $('.ptk_register').on('click', function () {
        window.open(registerLink)
    })


    $('.clear_apikey').on('click', function () {
        let $form = $('#profile_form')
        $form.form('set value', "api_key", "")
        $('#api_error').hide()
        $('#api_success').hide()
        checkApiKey(false)
        controller.save('profile.api_key', "")
        controller.restore().then(function (s) {
            controller.on_updated_settings(s)
        })
    })

    $('.save_apikey').on('click', function () {
        $('#api_error').hide()
        $('#api_success').hide()
        checkApiKey().then(res => {
            if (res) {
                let $form = $('#profile_form'), values = $form.form('get values')
                Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })
                controller.save('profile.api_key', values["api_key"])
            } else {

            }

            controller.restore().then(function (s) {
                controller.on_updated_settings(s)
            })
        })


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


function checkApiKey(showError = true) {
    let $form = $('#profile_form'), values = $form.form('get values')
    Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })

    return rattacker.checkApiKey(values['api_key']).then(function (response) {
        let msg = ""
        if (typeof response == "object" && response.rules?.modules?.json) {
            try {
                let modules = JSON.parse(response.rules.modules.json).modules
                let attacksNum = 0
                let dt = new Array()
                modules.map(item => {
                    dt.push([item.metadata.module_name, Object.keys(item.attacks).length])
                })
                bindTable('#tbl_modules', { data: dt })
                $('#api_response_success').text(msg)
                $('#api_error').hide()
                $('#api_success').show()
            }catch(er){
                if (showError) {
                    msg = er.message
                    $('#api_response_error').text(msg)
                    $('#api_success').hide()
                    $('#api_error').show()
                    return false
                }
            }
            return true
        } else if (showError) {
            msg = response.json.message
            $('#api_response_error').text(msg)
            $('#api_success').hide()
            $('#api_error').show()
            return false
        }
    })
}

$(document).on("check_api_key", async function (e) {
    checkApiKey()
})

$(document).on("init_forms", function (e, s) {

    Object.entries(s.main).forEach(([key, value]) => {
        if ($('#main_form').form('has field', key)) {
            $('#main_form').form('set value', key, value)
        }
    })

    Object.entries(s.proxy).forEach(([key, value]) => {
        if ($('#proxy_form').form('has field', key)) {
            $('#proxy_form').form('set value', key, value)
        }
    })

    Object.entries(s.recorder).forEach(([key, value]) => {
        //if ($('#recorder_form').form('has field', key)) {
        if (!['recorderFile', 'trackerFile', 'popupFile', 'replayerFile', 'icons'].includes(key)) {
            $('#recorder_form').form('set value', key, value)
        }
    })

    Object.entries(s.rattacker).forEach(([key, value]) => {
        if ($('#rattacker_form').form('has field', key)) {
            $('#rattacker_form').form('set value', key, value)
        }
    })

    Object.entries(s.privacy).forEach(([key, value]) => {
        if ($('#privacy_form').form('has field', key)) {
            $('#privacy_form').form('set value', key, value)
        }
    })


    Object.entries(s.profile).forEach(([key, value]) => {
        if (['api_key'].includes(key)) {
            $('#profile_form').form('set value', key, value)
            if (value != "")
                $(document).trigger("check_api_key")
        }
        if(key == "login_url") loginLink = value
        if(key == "register_url") registerLink = value
    })

})
