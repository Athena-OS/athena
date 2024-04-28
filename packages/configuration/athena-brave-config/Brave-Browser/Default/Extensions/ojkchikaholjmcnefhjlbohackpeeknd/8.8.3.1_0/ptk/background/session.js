/* Author: Denis Podgurskii */
import { ptk_utils, ptk_storage } from "../background/utils.js"

const worker = self

export class ptk_session {

    constructor(settings) {
        this.settings = settings
        this.storageKey = "ptk_cookies"
        this.addMessageListeners()
        this.addListiners()
        this.init()
    }

    async init() {
        this.storage = await ptk_storage.getItem(this.storageKey)
        if (!this.storage.blocked) {
            this.storage.blocked = []
        }
        if (!this.storage.readonly) {
            this.storage.readonly = []     
        }
        await ptk_storage.setItem(this.storageKey, this.storage)
        return this.storage
    }

    addMessageListeners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }


    onMessage(message, sender, sendResponse) {
        
        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_session") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve({ result: false })
        }
    }

    addListiners() {

        this.onChanged = this.onChanged.bind(this)
        browser.cookies.onChanged.addListener(this.onChanged)

        this.onUpdated = this.onUpdated.bind(this)
        browser.tabs.onUpdated.addListener(this.onUpdated)
    }

    onUpdated(tabId, info, tab) {
        if (info.status == 'complete') {
            this.manageCookies(tabId, tab.url)
        }
    }

    async onChanged(changeInfo) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        if (this.storage?.blocked) {
            if (!changeInfo.removed && this.storage.blocked.filter(x => x.domain == changeInfo.cookie.domain && x.name == changeInfo.cookie.name).length > 0) {
                this.removeCookie(changeInfo.cookie)
            }
        }

        if (this.storage?.readonly) {
            if (this.storage.readonly.filter(x => x.domain == changeInfo.cookie.domain && x.name == changeInfo.cookie.name).length > 0) {
                let lockedIndex = this.storage.readonly.findIndex(x => x.domain == changeInfo.cookie.domain && x.name == changeInfo.cookie.name)
                if (!changeInfo.removed) {
                    if (!this.matchCookie(changeInfo.cookie, this.storage.readonly[lockedIndex])) {
                        this.removeCookie(changeInfo.cookie)
                        let cookie = this.buildCookie(this.storage.readonly[lockedIndex])
                        browser.cookies.set(cookie)
                    }
                }
            }
        }
    }

    async manageCookies(tabId, url) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        let cookies = await this.getAllCookiesByTab(tabId)
        if (!cookies){
            cookies = await this.getAllCookies(url)
        }
        cookies.forEach(cookie => {
            if (this.storage.blocked.filter(x => x.domain == cookie.domain && x.name == cookie.name).length > 0) {
                this.removeCookie(cookie)
            }

            if (this.storage.readonly.filter(x => x.domain == cookie.domain && x.name == cookie.name).length > 0) {
                let lockedIndex = this.storage.readonly.findIndex(x => x.domain == cookie.domain && x.name == cookie.name)
                let readonlyCookie = this.buildCookie(this.storage.readonly[lockedIndex])
                this.removeCookie(cookie).then(browser.cookies.set(readonlyCookie))
            }
        })
    }

    async removeCookie(cookie) {
        let url = this.buildCookieUrl(cookie)
        return browser.cookies.remove({
            'url': url,
            'name': cookie.name,
            'storeId': cookie.storeId
        })
    }

    matchCookie(s, t) {
        if (s.value != t.value) return false
        if (s.httpOnly != t.httpOnly) return false
        if (s.path != t.path) return false
        if (s.sameSite != t.sameSite) return false
        if (s.secure != t.secure) return false
        if (s.value != t.value) return false
        return true
    }

    buildCookie(values) {
        let cookie = {
            httpOnly: values.httpOnly,
            name: values.name,
            path: values.path,
            sameSite: values.sameSite,
            secure: values.secure,
            storeId: values.storeId,
            url: this.buildCookieUrl(Object.assign({}, values)),
            value: values.value
        }
        if (!values.hostOnly)
            cookie['domain'] = values.domain
        if (!values.session)
            cookie['expirationDate'] = values.expirationDate
        return cookie
    }

    buildCookieUrl(cookie) {
        if (!cookie.secure && worker.ptk_app.proxy?.activeTab)
            cookie.secure = worker.ptk_app.proxy.activeTab.url.indexOf("https://") === 0
        if (cookie.domain.substr(0, 1) === '.')
            cookie.domain = cookie.domain.substring(1)
        return "http" + ((cookie.secure) ? "s" : "") + "://" + cookie.domain + cookie.path
    }


    async getAllCookies(url) {
        let promises = []
        promises.push(browser.cookies.getAll({ 'url': url }))

        return Promise.all(promises).then(function (cookie) {
            let merged = [].concat.apply([], cookie)
            return merged.filter((v, i, a) => a.findIndex(v2 => (JSON.stringify(v) === JSON.stringify(v2))) === i).sort((a, b) => a.name.localeCompare(b.name));
        })
    }

    async getAllCookiesByTab(tabId) {
        let promises = []
        let tab = worker.ptk_app.proxy.getTab(tabId)
        return tab?.analyze().then(function (result) {
            for (let i = 0; i < result.urls.length; i++) {
                promises.push(browser.cookies.getAll({ 'url': result.urls[i] }))
            }
            return Promise.all(promises).then(function (cookie) {
                let merged = [].concat.apply([], cookie)
                return merged.filter((v, i, a) => a.findIndex(v2 => (JSON.stringify(v) === JSON.stringify(v2))) === i).sort((a, b) => a.name.localeCompare(b.name));
            })
        })

    }


    async msg_init(message) {
        let activeTab = worker.ptk_app.proxy.activeTab
        let cookies = await this.getAllCookiesByTab(activeTab.tabId)
        this.storage = await this.init()
        return Promise.resolve(Object.assign({}, activeTab, { cookies: cookies, storage: this.storage }))
    }


    async msg_remove_all(message) {
        let activeTab = worker.ptk_app.proxy.activeTab
        let cookies = await this.getAllCookiesByTab(activeTab.tabId)
        for (var i = 0; i < cookies.length; i++) {
            let cookie = cookies[i]
            this.removeCookie(cookie)
        }
        return Promise.resolve(Object.assign({}, activeTab, { cookies: cookies }))

    }

    async msg_remove_one(message) {
        let activeTab = worker.ptk_app.proxy.activeTab
        let cookies = await this.getAllCookiesByTab(activeTab.tabId)
        let cookie = cookies[message.index]

        this.removeCookie(cookie)

        return Promise.resolve(Object.assign({}, activeTab, { cookies: cookies }))
    }

    //Export Import
    async msg_export(message) {
        let activeTab = worker.ptk_app.proxy.activeTab
        let cookies = await this.getAllCookiesByTab(activeTab.tabId)
        return Promise.resolve(Object.assign({}, { cookie: cookies }))
    }

    async msg_import(message) {
        let cookies = message.cookies
        cookies.forEach(cookie => {
            let c = this.buildCookie(cookie)
            browser.cookies.set(c)
        })
        return Promise.resolve(Object.assign({}, { cookie: cookies }))
    }

    //Block 
    async msg_block_one(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        let activeTab = worker.ptk_app.proxy.activeTab
        let cookies = await this.getAllCookiesByTab(activeTab.tabId)
        let cookie = cookies[message.index]

        if (!this.storage.blocked) this.storage.blocked = []

        this.storage.blocked.push(cookie)
        ptk_storage.setItem(this.storageKey, this.storage)
        this.removeCookie(cookie)

        return Promise.resolve(Object.assign({}, activeTab, { cookies: cookies }))

    }

    async msg_get_blocked_cookies(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        return Promise.resolve(Object.assign({}, { blockedCookies: this.storage }))
    }

    async msg_remove_blocked_rule(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        if (!this.storage.blocked) this.storage.blocked = []
        this.storage.blocked.splice(message.index, 1)
        ptk_storage.setItem(this.storageKey, this.storage)
        return Promise.resolve(Object.assign({}, activeTab, { blockedCookies: this.storage }))
    }

    async msg_remove_all_blocked_rules(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        this.storage.blocked = []
        ptk_storage.setItem(this.storageKey, this.storage)
        return Promise.resolve(Object.assign({}, activeTab, { blockedCookies: this.storage }))
    }

    //Readonly

    async msg_readonly_one(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        let activeTab = worker.ptk_app.proxy.activeTab
        let cookies = await this.getAllCookiesByTab(activeTab.tabId)
        let cookie = cookies[message.index]

        if (!this.storage.readonly) this.storage.readonly = []

        this.storage.readonly.push(cookie)
        ptk_storage.setItem(this.storageKey, this.storage)

        return Promise.resolve(Object.assign({}, activeTab, { cookies: cookies }))
    }

    async msg_remove_readonly_rule(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        if (!this.storage.readonly) this.storage.readonly = []
        this.storage.readonly.splice(message.index, 1)
        ptk_storage.setItem(this.storageKey, this.storage)
        return Promise.resolve(Object.assign({}, activeTab, { readonlyCookies: this.storage }))
    }

    async msg_remove_all_readonly_rules(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        this.storage.readonly = []
        ptk_storage.setItem(this.storageKey, this.storage)
        return Promise.resolve(Object.assign({}, activeTab, { readonlyCookies: this.storage }))
    }

    //Save/update

    async msg_save_one(message) {
        let activeTab = worker.ptk_app.proxy.activeTab
        let cookies = await this.getAllCookiesByTab(activeTab.tabId)
        let cookie = this.buildCookie(message.values)
        await this.removeCookie(message.values)
        browser.cookies.set(cookie)

        return Promise.resolve(Object.assign({}, activeTab, { cookies: cookies }))
    }


}
