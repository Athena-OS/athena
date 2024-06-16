/* Author: Denis Podgurskii */
import { ptk_controller_settings } from "../../../controller/settings.js"
import { ptk_controller_rattacker } from "../../../controller/rattacker.js"


const controller = new ptk_controller_settings()
const rattacker = new ptk_controller_rattacker()


jQuery(function () {

    $('.clear_apikey').on('click', function () {
        let $form = $('#profile_form') 
        $form.form('set value', "api_key", "")
        controller.save('profile.api_key', "")
    })

    $('.save_apikey').on('click', function () {

        let $form = $('#profile_form'), values = $form.form('get values')
        Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })

        rattacker.checkApiKey(values['api_key']).then(function (response) {
            let msg = ""
            if (typeof response == "object" && response.rules?.modules?.json) {
                let modules = JSON.parse(response.rules.modules.json).modules
                let attacksNum = 0
                modules.map(item => {
                    attacksNum += Object.keys(item.attacks).length
                }) 
                msg = "Number of attacks modules: " + modules.length
                msg += "\r\n\r\nNumber of attacks: " + attacksNum
                controller.save('profile.api_key', values["api_key"])
            } else {
                msg = 'Error: ' + response
            }
            $('#api_response').text(msg)
            //console.log(response)
        })

        controller.restore().then(function (s) {
            controller.on_updated_settings(s)
        })
    })


    // $('.test_apikey').on('click', function () {

    //     let $form = $('#profile_form'), values = $form.form('get values')
    //     Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })
    //     rattacker.checkApiKey(values['api_key']).then(function (response) {
    //         let msg = ""
    //         if (typeof response == "object" && response.rules?.modules?.json) {
    //             let modules = JSON.parse(response.rules.modules.json).modules
    //             let attacksNum = 0
    //             modules.map(item => {
    //                 attacksNum += Object.keys(item.attacks).length
    //             }) 
    //             msg = "Number of attacks modules: " + modules.length
    //             msg += "\r\n\r\nNumber of attacks: " + attacksNum
    //         } else {
    //             msg = 'Error: ' + response
    //         }
    //         $('#api_response').text(msg)
    //         console.log(response)
    //     })
    // })

    $('#settings_reset').on('click', function () {
        controller.reset().then(function (s) {
            $(document).trigger("init_forms", s.settings)
        })
    })

})


$(document).on("init_forms", function (e, s) {

    Object.entries(s.profile).forEach(([key, value]) => {
        if (['api_key'].includes(key)) {
            $('#profile_form').form('set value', key, value)
        }
    })

})
