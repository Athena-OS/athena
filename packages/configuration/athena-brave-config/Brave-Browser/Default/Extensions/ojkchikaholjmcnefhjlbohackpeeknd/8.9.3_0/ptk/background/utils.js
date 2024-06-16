/* Author: Denis Podgurskii */
import * as jose from "../packages/jose/browser/index.js"
import CryptoES from "../packages/crypto-es/index.js"
import { ptk_decoder } from "./decoder.js"

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

    static jsonSetValueByPath(jsonData, path, value, add = false) {
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
            } else if (add) {
                if (i < (pathArray.length - 1)) {
                    jsonData[key] = {}
                    jsonData = jsonData[key]
                }
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

    static unescapeHtml(unsafe) {
        unsafe = unsafe
            .replaceAll("&lt;", /</)
            .replaceAll("&gt;", />/)
            .replaceAll("&quot;", /"/)
            .replaceAll("&#039;", /'/)
            .replaceAll("&amp;", /&/)
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
    static SPKI = "SPKI"
    static PKCS8 = "PKCS8"
    static JWK = "JWK"
    constructor() {
        this.jwtRegex = /(ey[a-zA-Z0-9_=]+)\.(ey[a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/
        this.sessionRegex = '(?:[^"]*token\s?\s?){1}","?([A-Za-z0-9-_]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+]*)"?'
        this.headersRegex = '(?:"authorization"),"(?:.+\s?)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.]*)"'
        this.storageRegex = '(?:"*token"\s?):\s?"?([A-Za-z0-9-_]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+]*)"?'

        this.cookiesRawRegex = /(?:[^"]*tokens?){1}\s?=\s?([A-Za-z0-9-_]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+]*)"?/
        this.headersRawRegex = /(?:authorization\:)(?:.+\s)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.]*)/
    }

    checkToken(token) {
        let r = new RegExp(this.jwtRegex, "g")
        //let jwtToken = token.match(new RegExp(this.jwtRegex, "g"))
        let jwtToken = r.exec(token)
        let decodedToken = ''
        if (jwtToken) {
            try {
                decodedToken = JSON.stringify(this.parseJwt(jwtToken[0]), null, 4)

            } catch (e) { }
        }
        return { jwtToken: jwtToken, decodedToken: decodedToken }
    }

    detectCertFormat(cert) {
        if (typeof cert == 'string') {
            if (cert.startsWith("-----BEGIN PUBLIC KEY-----")) return ptk_jwtHelper.SPKI
            if (cert.startsWith("-----BEGIN PRIVATE KEY-----")) return ptk_jwtHelper.PKCS8
            try {
                JSON.parse(cert)
                return ptk_jwtHelper.JWK
            } catch (e) {
                return null
            }
        }
        return null
        // else {

        // }
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
        let base64Url = token.split('.');
        if (base64Url.length == 3) {
            let header = decodeURIComponent(atob(base64Url[0].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''))
            let jsonPayload = decodeURIComponent(atob(base64Url[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return { "header": JSON.parse(header), "payload": JSON.parse(jsonPayload), "signature": base64Url[2] }
        }

        return JSON.parse(jsonPayload);
    }

    async generateConfusionAttacks(header, payload, secret) {
        let tokens = []
        let hObj = header
        let pObj = payload


        //ORIGINAL
        let m = secret
        let a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m))
        tokens.push(["", "ORIGINAL", a])

        if (m.length > 32) {
            a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m.substring(32)))
            tokens.push(["", "ORIGINAL_PKCS1", a])
        }


        //ADDITIONAL_LF
        m = secret + "\n"
        a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m))
        tokens.push(["", "ADDITIONAL_LF", a])

        if (m.length > 32) {
            a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m.substring(32)))
            tokens.push(["", "ADDITIONAL_LF_PKCS1", a])
        }

        //NO_HEADER_FOOTER
        m = secret.replace("-----BEGIN PUBLIC KEY-----\n", "").replaceAll("-----END PUBLIC KEY-----\\n?", "")
            .replace("-----BEGIN RSA PUBLIC KEY-----\n", "").replaceAll("-----END RSA PUBLIC KEY-----\\n?", "")
        a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m))
        tokens.push(["", "NO_HEADER_FOOTER", a])
        if (m.length > 32) {
            a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m.substring(32)))
            tokens.push(["", "NO_HEADER_FOOTER_PKCS1", a])
        }

        //NO_LF
        m = secret.replaceAll("\\r\\n|\\r|\\n", "")
        a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m))
        tokens.push(["", "NO_LF", a])
        if (m.length > 32) {
            a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m.substring(32)))
            tokens.push(["", "NO_LF_PKCS1", a])
        }

        //NO_HEADER_FOOTER_LF
        m = secret.replace("-----BEGIN PUBLIC KEY-----\n", "").replaceAll("-----END PUBLIC KEY-----\\n?", "")
            .replace("-----BEGIN RSA PUBLIC KEY-----\n", "").replaceAll("-----END RSA PUBLIC KEY-----\\n?", "")
            .replaceAll("\\r\\n|\\r|\\n", "")
        a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m))
        tokens.push(["", "NO_HEADER_FOOTER_LF", a])
        if (m.length > 32) {
            a = await new jose.SignJWT(pObj).setProtectedHeader(hObj).sign(new TextEncoder().encode(m.substring(32)))
            tokens.push(["", "NO_HEADER_FOOTER_LF_PKCS1", a])
        }



        return Promise.resolve(tokens)
    }

    async signToken(header, payload, secret, keys) {
        let hObj = JSON.parse(header)
        let pObj = JSON.parse(payload)
        const decoder = new ptk_decoder()

        if (hObj.alg.toLowerCase() == 'none') {
            return decoder.base64url_encode(header.replace(/\n/g, '')) + "." + decoder.base64url_encode(payload.replace(/\n/g, '')) + "."
        }
        else if (['HS256', 'HS384', 'HS512'].includes(hObj.alg)) {
            if (secret == "") {
                if (hObj.alg == 'HS256') {
                    let tH = CryptoES.enc.Base64.stringify(CryptoES.enc.Utf8.parse(JSON.stringify(hObj)))
                        .replace(/=/g, '')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                    let tP = CryptoES.enc.Base64.stringify(CryptoES.enc.Utf8.parse(JSON.stringify(pObj)))
                        .replace(/=/g, '')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                    let t = jose.base64url.encode(JSON.stringify(hObj)) + "." + jose.base64url.encode(JSON.stringify(pObj))

                    let hash = CryptoES.HmacSHA256(tH + "." + tP, '')
                    return (tH + "." + tP + "." + CryptoES.enc.Base64.stringify(hash))
                        .replace(/=/g, '')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                }
            } else {
                secret = new TextEncoder().encode(secret)
                return await new jose.SignJWT(pObj)
                    .setProtectedHeader(hObj)
                    .sign(secret)
            }
        } else {

            let format = this.detectCertFormat(keys['private'])
            let privateKey = null
            if (format == ptk_jwtHelper.PKCS8) {
                privateKey = await jose.importPKCS8(keys['private'], hObj.alg).catch(e => {
                    console.log(e)
                })
            } else if (format == ptk_jwtHelper.JWK) {
                privateKey = await jose.importJWK(JSON.parse(keys['private']), hObj.alg).catch(e => {
                    console.log(e)
                })
            }


            return await new jose.SignJWT(pObj)
                .setProtectedHeader(hObj)
                .sign(privateKey)

        }
    }
}

export class ptk_storage {

    static async setItem(key, value) {
        let obj = {}
        obj[key] = value
        return browser.storage.local.set(obj)
    }

    static async getItem(key) {
        return browser.storage.local.get(key).then(function (result) {
            let obj = {}
            if (result[key] && Object.keys(result[key]).length > 0)
                obj = result[key]
            return obj
        })
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

    static async deleteSessionRules() {
        if (!worker.isFirefox) {
            await chrome.declarativeNetRequest.getSessionRules((rules) => {
                let ids = []
                rules.forEach(x => { ids.push(x.id) })
                chrome.declarativeNetRequest.updateSessionRules({
                    removeRuleIds: ids
                })
            })
        }
    }

    static async deleteDynamicRules(ids) {
        if (!worker.isFirefox) {
            if (!ids) {
                await chrome.declarativeNetRequest.getDynamicRules((rules) => {
                    ids = []
                    rules.forEach(x => { ids.push(x.id) })
                })
            }
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ids
            })
        }
    }

    static async addSessionRule(schema, ruleId) {
        if (!worker.isFirefox) {
            let headers = []
            schema.request.headers.forEach((h) => {
                headers.push({ "header": h.name, "operation": "set", "value": h.value })
            })
            await chrome.declarativeNetRequest.updateSessionRules({
                addRules: [
                    {
                        "id": parseInt(ruleId),
                        "priority": 1,
                        "action": {
                            "type": "modifyHeaders",
                            "requestHeaders": headers
                        },
                        "condition": {
                            "domains": [chrome.runtime.id],
                            "urlFilter": schema.request.url,
                            "resourceTypes": ["xmlhttprequest"]
                        }
                    },
                ]
            })

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
