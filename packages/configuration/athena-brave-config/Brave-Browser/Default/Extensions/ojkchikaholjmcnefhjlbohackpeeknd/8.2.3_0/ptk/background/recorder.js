/* Author: Denis Podgurskii */

import { ptk_logger, ptk_notifications, ptk_utils, ptk_storage } from "./utils.js"
import { ptk_exporter } from "./exporter.js"

const worker = self

export class ptk_recorder {
    constructor(settings) {
        this.recorderJS = settings.recorderFile
        this.trackerJS = settings.trackerFile
        this.popupJS = settings.popupFile
        this.replayerJS = settings.replayerFile
        this.setWindowSize = settings.set_window_size
        this.windowHeight = settings.window_height
        this.windowWidth = settings.window_width
        this.pathToIcons = settings.icons
        this.doubleClick = settings.double_click

        this.cleanCookieOnStart = false

        this.storageKey = 'ptk_recorder'
        this.storage = { 'savedMacro': '', 'recording': {} }

        this.reset()
    }

    /* Listeners */

    addListiners() {
        this.onCreated = this.onCreated.bind(this)
        browser.tabs.onCreated.addListener(this.onCreated)

        this.onUpdated = this.onUpdated.bind(this)
        browser.tabs.onUpdated.addListener(this.onUpdated)

        this.onRemoved = this.onRemoved.bind(this)
        browser.tabs.onRemoved.addListener(this.onRemoved)

        this.onBeforeRequest = this.onBeforeRequest.bind(this)
        browser.webRequest.onBeforeRequest.addListener(this.onBeforeRequest, { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["requestBody"].concat(ptk_utils.extraInfoSpec)
        )

        this.onSendHeaders = this.onSendHeaders.bind(this)
        browser.webRequest.onSendHeaders.addListener(this.onSendHeaders, { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["requestHeaders"].concat(ptk_utils.extraInfoSpec)
        )

        this.onHeadersReceived = this.onHeadersReceived.bind(this)
        browser.webRequest.onHeadersReceived.addListener(this.onHeadersReceived, { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["responseHeaders"].concat(ptk_utils.extraInfoSpec)
        )

        this.onBeforeRedirect = this.onBeforeRedirect.bind(this)
        browser.webRequest.onBeforeRedirect.addListener(this.onBeforeRedirect, { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["responseHeaders"].concat(ptk_utils.extraInfoSpec)
        )

        this.onCompleted = this.onCompleted.bind(this)
        browser.webRequest.onCompleted.addListener(this.onCompleted, { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["responseHeaders"].concat(ptk_utils.extraInfoSpec)
        )

    }

    removeListiners() {
        browser.tabs.onCreated.removeListener(this.onCreated)
        browser.tabs.onUpdated.removeListener(this.onUpdated)
        browser.tabs.onRemoved.removeListener(this.onRemoved)

        browser.webRequest.onBeforeRequest.removeListener(this.onBeforeRequest)
        browser.webRequest.onSendHeaders.removeListener(this.onSendHeaders)
        browser.webRequest.onHeadersReceived.removeListener(this.onHeadersReceived)
        browser.webRequest.onBeforeRedirect.removeListener(this.onBeforeRedirect)
        browser.webRequest.onCompleted.removeListener(this.onCompleted)
    }

    onCreated(tab) {
        if (this.mode != null) {
            this.tabs.push(tab.id)
        }
    }

    executeInline(code) {
        return new Function(code)
    }

    onUpdated(tabId, info, tab) {

        if (info.status != "complete" || !this.isTracking(tabId)) return
        let file = null
        if (this.mode == "recording") file = this.recorderJS
        if (this.mode == "replay") file = this.replayerJS


        if (file) {
            if (tab?.url != 'about:blank' && this.trackerJS) {

                if (this.cleanCookieOnStart) {
                    browser.scripting.executeScript({ func: () => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) { } }, target: { tabId: tabId, allFrames: true } })
                    this.cleanCookieOnStart = false
                }
                let popuJSPath = this.popupJS
                browser.scripting.executeScript({ files: [this.trackerJS], target: { tabId: tabId, allFrames: false } }).then(function () {
                    browser.scripting.executeScript({ files: [popuJSPath], target: { tabId: tabId, allFrames: false } })
                    browser.scripting.executeScript({ files: [file], target: { tabId: tabId, allFrames: true } })
                }).catch(e => console.log(e))
            } else {
                browser.scripting.executeScript({ files: [file], target: { tabId: tabId, allFrames: true } }).catch(e => e)
            }
        }
    }

    onRemoved(tabId, info) {
        if (tabId == this.openerTabId) {
            if (this.mode == "recording") this.stopRecording(info)
            else if (this.mode == "replay") this.stopReplay(info)
        }
    }

    onBeforeRequest(request) {
        if (ptk_utils.exclude(request.url) || request.type.match(/(ping)/) || !this.isTracking(request.tabId)) return

        if (this.mode == "recording") {
            try {
                let item = {
                    requestId: request.requestId, type: request.type, request: request, response: {}
                }

                this.recording.recordingRequests.push(item)

                if (worker.isFirefox) {
                    let filter = browser.webRequest.filterResponseData(item.requestId)
                    let decoder = new TextDecoder("utf-8")

                    filter.ondata = (event => {
                        let str = decoder.decode(event.data, { stream: true })
                        filter.write(event.data)
                        filter.disconnect()
                        let r = this.recording.recordingRequests[this.findLastIndex(this.recording.recordingRequests, item.requestId)]
                        r.response.body = str
                        r.response.base64Encoded = false
                    }).bind(this)
                }
            }
            catch (e) { e => ptk_logger(e, "Could not update recording request", "warning") }
        }
    }

    onSendHeaders(request) {
        if (this.isTracking(request.tabId) && this.mode == "recording") {
            let r = this.recording.recordingRequests[this.findLastIndex(this.recording.recordingRequests, request.requestId)]
            if (r) r.requestHeaders = request.requestHeaders
        }
    }

    onHeadersReceived(response) {
        if (!this.isTracking(response.tabId)) return
        if (this.mode == "recording") {
            let r = this.recording.recordingRequests[this.findLastIndex(this.recording.recordingRequests, response.requestId)]
            if (r) {
                r.responseHeaders = response.responseHeaders
                r.response.statusCode = response.statusCode
                r.response.statusLine = response.statusLine
            }
        }
    }

    onBeforeRedirect(response) {
        if (!this.isTracking(response.tabId)) return
        if (this.mode == "recording") {
            let r = this.recording.recordingRequests[this.findLastIndex(this.recording.recordingRequests, response.requestId)]
            if (r) {
                r.redirectUrl = response.redirectUrl
            }
        }
    }

    onCompleted(response) {
        if (!this.isTracking(response.tabId)) return
        if (this.mode == "recording") {
            let r = this.recording.recordingRequests[this.findLastIndex(this.recording.recordingRequests, response.requestId)]
            if (r) {
                r.serverIPAddress = response.ip
            }
        }
    }

    onStart(win, startUrl) {

        this.openerWinId = win.id
        this.openerTabId = win.tabs[0].id

        browser.windows.update(win.id, { "focused": true })

        if (this.setWindowSize) {
            browser.windows.update(win.id, { "height": parseInt(this.windowHeight), "width": parseInt(this.windowWidth) })
        }

        setTimeout(function () {
            if (!worker.isFirefox && this.mode == 'recording') {
                //Attach debugger
                let debugTarget = { tabId: this.openerTabId }
                chrome.debugger.attach(debugTarget, "1.3", this.onAttach())
                chrome.debugger.sendCommand(debugTarget, "Network.setCacheDisabled", { cacheDisabled: true })
                chrome.debugger.sendCommand(debugTarget, "Network.enable")
            }

            browser.tabs.update(this.openerTabId, { url: startUrl })

        }.bind(this), 300)
    }

    findLastIndex(obj, requestId) {
        let l = obj.length
        while (l--) {
            if (obj[l].requestId == requestId) return l
        }
        return -1
    }

    onAttach(tabId) {
        this.onEvent = this.onEvent.bind(this)
        chrome.debugger.onEvent.addListener(this.onEvent)
        this.onDetach = this.onDetach.bind(this)
        chrome.debugger.onDetach.addListener(this.onDetach)
    }

    onDetach(source, reason) {
        chrome.debugger.onEvent.removeListener(this.onEvent)
        chrome.debugger.onDetach.removeListener(this.onDetach)
    }

    onEvent(debuggeeId, message, params) {
        let err = browser.runtime.lastError
        if (!this.isTracking(debuggeeId.tabId)) return

        if (params?.request?.url?.includes("-extension://")) return
        if (params?.response?.url?.includes("-extension://")) return

        let item = {
            requestId: params.requestId,
            parentId: params.loaderId,
            type: params.type,
            response: {},
            timing: {}
        }
        let reverseIndex = this.findLastIndex(this.recording.requests, item.requestId)

        if (message == "Network.requestWillBeSent") {
            if (params.redirectResponse ||
                !this.recording.requests.some(e => e.requestId === params.requestId)) {
                item.request = params.request
                this.recording.requests.push(item)
            }
        }
        if (message == "Network.loadingFinished" && reverseIndex > -1) {
            chrome.debugger.sendCommand(debuggeeId, "Network.getResponseBody", { "requestId": params.requestId },
                function (response) {
                    if (response?.body) {
                        this.recording.requests[reverseIndex].response.body = response.body
                        this.recording.requests[reverseIndex].response.base64Encoded = response.base64Encoded
                    }
                }.bind(this))
        }
    }

    addMessageListeners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender) {
        
        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_recorder") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve({ success: false })
        }
    }

    async msg_init(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        this.recording = this.storage['recording']
        return Promise.resolve({ savedMacro: this.storage['savedMacro'], recording: this.storage['recording'] })
    }

    msg_save_macro(message) {
        this.storage['savedMacro'] = message.macro
        ptk_storage.setItem(this.storageKey, this.storage)
        return Promise.resolve({ success: true })
    }

    msg_analyse(message) {
        return Promise.resolve(this.analyse())
    }

    msg_cancel_recording(message) {
        this.cancelled = true
        let a = this.tabs.reverse()
        for (let i = 0; i < a.length; i++) {
            browser.tabs.get(a[i]).then(function (tab) {
                if (tab && tab.id) {
                    browser.tabs.remove(tab.id).catch(e => e)
                }
            })
        }
        return Promise.resolve({ success: true })
    }

    msg_stop_replay(message) {
        this.cancelled = true
        let a = this.tabs.reverse()
        for (let i = 0; i < a.length; i++) {
            browser.tabs.get(a[i]).then(function (tab) {
                if (tab && tab.id) {
                    browser.tabs.remove(tab.id).catch(e => e)
                }
            })
        }
        return Promise.resolve({ success: true })
    }

    //External access
    msg_start_recording(message) {
        this.startRecording(message.clean_cookie, message.url, message.bootstrap)
        return Promise.resolve({ success: true })
    }

    //External access
    msg_stop_recording(message) {
        let a = this.tabs.reverse()
        for (let i = 0; i < a.length; i++) {
            browser.tabs.get(a[i]).then(function (tab) {
                if (tab && tab.id) {
                    browser.tabs.remove(tab.id).catch(e => e)
                }
            })
        }
        return Promise.resolve({ success: true, bootstrap: this.bootstrap })
    }

    //External access
    msg_export_recording(message) {
        let exporter = new ptk_exporter(this.recording, message.settings)
        let result = exporter.render()
        return Promise.resolve({ success: true, result: result, bootstrap: this.bootstrap })
    }

    //External access
    msg_reset_recording(message) {
        this.reset()
        ptk_storage.setItem(this.storageKey, {})
        return Promise.resolve({ success: true })
    }

    msg_replay(message) {
        this.startReplay(message.clean_cookie, message.url, message.events, message.validate_regex)
        return Promise.resolve()
    }

    /* End Listeners */

    isTracking(tabId) {
        return (tabId == this.openerTabId || this.tabs.includes(tabId))
    }

    cleanCookie(startUrl) {
        this.cleanCookieOnStart = true
        browser.cookies.getAll({ domain: (new URL(startUrl)).hostname }).then(function (cookies) {
            let url = new URL(startUrl)
            for (let i = 0; i < cookies.length; i++) {
                browser.cookies.remove({
                    url: url.protocol + "//" + cookies[i].domain + cookies[i].path,
                    name: cookies[i].name
                })
            }
        })
    }

    startRecording(cleanCookie, startUrl, bootstrap) {
        if (this.mode == null) {
            this.reset()

            worker.ptk_recorder_active = true
            this.mode = 'recording'
            this.bootstrap = bootstrap
            this.cleanCookieOnStart = cleanCookie

            this.recording = {
                startUrl: startUrl, frames: [], items: [], requests: [], recordingRequests: []
            }

            if (cleanCookie) this.cleanCookie(startUrl)

            this.addListiners()
            let self = this
            browser.webRequest.handlerBehaviorChanged() //FF caching
            browser.storage.local.set({
                "ptk_recording_items": [],
                "ptk_recording_timing": [],
                "ptk_recording": { mode: "recording", startUrl: startUrl },
                "ptk_recording_log": "",
                "ptk_recording_confirm_required": true,
                "ptk_path_to_icons": this.pathToIcons,
                "ptk_double_click": this.doubleClick
            }).then(function () {
                if (cleanCookie) {
                    browser.extension.isAllowedIncognitoAccess().then(function (incognito) {
                        browser.windows.create({ url: 'about:blank', type: "popup", "incognito": incognito }).then(function (win) { self.onStart(win, startUrl) })
                    })
                } else {
                    browser.windows.create({ url: 'about:blank', type: "popup" }).then(function (win) { self.onStart(win, startUrl) })
                }
            })
        } else {
            ptk_notifications.notify("Recording/playback already started", "Stop recording before start a new one");
        }
    }

    stopRecording(params) {
        worker.ptk_recorder_active = false
        this.mode = null
        this.openerWinId = -1
        this.openerTabId = -1
        this.tabs = []
        this.removeListiners()

        if (this.cancelled) {
            this.reset()
            return
        }

        browser.storage.local.get(["ptk_recording_items", "ptk_recording_timing"]).then(function (result) {
            if (!result) return

            let a = this.recording.requests
            let b = result.ptk_recording_timing

            for (let l = 0; l < this.recording.recordingRequests.length; l++) {

                for (let k = 0; k < a.length; k++) {
                    let r = a[k].request
                    let u = r.urlFragment ? r.url + r.urlFragment : r.url
                    if (this.recording.recordingRequests[l].request.url == u) {
                        this.recording.recordingRequests[l].response.body = a[k].response.body
                        this.recording.recordingRequests[l].response.base64Encoded = a[k].response.base64Encoded
                        if (r.postData) {
                            if (this.recording.recordingRequests[l]?.request?.requestBody) {
                                this.recording.recordingRequests[l].request.requestBody.postData = r.postData
                                this.recording.recordingRequests[l].request.requestBody.postDataEntries = r.postDataEntries
                            } else {
                                console.log('No request body for postData')
                                console.log(this.recording.recordingRequests[l]?.request)
                            }
                        }
                        a.splice(k, 1)
                        break
                    }
                }

                for (let k = 0; k < b.length; k++) {
                    if (this.recording.recordingRequests[l].request.url == b[k].name) {
                        this.recording.recordingRequests[l].timing = b[k]
                        b.splice(k, 1)
                        break
                    }
                }
            }
            this.recording.requests = []
            this.recording.items = result.ptk_recording_items

            browser.storage.local.remove([
                "ptk_recording",
                "ptk_recording_items",
                "ptk_recording_timing",
                "ptk_recording_log",
                "ptk_recording_confirm_required",
                "ptk_path_to_icons",
                "ptk_double_click"
            ])
            this.storage['recording'] = this.recording
            ptk_storage.setItem(this.storageKey, this.storage)
            browser.runtime.sendMessage({
                channel: "ptk_background2popup_recorder",
                type: "recording_completed",
                recording: this.recording
            }).catch(e => ptk_logger.log(e, "Could send recording completed", "warning"))

        }.bind(this))
    }

    startReplay(cleanCookie, startUrl, items, validateRegex) {
        if (this.mode == null) {

            worker.ptk_recorder_active = true
            this.mode = 'replay'
            this.cleanCookieOnStart = cleanCookie

            this.replay = {
                startUrl: startUrl, replayStep: 0, replayEvents: items, validateRegex: validateRegex
            }

            if (cleanCookie) this.cleanCookie(startUrl)
            this.addListiners()
            let self = this
            return browser.storage.local.set({
                "ptk_replay_items": items,
                "ptk_replay_step": 0,
                "ptk_replay_regex": validateRegex,
                "ptk_replay": { mode: "replay", startUrl: startUrl },
                "ptk_recording_log": "",
                "ptk_recording_confirm_required": true,
                "ptk_path_to_icons": this.pathToIcons
            }).then(function () {

                if (cleanCookie) {
                    browser.extension.isAllowedIncognitoAccess().then(function (incognito) {
                        browser.windows.create({ url: 'about:blank', type: "popup", "incognito": incognito }).then(function (win) { self.onStart(win, startUrl) })
                    })
                } else {
                    browser.windows.create({ url: 'about:blank', type: "popup" }).then(function (win) { self.onStart(win, startUrl) })
                }
            })
        } else {
            ptk_notifications.notify("Recording/playback already started", "Stop recording before start a new one");
        }
    }

    stopReplay(params) {
        worker.ptk_recorder_active = false
        this.mode = null
        this.openerWinId = -1
        this.openerTabId = -1
        this.tabs = []
        this.replay = null
        this.removeListiners()
        browser.storage.local.remove([
            "ptk_replay_items",
            "ptk_replay_step",
            "ptk_replay_regex",
            "ptk_replay",
            "ptk_recording_log",
            "ptk_recording_confirm_required",
            "ptk_path_to_icons",
            "ptk_double_click"
        ])
    }

    reset() {
        this.mode = null
        this.openerWinId = -1
        this.openerTabId = -1
        this.tabs = []
        this.replay = null
        this.recording = null
        this.bootstrap = null
        this.savedMacro = ""
        this.cancelled = false
        delete worker.ptk_recorder_active
        browser.storage.local.remove(
            [
                "ptk_recording",
                "ptk_recording_items",
                "ptk_recording_timing",
                "ptk_replay_items",
                "ptk_replay_step",
                "ptk_replay_regex",
                "ptk_replay",
                "ptk_recording_log"
            ])
        this.removeListiners()
    }

    analyse() {
        let result = []
        let previousValue = []
        this.recording.recordingRequests.forEach(function (item) {

            let requestHeaders = item.requestHeaders ? item.requestHeaders : []
            let responseHeaders = item.responseHeaders ? item.responseHeaders : []
            let hostname = new URL(item.request.url).hostname

            if (!previousValue[hostname]) previousValue[hostname] = {}

            var resultitem = { hostname: hostname }
            requestHeaders.find(function (item) {
                if (item.name.toLowerCase() == 'cookie' && previousValue[hostname].cookie != item.value) {
                    resultitem.browser = { cookie: { item: {} } }
                    resultitem.browser.cookie = { item: item, request: item }
                    previousValue[hostname].cookie = item.value
                }
                if (item.name.toLowerCase() == 'authorization' && previousValue[hostname].authorization != item.value) {
                    resultitem.browser = { authorization: { item: {} } }
                    resultitem.browser.authorization = { item: item, request: item }
                    previousValue[hostname].authorization = item.value
                }
            })

            responseHeaders.find(function (item) {
                if (item.name.toLowerCase() == 'set-cookie') {
                    resultitem.server = { cookie: { item: {} } }
                    resultitem.server.cookie = { item: item, request: item }
                }
            })

            if (item.response?.body) {
                var body = item.response.base64Encoded ? atob(item.response.body) : item.response.body,
                    token = body.match(new RegExp('(?:"[^"]*token"\s?:\s?){1}"([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)"{1}'))
                if (token) {
                    resultitem.server = { token: { item: {} } }
                    resultitem.server.token = { item: token[token.length - 1], request: item }
                }
            }
            if (resultitem.browser || resultitem.server) {
                result.push(resultitem)
            }
        })
        return result
    }

}


