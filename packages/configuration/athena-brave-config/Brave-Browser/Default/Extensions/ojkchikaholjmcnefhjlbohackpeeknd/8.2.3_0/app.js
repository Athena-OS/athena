/* Author: Denis Podgurskii */
'use strict'


import "./ptk/packages/browser-polyfill/browser-polyfill.min.js"

import { ptk_settings } from "./ptk/background/settings.js"
import { ptk_proxy } from "./ptk/background/proxy.js"
import { ptk_dashboard } from "./ptk/background/dashboard.js"
import { ptk_rattacker } from "./ptk/background/rattacker.js"
import { ptk_request_manager } from "./ptk/background/request.js"
import { ptk_decoder_manager } from "./ptk/background/decoder.js"
import { ptk_sca } from "./ptk/background/sca.js"
import { ptk_session } from "./ptk/background/session.js"
import { ptk_recorder } from "./ptk/background/recorder.js"
import { ptk_ruleManager } from "./ptk/background/utils.js"



const worker = self
worker.isFirefox = browser.runtime.getBrowserInfo ? true : false

export class ptk_app {
    constructor(settings) {

        this.settings = new ptk_settings(settings)

        browser.storage.local.get('pentestkit8_settings').then(function (result) {

            if (result.pentestkit8_settings) {
                this.settings.mergeSettings(result.pentestkit8_settings)
            } else {
                this.settings.resetSettings()
            }

            this.proxy = new ptk_proxy(this.settings.proxy)

            this.request_manager = new ptk_request_manager(this.settings.rbuilder)
            ptk_ruleManager.resetSession()

            this.rattacker = new ptk_rattacker(this.settings.rattacker)

            this.decoder_manager = new ptk_decoder_manager()

            this.sca = new ptk_sca()

            this.session = new ptk_session()

            this.dashboard = new ptk_dashboard()

            this.recorder = new ptk_recorder(settings.recorder)
            this.recorder.addMessageListeners()

            this.addMessageListeners()
        }.bind(this))
    }


    addMessageListeners() {
        browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message.channel == "ptk_popup2background_app") {
                if (message.type == "on_updated_settings") {
                    if (this.proxy) {
                        this.proxy.maxTabsCount = this.settings.tabs.max_tabs
                        this.proxy.maxRequestsPerTab = this.settings.tabs.max_requests_per_tab
                    }
                }

                if (message.type == "reloadptk") {
                    browser.runtime.reload()
                }
            }
        }.bind(this))
    }
}



browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        browser.tabs.create({ url: browser.runtime.getURL('ptk/browser/oninstalled.html') })
    }
    // else if (details.reason == "update") {
    //     browser.tabs.create({ url: browser.runtime.getURL('ptk/browser/onupdated.html') })
    // }
})

// Start PTK app
fetch(browser.runtime.getURL('ptk/settings.json'))
    .then(response => response.json())
    .then(settings => {
        worker.ptk_app = new ptk_app(settings)
    })




