/* Author: Denis Podgurskii */

export class ptk_controller_decoder {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_decoder", type: "init" })
            .then(function (tab) {
                Object.assign(self, tab)
                return self
            }).catch(e => e)
    }

    async reset() {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_decoder", type: "reset" })
            .then(function (result) {
                return result
            }).catch(e => e)
    }

    async decode(method, text) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_decoder", type: "decode", method: method, text: text })
            .then(function (result) {
                return result
            }).catch(e => e)
    }

    async encode(method, text) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_decoder", type: "encode", method: method, text: text })
            .then(function (result) {
                return result
            }).catch(e => e)
    }
}
