/* Author: Denis Podgurskii */
import { ptk_module } from "../modules/module.js"
import { ptk_request } from "./rbuilder.js"
import { ptk_utils, ptk_logger, ptk_queue, ptk_storage, ptk_ruleManager } from "../background/utils.js"

const worker = self

export class ptk_rattacker {

    constructor(settings) {
        this.settings = settings
        this.storageKey = "ptk_rattacker"
        this.resetScanResult()

        this.modules = []
        this.pro_modules = []
        this.custom_modules = []

        this.loadModules()
        this.loadProModules()

        this.addMessageListeners()
    }


    async loadModules() {

        let self = this
        await fetch(browser.runtime.getURL('ptk/modules/modules.json'))
            .then(response => response.json())
            .then(json => {
                Object.values(json.modules).forEach(module => {
                    self.modules.push(new ptk_module(module))
                })
            })
    }

    async loadProModules() {
        // let self = this
        // this.pro_modules = []
        // let apiKey = worker.ptk_app?.settings?.profile?.api_key
        // let url = worker.ptk_app.settings.profile.api_url + worker.ptk_app.settings.profile.attacks_endpoint
        // if (apiKey) {
        //     return await fetch(url, { headers: { 'Authorization': apiKey }, cache: "no-cache" })
        //         .then(response => response.json())
        //         .then(json => {
        //             let modules = JSON.parse(json.rules.modules.json).modules
        //             Object.values(modules).forEach(module => {
        //                 self.pro_modules.push(new ptk_module(module))
        //             })
        //         }).catch(e => {
        //             console.log(e)
        //             return { "success": false, "json": { "message": e.message } }
        //         })
        // }
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
            date: new Date().toISOString(),
            tabId: null,
            host: null,
            uniqueRequestQueue: new ptk_queue(),
            requestQueue: new ptk_queue(),
            items: [],
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
        this.loadProModules()
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

    isLegalUrl(url) {
        let u = new URL(url)
        if (u.host.includes(this.scanResult?.host)) return true
        if (this.scanResult?.domains.length > 0) {
            for (let i = 0; i < this.scanResult?.domains.length; i++) {
                if (u.host.includes(this.scanResult?.domains[i])) return true
            }
        }
        return false
    }

    parseDomains(domains) {
        let d = []
        domains.split(",").forEach(function (item) {
            if (item.startsWith('*')) {
                d.push(item.replace('*.', ''))
            }
            else {
                d.push(item)
            }
        })
        return d
    }

    onCompleted(response) {
        //if (this.scanResult?.tabId == response.tabId) {
        let s = new URL(response.url)
        //if (s.host.includes(this.scanResult?.host)) {
        if (this.isLegalUrl(response.url)) {
            if (!this.settings.blacklist.includes(response.type) || s.search) {
                try {
                    let r = worker.ptk_app.proxy.getRawRequest(worker.ptk_app.proxy.getTab(response.tabId), response.frameId, response.requestId)
                    this.addRequest(r)
                } catch (e) { }
            }
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
                let result = { attacks: this.scanResult.attacks, stats: this.scanResult.stats }
                return Promise.resolve({ scanResult: JSON.parse(JSON.stringify(result)) })
            }
        }
    }

    async msg_init(message) {
        await this.init()
        return Promise.resolve({
            scanResult: JSON.parse(JSON.stringify(this.scanResult)),
            isScanRunning: this.isScanRunning,
            default_modules: JSON.parse(JSON.stringify(this.modules)),
            activeTab: worker.ptk_app.proxy.activeTab
        })
    }

    async msg_check_apikey(message) {
        let self = this
        let url = worker.ptk_app.settings.profile.api_url + worker.ptk_app.settings.profile.attacks_endpoint
        let response = await fetch(url, { headers: { 'Authorization': message.key }, cache: "no-cache" })
            .then(response => response.text())
            .then(text => {
                try {
                    return JSON.parse(text)
                } catch (err) {
                    return { "success": false, "json": { "message": text } }
                }
            }).catch(e => {
                return { "success": false, "json": { "message": e.message } }
            })
        return response
    }

    async msg_save_report(message) {
        let apiKey = worker.ptk_app.settings.profile?.api_key
        if (apiKey && Object.keys(this.scanResult?.items)) {
            let url = worker.ptk_app.settings.profile.api_url + worker.ptk_app.settings.profile.storage_endpoint
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    'Authorization': apiKey,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                cache: "no-cache",
                body: JSON.stringify(this.scanResult)
            })
                .then(response => {
                    if (response.status == 201)
                        return { "success": true }
                    else {
                        return response.json().then(json => {
                            return { "success": false, json }
                        })
                    }
                })
                .catch(e => { return { "success": false, "json": { "message": "Error while saving report: " + e.message } } })
            return response
        } else {
            return { "success": false, "json": { "message": "No API key found" } }
        }
    }

    async msg_download_scans(message) {
        let apiKey = worker.ptk_app.settings.profile?.api_key
        if (apiKey) {
            let url = worker.ptk_app.settings.profile.api_url + worker.ptk_app.settings.profile.scans_endpoint
            let response = await fetch(url, {
                headers: {
                    'Authorization': apiKey,
                },
                cache: "no-cache"
            })
                .then(response => response.json())
                .then(json => {
                    return { "success": true, json }
                }).catch(e => {
                    return { "success": false, "json": { "message": e.message } }
                })
            return response
        } else return { "success": false, "json": { "message": "No API key found" } }
    }

    async msg_download_scan_by_id(message) {
        let apiKey = worker.ptk_app.settings.profile?.api_key
        if (apiKey) {
            let url = worker.ptk_app.settings.profile.api_url + worker.ptk_app.settings.profile.scans_endpoint + "/" + message.scanId
            let response = await fetch(url, {
                headers: {
                    'Authorization': apiKey,
                },
                cache: "no-cache"
            })
                .then(response => response.json())
                .then(json => {
                    ptk_storage.setItem(this.storageKey, json)
                    return json
                }).catch(e => e)
            return response
        }
    }

    async msg_delete_scan_by_id(message) {
        let apiKey = worker.ptk_app.settings.profile?.api_key
        if (apiKey) {
            let url = worker.ptk_app.settings.profile.api_url + worker.ptk_app.settings.profile.storage_endpoint + "/" + message.scanId
            let response = await fetch(url, {
                method: "DELETE",
                headers: {
                    'Authorization': apiKey,
                },
                cache: "no-cache"
            })
                .then(response => response.json())
                .then(json => {
                    this.scanResult = json
                    return json
                }).catch(e => e)
            return response
        }
    }

    msg_reset(message) {
        this.reset()
        return Promise.resolve({
            scanResult: JSON.parse(JSON.stringify(this.scanResult)),
            default_modules: JSON.parse(JSON.stringify(this.modules)),
            activeTab: worker.ptk_app.proxy.activeTab
        })
    }

    async msg_loadfile(message) {
        this.reset()
        //await this.init()

        return new Promise((resolve, reject) => {
            var fr = new FileReader()
            fr.onload = () => {

                resolve(this.msg_save(fr.result))
            }
            fr.onerror = reject
            fr.readAsText(message.file)
        })


        var fileReader = new FileReader()
        fileReader.onload = function () {
            //var data = fileReader.result
            $("#import_scan_json").val(fileReader.result)
            $('.import_scan_text_btn').trigger("click")
        }
        fileReader.readAsText(message.file)
        return Promise.resolve({
            scanResult: JSON.parse(JSON.stringify(this.scanResult)),
            isScanRunning: this.isScanRunning,
            default_modules: JSON.parse(JSON.stringify(this.modules)),
            activeTab: worker.ptk_app.proxy.activeTab
        })
    }

    async msg_save(message) {
        this.reset()
        ptk_storage.setItem(this.storageKey, JSON.parse(message.json))
        await this.init()
        return Promise.resolve({
            scanResult: JSON.parse(JSON.stringify(this.scanResult)),
            isScanRunning: this.isScanRunning,
            default_modules: JSON.parse(JSON.stringify(this.modules)),
            activeTab: worker.ptk_app.proxy.activeTab
        })
    }

    msg_run_bg_scan(message) {
        this.runBackroungScan(message.tabId, message.host, message.domains)
        return Promise.resolve({ isScanRunning: this.isScanRunning, scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
    }

    msg_stop_bg_scan(message) {
        this.stopBackroungScan()
        return Promise.resolve({ scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
    }

    runBackroungScan(tabId, host, domains) {
        this.reset()
        this.isScanRunning = true
        this.scanningRequest = false
        this.scanResult.scanId = ptk_utils.UUID()
        this.scanResult.tabId = tabId
        this.scanResult.host = host
        this.scanResult.domains = this.parseDomains(domains)
        this.scan()
        // this.iast = new ptk_iast()
        // this.iast.start(tabId)
        this.addListeners()
    }

    stopBackroungScan() {
        //if (this.iast) this.iast.stop(this.scanResult.tabId)
        this.isScanRunning = false
        this.scanResult.tabId = null
        this.scanResult.requestQueue.clear()
        this.scanResult.uniqueRequestQueue.clear()
        ptk_storage.setItem(this.storageKey, this.scanResult)
        this.removeListeners()
    }

    addRequest(item) {
        let url = item.split('\n')[0]
        if (!this.scanResult.uniqueRequestQueue.has(url)) {
            //console.log(url)
            this.scanResult.uniqueRequestQueue.enqueue(url)
            this.scanResult.requestQueue.enqueue(item)
        }
    }

    checkConfirmedAttack(data) {
        this.updateScanResult(null, data)
    }

    updateScanResult(result, data) {
        if (result) {
            this.scanResult.items.push(result)
        }

        this.scanResult.stats = {
            vulnsCount: 0,
            high: 0,
            medium: 0,
            low: 0,
            attacksCount: 0
        }

        for (let r in this.scanResult.items) {
            let item = this.scanResult.items[r]

            if (data) {
                let i = item.attacks.findIndex(a => (a.metadata.action?.random == data.attackValue.ptk && !a.success))
                if (i > -1) {
                    item.attacks[i].success = true
                    item.attacks[i].proof = 'Confirmed by code execution on ' + data.location + '. Attack parameter value is: ' + data.attackValue.ptk
                }
            }

            for (let i in item.attacks) {
                this.scanResult.stats.attacksCount++
                if (item.attacks[i].success) {
                    this.scanResult.stats.vulnsCount++
                    if (item.attacks[i].metadata.severity == 'High') this.scanResult.stats.high++
                    if (item.attacks[i].metadata.severity == 'Medium') this.scanResult.stats.medium++
                    if (item.attacks[i].metadata.severity == 'Low') this.scanResult.stats.low++
                }

            }
        }

        ptk_storage.setItem(this.storageKey, this.scanResult)
    }

    async scan() {
        //if (!this.scanResult.tabId) return
        if (!this.isScanRunning) return
        let self = this

        if (this.scanResult.requestQueue.size() /*&& self.scanningRequest == false*/) {
            //await new Promise(resolve => { setTimeout(resolve, 100) })
            let item = this.scanResult.requestQueue.dequeue()
            //console.log(item)
            self.scanningRequest = true
            this.scanRequest(item).then(function (result) {
                //console.log(result)
                self.updateScanResult(result, null)

                browser.runtime.sendMessage({
                    channel: "ptk_background2popup_rattacker",
                    type: "all attacks completed",
                    info: item,
                    scanResult: JSON.parse(JSON.stringify(self.scanResult))
                }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
                // self.scanningRequest = false
                // self.scan()
            })
        }
        setTimeout(function () { self.scan() }, 200)
    }

    async scanRequest(raw) {
        let schema = ptk_request.parseRawRequest(raw)
        let original = await this.executeOriginal(schema)
        let result = { original: original, attacks: [], stats: { attacksCount: 0, vulnsCount: 0, high: 0, medium: 0, low: 0 } }
        if (!original) {
            return result
        }

        return this.runAttacks(original)
            .then((value) => {
                for (let i = 0; i < value.attacks.length; i++) {
                    let attack = value.attacks[i]
                    result.attacks.push(attack)
                    result.stats.attacksCount++
                    if (attack.success) {
                        result.stats.vulnsCount++
                        if (attack.metadata.severity == 'High') result.stats.high++
                        if (attack.metadata.severity == 'Medium') result.stats.medium++
                        if (attack.metadata.severity == 'Low') result.stats.low++
                    }
                }
                return result
            })
    }

    async runAttacks(original) {
        let result = { attacks: [] }
        if (!original) {
            return result
        }

        let promises = []
        let modules = [...this.modules, ...this.pro_modules]
        for (let key in modules) {
            let module = modules[key]

            module.executed = []

            for (let attackIndex in module.attacks) {
                let attack = module.prepareAttack(module.attacks[attackIndex])
                if (attack.condition) {
                    let _a = { "metadata": Object.assign({}, attack, module.metadata) }
                    if (!module.validateAttackConditions(_a, original)) continue
                }

                if (module.type == 'active') {
                    let _schema = ptk_request.parseRawRequest(original.request.raw, attack.action.options)
                    let attackRequests = module.buildAttacks(_schema, attack)

                    for (let i in attackRequests) {
                        //attackRequests[i].request.target += attackRequests[i].request.queryParams.length > 0 ? "" : "?" + "&ptk_attack=" + attack.id
                        let _s = ptk_request.updateRawRequest(attackRequests[i], null, attack.action.options)
                        _s.metadata = Object.assign({}, module.metadata, attack)

                        //if (module.async == false) {
                        let executed = await this.activeAttack(_s)
                        if (executed) {
                            module.executed.push(executed)

                            //only attacks with validation count
                            if (attack.validation) {
                                let res = module.validateAttack(executed, original)
                                result.attacks.push(Object.assign(executed, res))
                            }
                        }

                        // } else if (module.async == true) {
                        //     await new Promise(resolve => { setTimeout(resolve, 150) })
                        //     this.activeAttack(_s).then(executed => {
                        //         if (executed) {
                        //             module.executed.push(executed)

                        //             //only attacks with validation count
                        //             if (attack.validation) {
                        //                 let res = module.validateAttack(executed, original)
                        //                 result.attacks.push(Object.assign(executed, res))
                        //             }
                        //         }
                        //     })
                        // }
                    }
                } else if (module.type == 'passive') {
                    let _s = { "metadata": Object.assign({}, attack, module.metadata) }
                    let res = module.validateAttack(_s, original) //this.passiveAttack(attack, original, module)
                    if (res.success) {
                        result.attacks.push(Object.assign(_s, res))
                    }
                }
                let self = this

                browser.runtime.sendMessage({
                    channel: "ptk_background2popup_rattacker",
                    type: "attack completed",
                    info: attack,
                    scanResult: JSON.parse(JSON.stringify(self.scanResult))
                }).catch(e => ptk_logger.log(e, "Could not send a message", "info"))
            }

        }
        // let attacks = await this.getAllPromises(promises, original)
        // attacks.map(item => {
        //     result.attacks.push(item)
        // })

        // promises = []

        return result

    }

    async getAllPromises(promises, original) {
        let module = new ptk_module({})
        let attacks = []
        return Promise.allSettled(promises).then((values) => {
            for (let i in values) {
                if (values[i].value) {
                    let res = module.validateAttack(values[i].value, original)
                    attacks.push(Object.assign(values[i].value, res))
                }
            }
            return attacks
        })
    }



    // async scanAsyncAttacks(original) {
    //     let asyncAttacks = []
    //     this.modules.map(item => {
    //         if (item.type == 'active' && item.async == true) {
    //             asyncAttacks = asyncAttacks.concat(item.attacks.map(a => {
    //                 a.metadata = item.metadata
    //                 return a
    //             }))
    //         }
    //     })

    //     let module = new ptk_module({})
    //     let promises = []
    //     let requestCount = 0
    //     for (let attackIndex in asyncAttacks) {
    //         let attack = module.prepareAttack(asyncAttacks[attackIndex])
    //         if (attack.condition) {
    //             let _a = { "metadata": Object.assign({}, attack, module.metadata) }
    //             if (!module.validateAttackConditions(_a, original)) continue
    //         }
    //         let _schema = ptk_request.parseRawRequest(original.request.raw, attack.action.options)
    //         let attackRequests = module.buildAttacks(_schema, attack)
    //         for (let i in attackRequests) {
    //             await new Promise(resolve => { setTimeout(resolve, 150) })
    //             let _s = ptk_request.updateRawRequest(attackRequests[i], null, attack.action.options)
    //             _s.metadata = Object.assign({}, attack, module.metadata)
    //             promises.push(this.activeAttack(_s))
    //             requestCount++
    //             if (requestCount > 5) {
    //                 await new Promise(resolve => { setTimeout(resolve, 1500) })
    //                 requestCount = 0
    //             }
    //         }

    //     }
    //     return Promise.allSettled(promises).then((values) => {
    //         let result = { attacks: [] }
    //         for (let i in values) {
    //             if (values[i].value) {
    //                 let res = module.validateAttack(values[i].value, original)
    //                 result.attacks.push(Object.assign(values[i].value, res))
    //             }
    //         }
    //         return result
    //     })
    // }

    // async scanSyncAttacks(original) {
    //     let result = { attacks: [] }
    //     if (!original) {
    //         return result
    //     }

    //     for (let key in this.modules) {
    //         let module = this.modules[key]
    //         if (module.type == 'active' && module.async == false) {
    //             module.executed = []

    //             for (let attackIndex in module.attacks) {
    //                 let attack = module.prepareAttack(module.attacks[attackIndex])
    //                 if (attack.condition) {
    //                     let _a = { "metadata": Object.assign({}, attack, module.metadata) }
    //                     if (!module.validateAttackConditions(_a, original)) continue
    //                 }

    //                 let _schema = ptk_request.parseRawRequest(original.request.raw, attack.action.options)
    //                 let attackRequests = module.buildAttacks(_schema, attack)

    //                 for (let i in attackRequests) {
    //                     let _s = ptk_request.updateRawRequest(attackRequests[i], null, attack.action.options)
    //                     _s.metadata = Object.assign({}, attack, module.metadata)
    //                     let executed = await this.activeAttack(_s)
    //                     if (executed) {
    //                         module.executed.push(executed)

    //                         //only attacks with validation count
    //                         if (attack.validation) {
    //                             let res = module.validateAttack(executed, original)
    //                             result.attacks.push(Object.assign(executed, res))
    //                         }
    //                     }

    //                 }
    //             }
    //         }
    //     }
    //     return result
    // }


    // async scanRequestOld(raw) {
    //     let schema = ptk_request.parseRawRequest(raw)
    //     let original = await this.executeOriginal(schema)
    //     let result = { original: original, attacks: [], stats: { attacksCount: 0, vulnsCount: 0, high: 0, medium: 0, low: 0 } }
    //     if (!original) {
    //         return result
    //     }

    //     for (let key in this.modules) {
    //         let module = this.modules[key]
    //         module.executed = []

    //         for (let attackIndex in module.attacks) {
    //             let attack = module.prepareAttack(JSON.parse(JSON.stringify(module.attacks[attackIndex])))

    //             if (attack.condition) {
    //                 if (!module.validateAttackConditions(attack.condition, original)) continue
    //             }

    //             if (module.type == 'active') {
    //                 let _schema = ptk_request.parseRawRequest(raw, attack.action.options)
    //                 let attackRequests = module.buildAttacks(_schema, attack)
    //                 for (let i in attackRequests) {
    //                     try {
    //                         ptk_request.normalizeHeaders(attackRequests[i], attack.action.options)
    //                         let executed = await this.activeAttack(attackRequests[i])

    //                         module.executed.push(executed)
    //                         //only attacks with validation count
    //                         if (attack.validation) {
    //                             result.stats.attacksCount++

    //                             executed = Object.assign(executed, JSON.parse(JSON.stringify(attack)), { baseUrl: original.request.target })
    //                             let res = module.validateAttack(executed, original)
    //                             if (res.success) result.stats.vulnsCount++

    //                             result.attacks.push(Object.assign(executed, res))
    //                         }
    //                     } catch (e) {
    //                         console.log(e)
    //                     }
    //                     //await new Promise(resolve => { setTimeout(resolve, 500) })
    //                     //promises.push(result)
    //                 }
    //             }
    //             else if (module.type == 'passive') {
    //                 //promises.push(await this.passiveAttack(original, attack, module))
    //                 let res = await this.passiveAttack(attack, original, module)
    //                 if (res.success) {
    //                     result.stats.attacksCount++
    //                     result.stats.vulnsCount++
    //                     result.attacks.push(Object.assign(JSON.parse(JSON.stringify(original)), JSON.parse(JSON.stringify(attack)), { baseUrl: original.request.target }, res))
    //                 }
    //             }

    //         }
    //         module.executed = []
    //     }

    //     for (let p in result.attacks) {
    //         let executed = result.attacks[p]
    //         if (executed.success) {
    //             if (executed.severity == 'High') result.stats.high++
    //             if (executed.severity == 'Medium') result.stats.medium++
    //             if (executed.severity == 'Low') result.stats.low++
    //         }
    //     }
    //     return result
    // }

    passiveAttack(attack, original, module) {
        return module.validateAttack(attack, original)
    }

    async activeAttack(schema) {

        try {
            let request = new ptk_request()
            return request.sendRequest(schema)
        } catch (error) {
            ptk_logger.log(error, "Could not run an attack", "info")
        }

    }

    async executeOriginal(schema) {
        let _schema = JSON.parse(JSON.stringify(schema))
        let request = new ptk_request()
        _schema.opts.override_headers = false
        _schema.opts.follow_redirect = true
        return Promise.resolve(request.sendRequest(_schema))
    }

}