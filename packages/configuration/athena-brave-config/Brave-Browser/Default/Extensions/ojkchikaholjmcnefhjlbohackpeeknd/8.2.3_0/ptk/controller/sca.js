/* Author: Denis Podgurskii */

export class ptk_controller_sca {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_sca", type: "init" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async analyze(urls) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_sca", type: "analyze", urls: urls })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }


}
