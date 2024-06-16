/* Author: Denis Podgurskii */

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.channel == "ptk_background2content" && message.type == "init") {
        const contentData = message
        const script = document.createElement('script')

        script.onload = () => {
            const onMessage = ({ data }) => {
                if (data.channel != 'ptk_inject2content' || !data.js) {
                    return
                }

                window.removeEventListener('message', onMessage)
                runAnalysis(contentData, data.js, data.dom)

                script.remove()
            }

            window.addEventListener('message', onMessage)
            window.postMessage({
                channel: "ptk_content2inject",
                js: message.js,
                dom: message.dom
            })
        }

        script.setAttribute('src', browser.runtime.getURL('ptk/inject.js'))

        document.body.appendChild(script)

        return Promise.resolve()
    }
    if (message.channel == "ptk_popup2content") {
        if (message.type == "get_storage"){
            browser.runtime.sendMessage({
                channel: "ptk_content2popup",
                type: "return_storage",
                data: { localStorage: JSON.stringify(window.localStorage), sessionStorage: JSON.stringify(window.sessionStorage) }
            }).catch(e => e)
            return Promise.resolve()
        }
           
        else if (message.type == "update_storage") {
            if (message.storage == 'localStorage') {
                let item = window.localStorage.getItem(message.name)
                if (item) {
                    window.localStorage.setItem(message.name, message.value)
                }
            }
            if (message.storage == 'sessionStorage') {
                let item = window.sessionStorage.getItem(message.name)
                if (item) {
                    window.sessionStorage.setItem(message.name, message.value)
                }
            }
            // if (message.storage == 'cookie') {
            //     let item = window.sessionStorage.getItem(message.name)
            //     if (item) {
            //         window.sessionStorage.setItem(message.name, message.value)
            //     }
            // }
        }
    }
})

window.addEventListener("message", (event) => {
    if (event.data?.ptk) {
        browser.runtime.sendMessage({
            channel: "ptk_content2rattacker",
            type: "xss_confirmed",
            data: { attackValue: event.data, origin: event.origin, location: window.location.toString() }
        }).catch(e => e)
    }

    if (event.data?.ptk_rattacker) {
        let isIframe = false
        try {
            isIframe = window.self !== window.top
        } catch (e) {
            isIframe = true
        }

        if (event.data?.ptk_rattacker == 'start') {
            console.log('start scan')
            console.log('iframe ' + isIframe)
            browser.runtime.sendMessage({
                channel: "ptk_content2rattacker",
                type: 'start'
            })
        } else if (event.data?.ptk_rattacker == 'stop') {
            console.log('stop scan')
            console.log('iframe ' + isIframe)
            browser.runtime.sendMessage({
                channel: "ptk_content2rattacker",
                type: 'stop'
            }).then(function (result) {
                console.log(result)
                let div = document.createElement('div')
                div.innerText = JSON.stringify(result)
                div.id = 'ptk_rattacker_result'
                div.style.cssText = 'position:absolute;top:0px;left:0px;width:200px;height:200px;overflow:hidden';
                document.body.appendChild(div)
                //document.body.setAttribute('ptk_rattacker_result', JSON.stringify(result))
            }).catch(e => console.log(e))
        }
    }

}, false)

async function runAnalysis(message, js, dom) {

    // HTML
    let html = new XMLSerializer().serializeToString(document)

    // Discard the middle portion of HTML to avoid performance degradation on large pages
    const chunks = []
    const maxCols = 2000
    const maxRows = 3000
    const rows = html.length / maxCols

    for (let i = 0; i < rows; i += 1) {
        if (i < maxRows / 2 || i > rows - maxRows / 2) {
            chunks.push(html.slice(i * maxCols, (i + 1) * maxCols))
        }
    }
    html = chunks.join('')

    // CSS rules
    let css = []

    try {
        for (const sheet of Array.from(document.styleSheets)) {
            for (const rules of Array.from(sheet.cssRules)) {
                css.push(rules.cssText)

                if (css.length >= 3000) {
                    break
                }
            }
        }
    } catch (error) {
        // Continue
    }
    css = css.join('\n')

    // Script tags
    const scriptNodes = Array.from(document.scripts)

    const scriptSrc = scriptNodes
        .filter(({ src }) => src && !src.startsWith('data:text/javascript;'))
        .map(({ src }) => src)

    const scripts = scriptNodes
        .map((node) => node.textContent)
        .filter((script) => script)



    // Meta tags
    const meta = Array.from(document.querySelectorAll('meta')).reduce(
        (metas, meta) => {
            const key = meta.getAttribute('name') || meta.getAttribute('property')

            if (key) {
                metas[key.toLowerCase()] = [meta.getAttribute('content')]
            }
            return metas
        },
        {}
    )



    dom = Array.prototype.concat.apply(message.dom
        .reduce((technologies, { name, dom }) => {
            const toScalar = (value) =>
                typeof value === 'string' || typeof value === 'number'
                    ? value
                    : !!value

            Object.keys(dom).forEach((selector) => {
                let nodes = []//document.querySelectorAll(selector)
                try {
                    nodes = document.querySelectorAll(selector)
                } catch (error) {
                    // Continue
                }

                if (!nodes.length) {
                    return
                }

                dom[selector].forEach(({ text, properties, attributes }) => {
                    nodes.forEach((node) => {
                        if (text) {
                            const value = node.textContent.trim()

                            if (value && !technologies.find(item => item.name == name)) {
                                technologies.push({
                                    name,
                                    selector,
                                    text: value,
                                })
                            }
                        }

                        if (properties) {
                            Object.keys(properties).forEach((property) => {
                                if (Object.prototype.hasOwnProperty.call(node, property)) {
                                    const value = node[property]

                                    if (typeof value !== 'undefined' && !technologies.find(item => item.name == name)) {
                                        technologies.push({
                                            name,
                                            selector,
                                            property,
                                            value: toScalar(value),
                                        })
                                    }
                                }
                            })
                        }

                        if (attributes) {
                            Object.keys(attributes).forEach((attribute) => {
                                if (node.hasAttribute(attribute) && !technologies.find(item => item.name == name)) {
                                    const value = node.getAttribute(attribute)

                                    technologies.push({
                                        name,
                                        selector,
                                        attribute,
                                        value: toScalar(value),
                                    })
                                }
                            })
                        }
                    })
                })
            })

            return technologies
        }, [])
        , dom)


    let auth = {
        localStorage: JSON.stringify(window.localStorage),
        sessionStorage: JSON.stringify(window.sessionStorage)
    }

    browser.runtime.sendMessage({
        channel: "ptk_content2popup",
        type: "init_complete",
        data: { html: html, meta: meta, scriptSrc: scriptSrc, scripts: scripts, css: css, auth: auth, dom: dom, js: js }
    }).catch(e => e)

    return Promise.resolve(true)
}