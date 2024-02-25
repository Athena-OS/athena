/* Author: Denis Podgurskii */
import { ptk_logger, ptk_utils } from "./utils.js"
import retire from '../packages/retire/retire.js';
import CryptoES from '../packages/crypto-es/index.js';

const worker = self

export class ptk_sca {
    constructor() {
        this.repo = {}
        this.hasher = {
            sha1: function (data) {
                return CryptoES.SHA1(data).toString(CryptoES.enc.Hex)
            }
        }
        this.addMessageListiners()
    }

    getFileName(url) {
        var a = new URL(url)//document.createElement("a");
        //a.href = url;
        return (a.pathname.match(/\/([^\/?#]+)$/i) || [, ""])[1];
    }


    addMessageListiners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {
        
        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_sca") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }


    async msg_init(message) {
        await this.initRepo()
        this.activeTab = worker.ptk_app.proxy.activeTab
        let tab = worker.ptk_app.proxy.getTab(this.activeTab.tabId)
        let self = this
        if (tab) {
            return tab?.analyze().then(function (result) {
                self['tab'] = result
                return Promise.resolve(Object.assign({}, result, worker.ptk_app.proxy.activeTab))
            })
        }
    }

    async msg_analyze(message) {
        return await this.analyze(message.urls)
    }



    async initRepo() {
        await fetch(browser.runtime.getURL('ptk/packages/retire/jsrepository.json'))
            .then(response => response.text())
            .then(data => {
                this.repo = JSON.parse(retire.replaceVersion(data))
            })
    }

    async analyze(urls) {
        let dt = new Array()
        let fetches = []
        if (urls)
            Object.values(urls).forEach(url => {
                let results = retire.scanUri(url, this.repo)
                if (results.length > 0) {
                    let hash = url + results[0].component + results[0].version
                    if (dt.findIndex(u => u[2] == hash) == -1){
                        dt.push([url, results, hash])
                    }
                }

                results = retire.scanFileName(this.getFileName(url), this.repo)
                if (results.length > 0) {
                    let hash = url + results[0].component + results[0].version
                    if (dt.findIndex(u => u[2] == hash) == -1){
                        dt.push([url, results, hash])
                    }
                }

                fetches.push(
                    fetch(url)
                        .then(response => response.text())
                        .then(content => {
                            var results = retire.scanFileContent(content, this.repo, this.hasher);
                            if (results.length > 0) {
                                let hash = url + results[0].component + results[0].version
                                if (dt.findIndex(u => u[2] == hash) == -1){
                                    dt.push([url, results, hash])
                                }
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        })
                )
            })
        if (fetches.length) {
            await Promise.all(fetches).then()
        }
        return Promise.resolve({ "vulns": dt })
    }


}