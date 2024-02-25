/* Author: Denis Podgurskii */
import { ptk_request } from "./rbuilder.js"
import { ptk_utils, ptk_logger, ptk_queue, ptk_storage } from "../background/utils.js"

const worker = self

export class ptk_iast {

    constructor(settings) {
        this.settings = settings
        this.storageKey = "ptk_iast"
        this.scanResult = {}

    }

    async reset() {
        ptk_storage.setItem(this.storageKey, {})
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
        // if (this.scanResult?.tabId == tabId) this.scanResult.tabId = null
    }

    onCompleted(response) {
        // if (this.scanResult?.tabId == response.tabId && !this.settings.blacklist.includes(response.type)) {
        //     let r = worker.ptk_app.proxy.getRawRequest(worker.ptk_app.proxy.getTab(response.tabId), response.frameId, response.requestId)
        //     this.addRequest(r)
        // }
    }

    onMessage(message, sender, sendResponse) {
        if (message.channel == "ptk_popup2background_iast") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve({ result: false })
        }
    }

    async msg_init(message) {
        await this.init()
        return Promise.resolve({ scanResult: JSON.parse(JSON.stringify(this.scanResult)) })
    }



    start(tabId, host) {
        var debuggeeId = { tabId: tabId }
        chrome.debugger.attach(debuggeeId, "1.3", this.onAttach())
        //chrome.debugger.sendCommand(debuggeeId, "Debugger.enable", {}, this.onDebuggerEnabled.bind(null, debuggeeId))
        chrome.debugger.sendCommand(debuggeeId, "Page.enable", {}, this.onPageEnabled.bind(null, debuggeeId))

        // chrome.debugger.attach(debuggeeId, version, onAttach.bind(null, debuggeeId));
        // else if (attachedTabs[tabId])
        //     chrome.debugger.detach(debuggeeId, onDetach.bind(null, debuggeeId));
        this.addListeners()
    }

    stop(tabId) {
        var debuggeeId = { tabId: tabId }
        chrome.debugger.detach(debuggeeId)
        this.removeListeners()
    }

    onAttach(tabId) {
        this.onEvent = this.onEvent.bind(this)
        chrome.debugger.onEvent.addListener(this.onEvent)

        // this.onDebuggerEnabled = this.onDebuggerEnabled.bind(this)
        // chrome.debugger.onDebuggerEnabled.addListener(this.onDebuggerEnabled)

        // this.onPageEnabled = this.onPageEnabled.bind(this)
        // chrome.debugger.onPageEnabled.addListener(this.onPageEnabled)


        this.onDetach = this.onDetach.bind(this)
        chrome.debugger.onDetach.addListener(this.onDetach)
    }

    onDetach(source, reason) {
        chrome.debugger.onEvent.removeListener(this.onEvent)
        // chrome.debugger.onDebuggerEnabled.removeListener(this.onDebuggerEnabled)
        // chrome.debugger.onPageEnabled.removeListener(this.onPageEnabled)
        chrome.debugger.onDetach.removeListener(this.onDetach)
    }

    onDebuggerEnabled(debuggeeId) {

    }

    onPageEnabled(debuggeeId) {

        fetch(browser.runtime.getURL('ptk/content/iast_agent.js')).then(r => {
            r.text().then(source => {
                chrome.debugger.sendCommand(debuggeeId, "Page.addScriptToEvaluateOnNewDocument", {
                    source: source
                });
            })
          })


        // chrome.debugger.sendCommand(debuggeeId, "Page.addScriptToEvaluateOnNewDocument", {

        //     source: `
        //     console.log('ptk iast');

        //     var originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML")
        //     Object.defineProperty(Element.prototype, "innerHTML", {
        //         set: function(html){
        //             if(html.includes(document.location.hash)){
        //                 console.log("Assigning DANGER html", html)
        //                 console.log(new Error().stack)
        //             }
        //             return originalInnerHTMLDescriptor.set.apply(this, arguments)
        //         }
        //     })

        //     var originalEval = window.eval
        //     window.eval = function() {
        //         console.log("Eval", arguments)
        //         console.log(new Error().stack)
        //         return originalEval.apply(this, arguments);
        //       };


        //       var originalWrite = document.write;
	
        //       document.write = function( content ) {
        //         console.log("document.write", arguments)
        //         console.log(new Error().stack)
        //         return originalWrite.apply(this, arguments);
        //       };

        //     `
        // });

    }

    onEvent(debuggeeId, method, params) {
        var tabId = debuggeeId.tabId
        if (method.startsWith("Page")) {
            // console.log(method)
            // console.log(params)
        }
    }

    // onAttach(debuggeeId) {
    //     if (chrome.runtime.lastError) {
    //         alert(chrome.runtime.lastError.message);
    //         return;
    //     }

    //     var tabId = debuggeeId.tabId;
    //     attachedTabs[tabId] = "pausing";

    //     chrome.debugger.sendCommand(
    //         debuggeeId, "Debugger.enable", {},
    //         onDebuggerEnabled.bind(null, debuggeeId));

    //     chrome.debugger.sendCommand(
    //         debuggeeId, "DOM.enable", {},
    //         onDomEnabled.bind(null, debuggeeId));

    //     chrome.debugger.sendCommand(
    //         debuggeeId, "Page.enable", {},
    //         onPageEnabled.bind(null, debuggeeId));


    // }



}
