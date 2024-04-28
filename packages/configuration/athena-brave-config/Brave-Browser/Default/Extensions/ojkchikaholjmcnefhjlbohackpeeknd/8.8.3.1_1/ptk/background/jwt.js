/* Author: Denis Podgurskii */
import { ptk_logger, ptk_utils, ptk_storage, ptk_jwtHelper } from "./utils.js"
import * as jose from "../packages/jose/browser/index.js"
import CryptoES from "../packages/crypto-es/index.js"


const worker = self
const jwtHelper = new ptk_jwtHelper()

export class ptk_jwt {
    constructor() {
        this.storageKey = "ptk_jwt"
        this.storage = {}
        this.addMessageListiners()
        this.dict = []
    }


    addMessageListiners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {

        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_jwt") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }

    async msg_init(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        let activeTab = worker.ptk_app.proxy.activeTab
        let cookies = []
        if (activeTab?.tabId) cookies = await worker.ptk_app.session.getAllCookiesByTab(activeTab.tabId)
        return Promise.resolve(Object.assign({}, {
            storage: JSON.parse(JSON.stringify(this.storage)),
            cookies: cookies,
            tab: activeTab
        }))
    }


    async msg_save(message) {
        return ptk_storage.setItem(this.storageKey, { "token": message.token })
    }

    async msg_reset(message) {
        this.dict = []
        return ptk_storage.setItem(this.storageKey, {})
    }

    async msg_load_dict(message) {
        this.dict = message.text.split('\r\n')
        return true
    }

    async msg_bruteforce(message) {
        this.bruteforce(message.token)
        return Promise.resolve()
    }

    async getDict() {
        // if (this.dict?.length) {
        //     return this.dict
        // }
        // else {
        let self = this
        return fetch(browser.runtime.getURL('ptk/background/jwt.secrets.list.txt'))
            .then(response => response.text())
            .then(words => {
                return [].concat(words.split('\r\n'), self.dict);
            })
        //}
    }

    async bruteforce(token) {
        let { jwtToken, decodedToken } = jwtHelper.checkToken(token)
        let wordlist = await this.getDict()

        let jwt = JSON.parse(decodedToken)

        let totalCount = wordlist.length
        let current = 0
        let promises = []
        for (var i = 0; i < wordlist.length; i++) {
            let res = this.checkSignature(jwt, jwtToken, wordlist[i])
            //promises.push(this.checkSignature(jwt, jwtToken, wordlist[i]))
            if (res) break
            if ((i % 100) == 0) {
                let percent = ((i * 100) / totalCount)
                current = i
                browser.runtime.sendMessage({
                    channel: "ptk_background2popup_jwt",
                    type: "progress",
                    percent: percent,
                    totalCount: totalCount,
                    current: i
                }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
            }
        }
        //Promise.all(promises).then(res => {
        browser.runtime.sendMessage({
            channel: "ptk_background2popup_jwt",
            type: "progress",
            percent: 100,
            totalCount: totalCount,
            current: current
        }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
        //})

    }

    checkSignature(jwt, jwtToken, secret) {
        let signature = CryptoES.enc.Base64.stringify(CryptoES.HmacSHA256(jwtToken[1] + "." + jwtToken[2], secret))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')

        if (signature == jwt['signature']) {
            browser.runtime.sendMessage({
                channel: "ptk_background2popup_jwt",
                type: "secret found",
                secret: secret
            }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
            return true
        }
        return false
        // return new jose.CompactSign( new TextEncoder().encode((payload)))
        //     .setProtectedHeader(jwt['header'])
        //     .sign(new TextEncoder().encode(secret))
        //     .then(result => {
        //         let t = result.split('.')
        //         if (t[2] == jwt['signature']) {
        //             browser.runtime.sendMessage({
        //                 channel: "ptk_background2popup_jwt",
        //                 type: "secret found",
        //                 secret: secret
        //             }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
        //         }
        //     })
    }

}
