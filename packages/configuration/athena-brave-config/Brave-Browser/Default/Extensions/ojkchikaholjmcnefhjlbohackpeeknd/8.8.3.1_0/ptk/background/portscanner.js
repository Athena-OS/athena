/* Author: Denis Podgurskii */
import { ptk_logger, ptk_utils, ptk_storage } from "./utils.js"

const worker = self

export class ptk_portscanner {
    constructor() {
        this.storageKey = "ptk_portscanner"
        this.storage = ptk_storage.getItem(this.storageKey)
        this.addMessageListiners()
    }


    addMessageListiners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {

        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_portscanner") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }


    async msg_init(message) {
        this.storage = await ptk_storage.getItem(this.storageKey)
        return Promise.resolve(Object.assign({}, this.storage, worker.ptk_app.proxy.activeTab))
    }

    async msg_reset(message) {
        this.storage = ptk_storage.setItem(this.storageKey, {})
        return Promise.resolve(Object.assign({}, worker.ptk_app.proxy.activeTab))
    }

    async msg_save(message) {
        this.storage = ptk_storage.setItem(this.storageKey, {target: message.target, ports: message.ports})
        return Promise.resolve(Object.assign({}, worker.ptk_app.proxy.activeTab))
    }

    async msg_scan(message) {
        let domain = message.domain
        let ports = message.ports
        for(let i =0; i < ports.length; i++){
            console.log(this.isPortOpen(domain, ports[i]))
        }

    }

    async isPortOpen(domain, portToScan, N = 30) {

        return new Promise((resolve, reject) => {
            var portIsOpen = 'unknown';

            var timePortImage = function (port) {
                return new Promise((resolve, reject) => {
                    var t0 = performance.now()
                    // a random appendix to the URL to prevent caching
                    var random = Math.random().toString().replace('0.', '').slice(0, 7)
                    var img = new Image;

                    img.onerror = function () {
                        var elapsed = (performance.now() - t0)
                        // close the socket before we return
                        resolve(parseFloat(elapsed.toFixed(3)))
                    }

                    img.src = "http://" + domain + ":" + port + '/' + random + '.png'
                })
            }

            const portClosed = 37857; // let's hope it's closed :D

            (async () => {
                var timingsOpen = [];
                var timingsClosed = [];
                for (var i = 0; i < N; i++) {
                    timingsOpen.push(await timePortImage(portToScan))
                    timingsClosed.push(await timePortImage(portClosed))
                }

                var sum = (arr) => arr.reduce((a, b) => a + b);
                var sumOpen = sum(timingsOpen);
                var sumClosed = sum(timingsClosed);
                var test1 = sumOpen >= (sumClosed * 1.3);
                var test2 = false;

                var m = 0;
                for (var i = 0; i <= N; i++) {
                    if (timingsOpen[i] > timingsClosed[i]) {
                        m++;
                    }
                }
                // 80% of timings of open port must be larger than closed ports
                test2 = (m >= Math.floor(0.8 * N));

                portIsOpen = test1 && test2;
                resolve([portIsOpen, m, sumOpen, sumClosed]);
            })();
        });

    }

}