/* Author: Denis Podgurskii */

export class ptk_controller_session {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "init" })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }


    async export() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "export" })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

    async import(cookies) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "import", cookies: cookies })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

    async removeAll() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "remove_all" })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

    async removeByIndex(index) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "remove_one", index: index })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }
    

    async blockByIndex(index) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "block_one", index: index })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

    async removeBlockedRule(index) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "remove_blocked_rule", index: index })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

    async removeBlockedRules() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "remove_all_blocked_rules" })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }



    //Readonly
    async readonlyByIndex(index) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "readonly_one", index: index })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

    async removeReadonlyRule(index) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "remove_readonly_rule", index: index })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

    async removeReadonlyRules() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "remove_all_readonly_rules" })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

    //Save/update

    async saveByIndex(index, values) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_session", type: "save_one", index: index, values: values })
            .then(function (cookies) {
                Object.assign(self, cookies )
                return self
            }).catch(e => e)
    }

}
