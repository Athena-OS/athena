/* Author: Denis Podgurskii */

export class ptk_controller_settings {
    constructor() {

    }

    async save(path, value) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_settings", type: "update_settings", path: path, value: value })
            .then(function (response) {
                return response
            }).catch(e => e)
    }

    async restore() {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_settings", type: "get_settings" })
            .then(function (response) {
                return response
            }).catch(e => e)
    }

    async reset() {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_settings", type: "reset_settings" })
            .then(function (response) {
                return response
            }).catch(e => e)
    }

    async on_updated_settings(s) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_app", type: "on_updated_settings", "settings": s }).then(function (response) {
            return response
        }).catch(e => e)

    }
}