/* Author: Denis Podgurskii */
import { Wappalyzer } from "../packages/wappalyzer/wappalyzer.js"
import { HttpHeadersCheck } from "../modules/passive/headers.js"
import { ptk_utils } from "./utils.js"


const worker = self

export class ptk_dashboard {
    constructor() {

        fetch(browser.runtime.getURL('ptk/packages/wappalyzer/technologies.json'))
            .then(response => response.json())
            .then(data => {
                this.technologies = data.technologies
                this.categories = data.categories
            })

        fetch(browser.runtime.getURL('ptk/packages/wappalyzer/waf.json'))
            .then(response => response.json())
            .then(data => {
                this.wafTechnologies = data.technologies
                this.wafCategories = data.categories
            })

        this.addMessageListiners()
    }

    async initCookies(urls) {
        let merged = []
        let promises = []
        for (let i = 0; i < urls.length; i++) {
            promises.push(browser.cookies.getAll({ 'url': urls[i] }))
        }
        let self = this
        return Promise.all(promises).then(function (cookie) {
            let merged = [].concat.apply([], cookie)
            let cookies = merged.filter((v, i, a) => a.findIndex(v2 => (JSON.stringify(v) === JSON.stringify(v2))) === i).sort((a, b) => a.name.localeCompare(b.name));
            self.tab.cookies = cookies
            browser.runtime.sendMessage({
                channel: "ptk_background2popup_dashboard",
                type: "init_complete",
                data: Object.assign({}, { cookies: cookies })
            }).catch(e => e)
        })
    }

    async analyzeTab(message) {
        let cookies = {}
        if (this.tab.cookies)
            Object.values(this.tab.cookies).forEach(function (c) {
                cookies[c.name.toLowerCase()] = [c.value]
            })


        let detections = Wappalyzer.analyze({
            headers: this.tab.responseHeaders,
            meta: message.info.meta,
            scriptSrc: message.info.scriptSrc,
            scripts: message.info.scripts,
            html: message.info.html,
            js: message.info.js,
            dom: message.info.dom,
            cookies: cookies
        })
        detections = Wappalyzer.resolve(detections)


        let technologies = Array.prototype.concat.apply(
            [],
            message.info.dom.map(({ name, selector, exists, text, property, attribute, value }) => {

                const technology = Wappalyzer.technologies.find(({ name: _name }) => name === _name)
                if (!technology) return []
                if (typeof exists !== 'undefined') {
                    return Wappalyzer.analyzeManyToMany(technology, 'dom.exists', { [selector]: [''], })
                }

                if (text) {
                    return Wappalyzer.analyzeManyToMany(technology, 'dom.text', { [selector]: [text], })
                }

                if (property) {
                    return Wappalyzer.analyzeManyToMany(technology, `dom.properties.${property}`, { [selector]: [value], })
                }

                if (attribute) {
                    return Wappalyzer.analyzeManyToMany(technology, `dom.attributes.${attribute}`, { [selector]: [value], })
                }

                return []
            })
        )

        technologies = Array.prototype.concat.apply(
            technologies,
            message.info.js
                .map(({ name, chain, value }) => {
                    const technology = Wappalyzer.technologies.find(({ name: _name }) => name === _name)
                    if (!technology) return []
                    if (name) {
                        return Wappalyzer.analyzeManyToMany(technology, 'js', { [chain]: [value], })
                    }

                    return []
                })
        )

        technologies = technologies.map(item => { return { name: item.technology.name, version: item.version ? item.version : "" } })
        const result = [];
        const map = new Map();
        for (const item of technologies) {
            if (!map.has(item.name)) {
                map.set(item.name, true);    // set any value to Map
                result.push({
                    name: item.name,
                    version: item.version
                });
            } else if (map.has(item.name) && result.findIndex(i => i.name == item.name) > -1) {
                result[result.findIndex(i => i.name == item.name)].version = item.version
            }
        }
        technologies = result
        Object.keys(detections).forEach(i => {
            let item = technologies.find(item => item.name == detections[i].name)
            if (!item) {
                technologies.push({ name: detections[i].name, version: detections[i].version })
            } else if (!item.version) {
                item.version = detections[i].version
            }
        })


        //WAF
        let wafDetections = {}
        this.setWappalyzer(this.wafTechnologies, this.wafCategories)

        wafDetections = await Wappalyzer.analyze({
            headers: this.tab.responseHeaders,
            meta: message.info.meta,
            scriptSrc: message.info.scriptSrc,
            scripts: message.info.scripts,
            html: message.info.html,
            js: message.info.js,
            dom: message.info.dom,
            cookies: cookies
        })


        this.tab.technologies = technologies
        this.tab.waf = Wappalyzer.resolve(wafDetections)
        this.tab.storage = message.info.auth

        let self = this
        try {
            self = JSON.parse(JSON.stringify(this))//FF fix
        } catch (e) {

        }
        browser.runtime.sendMessage({
            channel: "ptk_background2popup_dashboard",
            type: "analyze_complete",
            data: Object.assign({}, self)
        }).catch(e => e)

        return Promise.resolve()
    }

    setWappalyzer(technologies, categories) {
        Wappalyzer.technologies = []
        Wappalyzer.categories = []
        Wappalyzer.requires = []
        Wappalyzer.categoryRequires = []
        Wappalyzer.setTechnologies(technologies)
        Wappalyzer.setCategories(categories)
    }



    /* Listeners */

    addMessageListiners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {

        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_dashboard") {
            console.log(message)
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }

    async msg_get(message) {
        return Promise.resolve(Object.assign({},
            this,
            worker.ptk_app.proxy.activeTab))
    }

    async msg_save(message) {
        if (message.items)
            this.items = message.items
        return Promise.resolve(Object.assign({},
            this,
            worker.ptk_app.proxy.activeTab))
    }

    async msg_init(message) {
        if (worker.ptk_app?.settings?.history?.route != 'index') {
            let link = ""
            if (['session', 'sca', 'proxy', 'rbuilder', 'rattacker', 'recording', 'decoder', 'swagger-editor', 'portscanner', 'jwt', 'xss','sql'].includes(worker.ptk_app.settings.history.route)) {
                link = worker.ptk_app.settings.history.route + ".html"
                if (worker.ptk_app.settings.history.hash) {
                    link += "#" + worker.ptk_app.settings.history.hash
                }
            }
            if (link != "")
                return Promise.resolve({ redirect: link, items: this.items })
        }


        //this.Wappalyzer = Wappalyzer

        this.activeTab = worker.ptk_app.proxy.activeTab

        this.privacy = worker.ptk_app.settings.privacy

        this.setWappalyzer(this.technologies, this.categories)

        this.wappalyzerDomRules = Wappalyzer.technologies
            .filter(({ dom }) => dom)
            .map(({ name, dom }) => ({ name, dom }))
            .filter(item => item.dom != "")

        this.wappalyzerJsRules = Wappalyzer.technologies
            .filter(({ js }) => js)
            .map(({ name, js }) => ({ name, js }))
            .filter(item => item.js != "")

        if (this.activeTab?.tabId) {

            browser.tabs.sendMessage(this.activeTab.tabId, {
                channel: "ptk_background2content",
                type: "init",
                dom: this.wappalyzerDomRules,
                js: this.wappalyzerJsRules
            }).catch(() => { })

            let tab = worker.ptk_app.proxy.getTab(this.activeTab.tabId)
            let self = this
            if (tab) {
                return tab?.analyze().then(function (result) {
                    self['tab'] = result
                    self.tab.findings = HttpHeadersCheck.checkSecurityHeaders(tab)
                    self.initCookies(result.urls)

                    return Promise.resolve(Object.assign({}, self, worker.ptk_app.proxy.activeTab, { findings: self.tab.findings }))
                })
            }
        }
        return Promise.resolve(Object.assign({}, worker.ptk_app.proxy.activeTab, { privacy: this.privacy }))
    }

    msg_analyze(message, tab) {
        if (!this.tab) return
        this.analyzeTab(message)
        return Promise.resolve(Object.assign({}, this))
    }

    /* End Listeners */
}