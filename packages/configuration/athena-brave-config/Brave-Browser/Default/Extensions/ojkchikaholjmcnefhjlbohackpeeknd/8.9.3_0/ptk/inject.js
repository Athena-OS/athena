; (function () {
    try {
        const onMessage = ({ data }) => {
            if (data.channel != "ptk_content2inject" || !data.js) {
                return
            }

            var technologies = data.js.filter(({ js }) => Object.keys(data.js).length).map(({ name, js }) => ({ name, chains: Object.keys(js) }))
            const js = technologies.reduce((technologies, { name, chains }) => {
                chains.forEach((chain) => {
                    const value = chain
                        .split('.')
                        .reduce(
                            (value, method) =>
                                value &&
                                    value instanceof Object &&
                                    Object.prototype.hasOwnProperty.call(value, method)
                                    ? value[method]
                                    : undefined,
                            window
                        )

                    if (value !== undefined) {
                        technologies.push({
                            name,
                            chain,
                            value:
                                typeof value === 'string' || typeof value === 'number'
                                    ? value
                                    : !!value,
                        })
                    }
                })

                return technologies
            }, [])

            const toScalar = (value) =>
                typeof value === 'string' || typeof value === 'number' ? value : !!value

            technologies = data.dom.filter(({ dom }) => Object.keys(data.dom).length).map(({ name, dom }) => ({ name, dom: dom }))
            const dom = technologies.reduce((technologies, { name, dom }) => {
                Object.keys(dom).forEach((selector) => {
                    let nodes = []

                    try {
                        nodes = document.querySelectorAll(selector)
                    } catch (error) {
                        // Continue
                    }

                    if (!nodes.length) {
                        return
                    }

                    nodes.forEach((node) => {
                        dom[selector].forEach(({ properties }) => {
                            if (properties) {
                                Object.keys(properties).forEach((property) => {
                                    if (
                                        Object.prototype.hasOwnProperty.call(node, property)
                                    ) {
                                        const value = node[property]

                                        if (typeof value !== 'undefined') {
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
                        })
                    })
                })

                return technologies
            },[])

            removeEventListener('message', onMessage)

            postMessage({
                channel: "ptk_inject2content",
                js: js,
                dom: dom
            })
        }

        addEventListener('message', onMessage)
    } catch (e) {
        console.log(e)
    }
})()