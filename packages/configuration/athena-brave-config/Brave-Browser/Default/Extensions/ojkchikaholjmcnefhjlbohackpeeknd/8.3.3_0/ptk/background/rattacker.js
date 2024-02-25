/* Author: Denis Podgurskii */
import { ptk_module } from "../modules/module.js"
import { ptk_request } from "./rbuilder.js"
import { ptk_utils, ptk_logger, ptk_queue, ptk_storage, ptk_ruleManager } from "../background/utils.js"
import httpZ from "../packages/http-z/http-z.es6.js"
import { ptk_decoder } from "../background/decoder.js"

const worker = self



export class ptk_rattacker {

    constructor(settings) {
        this.settings = settings
        this.storageKey = "ptk_rattacker"
        this.resetScanResult()

        this.modules = []
        this.loadModules()

        this.addMessageListeners()
    }

    loadModules() {

        let self = this
        fetch(browser.runtime.getURL('ptk/modules/modules.json'))
            .then(response => response.json())
            .then(json => {
                Object.values(json.modules).forEach(module => {
                    self.modules.push(new ptk_module(module))
                })
            })
    }

    async init() {
        if (!this.isScanRunning) {
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
        this.scanResult = this.getScanResultSchema()
    }

    getScanResultSchema() {
        return {
            scanId: null,
            tabId: null,
            host: null,
            uniqueRequestQueue: new ptk_queue(),
            requestQueue: new ptk_queue(),
            items: [],
            attacks: [],
            original: [],
            stats: {
                vulnsCount: 0,
                high: 0,
                medium: 0,
                low: 0,
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

    msg_run_bg_scan(message) {
        this.runBackroungScan(message.tabId, message.host)
        return Promise.resolve({ isScanRunning: this.isScanRunning, scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
    }

    msg_stop_bg_scan(message) {
        this.stopBackroungScan()
        return Promise.resolve({ scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
    }

    runBackroungScan(tabId, host) {
        this.reset()
        this.isScanRunning = true
        this.scanResult.scanId = ptk_utils.UUID()
        this.scanResult.tabId = tabId
        this.scanResult.host = host
        this.scan()
        //this.iast = new ptk_iast()
        //this.iast.start(tabId)
        this.addListeners()
    }

    stopBackroungScan() {
        if (this.iast) this.iast.stop(this.scanResult.tabId)
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
        this.updateScanResult(null, data)
    }

    async scan() {
        //if (!this.scanResult.tabId) return
        if (!this.isScanRunning) return
        let ptkRequest = new ptk_request()

        while (this.scanResult.requestQueue.size()) {
            let item = this.scanResult.requestQueue.dequeue()
            let schema = ptkRequest.parseRawRequest({ request: item })
            schema.request.followRedirect = true
            let self = this
            this.scanRequest(schema).then(function (result) {

                self.updateScanResult(result, null)

                browser.runtime.sendMessage({
                    channel: "ptk_background2popup_rattacker",
                    type: "attack completed",
                    info: item,
                    scanResult: JSON.parse(JSON.stringify(self.scanResult))
                }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
            })
        }

        let self = this
        setTimeout(function () { self.scan() }, 1000)
    }

    updateScanResult(result, data) {
        if (result) {
            this.scanResult.items.push(result)
            this.scanResult.original.push(result.original)
            for (let i in result.attacks) {
                if (result.attacks[i].attack.unique || !this.scanResult.attacks.find(item => item.attack.id == result.attacks[i].attack.id)) {
                    this.scanResult.attacks.push(result.attacks[i])
                    this.scanResult.stats.attacksCount++
                    if (result.attacks[i].success) {
                        this.scanResult.stats.vulnsCount++
                        if (result.attacks[i].attack.severity == 'High') this.scanResult.stats.high++
                        if (result.attacks[i].attack.severity == 'Medium') this.scanResult.stats.medium++
                        if (result.attacks[i].attack.severity == 'Low') this.scanResult.stats.low++
                    }
                }
            }
        }
        if (data) {
            let keys = Object.keys(this.scanResult.items)
            for (let i = 0; i < keys.length; i++) {
                let item = this.scanResult.items[keys[i]]
                for (let j = 0; j < item.attacks.length; j++) {
                    if (data.attackValue.ptk == item.attacks[j].attack.options?.attackParamValue && !item.attacks[j].success) {
                        item.attacks[j].success = true
                        item.attacks[j].proof = 'Confirmed by code execution on ' + data.location + '. Attack parameter value is: ' + data.attackValue.ptk
                        this.scanResult.vulnsCount++
                    }
                }
            }
        }

        this.scanResult.stats = {
            vulnsCount: 0,
            high: 0,
            medium: 0,
            low: 0,
            attacksCount: 0
        }

        for (let i in this.scanResult.attacks) {
            this.scanResult.stats.attacksCount++
            if (this.scanResult.attacks[i].success) {
                this.scanResult.stats.vulnsCount++
                if (this.scanResult.attacks[i].attack.severity == 'High') this.scanResult.stats.high++
                if (this.scanResult.attacks[i].attack.severity == 'Medium') this.scanResult.stats.medium++
                if (this.scanResult.attacks[i].attack.severity == 'Low') this.scanResult.stats.low++
            }

        }

        ptk_storage.setItem(this.storageKey, this.scanResult)
    }

    async scanRequest(schema) {

        let original = await this.executeOriginal(schema)
        let result = { original: original, attacks: [], stats: { attacksCount: 0, vulnsCount: 0, high: 0, medium: 0, low: 0 } }
        if (!original) {
            return result
        }

        let promises = []
        for (let key in this.modules) {
            let _schema = JSON.parse(JSON.stringify(schema))
            let module = this.modules[key]
            for (let attackIndex in module.attacks) {
                let attack = JSON.parse(JSON.stringify(module.attacks[attackIndex]))
                if (!attack.unique) attack.unique = module.unique
                if (!attack.severity) attack.severity = module.severity
                if (attack.conditions) {
                    if (!module.validateAttackConditions(_schema, attack.conditions, original)) continue
                }

                if (module.type == 'active') {
                    attack = module.prepareAttack(attack, ptk_utils.attackParamId())
                    console.log(attack)
                    let attackRequests = module.buildAttacks(_schema, attack)
                    for (let i in attackRequests) {
                        //await new Promise((resolve) => setTimeout(resolve, 100))
                        promises.push(await this.activeAttack(attackRequests[i], original, attack, module))
                    }
                }
                else if (module.type == 'passive') {
                    promises.push(await this.passiveAttack(original, attack, module))
                }
            }

        }

        for (let p in promises) {
            let executed = promises[p]
            result.attacks = result.attacks.concat(executed.attacks)
            result.stats.attacksCount += executed.stats.attacksCount
            result.stats.vulnsCount += executed.stats.vulnsCount
            for (let j in executed.attacks) {
                if (executed.attacks[j].success) {
                    if (executed.attacks[j].attack.severity == 'High') result.stats.high++
                    if (executed.attacks[j].attack.severity == 'Medium') result.stats.medium++
                    if (executed.attacks[j].attack.severity == 'Low') result.stats.low++
                }
            }
        }
        console.log(result)
        return result
    }

    async passiveAttack(original, attack, module) {
        let result = { attacks: [], stats: { attacksCount: 0, vulnsCount: 0 } }
        let res = module.validateAttack(null, attack.validation, original)
        if (res.success) {
            result.stats.attacksCount++
            result.stats.vulnsCount++
            result.attacks.push(Object.assign(JSON.parse(JSON.stringify(original)), { attack: JSON.parse(JSON.stringify(attack)), baseUrl: original.request.target }, res))
        }
        return result
    }

    async activeAttack(schema, original, attack, module) {
        let result = { attacks: [], stats: { attacksCount: 0, vulnsCount: 0 } }
        try {
            result.stats.attacksCount++
            let request = new ptk_request()
            let item = await request.sendRequest(schema)

            // console.log(attack)
            // console.log(item)
            let res = module.validateAttack(item, attack.validation, original)
            if (res.success) result.stats.vulnsCount++
            result.attacks.push(Object.assign(item, { attack: JSON.parse(JSON.stringify(attack)), baseUrl: original.request.target }, res))
            return result

        } catch (error) {
            console.log(error)
            ptk_logger.log(error, "Could not run an attack", "info")
        }

        return result
    }

    async executeOriginal(schema) {
        let _schema = JSON.parse(JSON.stringify(schema))
        let request = new ptk_request()
        _schema.request.followRedirect = true
        _schema.request.overwriteHeaders = true
        return Promise.resolve(request.sendRequest(_schema))
    }

}
