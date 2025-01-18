/* Author: Denis Podgurskii */

export class ptk_controller_portscanner {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_portscanner", type: "init" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async scan(domain, ports) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_portscanner", type: "scan", domain: domain, ports: ports  })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async reset() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_portscanner", type: "reset" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }


    async save(target, ports) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_portscanner", type: "save", target: target, ports: ports })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

}
