/* Author: Denis Podgurskii */

(function () {
    if (window.ptk_replayer || typeof browser === typeof undefined) return

    let isIframe = false
    try {
        isIframe = window.self !== window.top
    } catch (e) {
        isIframe = true
    }

    let windowIndex = window.opener ? 1 : 0

    if (isIframe)
        windowIndex = window.top.opener ? 1 : 0


    class ptk_replayer {
        constructor() {
            browser.storage.local.get([
                'ptk_replay',
                'ptk_replay_items',
                'ptk_replay_step',
                'ptk_replay_regex',
                'ptk_recording_log']).then(function (result) {
                    if (result.ptk_replay_step == -1) return
                    this.items = result.ptk_replay_items
                    this.step = result.ptk_replay_step
                    this.regex = result.ptk_replay_regex
                    this.paused = false
                    this.forward = false
                    this.log = result.ptk_recording_log


                    if (!isIframe && !windowIndex) {
                        this.start()
                    } else if (!isIframe && windowIndex) {
                        window.opener.postMessage({ channel: "child2opener", message: 'init' }, '*')
                    }
                }.bind(this))
        }

        logEvent(item, msg) {
            if (item) {
                let eventName = (item.EventType == 'Javascript') ? item.EventType + '(' + item.EventTypeName + ')' : item.EventType
                this.log += 'Step #' + (this.step + 1) + ': ' + eventName + '<br/>'
            }
            if (msg) {
                this.log += msg + '<br/>'
            }
            browser.storage.local.set({
                'ptk_recording_log': this.log
            })
        }

        wait(ms, opts = {}) {
            return new Promise((resolve, reject) => {
                let timerId = setTimeout(resolve, ms)
                if (opts.signal) {
                    opts.signal.addEventListener('abort', event => {
                        clearTimeout(timerId)
                        reject(event)
                    })
                }
            })
        }

        validate() {
            if (this.regex && this.step > 0) {
                var regex = new RegExp(this.regex, 'i')
                if (regex.test(document.body.innerHTML)) {
                    var str = regex.exec(document.body.innerHTML)
                    this.logEvent(null, 'Regex successfully match: ' + str[0])
                    alert('Successfully match: ' + str[0])
                } else {
                    this.logEvent(null, 'Regex match not found')
                    alert('Match not found')
                }
            }
        }

        execute(item) {
            let frames = document.getElementsByTagName('iframe')
            if (!isIframe && item.WindowIndex == windowIndex) {
                if (item.ElementPath.includes('//IFRAME')) {
                    this.executeFrame(item)
                } else {
                    this.doStep(this.step, item)
                }
            } else if (!isIframe && this.childWindow) {
                this.childWindow.postMessage({ channel: "2child", message: 'doStep', step: this.step, item: item }, '*')
            }
        }

        executeFrame(item){
            let frames = document.getElementsByTagName('iframe')
            let [eventIframeName, xpath] = item.ElementPath.split('|||>')
            let frameIndex = this.getFrameIndex(eventIframeName)
            item.ElementPath = xpath.replace('xpath=', '')
            frames[frameIndex].contentWindow.postMessage({ channel: "2frame", message: 'doStep', step: this.step, item: item }, '*')
        }

        getFrameIndex(eventIframeName) {
            let frames = document.getElementsByTagName('iframe')
            let [framePattern, frameName] = eventIframeName.replace('xpath=//IFRAME[@','').replace(']','').replaceAll('"','').split('=')
            for (var i = 0; i < frames.length; i++) {
                if(frames[i][framePattern] == frameName)
                return i
            }
        }

        async start() {
            if (this.step > -1) {
                while (this.step < this.items.length) {
                    let item = this.items[this.step]

                    this.logEvent(item)
                    browser.storage.local.set({ 'ptk_replay_step': (this.step + 1) })

                    this.abortController = new AbortController()
                    this.awaitTimeout = this.wait(item.Duration, { signal: this.abortController.signal }).catch(e => console.log(e))
                    await this.awaitTimeout

                    if (this.paused) break

                    this.step++

                    if (this.forward) {
                        this.forward = false
                        continue
                    }

                    this.execute(item)
                }
                if (this.step == this.items.length) {
                    this.validate()
                }
            }
            if (!this.paused) this.stop()
        }

        stop() {
            this.step = -1
            browser.storage.local.set({ "ptk_replay_step": this.step })
        }

        pause() {
            this.paused = true
            this.logEvent(null, 'Paused...')
        }

        run() {
            this.paused = false
            this.logEvent(null, 'Resumed...')
            this.start()
        }

        stepForward() {
            if (this.step > -1) {
                this.forward = true
                this.logEvent(null, 'Skip step #' + (this.step + 1))
                this.abortController.abort()
            }
        }

        doStep(step, item) {
            if (!item || this.paused) return

            this.step = step
            let eventType = item.EventType.toLowerCase()
            this.handler = this[eventType]
            this.handler(item)
        }

        navigate(item) { }

        delay(item) { }

        driverclick(item) { this.click(item) }
        onclick(item) { this.click(item) }
        click(item) {
            let element = this.getElementByXpath(item)
            if (element) {
                element.click()
                element.dispatchEvent(new Event('resize', {bubbles: true}))
            } else if (item.Optional == 0) {
                alert('Could not execute click on ( Xpath: ' + item.ElementPath + ')')
            }
        }

        driversetcontrolvalue(item) { this.type(item) }
        setcontroldata(item) { this.type(item) }
        type(item) {
            let element = this.getElementByXpath(item)
            if (element) {
                let lastValue = element.value
                let event = new Event('input', {bubbles: true})
                event.simulated = true
                element.value = item.Data
                element.defaultValue = item.Data
                let tracker = element._valueTracker
                if (tracker) { tracker.setValue(lastValue) }
                element.dispatchEvent(event)
                element.dispatchEvent(new Event('change', {bubbles: true}))
                element.dispatchEvent(new Event('blur', {bubbles: true}))
                element.dispatchEvent(new Event('resize', {bubbles: true}))
            } else if (item.Optional == 0) {
                alert('Could not execute click on ( Xpath: ' + item.ElementPath + ')')
            }
        }

        javascript(item) {
            let element = this.getElementByXpath(item)
            if (element) {
                try {
                    eval(item.Data)
                } catch (e) {
                    if (item.Optional == 0) alert('Could not execute javascript: ' + e.message)
                }
            }
        }

        getElementByXpath(item) {
            let xpath = item.ElementPath
            xpath = xpath.replace('xpath=', '').replace(/\[(\d+)\]/g, function (fullMatch, n) { return "[" + (Number(n) + 1) + "]"; })
            if (!xpath.startsWith('//')) xpath = '/' + xpath
            return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
        }

    }

    window.ptk_replayer = new ptk_replayer()


    window.addEventListener("message", (event) => {
        if (!isIframe && event.data.channel == 'child2opener' && event.data.message == 'init') {
            window.ptk_replayer.childWindow = event.source
        }
        if (isIframe && event.data.channel == '2frame' && event.data.message == 'doStep') {
            window.ptk_replayer.doStep(event.data.step, event.data.item)
        }
        if (!isIframe && event.data.channel == '2child' && event.data.message == 'doStep') {
            if (event.data.item.ElementPath.includes('//IFRAME')) {
                window.ptk_replayer.executeFrame(event.data.item)
            } else {
                window.ptk_replayer.doStep(event.data.step, event.data.item)
            }
        }
    })

})()


