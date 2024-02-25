/* Author: Denis Podgurskii */
import { ptk_utils, ptk_storage, ptk_ruleManager } from "./utils.js"
import httpZ from "../packages/http-z/http-z.es6.js"

const worker = self

export class ptk_request_manager {

    constructor() {
        this.storageKey = 'ptk_rbuilder'
        this.storage = {}
        this.init()
    }

    async init() {
        this.addMessageListeners()
        this.storage = await ptk_storage.getItem(this.storageKey)
    }

    async clear(index) {
        this.init()
        if (index)
            delete this.storage[index]
        else
            this.storage = {}
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

    async msg_init(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        this.storage = this.storage ? this.storage : {}
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
        let request = new ptk_request()
        let rbObj = request.parseRawRequest(message.item)
        if (message.formId) {
            if (!this.storage[message.formId])
                this.storage[message.formId] = rbObj
            else
                this.storage[message.formId].request = rbObj.request
            await ptk_storage.setItem(this.storageKey, this.storage)
        }
        return Promise.resolve(rbObj)
    }

    async msg_update_request(message) {
        let request = new ptk_request()
        let rbObj = request.updateRawRequest(message.item)
        if (message.formId) {
            if (!this.storage[message.formId])
                this.storage[message.formId] = rbObj
            else
                this.storage[message.formId].request = rbObj.request
            await ptk_storage.setItem(this.storageKey, this.storage)
        }
        return Promise.resolve(rbObj)
    }

    async msg_delete_request(message) {
        if (this.storage[message.formId]) {
            delete this.storage[message.formId]
            await ptk_storage.setItem(this.storageKey, this.storage)
        }
        return Promise.resolve(JSON.parse(JSON.stringify(this.storage)))
    }

    async msg_send_request(message) {
        let self = this
        let request = new ptk_request()
        return request.sendRequest(message.schema).then(function (response) {
            if (message.formId) {
                self.storage[message.formId] = response
                ptk_storage.setItem(self.storageKey, self.storage)
            }
            return Promise.resolve(response)
        })
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

        let cacheControl = request.requestHeaders.find(obj => { return obj.name.toLowerCase() == "cache-control" });
        if (!cacheControl) {
            request.requestHeaders.push({
                "name": "Cache-Control",
                "value": "no-cache"
            })
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

    updateRawRequest(requestObject) {
        let rbObj = this.rbuilderScheme()
        let rawMessage = requestObject.request.trim().split(/\r?\n/).concat(['\r\n']).join('\r\n')
        if (requestObject.request.trim().split(/\r?\n\r?\n/).length > 1)
            rawMessage = requestObject.request.trim().split(/\r?\n/).join('\r\n')

        let target = requestObject.request_protocol + '://' + requestObject.request_url.replace(/^https?:\/\//, '')
        if (rawMessage.trim() == '') {
            rawMessage = [
                `${requestObject.request_method} ${target} HTTP/1.1`,
                '', ''
            ].join('\r\n')
        }
        let requestModel = httpZ.parse(rawMessage /*, { mandatoryHost: true } */)
        requestModel.scheme = requestObject.request_protocol
        requestModel.method = requestObject.request_method
        requestModel.target = target
        requestModel.followRedirect = requestObject.request_redirect == 'on' ? true : false

        if (requestModel.host == 'unspecified-host') {
            try {
                let url = new URL(requestModel.target)
                requestModel.host = url.host
            } catch (e) {
                throw new Error('Host header not defined. Use an absolute URL or add "Host" header.')
            }
        }
        requestModel.raw = httpZ.build(requestModel)
        rbObj.request = requestModel
        return rbObj
    }

    parseRawRequest(requestObject) {
        let rbObj = this.rbuilderScheme()
        let rawMessage = requestObject.request.trim().split(/\r?\n/).concat(['\r\n']).join('\r\n')
        if (requestObject.request.trim().split(/\r?\n\r?\n/).length > 1)
            rawMessage = requestObject.request.trim().split(/\r?\n/).join('\r\n')
        let requestModel = httpZ.parse(rawMessage/*, { mandatoryHost: true } */)

        requestModel.scheme = requestModel.target.startsWith('https://') ? 'https' : 'http'
        requestModel.followRedirect = requestObject.request_redirect == 'on' ? true : false
        if (requestModel.host == 'unspecified-host') {
            try {
                let url = new URL(requestModel.target)
                requestModel.host = url.host
            } catch (e) {
                throw new Error('Host header not defined. Use an absolute URL or add "Host" header.')
            }
        }
        requestModel.raw = rawMessage
        rbObj.request = requestModel
        return rbObj
    }



    async sendRequest(schema, overwriteHeaders = true) {
        this.addListeners()
        // ptk_ruleManager.getDynamicRules()
        // ptk_ruleManager.getSessionRules()
        let ruleId = null
        if (overwriteHeaders) {
            ruleId = await ptk_ruleManager.addSessionRule(schema)
            this.trackingRequest = new Map()
            this.trackingRequest.set('originalHeaders', schema.request.headers)
        }


        let params = {
            method: schema.request.method,
            credentials: 'same-origin',
            mode: 'no-cors',
            redirect: schema.request.followRedirect ? "follow" : "manual",
            cache: 'no-cache'
        }
        if (schema.request.body && !schema.request.method.toUpperCase().match(/(^GET|^HEAD)/)) {
            if (schema.request.body.text)
                params.body = schema.request.body.text
            else {
                // let formData = new FormData();
                // schema.request.body.params.forEach(x=>{
                //     formData.append(x.name, x.value)
                // })
                // params.body = formData
                params.body = new URLSearchParams(schema.request.body.params.map(x => `${x.name}=${x.value}`).join('&'))
            }
        }
        let rbSchema = schema
        let self = this
        // console.log(schema)
        // console.log(params)
        return fetch(schema.request.target, params).then(function (response) {
            let trackingRequest = null
            if (self.trackingRequest) {
                trackingRequest = {}
                for (let value of self.trackingRequest.values()) {
                    trackingRequest = value
                    break
                }
                rbSchema.request.headers = trackingRequest.request.requestHeaders
            }


            return response.text().then(function (body) {

                if (!response.ok || !trackingRequest) {
                    let h = []
                    for (var pair of response.headers.entries()) {
                        h.push({ name: pair[0], value: pair[1] })
                    }
                    rbSchema.response.headers = h
                    rbSchema.response.statusLine = rbSchema.request.protocolVersion + ' ' + response.statusText
                    rbSchema.response.statusCode = response.status
                } else {
                    rbSchema.response.headers = trackingRequest.response.responseHeaders
                    rbSchema.response.statusLine = trackingRequest.response.statusLine
                    rbSchema.response.statusCode = trackingRequest.response.statusCode
                }
                rbSchema.response.body = body
                return rbSchema
            })
        }).catch(e => {
            console.log(e)
            //return Promise.reject(e)
        }).finally(() => {

            self.trackingRequest = null
            self.removeListeners()
            if (ruleId) {
                ptk_ruleManager.removeSessionRule(ruleId)
            }
        })
    }

    rbuilderScheme() {
        return { request: {}, response: { headers: [], statusLine: '', statusCode: '', body: '' } }
    }
}