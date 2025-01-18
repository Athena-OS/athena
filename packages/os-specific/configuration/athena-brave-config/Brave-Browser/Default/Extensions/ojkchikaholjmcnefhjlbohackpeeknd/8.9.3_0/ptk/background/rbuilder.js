/* Author: Denis Podgurskii */
import { ptk_utils, ptk_storage, ptk_ruleManager, ptk_logger } from "./utils.js"
import { httpZ } from "./lib/httpZ.esm.js"

const worker = self

export class ptk_request_manager {

    constructor(settings) {
        this.storageKey = 'ptk_rbuilder'
        this.storage = []
        this.settings = settings
        this.init()
        this.addMessageListeners()
    }

    async init() {
        this.storage = await ptk_storage.getItem(this.storageKey)
    }

    async clear(index) {
        this.init()
        if (index) delete this.storage[index]
        else this.storage = []
        await ptk_storage.setItem(this.storageKey, this.storage)
    }

    findLastIndex(obj, requestId) {
        let l = obj.length
        while (l--) {
            if (obj[l].requestId == requestId) return l
        }
        return -1
    }

    /* Listeners */

    addMessageListeners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {

        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_request") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve({ result: false })
        }
    }

    resort(storage){
        let i = 0
        Object.keys(storage).sort(function (a, b) { return storage[a].sort - storage[b].sort }).forEach(function (key) {
            storage[key].sort = i
            i++
        })
        return storage
    }

    async msg_init(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        this.storage = this.storage ? this.resort(this.storage) : []
        return Promise.resolve(JSON.parse(JSON.stringify(this.storage)))
    }

    msg_clear(message) {
        this.clear(message.index)
        return Promise.resolve()
    }

    msg_reset_all(message) {
        this.clear()
        return Promise.resolve()
    }

    async msg_parse_request(message) {
        let rbObj = ptk_request.parseRawRequest(message.raw, message.opts)
        if (message.formId) {
            
            if (!this.storage[message.formId]) {
                this.storage[message.formId] = rbObj
                this.storage[message.formId].sort = Object.keys(this.storage).length
            } else {
                this.storage[message.formId].opts = message.opts
                this.storage[message.formId].request = rbObj.request
            }
            await ptk_storage.setItem(this.storageKey, this.storage)
        }
        return Promise.resolve(rbObj)
    }

    async msg_update_request(message) {
        let rbObj = ptk_request.updateRawRequest(message.schema, message.params, message.opts)
        if (message.formId) {
            if (!this.storage[message.formId]) {
                this.storage[message.formId] = rbObj
                this.storage[message.formId].sort = Object.keys(this.storage).length
            } else {
                this.storage[message.formId].opts = message.opts
                this.storage[message.formId].request = rbObj.request
            }
            await ptk_storage.setItem(this.storageKey, this.storage)
        }
        return Promise.resolve(rbObj)
    }

    async msg_delete_request(message) {
        if (this.storage[message.formId]) {
            delete this.storage[message.formId]
            await ptk_storage.setItem(this.storageKey, this.resort(this.storage))
        }
        return Promise.resolve(JSON.parse(JSON.stringify(this.storage)))
    }

    async msg_send_request(message) {
        let self = this
        let request = new ptk_request()
        return request.sendRequest(message.schema).then(function (response) {
            if (message.formId) {
                let sort = self.storage[message.formId].sort
                self.storage[message.formId] = response
                self.storage[message.formId].sort = sort
                delete self.storage[message.formId].scanResult
                ptk_storage.setItem(self.storageKey, self.storage)
            }
            return Promise.resolve(response)
        })
    }

    async msg_scan_request(message) {
        worker.ptk_app.rattacker.scanRequest(message.schema.request.raw).then(scanResult => {
            let request_manager = worker.ptk_app.request_manager
            if (request_manager.storage[message.formId]) {
                request_manager.storage[message.formId]['scanResult'] = JSON.parse(JSON.stringify(scanResult))
                ptk_storage.setItem(request_manager.storageKey, request_manager.storage)
            }
            browser.runtime.sendMessage({
                channel: "ptk_background2popup_rbuilder",
                type: "scan completed",
                scanResult: JSON.parse(JSON.stringify(scanResult))
            }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
        })
    }

    async msg_sync_storage(message) {
        if(message.storage){
            this.storage = this.resort(message.storage)
            await ptk_storage.setItem(this.storageKey, this.storage)
        }
        return Promise.resolve(JSON.parse(JSON.stringify(this.storage)))
    }


    /* End Listeners */

}


export class ptk_request {

    constructor() {
        this.init()
    }

    async init() {
        this.trackingRequest = null
    }

    /* Listeners */

    addListeners() {
        let blocking = []
        if (worker.isFirefox)
            blocking.push("blocking")


        this.onBeforeRequest = this.onBeforeRequest.bind(this)
        browser.webRequest.onBeforeRequest.addListener(
            this.onBeforeRequest,
            { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["requestBody"].concat(ptk_utils.extraInfoSpec).concat(blocking)
        )

        this.onBeforeSendHeaders = this.onBeforeSendHeaders.bind(this)
        browser.webRequest.onBeforeSendHeaders.addListener(
            this.onBeforeSendHeaders,
            { urls: ["<all_urls>"], types: ptk_utils.filterType },
            ["requestHeaders"].concat(ptk_utils.extraInfoSpec).concat(blocking)
        )

        this.onHeadersReceived = this.onHeadersReceived.bind(this);
        browser.webRequest.onHeadersReceived.addListener(
            this.onHeadersReceived,
            { urls: ["<all_urls>"], types: ptk_utils.filterType },
            ["responseHeaders"].concat(ptk_utils.extraInfoSpec).concat(blocking)
        )

    }

    removeListeners() {
        browser.webRequest.onBeforeSendHeaders.removeListener(this.onBeforeSendHeaders)
        browser.webRequest.onBeforeRequest.removeListener(this.onBeforeRequest)
        browser.webRequest.onHeadersReceived.removeListener(this.onHeadersReceived)
    }

    onBeforeRequest(request) {
        if (this.trackingRequest) {
            let item = {
                requestId: request.requestId,
                type: "main_frame",
                request: request,
                response: {}
            }
            this.trackingRequest.set(request.requestId, item)
        }
    }

    onBeforeSendHeaders(request) {
        if (this.trackingRequest?.has('originalHeaders')) {
            request.requestHeaders = this.trackingRequest.get('originalHeaders')
            this.trackingRequest.delete('originalHeaders')
        }

        if (this.trackingRequest?.has(request.requestId)) {
            this.trackingRequest.get(request.requestId).request.requestHeaders = request.requestHeaders
        }

        return { requestHeaders: request.requestHeaders }
    }


    onHeadersReceived(response) {
        if (this.trackingRequest?.has(response.requestId)) {
            this.trackingRequest.get(response.requestId).response = response
        }
        return { responseHeaders: response.responseHeaders }
    }

    /* End Listeners */

    static rbuilderScheme() {
        return {
            sort: 0,
            opts: {
                "title": "",
                "override_headers": true,
                "follow_redirect": true,
                "update_content_length": true,
                "use_content_type": true
            },
            request: {

            },
            response: {
                headers: [],
                statusLine: '',
                statusCode: '',
                body: ''
            }
        }
    }

    static getParsedRaw(request) {
        let raw = ""
        if (request.split(/\r?\n\r?\n/).length > 1)
            raw = request.split(/\r?\n/).join('\r\n')
        else
            raw = request.split(/\r?\n/).concat(['\r\n']).join('\r\n')

        return raw
    }

    static updateRawRequest(schema, params, opts) {
        if (!opts) opts = schema.opts
        else schema.opts = opts

        if (params) {
            let url = params.request_protocol + '://' + params.request_url.replace(/^https?:\/\//, '')
            schema.request.scheme = params.request_protocol
            schema.request.method = params.request_method
            schema.request.url = url
        }

        ptk_request.normalizeHeaders(schema, opts)
        schema.request.raw = httpZ.build(schema.request, opts)
        return schema
    }

    static parseRawRequest(raw, opts) {
        let schema = ptk_request.rbuilderScheme()
        if (!opts) opts = schema.opts
        else schema.opts = opts

        schema.request = Object.assign(httpZ.parse(ptk_request.getParsedRaw(raw), opts))
        schema.request.scheme = schema.request.url.startsWith('https://') ? 'https' : 'http'

        ptk_request.normalizeHeaders(schema, opts)
        schema.request.raw = httpZ.build(schema.request, opts)
        return schema
    }


    static normalizeHeaders(schema, opts) {
        //Cache - no-cache
        let cacheControl = schema.request.headers.findIndex(obj => { return obj.name.toLowerCase() == "cache-control" });
        if (cacheControl == -1) {
            schema.request.headers.push({
                "name": "Cache-Control",
                "value": "no-cache, no-store"
            })
        } else {
            schema.request.headers[cacheControl].value = "no-cache, no-store"
        }

        //Host header
        if (schema.request.host == 'unspecified-host') {
            try {
                let url = new URL(schema.request.url)
                schema.request.host = url.host
            } catch (e) {
                throw new Error('Host header not defined. Use an absolute URL or add "Host" header.')
            }
        }
        if (schema.request.headers.findIndex(x => x.name.toLowerCase() == 'host') < 0) {
            schema.request.headers.push({ name: 'Host', value: schema.request.host })
        }



        //Content-Length - FF fix
        if (opts?.update_content_length != false) {
            if (["POST", "PUT", "DELETE", "PATCH"].includes(schema.request.method)) {
                let contentLengthIndex = schema.request.headers.findIndex(obj => { return obj.name.toLowerCase() == "content-length" })
                let contentLengthVal = 0
                if (schema.request.body?.params) {
                    schema.request.bodySize = (new URLSearchParams(schema.request.body.params.map(x => `${x.name}=${x.value}`).join('&'))).toString().length
                    contentLengthVal = (new URLSearchParams(schema.request.body.params.map(x => `${x.name}=${x.value}`).join('&'))).toString().length
                } else if (schema.request.body?.text) {
                    contentLengthVal = schema.request.body.text.toString().length
                }
                schema.request.bodySize = contentLengthVal
                if (contentLengthIndex < 0) {
                    schema.request.headers.push({
                        "name": "Content-Length",
                        "value": contentLengthVal.toString()
                    })
                } else {
                    schema.request.headers[contentLengthIndex].value = contentLengthVal.toString()
                }
            }
        }

    }

    async sendRequest(schema) {
        this.addListeners()
        // ptk_ruleManager.getDynamicRules()
        // ptk_ruleManager.getSessionRules()
        let ruleId = null
        this.trackingRequest = new Map()

        if (schema.opts.override_headers != false && schema.request.headers.length > 0) {
            ruleId = parseInt((Math.floor(Math.random() * 6) + 1) + Math.floor((Date.now() * Math.random() * 1000)).toString().substr(-8, 8))
            await ptk_ruleManager.addSessionRule(schema, ruleId)
            this.trackingRequest.set('originalHeaders', JSON.parse(JSON.stringify(schema.request.headers)))
        }


        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        let h = {}
        for (let i = 0; i < schema.request.headers.length; i++) {
            let item = schema.request.headers[i]
            h[item.name] = item.value
        }

        let params = {
            method: schema.request.method,
            credentials: 'include',
            redirect: schema.opts.follow_redirect ? "follow" : "manual",
            cache: 'no-store',
            keepalive: true,
            headers: h,
            //signal: controller.signal
        }
        if (schema.request.body && !schema.request.method.toUpperCase().match(/(^GET|^HEAD)/)) {
            if (schema.request.body.text)
                params.body = schema.request.body.text
            else {
                params.body = new URLSearchParams(schema.request.body.params.map(x => `${x.name}=${x.value}`).join('&'))
            }
            //params.body.toString().length
        }
        let rbSchema = schema
        let self = this


        return fetch(schema.request.url, params).then(async function (response) {
            let rh = []
            for (var pair of response.headers.entries()) {
                rh.push({ name: pair[0], value: pair[1] })
            }
            let trackingRequest = null
            if (self.trackingRequest) {
                trackingRequest = {}
                for (let value of self.trackingRequest.values()) {
                    trackingRequest = value
                    break
                }
                if (!response.redirected)
                    rbSchema.request.headers = trackingRequest.request.requestHeaders
            }

            rbSchema.response.body = await response.text()
            if (trackingRequest) {
                rbSchema.response.headers = trackingRequest.response.responseHeaders
                rbSchema.response.statusLine = trackingRequest.response.statusLine
                rbSchema.response.statusCode = trackingRequest.response.statusCode
            } else {
                rbSchema.response.headers = rh
                rbSchema.response.statusLine = rbSchema.request.protocolVersion + ' ' + response.statusText
                rbSchema.response.statusCode = response.status
            }
            rbSchema.response.raw = ""
            if (rbSchema.response.statusLine) rbSchema.response.raw += rbSchema.response.statusLine + '\n'
            if (rbSchema.response.headers) rbSchema.response.raw += rbSchema.response.headers.map(x => x.name + ": " + x.value).join('\n')
            rbSchema.response.raw += "\r\n\r\n" + rbSchema.response.body

            return rbSchema
        }).catch(e => {
            console.log(e)
            //console.log(rbSchema)
            rbSchema.response.statusLine = e.message
            return rbSchema
        }).finally(() => {
            clearTimeout(timeoutId)
            self.trackingRequest = null
            self.removeListeners()
            if (ruleId) {
                ptk_ruleManager.removeSessionRule(ruleId)
            }

        })
    }


}