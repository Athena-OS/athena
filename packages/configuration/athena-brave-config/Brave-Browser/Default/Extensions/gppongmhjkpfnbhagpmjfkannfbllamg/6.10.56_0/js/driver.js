'use strict'
/* eslint-env browser */
/* globals chrome, Wappalyzer, Utils */

const {
  setTechnologies,
  setCategories,
  analyze,
  analyzeManyToMany,
  resolve,
  getTechnology,
} = Wappalyzer
const { agent, promisify, getOption, setOption, open, globEscape } = Utils

const expiry = 1000 * 60 * 60 * 48

const maxHostnames = 100

const hostnameIgnoreList =
  /\b((local|dev(elop(ment)?)?|sandbox|stag(e|ing)?|preprod|production|preview|test(ing)?|[^a-z]demo(shop)?|cache)[.-]|dev\d|localhost|((wappalyzer|google|bing|baidu|microsoft|duckduckgo|facebook|adobe|twitter|reddit|yahoo|wikipedia|amazon|amazonaws|youtube|stackoverflow|github|stackexchange|w3schools|twitch)\.)|(live|office|herokuapp|shopifypreview)\.com|\.local|\.test|\.netlify\.app|web\.archive\.org|zoom\.us|^([0-9.]+|[\d.]+)$|^([a-f0-9:]+:+)+[a-f0-9]+$)/

const xhrDebounce = []

let xhrAnalyzed = {}

let initDone

const initPromise = new Promise((resolve) => {
  initDone = resolve
})

function getRequiredTechnologies(name, categoryId) {
  return name
    ? Wappalyzer.requires.find(({ name: _name }) => _name === name).technologies
    : categoryId
    ? Wappalyzer.categoryRequires.find(
        ({ categoryId: _categoryId }) => _categoryId === categoryId
      ).technologies
    : undefined
}

function isSimilarUrl(a, b) {
  const normalise = (url) => String(url || '').replace(/(\/|\/?#.+)$/, '')

  return normalise(a) === normalise(b)
}

const Driver = {
  /**
   * Initialise driver
   */
  async init() {
    await Driver.loadTechnologies()

    const hostnameCache = await getOption('hostnames', {})

    Driver.cache = {
      hostnames: Object.keys(hostnameCache).reduce(
        (cache, hostname) => ({
          ...cache,
          [hostname]: {
            ...hostnameCache[hostname],
            detections: hostnameCache[hostname].detections.map(
              ({
                technology: name,
                pattern: { regex, confidence },
                version,
              }) => ({
                technology: getTechnology(name, true),
                pattern: {
                  regex: new RegExp(regex, 'i'),
                  confidence,
                },
                version,
              })
            ),
          },
        }),
        {}
      ),
      robots: await getOption('robots', {}),
      ads: [],
    }

    const { version } = chrome.runtime.getManifest()
    const previous = await getOption('version')
    const upgradeMessage = await getOption('upgradeMessage', true)

    await setOption('version', version)

    const current = await getOption('version')

    if (!previous) {
      await Driver.clearCache()

      if (current) {
        open(
          'https://www.wappalyzer.com/installed/?utm_source=installed&utm_medium=extension&utm_campaign=wappalyzer'
        )
      }
    } else if (version !== previous && upgradeMessage) {
      open(
        `https://www.wappalyzer.com/upgraded/?utm_source=upgraded&utm_medium=extension&utm_campaign=wappalyzer`,
        false
      )
    }

    initDone()
  },

  /**
   * Log debug messages to the console
   * @param {String} message
   * @param {String} source
   * @param {String} type
   */
  log(message, source = 'driver', type = 'log') {
    // eslint-disable-next-line no-console
    console[type](message)
  },

  /**
   * Log errors to the console
   * @param {String} error
   * @param {String} source
   */
  error(error, source = 'driver') {
    Driver.log(error, source, 'error')
  },

  /**
   * Load technologies and categories into memory
   */
  async loadTechnologies() {
    try {
      const categories = await (
        await fetch(chrome.runtime.getURL('categories.json'))
      ).json()

      let technologies = {}

      for (const index of Array(27).keys()) {
        const character = index ? String.fromCharCode(index + 96) : '_'

        technologies = {
          ...technologies,
          ...(await (
            await fetch(chrome.runtime.getURL(`technologies/${character}.json`))
          ).json()),
        }
      }

      Object.keys(technologies).forEach((name) => {
        delete technologies[name].description
        delete technologies[name].cpe
        delete technologies[name].pricing
        delete technologies[name].website
      })

      setTechnologies(technologies)
      setCategories(categories)
    } catch (error) {
      Driver.error(error)
    }
  },

  /**
   * Get all categories
   */
  getCategories() {
    return Wappalyzer.categories
  },

  /**
   * Perform a HTTP POST request
   * @param {String} url
   * @param {String} body
   */
  post(url, body) {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },

  /**
   * Wrapper for analyze
   */
  analyze(...args) {
    return analyze(...args)
  },

  /**
   * Analyse JavaScript variables
   * @param {String} url
   * @param {Array} js
   */
  analyzeJs(url, js, requires, categoryRequires) {
    const technologies =
      getRequiredTechnologies(requires, categoryRequires) ||
      Wappalyzer.technologies

    return Driver.onDetect(
      url,
      js
        .map(({ name, chain, value }) => {
          const technology = technologies.find(
            ({ name: _name }) => name === _name
          )

          return technology
            ? analyzeManyToMany(technology, 'js', { [chain]: [value] })
            : []
        })
        .flat()
    )
  },

  /**
   * Analyse DOM nodes
   * @param {String} url
   * @param {Array} dom
   */
  analyzeDom(url, dom, requires, categoryRequires) {
    const technologies =
      getRequiredTechnologies(requires, categoryRequires) ||
      Wappalyzer.technologies

    return Driver.onDetect(
      url,
      dom
        .map(
          (
            { name, selector, exists, text, property, attribute, value },
            index
          ) => {
            const technology = technologies.find(
              ({ name: _name }) => name === _name
            )

            if (!technology) {
              return []
            }

            if (typeof exists !== 'undefined') {
              return analyzeManyToMany(technology, 'dom.exists', {
                [selector]: [''],
              })
            }

            if (typeof text !== 'undefined') {
              return analyzeManyToMany(technology, 'dom.text', {
                [selector]: [text],
              })
            }

            if (typeof property !== 'undefined') {
              return analyzeManyToMany(
                technology,
                `dom.properties.${property}`,
                {
                  [selector]: [value],
                }
              )
            }

            if (typeof attribute !== 'undefined') {
              return analyzeManyToMany(
                technology,
                `dom.attributes.${attribute}`,
                {
                  [selector]: [value],
                }
              )
            }
          }
        )
        .flat()
    )
  },

  /**
   * Force a technology detection by URL and technology name
   * @param {String} url
   * @param {String} name
   */
  detectTechnology(url, name) {
    const technology = getTechnology(name)

    return Driver.onDetect(url, [
      { technology, pattern: { regex: '', confidence: 100 }, version: '' },
    ])
  },

  /**
   * Enable scripts to call Driver functions through messaging
   * @param {Object} message
   * @param {Object} sender
   * @param {Function} callback
   */
  onMessage({ source, func, args }, sender, callback) {
    if (!func) {
      return
    }

    if (func !== 'log') {
      Driver.log({ source, func, args })
    }

    if (!Driver[func]) {
      Driver.error(new Error(`Method does not exist: Driver.${func}`))

      return
    }

    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve) => {
      await initPromise

      resolve(Driver[func].call(Driver[func], ...(args || [])))
    })
      .then(callback)
      .catch(Driver.error)

    return !!callback
  },

  async content(url, func, args) {
    const [tab] = await promisify(chrome.tabs, 'query', {
      url: globEscape(url),
    })

    if (!tab) {
      return
    }

    if (tab.status !== 'complete') {
      throw new Error(`Tab ${tab.id} not ready for sendMessage: ${tab.status}`)
    }

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tab.id,
        {
          source: 'driver.js',
          func,
          args: args ? (Array.isArray(args) ? args : [args]) : [],
        },
        (response) => {
          chrome.runtime.lastError
            ? func === 'error'
              ? resolve()
              : Driver.error(
                  new Error(
                    `${
                      chrome.runtime.lastError.message
                    }: Driver.${func}(${JSON.stringify(args)})`
                  )
                )
            : resolve(response)
        }
      )
    })
  },

  /**
   * Analyse response headers
   * @param {Object} request
   */
  async onWebRequestComplete(request) {
    if (request.responseHeaders) {
      if (await Driver.isDisabledDomain(request.url)) {
        return
      }

      const headers = {}

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const [tab] = await promisify(chrome.tabs, 'query', {
          url: globEscape(request.url),
        })

        if (tab) {
          request.responseHeaders.forEach((header) => {
            const name = header.name.toLowerCase()

            headers[name] = headers[name] || []

            headers[name].push(
              (header.value || header.binaryValue || '').toString()
            )
          })

          Driver.onDetect(request.url, analyze({ headers })).catch(Driver.error)
        }
      } catch (error) {
        Driver.error(error)
      }
    }
  },

  /**
   * Analyse scripts
   * @param {Object} request
   */
  async onScriptRequestComplete(request) {
    const initiatorUrl = request.initiator || request.documentUrl || request.url

    if (
      (await Driver.isDisabledDomain(initiatorUrl)) ||
      (await Driver.isDisabledDomain(request.url))
    ) {
      return
    }

    const { hostname } = new URL(initiatorUrl)

    if (!Driver.cache.hostnames[hostname]) {
      Driver.cache.hostnames[hostname] = {}
    }

    if (!Driver.cache.hostnames[hostname].analyzedScripts) {
      Driver.cache.hostnames[hostname].analyzedScripts = []
    }

    if (Driver.cache.hostnames[hostname].analyzedScripts.length >= 25) {
      return
    }

    Driver.cache.hostnames[hostname].analyzedScripts.push(request.url)

    const response = await fetch(request.url)

    const scripts = (await response.text()).slice(0, 500000)

    Driver.onDetect(initiatorUrl, analyze({ scripts })).catch(Driver.error)
  },

  /**
   * Analyse XHR request hostnames
   * @param {Object} request
   */
  async onXhrRequestComplete(request) {
    if (await Driver.isDisabledDomain(request.url)) {
      return
    }

    let hostname
    let originHostname

    try {
      ;({ hostname } = new URL(request.url))
      ;({ hostname: originHostname } = new URL(request.originUrl))
    } catch (error) {
      return
    }

    if (!xhrDebounce.includes(hostname)) {
      xhrDebounce.push(hostname)

      setTimeout(() => {
        xhrDebounce.splice(xhrDebounce.indexOf(hostname), 1)

        xhrAnalyzed[originHostname] = xhrAnalyzed[originHostname] || []

        if (!xhrAnalyzed[originHostname].includes(hostname)) {
          xhrAnalyzed[originHostname].push(hostname)

          if (Object.keys(xhrAnalyzed).length > 500) {
            xhrAnalyzed = {}
          }

          Driver.onDetect(
            request.originUrl || request.initiator,
            analyze({ xhr: hostname })
          ).catch(Driver.error)
        }
      }, 1000)
    }
  },

  /**
   * Process return values from content.js
   * @param {String} url
   * @param {Object} items
   * @param {String} language
   */
  async onContentLoad(url, items, language, requires, categoryRequires) {
    try {
      items.cookies = items.cookies || {}

      //
      ;(
        await promisify(chrome.cookies, 'getAll', {
          url,
        })
      ).forEach(
        ({ name, value }) => (items.cookies[name.toLowerCase()] = [value])
      )

      // Change Google Analytics 4 cookie from _ga_XXXXXXXXXX to _ga_*
      Object.keys(items.cookies).forEach((name) => {
        if (/_ga_[A-Z0-9]+/.test(name)) {
          items.cookies['_ga_*'] = items.cookies[name]

          delete items.cookies[name]
        }
      })

      const technologies = getRequiredTechnologies(requires, categoryRequires)

      await Driver.onDetect(
        url,
        analyze({ url, ...items }, technologies),
        language,
        true
      )
    } catch (error) {
      Driver.error(error)
    }
  },

  /**
   * Get all technologies
   */
  getTechnologies() {
    return Wappalyzer.technologies
  },

  /**
   * Check if Wappalyzer has been disabled for the domain
   */
  async isDisabledDomain(url) {
    try {
      const { hostname } = new URL(url)

      return (await getOption('disabledDomains', [])).includes(hostname)
    } catch (error) {
      return false
    }
  },

  /**
   * Callback for detections
   * @param {String} url
   * @param {Array} detections
   * @param {String} language
   * @param {Boolean} incrementHits
   */
  async onDetect(
    url,
    detections = [],
    language,
    incrementHits = false,
    analyzeRequires = true
  ) {
    if (!url || !detections.length) {
      return
    }

    url = url.split('#')[0]

    const { hostname, pathname } = new URL(url)

    // Cache detections
    const cache = (Driver.cache.hostnames[hostname] = {
      detections: [],
      hits: incrementHits ? 0 : 1,
      https: url.startsWith('https://'),
      analyzedScripts: [],
      ...(Driver.cache.hostnames[hostname] || []),
      dateTime: Date.now(),
    })

    // Remove duplicates
    cache.detections = cache.detections
      .concat(detections)
      .filter(({ technology }) => technology)
      .filter(
        (
          {
            technology: { name },
            pattern: { regex, value },
            confidence,
            version,
          },
          index,
          detections
        ) =>
          detections.findIndex(
            ({
              technology: { name: _name },
              pattern: { regex: _regex, value: _value },
              confidence: _confidence,
              version: _version,
            }) =>
              name === _name &&
              version === _version &&
              confidence === _confidence &&
              value === _value &&
              (!regex || regex.toString() === _regex.toString())
          ) === index
      )
      .map((detection) => {
        if (
          detections.find(
            ({ technology: { slug } }) => slug === detection.technology.slug
          )
        ) {
          detection.lastUrl = url
        }

        return detection
      })

    // Track if technology was identified on website's root path
    detections.forEach(({ technology: { name } }) => {
      const detection = cache.detections.find(
        ({ technology: { name: _name } }) => name === _name
      )

      detection.rootPath = detection.rootPath || pathname === '/'
    })

    const resolved = resolve(cache.detections).map((detection) => detection)

    // Look for technologies that require other technologies to be present on the page
    const requires = [
      ...Wappalyzer.requires.filter(({ name }) =>
        resolved.some(({ name: _name }) => _name === name)
      ),
      ...Wappalyzer.categoryRequires.filter(({ categoryId }) =>
        resolved.some(({ categories }) =>
          categories.some(({ id }) => id === categoryId)
        )
      ),
    ]

    try {
      await Driver.content(url, 'analyzeRequires', [url, requires])
    } catch (error) {
      // Continue
    }

    await Driver.setIcon(url, resolved)

    await Driver.ping()

    cache.hits += incrementHits ? 1 : 0
    cache.language = cache.language || language

    // Expire cache
    Driver.cache.hostnames = Object.keys(Driver.cache.hostnames)
      .sort((a, b) =>
        Driver.cache.hostnames[a].dateTime > Driver.cache.hostnames[b].dateTime
          ? -1
          : 1
      )
      .reduce((hostnames, hostname) => {
        const cache = Driver.cache.hostnames[hostname]

        if (
          cache.dateTime > Date.now() - expiry &&
          Object.keys(hostnames).length < maxHostnames
        ) {
          hostnames[hostname] = cache
        }

        return hostnames
      }, {})

    // Save cache
    await setOption(
      'hostnames',
      Object.keys(Driver.cache.hostnames).reduce(
        (hostnames, hostname) => ({
          ...hostnames,
          [hostname]: {
            ...cache,
            detections: Driver.cache.hostnames[hostname].detections
              .filter(({ technology }) => technology)
              .map(
                ({
                  technology: { name: technology },
                  pattern: { regex, confidence },
                  version,
                  rootPath,
                  lastUrl,
                }) => ({
                  technology,
                  pattern: {
                    regex: regex.source,
                    confidence,
                  },
                  version,
                  rootPath,
                  lastUrl,
                })
              ),
          },
        }),
        {}
      )
    )

    Driver.log({ hostname, technologies: resolved })
  },

  /**
   * Callback for onAd listener
   * @param {Object} ad
   */
  onAd(ad) {
    Driver.cache.ads.push(ad)
  },

  /**
   * Update the extension icon
   * @param {String} url
   * @param {Object} technologies
   */
  async setIcon(url, technologies = []) {
    if (await Driver.isDisabledDomain(url)) {
      technologies = []
    }

    const dynamicIcon = await getOption('dynamicIcon', false)
    const showCached = await getOption('showCached', true)
    const badge = await getOption('badge', true)

    let icon = 'default.svg'

    const _technologies = technologies.filter(
      ({ slug, lastUrl }) =>
        slug !== 'cart-functionality' &&
        (showCached || isSimilarUrl(url, lastUrl))
    )

    if (dynamicIcon) {
      const pinnedCategory = parseInt(await getOption('pinnedCategory'), 10)

      const pinned = _technologies.find(({ categories }) =>
        categories.some(({ id }) => id === pinnedCategory)
      )

      ;({ icon } = pinned || _technologies[0] || { icon })
    }

    if (!url) {
      return
    }

    let tabs = []

    try {
      tabs = await promisify(chrome.tabs, 'query', {
        url: globEscape(url),
      })
    } catch (error) {
      // Continue
    }

    tabs.forEach(({ id: tabId }) => {
      chrome.action.setBadgeText(
        {
          tabId,
          text:
            badge && _technologies.length
              ? _technologies.length.toString()
              : '',
        },
        () => {}
      )

      chrome.action.setIcon(
        {
          tabId,
          path: chrome.runtime.getURL(
            `../images/icons/${
              /\.svg$/i.test(icon)
                ? `converted/${icon.replace(/\.svg$/, '.png')}`
                : icon
            }`
          ),
        },
        () => {}
      )
    })
  },

  /**
   * Get the detected technologies for the current tab
   */
  async getDetections() {
    const [tab] = await promisify(chrome.tabs, 'query', {
      active: true,
      currentWindow: true,
    })

    if (!tab) {
      Driver.error(new Error('getDetections: no active tab found'))

      return
    }

    const { url } = tab

    if (await Driver.isDisabledDomain(url)) {
      await Driver.setIcon(url, [])

      return
    }

    const showCached = await getOption('showCached', true)

    const { hostname } = new URL(url)

    const cache = Driver.cache.hostnames?.[hostname]

    const resolved = (cache ? resolve(cache.detections) : []).filter(
      ({ lastUrl }) => showCached || isSimilarUrl(url, lastUrl)
    )

    await Driver.setIcon(url, resolved)

    return resolved
  },

  /**
   * Fetch the website's robots.txt rules
   * @param {String} hostname
   * @param {Boolean} secure
   */
  async getRobots(hostname, secure = false) {
    if (
      !(await getOption('tracking', true)) ||
      hostnameIgnoreList.test(hostname)
    ) {
      return []
    }

    if (typeof Driver.cache.robots[hostname] !== 'undefined') {
      return Driver.cache.robots[hostname]
    }

    try {
      Driver.cache.robots[hostname] = await Promise.race([
        // eslint-disable-next-line no-async-promise-executor
        new Promise(async (resolve) => {
          const response = await fetch(
            `http${secure ? 's' : ''}://${hostname}/robots.txt`
          )

          if (!response.ok) {
            Driver.log(`getRobots: ${response.statusText} (${hostname})`)

            resolve('')
          }

          let agent

          resolve(
            (await response.text()).split('\n').reduce((disallows, line) => {
              let matches = /^User-agent:\s*(.+)$/i.exec(line.trim())

              if (matches) {
                agent = matches[1].toLowerCase()
              } else if (agent === '*' || agent === 'wappalyzer') {
                matches = /^Disallow:\s*(.+)$/i.exec(line.trim())

                if (matches) {
                  disallows.push(matches[1])
                }
              }

              return disallows
            }, [])
          )
        }),
        new Promise((resolve) => setTimeout(() => resolve(''), 5000)),
      ])

      Driver.cache.robots = Object.keys(Driver.cache.robots)
        .slice(-50)
        .reduce(
          (cache, hostname) => ({
            ...cache,
            [hostname]: Driver.cache.robots[hostname],
          }),
          {}
        )

      await setOption('robots', Driver.cache.robots)

      return Driver.cache.robots[hostname]
    } catch (error) {
      Driver.error(error)
    }
  },

  /**
   * Check if the website allows indexing of a URL
   * @param {String} href
   */
  async checkRobots(href) {
    const url = new URL(href)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Invalid protocol')
    }

    const robots = await Driver.getRobots(
      url.hostname,
      url.protocol === 'https:'
    )

    if (robots.some((disallowed) => url.pathname.indexOf(disallowed) === 0)) {
      throw new Error('Disallowed')
    }
  },

  /**
   * Clear caches
   */
  async clearCache() {
    Driver.cache.hostnames = {}

    xhrAnalyzed = {}

    await setOption('hostnames', {})
  },

  /**
   * Anonymously send identified technologies to wappalyzer.com
   * This function can be disabled in the extension settings
   */
  async ping() {
    const tracking = await getOption('tracking', true)
    const termsAccepted =
      agent === 'chrome' || (await getOption('termsAccepted', false))

    if (tracking && termsAccepted) {
      const urls = Object.keys(Driver.cache.hostnames).reduce(
        (urls, hostname) => {
          if (Object.keys(urls).length >= 25) {
            return urls
          }

          // eslint-disable-next-line standard/computed-property-even-spacing
          const { language, detections, hits, https } =
            Driver.cache.hostnames[hostname]

          const url = `http${https ? 's' : ''}://${hostname}`

          if (!hostnameIgnoreList.test(hostname) && hits) {
            urls[url] = urls[url] || {
              technologies: resolve(detections).reduce(
                (technologies, { name, confidence, version, rootPath }) => {
                  if (confidence === 100) {
                    technologies[name] = {
                      version,
                      hits,
                      rootPath,
                    }
                  }

                  return technologies
                },
                {}
              ),
              meta: {
                language,
              },
            }
          }

          return urls
        },
        {}
      )

      const count = Object.keys(urls).length

      const lastPing = await getOption('lastPing', Date.now())

      if (
        count &&
        ((count >= 25 && lastPing < Date.now() - 1000 * 60 * 60) ||
          (count >= 5 && lastPing < Date.now() - expiry))
      ) {
        await setOption('lastPing', Date.now())

        try {
          await Driver.post('https://ping.wappalyzer.com/v2/', {
            version: chrome.runtime.getManifest().version,
            urls,
          })
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }

        Object.keys(Driver.cache.hostnames).forEach((hostname) => {
          Driver.cache.hostnames[hostname].hits = 0
        })
      }

      if (Driver.cache.ads.length > 25) {
        try {
          await Driver.post(
            'https://ad.wappalyzer.com/log/wp/',
            Driver.cache.ads
          )
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }

        Driver.cache.ads = []
      }
    }
  },
}

chrome.action.setBadgeBackgroundColor({ color: '#6B39BD' }, () => {})

chrome.webRequest.onCompleted.addListener(
  Driver.onWebRequestComplete,
  { urls: ['http://*/*', 'https://*/*'], types: ['main_frame'] },
  ['responseHeaders']
)

chrome.webRequest.onCompleted.addListener(Driver.onScriptRequestComplete, {
  urls: ['http://*/*', 'https://*/*'],
  types: ['script'],
})

chrome.webRequest.onCompleted.addListener(Driver.onXhrRequestComplete, {
  urls: ['http://*/*', 'https://*/*'],
  types: ['xmlhttprequest'],
})

chrome.tabs.onUpdated.addListener(async (id, { status, url }) => {
  if (status === 'complete') {
    ;({ url } = await promisify(chrome.tabs, 'get', id))
  }

  if (url) {
    const { hostname } = new URL(url)

    const showCached = await getOption('showCached', true)

    const cache = Driver.cache?.hostnames?.[hostname]

    const resolved = (cache ? resolve(cache.detections) : []).filter(
      ({ lastUrl }) => showCached || isSimilarUrl(url, lastUrl)
    )

    await Driver.setIcon(url, resolved)
  }
})

// Enable messaging between scripts
chrome.runtime.onMessage.addListener(Driver.onMessage)

Driver.init()
