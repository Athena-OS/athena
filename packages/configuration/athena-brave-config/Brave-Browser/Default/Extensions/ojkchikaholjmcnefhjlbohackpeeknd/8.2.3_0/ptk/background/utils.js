/* Author: Denis Podgurskii */

/* Utils */
const worker = self

export class ptk_utils {
    constructor() { }

    static getOrigin(sender) {
        let origin = null, regex = RegExp('extension:\/\/' + browser.runtime.id)
        if (regex.test(sender.url) || (worker.isFirefox && sender.id === browser.runtime.id && sender.url.startsWith('moz-extension://'))) {
            origin = browser.runtime.id
        } else if (sender.url.startsWith("http")) {
            origin = (new URL(sender.url)).origin
        } else if (sender.url.startsWith("file:///")) {
            origin = sender.url
        }
        return origin
    }

    static isTrustedOrigin(sender) {
        return (sender.id === browser.runtime.id)
    }

    static jsonSetValueByPath(jsonData, path, value) {
        if (!(jsonData instanceof Object) || typeof (path) === "undefined") {
            throw "Not valid argument:jsonData:" + jsonData + ", path:" + path
        }
        let origData = jsonData
        path = path.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
        path = path.replace(/^\./, '');// strip a leading dot
        let pathArray = path.split('.')
        let i = 0
        do {
            let key = pathArray[i]
            if (key in jsonData) {
                if (i < (pathArray.length - 1)) jsonData = jsonData[key]
                else jsonData[key] = value
            }
            i++
        } while (i < pathArray.length)
        return origData
    }

    static jsonGetValueByPath(jsonData, path) {
        if (!(jsonData instanceof Object) || typeof (path) === "undefined") {
            throw "Not valid argument:jsonData:" + jsonData + ", path:" + path
        }
        let origData = jsonData
        path = path.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
        path = path.replace(/^\./, '');// strip a leading dot
        let pathArray = path.split('.')
        let i = 0
        do {
            let key = pathArray[i]
            if (key in jsonData) {
                if (i < (pathArray.length - 1)) jsonData = jsonData[key]
                else return jsonData[key]
            }
            i++
        } while (i < pathArray.length)
        return origData
    }

    static get requestFilters() {
        return ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]
    }

    static get extraInfoSpec() {
        return browser.runtime.getBrowserInfo ? [] : ["extraHeaders"]
    }

    static UUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    static attackId() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    static attackParamId(l = 12) {
        return Math.random().toString(36).slice(-l)
    }

    static isURL(url) {
        let regex = new RegExp(/^((http|https):\/\/){1}(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])?(:+[0-9]+)?([\/\?]{1}.*)?$/i)
        return regex.test(url)
    }

    static exclude(url) {
        if (url == 'chrome://newtab/' || url == 'about:newtab') return false
        let regex = new RegExp(/^(chrome:|about:|moz-extension:|chrome-extension:)/i)
        return regex.test(url)
    }

    static escapeHtml(unsafe) {
        unsafe = unsafe.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
        return unsafe
    }
}

/* Logger */
export class ptk_logger {
    constructor() { }

    static log(event, msg, level) {
        // if (window.ptk_debug || level == "error") {
        //     console.log(event)
        //     if (msg instanceof Array) {
        //         for (m in msg) {
        //             console.log(m + ": " + msg[m])
        //         }
        //     } else console.log(msg)
        //     console.log("Logged at: " + Date.now())
        // }
    }

}

/* Notifications -- manage browser notifications */
export class ptk_notifications {
    constructor() { }

    static clearAll() {
        browser.notifications.getAll().then(function (notifications) {
            if (notifications) {
                for (let key in notifications) {
                    browser.notifications.clear(key)
                }
            }
        })
    }

    static notify(title, message, clearAll = true) {
        if (clearAll) this.clearAll()
        browser.notifications.create(
            'PTK_notification', {
            type: 'basic',
            /*iconUrl: browser.runtime.getURL('browser/assets/images/icon.png'),*/
            title: title,
            message: message
        })
    }
}

/* Queue for R-Attacker */
export class ptk_queue {
    constructor(items = []) {
        this.items = items
    }

    isEmpty() {
        return (this.items.length === 0)
    }

    enqueue(item) {
        this.items.unshift(item)
    }

    dequeue() {
        return this.items.pop()
    }

    size() {
        return this.items.length
    }

    clear() {
        this.items = []
    }

    has(item) {
        return this.items.includes(item)
    }

}

/* JWT Helper class */
export class ptk_jwtHelper {
    constructor() {
        this.sessionRegex = '(?:[^"]*token\s?\s?){1}","?([A-Za-z0-9-_]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+]*)"?'
        this.headersRegex = '(?:"authorization"),"(?:.+\s?)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.]*)"'
        this.storageRegex = '(?:"*token"\s?):\s?"?([A-Za-z0-9-_]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+]*)"?'

        this.cookiesRawRegex = /(?:[^"]*tokens?){1}\s?=\s?([A-Za-z0-9-_]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+]*)"?/
        this.headersRawRegex = /(?:authorization\:)(?:.+\s)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.]*)/
    }

    checkJWT(item, regex) {
        let jwtToken = item.match(new RegExp(regex, "i", "g"))
        let decodedToken = ''
        if (jwtToken) {
            try {
                decodedToken = JSON.stringify(this.parseJwt(jwtToken[1]), null, 4)
            } catch (e) { }
        }
        return { jwtToken: jwtToken, decodedToken: decodedToken }
    }

    parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }
}

export class ptk_storage {

    static async setItem(key, value) {
        let obj = {}
        obj[key] = value
        return browser.storage.local.set(obj)
    }

    static async getItem(key) {
        // return new Promise((resolve, reject) => {
        //     try {
        return browser.storage.local.get(key).then(function (result) {
            let obj = {}
            if (result[key] && Object.keys(result[key]).length > 0)
                obj = result[key]
            return obj
            // resolve(obj)
        })
        //     } catch (ex) {
        //         console.log(ex)
        //         reject(ex)
        //     }
        // })
    }
}

// Mange manifest V3 declarativeNetRules
export class ptk_ruleManager {
    static declarativeNetRulesCounter = 0

    static resetSession() {
        if (!worker.isFirefox) {
            this.deleteSessionRules()
            this.declarativeNetRulesCounter = 0
        }
    }

    static getDynamicRules() {
        if (!worker.isFirefox) {
            return chrome.declarativeNetRequest.getDynamicRules((rules) => {
                console.log(rules)
            })
        }
        return []
    }

    static getSessionRules() {
        if (!worker.isFirefox) {
            return chrome.declarativeNetRequest.getSessionRules((rules) => {
                console.log(rules)
            })
        }
        return []
    }

    static async deleteSessionRules(ids) {
        if (!worker.isFirefox) {
            if (!ids) {
                chrome.declarativeNetRequest.getSessionRules((rules) => {
                    ids = []
                    rules.forEach(x => { ids.push(x.id) })
                })
            }
            await chrome.declarativeNetRequest.updateSessionRules({
                removeRuleIds: ids
            })
        }
    }

    static deleteDynamicRules(ids) {
        if (!worker.isFirefox) {
            if (!ids) {
                chrome.declarativeNetRequest.getDynamicRules((rules) => {
                    ids = []
                    rules.forEach(x => { ids.push(x.id) })
                })
            }
            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ids
            })
        }
    }

    static async addSessionRule(schema) {
        if (!worker.isFirefox) {
            let headers = []
            schema.request.headers.forEach((h) => {
                headers.push({ "header": h.name, "operation": "set", "value": h.value })
            })
            ptk_ruleManager.declarativeNetRulesCounter++
            let ruleId = ptk_ruleManager.declarativeNetRulesCounter
            //console.log('counter ' + ruleId)
            await chrome.declarativeNetRequest.updateSessionRules({
                addRules: [
                    {
                        "id": ruleId,
                        "priority": 1,
                        "action": {
                            "type": "modifyHeaders",
                            "requestHeaders": headers
                        },
                        "condition": {
                            "urlFilter": schema.request.target,
                            "resourceTypes": ["xmlhttprequest"]
                        }
                    },
                ]
            })
            //console.log('add rule ' + ruleId)
            return ruleId
        }
    }

    static removeSessionRule(id) {
        if (!worker.isFirefox) {
            try {
                //console.log('remove rule ' + id)
                chrome.declarativeNetRequest.updateSessionRules({
                    removeRuleIds: [id]
                })
            } catch (e) {
                console.log(e)
            }
        }
    }

}