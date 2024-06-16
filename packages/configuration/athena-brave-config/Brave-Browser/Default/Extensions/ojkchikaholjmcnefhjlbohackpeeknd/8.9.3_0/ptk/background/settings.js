/* Author: Denis Podgurskii */

import { ptk_utils } from "./utils.js"

export class ptk_settings {
    constructor(settings) {
        this.default = settings
        this.reset()
        this.addMessageListeners()
    }

    reset() {
        Object.assign(this, this.default)
    }

    /* Listeners */
    addMessageListeners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {

        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_settings") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve({ result: false })
        }
    }

    msg_update_settings(message) {
        return this.updateSettings(message.path, message.value).then(function () {
            return Promise.resolve({ settings: JSON.parse(JSON.stringify(this)) })
        }.bind(this))
    }

    msg_reset_settings(message) {
        return this.resetSettings().then(function () {
            return Promise.resolve({ settings: JSON.parse(JSON.stringify(this)) })
        }.bind(this))
    }

    msg_get_settings(message) {
        return this.getSettings(message.path)
    }

    /* End Listeners */


    async updateSettings(path, value) {
        ptk_utils.jsonSetValueByPath(this, path, value)
        return browser.storage.local.set({ "pentestkit8_settings": JSON.parse(JSON.stringify(this)) })
    }

    getSettings(path) {
        let result = this
        if (path) result = ptk_utils.jsonGetValueByPath(this, path)
        return Promise.resolve(result)
    }

    async resetSettings() {
        this.reset()
        return browser.storage.local.set({ "pentestkit8_settings": JSON.parse(JSON.stringify(this)) })
    }

    mergeSettings(source) {
        if (!source) return this
        return this.deepMerge(this, source)
    }

    deepMerge(target, source) {
        if (!source) return target
        for (const key in source) {
            if (target.hasOwnProperty(key)) {
                if (typeof (source[key]) === 'object') {
                    this.deepMerge(target[key], source[key])
                } else {
                    Object.assign(target, { [key]: source[key] })
                }
            }
        }
        return target
    }

}