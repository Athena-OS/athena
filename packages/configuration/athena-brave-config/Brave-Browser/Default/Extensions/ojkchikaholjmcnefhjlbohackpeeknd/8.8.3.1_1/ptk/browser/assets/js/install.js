/* Author: Denis Podgurskii */
import { ptk_controller_install } from "../../../controller/install.js"
import { ptk_controller_settings } from "../../../controller/settings.js"
const controller = new ptk_controller_install()
const settings_controller = new ptk_controller_settings()

jQuery(function () {
    controller.init().then(function (s) {
        $(document).trigger("init_forms", s)
    })

    $(document).on("init_forms", function (e, s) {
        $('#privacy_form').form('set values', s.privacy)
    })

    $('.button.confirm').on('click', function () {
        let $form = $('#privacy_form'), values = $form.form('get values')
        Object.keys(values).map((k) => { if (values[k] === 'on') values[k] = true })
        if(!values['enable_cookie']){
            if (confirm('Disabling cookie and storage will make the PTK non-working and therefore you will need to remove it. Are you sure you want to disable cookie and storage?')) {
                alert('The PTK may NOT work, you may need to re-install it.')
            } else {
                return
            }
        }
        settings_controller.save('privacy', values)
    })

})

