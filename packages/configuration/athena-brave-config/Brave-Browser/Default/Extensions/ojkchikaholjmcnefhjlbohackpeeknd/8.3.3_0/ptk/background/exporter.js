/* Author: Denis Podgurskii */

import { ptk_utils } from "./utils.js"

export class ptk_exporter {

    constructor(recording, settings) {
        this.items = recording.items
        this.request = recording.recordingRequests
        this.settings = settings
    }

    render() {
        if (this['render_' + this.settings.format]) return this['render_' + this.settings.format]()
        else throw 'No render methond for ' + this.settings.format
    }

    /* xml */
    render_xml() {
        let macro = '<?xml version="1.0"?>\r\n<MacroEventList>'
        let last = null
        let step = 0
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            if (this.settings.enable_extra_delay && last
                && last.eventTypeName != 'Delay' && item.eventTypeName != 'Delay'
                && item.csspath != last.csspath) {
                step++
                macro += this.renderDelay(step)
            }
            last = item
            step++
            macro += this.renderXmlEvent(item, step)
        }
        if (last?.eventTypeName != "Delay") {
            step++
            macro += this.renderDelay(step++)
        }
        macro += '\r\n</MacroEventList>'
        return macro
    }

    renderDelay(step) {
        let item = { "eventTypeName": "Delay", "data": "", "eventDuration": this.settings.min_duration, "windowIndex": 0 }
        return this.renderXmlEvent(item, step)
    }

    renderXmlEvent(item, step) {
        let eventTypeName = this.getXmlEventName(item.eventTypeName),
            data = this.getXmlEventData(item),
            path = this.getXPath(item),
            duration = item.eventDuration > this.settings.min_duration ? item.eventDuration : this.settings.min_duration,
            windowIndex = item.windowIndex

        return `
  <MacroEvent>
    <WindowIndex>${windowIndex}</WindowIndex>
    <EventType>${eventTypeName}</EventType>
    <EventTypeName>${item.eventTypeName}</EventTypeName>
    <UseEncryptedData>0</UseEncryptedData>
    <Data><![CDATA[${data}]]></Data>
    <EncryptedData></EncryptedData>
    <ElementPath><![CDATA[${path}]]></ElementPath>
    <Duration>${duration}</Duration>
    <Enable>1</Enable>
    <Optional>0</Optional>
    <Step>${step}</Step>
  </MacroEvent>`
    }

    getXmlEventName(eventTypeName) {
        let r = eventTypeName
        switch (eventTypeName) {
            case 'Click':
                r = "DriverClick"
                if (this.settings.event_type == "javascript") r = "Javascript"
                if (this.settings.event_type == "onclick") r = "OnClick"
                break
            case 'DblClick':
                r = "Javascript"
                break
            case 'SetValue':
                r = "DriverSetControlValue"
                if (this.settings.event_type == "javascript") r = "Javascript"
                if (this.settings.event_type == "onclick") r = "SetControlData"
                break
        }
        return r
    }

    getXmlEventData(item) {
        let r = item.data ? item.data : ""
        let path = ""
        if (item.eventTypeName == "DblClick") {
            path = this.settings.element_path == 'id' ? item.csspath : item.fullcsspath
            return this.javascriptDoubleClickEvent(path)
        }

        if (this.settings.event_type == 'javascript') {
            path = this.settings.element_path == 'id' ? item.csspath : item.fullcsspath
            switch (item.eventTypeName) {
                case "Click":
                    r = this.javascriptClickEvent(path)
                    break;
                case "SetValue":
                    r = this.javascriptSetControlValueEvent(item.data, path)
                    break
            }
        }
        return r
    }

    getXmlIframePath(item) {
        if (!item.frameInfo || Object.keys(item.frameInfo) < 1) return ""

        if (item.frameInfo?.id) return `//IFRAME[@id="${item.frameInfo.id}"]|||>xpath=`
        if (item.frameInfo?.name) return `//IFRAME[@name="${item.frameInfo.name}"]|||>xpath=`
        if (item.frameInfo?.title) return `//IFRAME[@title="${item.frameInfo.title}"]|||>xpath=`
        if (item.frameInfo?.src) return `//IFRAME[@src="${item.frameInfo.src}"]|||>xpath=`
    }

    getXPath(item) {
        let path = this.getXmlIframePath(item)
        if (this.settings.element_path == 'id' && item.xpath) path += item.xpath
        if (this.settings.element_path == 'fullpath' && item.fullxpath) path += item.fullxpath
        if (path) path = 'xpath=' + path

        if (this.settings.event_type == "javascript") path = ''
        return path
    }


    /* javascript */
    javascriptGetMacroItem(path, attrs) {
        let output = "";
        if (attrs.length > 0 && path == "") {
            if (attrs[0] == 'a') {
                output += `let item = Array.prototype.slice.call(document.querySelectorAll('ptk_ATTRNAME_ptk')).filter(function (el) { return el.textContent === 'ptk_ATTRVALUE_ptk'})[0];
                `.replace(/ptk_ATTRNAME_ptk/g, attrs[0]).replace(/ptk_ATTRVALUE_ptk/g, attrs[1]);;
            } else {
                path = '[' + attrs[0] + ' = "' + attrs[1] + '"]';
                output += `let item = document.querySelector('ptk_PATH_ptk'); `.replace(/ptk_PATH_ptk/g, path);
            }
        } else {
            output += `let item = document.querySelector(path); `

        }
        return output;
    }

    javascriptSetControlValueEvent(data, path, attrs = []) {
        let js = this.javascriptGetMacroItem(path, attrs)
        data = data.replaceAll(String.fromCharCode(92), String.fromCharCode(92, 92))
        data = data.replaceAll(String.fromCharCode(96), String.fromCharCode(92, 96))

        return `
    (function(path, data){
        ${js}
        let lastValue = item.value
        let event = new Event('input', {bubbles: true})
        event.simulated = true
        item.value = data
        item.defaultValue = data
        let tracker = item._valueTracker
        if (tracker) { tracker.setValue(lastValue) }
        item.dispatchEvent(event)
        item.dispatchEvent(new Event('change', {bubbles: true}))
        item.dispatchEvent(new Event('blur', {bubbles: true}))
        item.dispatchEvent(new Event('resize', {bubbles: true}))
    })('${path}', \`${data}\`)
    `
    }

    javascriptClickEvent(path, attrs = []) {
        let js = this.javascriptGetMacroItem(path, attrs)
        return `
    (function(path){
        ${js}
        item.click()
        item.dispatchEvent(new Event('resize', {bubbles: true}))
    })('${path}')
    `
    }

    javascriptDoubleClickEvent(path, attrs = []) {
        let js = this.javascriptGetMacroItem(path, attrs)
        return `
    (function(path){
        ${js}
        item.click()
        item.click()
        item.dispatchEvent(new Event('resize', {bubbles: true}))
    })('${path}')
    `
    }

    /* har */

    render_har() {
        let pages = [], entries = [], requestId = -1

        this.request.forEach(function (item) {
            if (item.type == "main_frame" && requestId != item.requestId) {
                pages.push(this.renderHarPage(item));
                requestId = item.requestId;
            }
            entries.push(this.renderHarEntry(item, requestId));
        }.bind(this))

        return JSON.stringify({
            "log": {
                "version": "1.2",
                "creator": {
                    "name": "PTK",
                    "version": "6.0.0"
                },
                pages: pages.reverse(),
                entries: entries
            }
        }, null, 4)
    }

    renderHarPage(item) {
        return {
            "startedDateTime": (new Date(item.request.timeStamp).toISOString()),
            "id": item.requestId,
            "title": item.request.url,
            "pageTimings": {
                "onContentLoad": item.timing?.domContentLoadedEventEnd ? item.timing.domContentLoadedEventEnd : -1,
                "onLoad": item.timing?.loadEventEnd ? item.timing.loadEventEnd : -1
            }
        }
    }

    renderHarEntry(item, requestId) {
        let requestHeaders = item.requestHeaders ? item.requestHeaders : [],
            responseHeaders = item.responseHeaders ? item.responseHeaders : []

        if (requestHeaders.filter(x => x.name.toLowerCase() == 'host').length == 0) {
            requestHeaders.push({ name: "Host", value: (new URL(item.request.url)).hostname })
        }

        let requestHeaderSize = requestHeaders.map(item => item.name + ": " + item.value).join('\r\n').length,
            responseHeaderSize = responseHeaders.map(item => item.name + ": " + item.value).join('\r\n').length

        let requestCookies = this.getEntryRequestCookies(requestHeaders)
        let [bodySize, postData] = this.getEntryPostData(item)

        let status = item.response.statusLine?.split(' ')
        let httpVersion = status ? status[0] : "HTTP/1.1"
        status?.splice(0, 1)
        let statusCode = status ? status[0] : ""
        status?.splice(0, 1)
        let statusText = status ? status.join(' ') : ""

        let mimeType = responseHeaders?.filter(x => x.name.toLowerCase() == 'content-type')[0]?.value

        let send = (item.timing?.requestStart - item.timing?.connectEnd)
        let wait = (item.timing?.responseStart - item.timing?.requestStart)
        let receive = (item.timing?.responseEnd - item.timing?.responseStart)


        var entry = {
            "startedDateTime": (new Date(item.request.timeStamp).toISOString()),
            "time": item.timing?.duration ? item.timing.duration : -1,
            "request": {
                "method": item.request.method,
                "url": item.request.url,
                "httpVersion": httpVersion,
                "headers": requestHeaders,
                "queryString": [],
                "cookies": requestCookies,
                "headersSize": requestHeaderSize,
                "bodySize": bodySize
            },
            "response": {
                "status": statusCode,
                "statusText": statusText,
                "httpVersion": httpVersion,
                "headers": responseHeaders,
                "cookies": [],
                "content": {
                    "size": item.response.body ? item.response.body.length : 0,
                    "mimeType": mimeType ? mimeType : "",
                    "compression": 0,
                    "text": item.response.body ? item.response.body : "",
                    "encoding": item.response.base64Encoded ? "base64" : ""
                },
                "redirectURL": item.redirectUrl ? item.redirectUrl : "",
                "headersSize": responseHeaderSize,
                "bodySize": item.response.body ? item.response.body.length : 0
            },
            "cache": {},
            "timings": {
                "send": send ? send : -1,
                "receive": receive ? receive : -1,
                "wait": wait ? wait : -1
            },
            "serverIPAddress": item.serverIPAddress ? item.serverIPAddress : "",
            "pageref": requestId
        };

        if (postData != null) {
            entry.request.postData = postData;
        }
        return entry
    }

    getEntryRequestCookies(requestHeaders) {
        let requestCookies = []
        if (requestHeaders.find(i => i.name == 'Cookie')) {
            requestHeaders.find(i => i.name == 'Cookie').value.split('; ').reduce(function (result, v, i, a) {
                var k = v.split('=');
                requestCookies.push({ "name": k[0], "value": k[1], "expires": null, "httpOnly": false, "secure": false });
            }, {})
        }
        return requestCookies
    }

    getEntryPostData(item) {
        let bodySize = 0, postData = null
        if (item.request.requestBody) {
            postData = {}
            postData.mimeType = item.requestHeaders?.filter(x => x.name.toLowerCase() == 'content-type')[0]?.value

            if (item.request.requestBody.formData) {
                let formData = item.request.requestBody.formData
                postData.text = Object.keys(formData).map(function (k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(formData[k])
                }).join('&')
                postData.params = Object.keys(formData).map(name => ({ name, value: encodeURIComponent(formData[name]) }))
                bodySize = postData.text.length
            } else if (item.request?.requestBody.postData) {
                postData.text = item.request.requestBody.postData
                bodySize = postData.text.length
            }
            // else if (item.request?.requestBody?.raw) {
            //     let arr = new Uint8Array(item.request.requestBody.raw[0].bytes)
            //     postData.text = String.fromCharCode.apply(String, arr)
            //     bodySize = postData.text.length
            // }
        }
        return [bodySize, postData]
    }

    /* side */

    render_side() {
        let macro = {}
        let url = null
        let items = []
        for (let i = 0; i < this.items.length; i++) {
            if (i == 0) url = new URL(this.items[i].data)
            items.push(this.renderSideCommands(this.items[i]))
        }

        return JSON.stringify(macro)
    }

    renderSideCommands(item) {
        let command = ''
        if (item.eventTypeName == 'Navigate') command = 'open'
        else if (item.eventTypeName == 'Click') command = 'click'
        else if (item.eventTypeName == 'SetValue') command = 'type'

        return {
            "id": ptk_utils.UUID(),
            "comment": "",
            "command": command,
            "target": item.csspath,
            "targets": [
                [item.csspath, "css:finder"],
                [item.xpath, "xpath:attributes"],
                [item.fullxpath, "xpath:position"],
            ],
            "value": item.data
        }
    }
}