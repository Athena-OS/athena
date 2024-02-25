/* Author: Denis Podgurskii */
import { ptk_logger, ptk_utils } from "./utils.js"

/*
{frames: new Map[ frameId: new Map [requestId: [item: {request: object, response: object} ] ] ] }
*/

const worker = self

export class ptk_proxy {

    constructor(settings) {
        this.maxTabsCount = settings.max_tabs
        this.maxRequestsPerTab = settings.max_requests_per_tab

        this.tabs = {}
        this._createdTab = null
        this._activeTab = null
        this._previousTab = null

        this.addMessageListiners()
        this.addListiners()
    }

    /* Listeners */

    addListiners() {

        this.onActivated = this.onActivated.bind(this)
        browser.tabs.onActivated.addListener(this.onActivated)
        this.onUpdated = this.onUpdated.bind(this)
        browser.tabs.onUpdated.addListener(this.onUpdated)
        this.onRemoved = this.onRemoved.bind(this)
        browser.tabs.onRemoved.addListener(this.onRemoved)

        this.onBeforeRequest = this.onBeforeRequest.bind(this)
        browser.webRequest.onBeforeRequest.addListener(
            this.onBeforeRequest,
            { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["requestBody"].concat(ptk_utils.extraInfoSpec)
        )
        this.onSendHeaders = this.onSendHeaders.bind(this)
        browser.webRequest.onSendHeaders.addListener(
            this.onSendHeaders,
            { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["requestHeaders"].concat(ptk_utils.extraInfoSpec)
        )

        this.onBeforeRedirect = this.onBeforeRedirect.bind(this)
        browser.webRequest.onBeforeRedirect.addListener(
            this.onBeforeRedirect,
            { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["responseHeaders"].concat(ptk_utils.extraInfoSpec)
        )

        this.onCompleted = this.onCompleted.bind(this)
        browser.webRequest.onCompleted.addListener(
            this.onCompleted,
            { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["responseHeaders"].concat(ptk_utils.extraInfoSpec)
        )
    }

    removeListeners() {
        browser.tabs.onActivated.removeListener(this.onActivated)
        browser.tabs.onUpdated.removeListener(this.onUpdated)
        browser.tabs.onRemoved.removeListener(this.onRemoved)

        browser.webRequest.onBeforeRequest.removeListener(this.onBeforeRequest)
        browser.webRequest.onSendHeaders.removeListener(this.onSendHeaders)
        browser.webRequest.onBeforeRedirect.removeListener(this.onBeforeRedirect)
        browser.webRequest.onCompleted.removeListener(this.onCompleted)
    }

    onActivated(info) {
        this._createdTab = { tabId: info.tabId, window: info.windowId }
        setTimeout(function () {
            browser.tabs.get(info.tabId).then(function (tab) {
                if (tab?.url && ptk_utils.isURL(tab?.url)) {
                    worker.ptk_app.proxy.activeTab = { tabId: tab.id, url: tab.url, window: tab.windowId }
                }
            }).catch(e => e)
        }, 150)
    }

    onUpdated(tabId, info, tab) {
        if (tab?.url && ptk_utils.isURL(tab?.url)) {
            this.activeTab = { tabId: tabId, url: tab.url, window: tab.windowId }
        }
    }

    onRemoved(tabId, info) {
        if (this._previousTab && this._activeTab?.tabId == tabId) this._activeTab = this._previousTab
    }

    onBeforeRequest(request) {
        ptk_logger.log("ptk_tabs onBeforeRequest", { tabId: request.tabId, request: request.requestId, request: request })
        this.setTab(request.tabId, request, 'start')
    }

    onSendHeaders(request) {
        ptk_logger.log("ptk_tabs onSendHeaders", { tabId: request.tabId, request: request.requestId, request: request })
        this.setTab(request.tabId, request, 'request')
    }

    onBeforeRedirect(response) {
        ptk_logger.log("onBeforeRedirect", { tabId: response.tabId, request: response.requestId, response: response })
        this.setTab(response.tabId, response, 'redirect')
    }

    onCompleted(response) {
        ptk_logger.log("onCompleted", { tabId: response.tabId, request: response.requestId, response: response })
        this.setTab(response.tabId, response, 'response')
    }

    addMessageListiners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {

        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_tabs") {
            let tab = this.getTab(this.activeTab.tabId)

            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message, tab)
            }
        }
    }

    async msg_init(message, tab) {
        return Promise.resolve(Object.assign({}, this.activeTab))
    }


    async msg_get_active_tab(message, tab) {
        if (!tab?.tabInfo) {
            tab['tabInfo'] = await tab.analyze()
        }
        return Promise.resolve(Object.assign({}, this.activeTab, tab.tabInfo))
    }


    msg_get_all_frames(message, tab) {
        let tabInfo = { requestHeaders: {}, responseHeaders: {}, frames: {}, requests: {}, domains: {}, urls: {} }
        if (tab) tabInfo = tab.analyze()
        return Promise.resolve({ frames: tabInfo.frames })
    }

    msg_get_frame(message, tab) {
        return Promise.resolve(Array.from(tab.frames.get(message.frameIndex)))
    }

    msg_get_request_details(message, tab) {
        let r = {}
        if (tab) {
            r = this.getRequestDetails(tab, message.frameId, message.requestId)
        }
        return Promise.resolve(r)
    }

    msg_clear(message, tab) {
        delete this.tabs[this.activeTab.tabId]
        return Promise.resolve({ result: true })
    }

    /* End Listeners */

    getRequestDetails(tab, frameId, requestId) {
        let request = tab.frames.get(frameId).get(requestId)[0]
        let r = JSON.parse(JSON.stringify(request))
        if (request.requestBody?.raw) {
            let arr = new Uint8Array(request.requestBody.raw[0].bytes)
            r.requestBody.raw = String.fromCharCode.apply(String, arr)
        }
        if(!request.requestHeaders && tab?.tabInfo?.requestHeaders){
            let rH = tab.tabInfo.requestHeaders
            r.requestHeaders = Object.keys(rH).map(key => {
                // let h = rH[key].split(':')
                // if (h.length > 2) return { name: key, value: rH[key] }
                return { name: key, value: rH[key] }
            })
        }
        return r
    }

    getRawRequest(tab, frameId, requestId) {
        
        let request = this.getRequestDetails(tab, frameId, requestId)
        let path = request.method + ' ' + request.url + ' HTTP/1.1'
        let rawRequest = path + '\n' + request.requestHeaders.map(x => x.name + ": " + x.value).join('\n')

        if (request?.requestBody?.formData) {
            let params = Object.keys(request.requestBody.formData).map(function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(request.requestBody.formData[k])
            }).join('&')
            rawRequest += "\n\n" + params
        } else if (request?.requestBody?.raw) {
            rawRequest += "\n\n" + request.requestBody.raw
        }
        return rawRequest
    }

    setTab(tabId, params, t) {
        if (!ptk_utils.isURL(params?.url) ) return

        if (tabId == this._createdTab?.tabId || tabId == this.activeTab?.tabId) 
            this.updateTab(tabId, params, t)
    }

    getTab(tabId) {
        if (tabId in this.tabs && this.tabs[tabId] instanceof ptk_tab) return this.tabs[tabId]
        return null
    }

    updateTab(tabId, params, t) {
        if (!ptk_utils.isURL(params.url)) return

        try {
            if (tabId in this.tabs && this.tabs[tabId] instanceof ptk_tab) {
                this.tabs[tabId].setParams(params, t)
                ptk_logger.log("Tab updated ", { tabId: tabId })
            } else {
                this.tabs[tabId] = new ptk_tab(tabId, params, t)
                this.reduceTabs(this.maxTabsCount, tabId)
                ptk_logger.log("Tab added ", { tabId: tabId })
            }
            this.tabs[tabId].reduceTabSize(this.maxRequestsPerTab)
        } catch (e) {
            ptk_logger.log(e, "Could not update a tab", "error")
        }
    }

    clearTab(tabId) {
        delete this.tabs[tabId]
    }

    reduceTabs(maxTabs, newTabId) {
        let tabsCount = Object.keys(this.tabs).length
        if (tabsCount <= maxTabs) return
        let removeKey = [], count = 0
        Object.keys(this.tabs).forEach(key => {
            if ((tabsCount - count) > maxTabs && key != newTabId) {
                removeKey.push(key)
                count++
            }
        })
        if (removeKey.length > 0) {
            removeKey.forEach((tabId) => {
                delete this.tabs[tabId]
            })
        }
    }

    set activeTab(s) {
        if (ptk_utils.isURL(this._activeTab?.url))
            this._previousTab = this._activeTab

        this._activeTab = s
        // browser.runtime.sendMessage({
        //     channel: "ptk_background2popup_tabs",
        //     type: "active tab changed"
        // }).catch(e => ptk_logger.log(e, "Could not set active tab", "warning"))
    }

    get activeTab() {
        return this._activeTab
    }
}


//---------------------------------------------------//

export class ptk_tab {
    constructor(tabId, params, type) {
        this.tabId = tabId
        this.frames = new Map()
        this.setParams(params, type)
        this.tabInfo = null
    }

    setParams(params, type) {
        if (Number.isInteger(params.frameId)) {
            //Init frame map if doesn't exist
            if (!this.frames.has(params.frameId)) {
                this.frames.set(params.frameId, new Map())
                ptk_logger.log("Init frames", { frameId: params.frameId, requestId: params.requestId })
            }
            //Init request map if doesn't exist
            if (!this.frames.get(params.frameId).has(params.requestId)) {
                this.frames.get(params.frameId).set(params.requestId, new Array())
            }
            let index = this.frames.get(params.frameId).get(params.requestId).length
            if (type == 'start' || index == 0) {
                this.frames.get(params.frameId).get(params.requestId).push(params)
                ptk_logger.log("Add new item for ", { frameId: params.frameId, requestId: params.requestId })
            } else {
                for (let p in params) {
                    let requestKey = index == 0 ? 0 : index - 1
                    if (this.frames.get(params.frameId).get(params.requestId)[requestKey][p] != params[p]) {
                        this.frames.get(params.frameId).get(params.requestId)[requestKey][p] = params[p]
                    }
                }
                ptk_logger.log("Updated params ", { params: params, frameId: params.frameId, requestId: params.requestId })
            }
        } else {
            for (let p in params) {
                this[p] = params[p]
                ptk_logger.log("Add or update param ", { p: params[p] })
            }
        }
    }

    reduceTabSize(maxRequest) {
        let updated = false
        this.frames.forEach((frame, fkey) => {
            frame.forEach((request, rkey) => {
                if (frame.size >= maxRequest) {
                    updated = true
                    frame.delete(rkey)
                }
            })
        })
        if (updated) browser.runtime.sendMessage({
            channel: "ptk_background2popup_tabs",
            type: "requests source resized"
        }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
    }

    async analyze() {
        let requestHeaders = {},
            responseHeaders = new Array(),
            domains = new Array(),
            fqdnIP = new Array(),
            urls = new Array(),
            frames = new Array(),
            requests = new Array()
        this.frames.forEach((fV, fK) => {
            let i = 0, data = {}, ip = ''
            fV.forEach((rV, rK) => {
                rV.forEach((request, key) => {
                    try {
                        if (!urls.includes(request.url)) urls.push(request.url)

                        let hostname = (new URL(request.url)).hostname
                        if (!domains.includes(hostname)) {
                            domains.push(hostname)
                            fqdnIP.push([hostname, request.ip])
                        }

                        request.requestHeaders.forEach((hV, hK) => {
                            if (!(hV.name in requestHeaders))
                                requestHeaders[hV.name.toLowerCase()] = [hV.value]
                        })

                        request.responseHeaders.forEach((hV, hK) => {
                            if (!(hV.name.toLowerCase() in responseHeaders))
                                responseHeaders[hV.name.toLowerCase()] = [hV.value]

                        })

                        if (i == 0) {
                            ip = request.ip ? request.ip : ''
                            data.frame = request.parentFrameId == -1 ? "main" : "iframe"
                            data.url = hostname
                        }
                        if (request.ip && ip.indexOf(request.ip) < 0) ip += ", " + request.ip
                        i++
                    } catch (e) { }
                })
            })
            frames.push(['', fK, data.frame, data.url, ip])
        })

        return { responseHeaders: responseHeaders, requestHeaders: requestHeaders, frames: frames, requests: requests, domains: domains, urls: urls, fqdnIP: fqdnIP }
    }

}