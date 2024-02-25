/* Author: Denis Podgurskii */
import { ptk_sqlinjection } from "../modules/active/sqlinjection.js"
import { ptk_xss } from "../modules/active/xss.js"
import { ptk_oscommand } from "../modules/active/oscommand.js"
import { ptk_jwt } from "../modules/active/jwt.js"
import { ptk_request } from "../background/request.js"
import { ptk_iast } from "../background/iast.js"
import { ptk_utils, ptk_logger, ptk_queue, ptk_storage, ptk_ruleManager } from "../background/utils.js"
import httpZ from "../packages/http-z/http-z.es6.js"
import { ptk_decoder } from "../background/decoder.js"

const worker = self

export class ptk_rattacker {

    constructor(settings) {
        this.settings = settings
        this.storageKey = "ptk_rattacker"
        this.resetScanResult()
        this.attackModules = {
            SqlInjection: new ptk_sqlinjection(),
            XSS: new ptk_xss(),
            OSCommand: new ptk_oscommand(),
            JWT: new ptk_jwt()
        }
        this.addMessageListeners()
    }

    async init() {
        //if (!this.scanResult.tabId) {
        if(!this.isScanRunning) {
            this.storage = await ptk_storage.getItem(this.storageKey)
            if (Object.keys(this.storage).length > 0) {
                this.scanResult = this.storage
                this.scanResult.uniqueRequestQueue = new ptk_queue(this.scanResult.uniqueRequestQueue.items)
                this.scanResult.requestQueue = new ptk_queue(this.scanResult.requestQueue.items)
            }
        }
    }

    resetScanResult() {
        this.isScanRunning = false
        this.scanResult = {
            scannedTabId: null,
            scanId: null,
            tabId: null,
            host: null,
            uniqueRequestQueue: new ptk_queue(),
            requestQueue: new ptk_queue(),
            items: {},
            stats: {
                vulnsCount: 0,
                attacksCount: 0
            },
            settings: {}
        }
    }

    async reset() {
        ptk_storage.setItem(this.storageKey, {})
        ptk_ruleManager.resetSession()
        this.resetScanResult()
    }

    addMessageListeners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    addListeners() {
        this.onRemoved = this.onRemoved.bind(this)
        browser.tabs.onRemoved.addListener(this.onRemoved)

        this.onCompleted = this.onCompleted.bind(this)
        browser.webRequest.onCompleted.addListener(
            this.onCompleted,
            { urls: ["<all_urls>"], types: ptk_utils.requestFilters },
            ["responseHeaders"].concat(ptk_utils.extraInfoSpec)
        )
    }

    removeListeners() {
        browser.tabs.onRemoved.removeListener(this.onRemoved)
        browser.webRequest.onCompleted.removeListener(this.onCompleted)
    }

    onRemoved(tabId, info) {
        if (this.scanResult?.tabId == tabId) {
            this.scanResult.tabId = null
            this.isScanRunning = false
        }
    }

    onCompleted(response) {
        if (this.scanResult?.tabId == response.tabId && !this.settings.blacklist.includes(response.type)) {
            try {
                let r = worker.ptk_app.proxy.getRawRequest(worker.ptk_app.proxy.getTab(response.tabId), response.frameId, response.requestId)
                this.addRequest(r)
            } catch (e) { }
        }
    }

    onMessage(message, sender, sendResponse) {

        if (message.channel == "ptk_popup2background_rattacker") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve({ result: false })
        }

        if (message.channel == "ptk_content2rattacker") {

            if (message.type == 'xss_confirmed' && this.scanResult.host == (new URL(message.data.origin)).host) {
                this.checkConfirmedAttack(message.data)
            }

            if (message.type == 'start') {
                console.log('start scan')
                this.runBackroungScan(sender.tab.id, new URL(sender.origin).host)
                return Promise.resolve({ success: true, scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
            }

            if (message.type == 'stop') {
                this.stopBackroungScan()
                let result = { items: [], count: 0 }
                let keys = Object.keys(this.scanResult.items)
                for (let i = 0; i < keys.length; i++) {
                    let item = this.scanResult.items[keys[i]]
                    for (let j = 0; j < item.attacks.length; j++) {
                        let info = item.attacks[j]

                        if (info.success) {
                            result.count++
                            result.items.push({
                                baseUrl: ptk_utils.escapeHtml(info.baseUrl),
                                proof: ptk_utils.escapeHtml(info.proof),
                                description: ptk_utils.escapeHtml(info.attack.description),
                                request: ptk_utils.escapeHtml(info.request),
                                headers: ptk_utils.escapeHtml(info.headers),
                                body: ptk_utils.escapeHtml(info.body)
                            })
                        }
                    }
                }
                return Promise.resolve({ scanResult: JSON.parse(JSON.stringify(result)) })
            }
        }
    }

    async msg_init(message) {
        await this.init()
        return Promise.resolve({ scanResult: JSON.parse(JSON.stringify(this.scanResult)), isScanRunning: this.isScanRunning })
    }

    msg_reset(message) {
        this.reset()
        return Promise.resolve({ scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
    }

    msg_run_scan(message) {
        this.reset()
        this.scanResult.scanId = ptk_utils.UUID()
        this.runAllAttacks(message.schema)
        return Promise.resolve({ success: true })
    }

    msg_run_bg_scan(message) {
        this.runBackroungScan(message.tabId, message.host)
        return Promise.resolve({ success: true, scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
    }

    msg_stop_bg_scan(message) {
        this.stopBackroungScan()
        return Promise.resolve({ success: true, scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
    }


    runBackroungScan(tabId, host) {
        this.reset()
        this.isScanRunning = true
        this.scanResult.scannedTabId = tabId
        this.scanResult.scanId = ptk_utils.UUID()
        this.scanResult.tabId = tabId
        this.scanResult.host = host
        this.scan()
        // this.iast = new ptk_iast()
        // this.iast.start(tabId)
        this.addListeners()
    }

    stopBackroungScan() {
        //if(this.iast) this.iast.stop(this.scanResult.tabId)
        this.isScanRunning = false
        this.scanResult.tabId = null
        this.scanResult.requestQueue.clear()
        ptk_storage.setItem(this.storageKey, this.scanResult)
        this.removeListeners()
    }

    addRequest(item) {
        let url = item.split('\n')[0]
        if (!this.scanResult.uniqueRequestQueue.has(url)) {
            this.scanResult.uniqueRequestQueue.enqueue(url)
            this.scanResult.requestQueue.enqueue(item)
        }
    }

    checkConfirmedAttack(data) {
        let keys = Object.keys(this.scanResult.items)
        for (let i = 0; i < keys.length; i++) {
            let item = this.scanResult.items[keys[i]]
            for (let j = 0; j < item.attacks.length; j++) {
                if (data.attackValue.ptk == item.attacks[j].attack.options.attackParamValue && !item.attacks[j].success) {
                    item.attacks[j].success = true
                    item.attacks[j].proof += btoa('Confirmed by code execution on ' + data.location + '. Attack parameter value is: ' + data.attackValue.ptk)
                    this.scanResult.stats.vulnsCount++
                }
            }
        }
    }

    async scan() {
        //if (!this.scanResult.tabId) return
        if (!this.isScanRunning) return
        let ptkRequest = new ptk_request()

        while (this.scanResult.requestQueue.size()) {
            let item = this.scanResult.requestQueue.dequeue()
            let schema = ptkRequest.parseRawRequest({ request: item })
            this.runAllAttacks(schema)
        }

        let self = this
        setTimeout(function () { self.scan() }, 1000)
    }

    async runAllAttacks(schema) {

        let attackId = ptk_utils.attackId()
        this.scanResult.items[attackId] = {}

        this.scanResult.items[attackId]['originalSchema'] = schema.request.raw//request.toString(schema)

        let ruleId = await ptk_ruleManager.addSessionRule(schema)
        let originalRequest = await this.executeOriginal(JSON.parse(JSON.stringify(schema)), attackId)

        for (let key in this.attackModules) {
            let module = this.attackModules[key]
            for (let attackIndex in module.attacks) {

                await new Promise((resolve) => setTimeout(resolve, 1000))

                let attack = module.attacks[attackIndex]
                if (attack.methods.includes(schema.request.method)) {


                    let modified = module.prepareAttack(JSON.parse(JSON.stringify(schema)), JSON.parse(JSON.stringify(attack)), ptk_utils.attackParamId())

                    if (modified && modified.attack) {
                        let modifiedSchema = modified.schema
                        attack = modified.attack
                        if (["POST", "PUT", "DELETE", "PATCH"].includes(modifiedSchema.request.method)) {
                            modifiedSchema = this.modifyPostParams(modifiedSchema, attack.options)
                        }
                        let url = new URL(modifiedSchema.request.target)
                        if (modifiedSchema.queryParams) {
                            modifiedSchema = this.modifyGetParams(modifiedSchema, attack.options)
                        }

                        //let item = await 
                        let self = this
                        this.runAttack(modifiedSchema, attack).then(item => {

                            let vulnRegex = attack.options.vulnRegex ? attack.options.vulnRegex : module.vulnRegex
                            module.validateAttack(item, vulnRegex, originalRequest)
                            if (item.success) self.scanResult.stats.vulnsCount++

                            self.scanResult.items[attackId]['attacks'].push(JSON.parse(JSON.stringify(item)))

                            browser.runtime.sendMessage({
                                channel: "ptk_background2popup_rattacker",
                                type: "attack completed",
                                info: item,
                                scanResult: JSON.parse(JSON.stringify(self.scanResult))
                            }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))

                            if (!self.scanResult.requestQueue.size()) {
                                ptk_storage.setItem(self.storageKey, self.scanResult)
                                browser.runtime.sendMessage({
                                    channel: "ptk_background2popup_rattacker",
                                    type: "all attacks completed",
                                    scanResult: JSON.parse(JSON.stringify(self.scanResult))
                                }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
                            }

                        })
                    }
                }
            }
        }
        ptk_ruleManager.removeSessionRule(ruleId)

    }

    modifyPostParams(modifiedSchema, options) {
        let params = modifiedSchema.request.body.params
        for (let i in params) {
            params[i].value = options.position == 'before' ? options.attackValue + params[i].value : params[i].value + options.attackValue
        }
        //modifiedSchema.request.body = params.join('&')
        return modifiedSchema
    }

    modifyGetParams(modifiedSchema, options) {
        let url = new URL(modifiedSchema.request.target)
        for (const [key, value] of url.searchParams) {
            let v = options.position === 'before' ? options.attackValue + value : value + options.attackValue
            url.searchParams.set(key, v)
        }
        modifiedSchema.request.target = url.toString()
        return modifiedSchema
    }

    async executeOriginal(schema, attackId) {

        this.scanResult.items[attackId]['originalUrl'] = schema.request.target
        this.scanResult.items[attackId]['attacks'] = []

        let request = new ptk_request()
        schema.request.followRedirect = true
        let result = await request.sendRequest(schema, false)

        this.scanResult.items[attackId]['originalResponseStatus'] = result.response.statusCode
        this.scanResult.items[attackId]['originalResponseBody'] = result.response.body
        this.scanResult.items[attackId]['originalResponseHeaders'] = result.response.headers
        return Promise.resolve({ status: result.response.status, body: result.response.body, headers: result.response.headers })
    }

    async runAttack(schema, attack) {
        let request = new ptk_request()
        let decoder = new ptk_decoder()
        schema.request.followRedirect = true
        let item = {
            attack: attack,
            request: btoa(httpZ.build(schema.request)),
            baseUrl: schema.request.target,
            body: "",
            headers: "",
            failed: false
        }

        try {
            this.scanResult.stats.attacksCount++

            const result = await request.sendRequest(schema, false)
            //console.log(result)
            let body = result.response.body
            let headers = result.response.statusLine + '\r\n' + result.response.headers.map(x => { return x.name + ": " + x.value }).join('\r\n')
            item.body = body ? decoder.base64_encode(body) : ""
            item.headers = decoder.base64_encode(headers)
            item.responseStatus = result.response.statusCode
            item.statusText = result.response.statusLine
            item.redirected = result.redirected
            return item
        } catch (error) {
            console.log(error)
            ptk_logger.log(error, "Could not run an attack", "info")
            item.failed = true
            return item
        }
    }

}
