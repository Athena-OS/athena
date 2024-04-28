/* Author: Denis Podgurskii */

export class ptk_controller_jwt {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_jwt", type: "init" })
            .then(function (tab) {
                Object.assign(self, tab)
                return self
            }).catch(e => e)
    }

    async save(token) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_jwt", type: "save", "token": token })
            .then(function (tab) {
                Object.assign(self, tab)
                return self
            }).catch(e => e)
    }

    async bruteforce(token) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_jwt", type: "bruteforce", "token": token })
            .then(function (tab) {
                Object.assign(self, tab)
                return self
            }).catch(e => e)
    }

    async reset() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_jwt", type: "reset"})
            .then(function (tab) {
                Object.assign(self, tab)
                return self
            }).catch(e => e)
    }

    async load_dict(text){
        //return text.split('\r\n')
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_jwt", type: "load_dict", "text": text})
        .then(function (tab) {
            Object.assign(self, tab)
            return self
        }).catch(e => e)
    }

}
