/* Author: Denis Podgurskii */

import { ptk_exporter } from "../background/exporter.js"

export class ptk_controller_traffic {
    constructor() {
        this.settings = {}
        this.recording = null
    }

    getSettings() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_settings", type: "get_settings", path: "traffic" })
            .then(function (response) {
                Object.assign(self.settings, response)
                return response.settings
            })
    }

    init() {
        let self = this
        self.getSettings()
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_recorder", type: "init" })
            .then(response => {
                Object.assign(self, response)
                return response
            })
    }

    reset() {
        this.recording = null
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_recorder", type: "reset_recording" })
            .then(response => {
                return response
            })
    }

    start(clean_cookie, url) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_recorder",
            type: "start_recording",
            clean_cookie: clean_cookie,
            url: url
        }).then(response => {
            return response
        })
    }

    export() {
        if (this.recording) {
            let exporter = new ptk_exporter(this.recording, this.settings)
            return exporter.render()
        }
    }

    analyse() {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_recorder", type: "analyse" })
            .then(response => {
                return response
            })
    }


}

