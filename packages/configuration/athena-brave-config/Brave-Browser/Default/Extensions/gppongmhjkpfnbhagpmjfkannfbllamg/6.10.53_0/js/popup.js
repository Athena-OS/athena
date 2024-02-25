'use strict'
/* eslint-env browser */
/* globals chrome, Utils */

const { agent, open, i18n, getOption, setOption, promisify, sendMessage } =
  Utils

const baseUrl = 'https://www.wappalyzer.com'
const utm = '?utm_source=popup&utm_medium=extension&utm_campaign=wappalyzer'

const footers = [
  {
    heading: 'Generate sales leads',
    body: 'Find new prospects by the technologies they use. Reach out to customers of Shopify, Magento, Salesforce and others.',
    buttonText: 'Create a lead list',
    buttonLink: `${baseUrl}/lists/${utm}`,
  },
  {
    heading: 'Connect Wappalyzer to your CRM',
    body: 'See the technology stacks of your leads without leaving your CRM. Connect to HubSpot, Pipedrive and many others.',
    buttonText: 'See all apps',
    buttonLink: `${baseUrl}/apps/${utm}`,
  },
  {
    heading: 'Enrich your data with tech stacks',
    body: 'Upload a list of websites to get a report of the technologies in use, such as CMS or ecommerce platforms.',
    buttonText: 'Upload a list',
    buttonLink: `${baseUrl}/lookup/${utm}#bulk`,
  },
  {
    heading: 'Automate technology lookups',
    body: 'Our APIs provide instant access to website technology stacks, contact details and social media profiles.',
    buttonText: 'Compare APIs',
    buttonLink: `${baseUrl}/api/${utm}`,
  },
  {
    heading: 'Wappalyzer for businesses',
    body: 'Sign up for a plan to get monthly credits to spend on any product, including lead lists and technology lookups.',
    buttonText: 'Compare plans',
    buttonLink: `${baseUrl}/pricing/${utm}`,
  },
]

const attributeKeys = [
  'phone',
  'skype',
  'whatsapp',
  'email',
  'verifiedEmail',
  'safeEmail',
  'twitter',
  'facebook',
  'instagram',
  'github',
  'tiktok',
  'youtube',
  'pinterest',
  'linkedin',
  'owler',
  'title',
  'description',
  'copyright',
  'copyrightYear',
  'responsive',
  'schemaOrgTypes',
  'certInfo.subjectOrg',
  'certInfo.subjectCountry',
  'certInfo.subjectState',
  'certInfo.subjectLocality',
  'certInfo.issuer',
  'certInfo.protocol',
  'certInfo.validTo',
  'dns.spf',
  'dns.dmarc',
  'https',
  'trackerGoogleAnalytics',
  'trackerGoogleAdSense',
  'trackerMedianet',
  'trackerFacebook',
  'trackerOptimizely',
  'companyName',
  'inferredCompanyName',
  'industry',
  'about',
  'locations',
  'companySize',
  'companyType',
  'companyFounded',
  'employees',
]

function setDisabledDomain(enabled) {
  const el = {
    headerSwitchEnabled: document.querySelector('.header__switch--enabled'),
    headerSwitchDisabled: document.querySelector('.header__switch--disabled'),
  }

  if (enabled) {
    el.headerSwitchEnabled.classList.add('header__switch--hidden')
    el.headerSwitchDisabled.classList.remove('header__switch--hidden')
  } else {
    el.headerSwitchEnabled.classList.remove('header__switch--hidden')
    el.headerSwitchDisabled.classList.add('header__switch--hidden')
  }
}

function getCsv() {
  let hostname = ''
  let www = false
  let https = false

  try {
    let protocol = ''

    ;({ hostname, protocol } = new URL(Popup.cache.url))

    www = hostname.startsWith('www')

    https = protocol === 'https:'

    hostname = hostname.replace(/^www\./, '')
  } catch (error) {
    // Continue
  }

  const columns = [
    'URL',
    ...Popup.cache.categories.map(({ id }) =>
      chrome.i18n.getMessage(`categoryName${id}`)
    ),
    ...attributeKeys.map((key) =>
      chrome.i18n.getMessage(
        `attribute${
          key.charAt(0).toUpperCase() + key.slice(1).replace('.', '_')
        }`
      )
    ),
  ]

  const csv = [`"${columns.join('","')}"`]

  const filename = `wappalyzer${
    hostname ? `_${hostname.replace('.', '-')}` : ''
  }.csv`

  const row = [`http${https ? 's' : ''}://${www ? 'www.' : ''}${hostname}`]

  row.push(
    ...Popup.cache.categories.reduce((categories, { id }) => {
      categories.push(
        Popup.cache.detections
          .filter(({ categories }) =>
            categories.some(({ id: _id }) => _id === id)
          )
          .map(({ name }) => name)
          .join(' ; ')
      )

      return categories
    }, [])
  )

  row.push(
    ...attributeKeys.map((key) => csvEscape(Popup.cache.attributeValues[key]))
  )

  csv.push(`"${row.join('","')}"`)

  return { csv, filename }
}

function csvEscape(value = '') {
  if (Array.isArray(value)) {
    value = value
      .flat()
      .slice(0, 10)
      .map((value) => csvEscape(String(value).replace(/ ; /g, ' : ')))
      .join(' ; ')
  }

  if (typeof value === 'string') {
    return value.replace(/\n/g, ' ').replace(/"/g, '""').trim()
  }

  if (typeof value === 'boolean') {
    return String(value).toUpperCase()
  }

  if (value === null) {
    return ''
  }

  return String(value).replace(/"/g, '""')
}

function parseEmail(fullEmail) {
  const email = fullEmail.replace(/^[^<]*<([^>]+)>/, '$1')

  const [name, title] = fullEmail.replace(/ <([^>]+)>$/, '').split(' -- ')

  return { email, name, title }
}

function getTechnologySpend(technologies) {
  const totals = technologies.reduce(
    (totals, { pricing }) => {
      pricing.forEach((price) => totals[price]++)

      return totals
    },
    { low: 0, poa: 0, mid: 0, high: 0 }
  )

  totals.mid += Math.floor(totals.low / 3)
  totals.high += Math.floor(totals.poa / 2)
  totals.high += Math.floor(totals.mid / 3)
  totals.xhigh = Math.floor(totals.high / 3)

  const spend = totals.xhigh
    ? 'Very high'
    : totals.high
    ? 'High'
    : totals.mid
    ? 'Medium'
    : totals.low
    ? 'Low'
    : 'Very low'

  return spend
}

const Popup = {
  /**
   * Initialise popup
   */
  async init() {
    Popup.cache = {
      url: '',
      categories: [],
      detections: [],
      attributeValues: {},
    }

    const el = {
      body: document.body,
      detections: document.querySelector('.detections'),
      empty: document.querySelector('.empty'),
      footer: document.querySelector('.footer'),
      game: document.querySelector('.ttt-game'),
      headerSwitchDisabled: document.querySelector('.header__switch--disabled'),
      headerSwitchEnabled: document.querySelector('.header__switch--enabled'),
      headerSwitches: document.querySelectorAll('.header__switch'),
      plusDownloadLink: document.querySelector(
        '.plus-download__button .button__link'
      ),
      playGame: document.querySelector('.empty__play-game'),
      plusConfigureApiKey: document.querySelector('.plus-configure__apikey'),
      plusConfigureSave: document.querySelector('.plus-configure__save'),
      plusDownload: document.querySelector('.plus-download'),
      tabPlus: document.querySelector('.tab--plus'),
      terms: document.querySelector('.terms'),
      termsButtonAccept: document.querySelector('.terms__button--accept'),
      termsButtonDecline: document.querySelector('.terms__button--decline'),
      credits: document.querySelector('.credits'),
      footerButtonLink: document.querySelector('.footer .button__link'),
      footerButtonText: document.querySelector('.footer .button__text'),
      footerContentBody: document.querySelector('.footer__content-body'),
      footerHeading: document.querySelector('.footer__heading'),
      footerHeadingText: document.querySelector('.footer__heading-text'),
      footerToggleClose: document.querySelector('.footer__toggle--close'),
      footerToggleOpen: document.querySelector('.footer__toggle--open'),
      headerSettings: document.querySelector('.header__settings'),
      headerThemeDark: document.querySelector('.header__theme--dark'),
      headerThemeLight: document.querySelector('.header__theme--light'),
      headerThemes: document.querySelectorAll('.header__theme'),
      issue: document.querySelector('.issue'),
      tabItems: document.querySelectorAll('.tab-item'),
      tabs: document.querySelectorAll('.tab'),
      templates: document.querySelectorAll('[data-template]'),
    }

    // Templates
    Popup.templates = Array.from(el.templates).reduce((templates, template) => {
      templates[template.dataset.template] = template.cloneNode(true)

      template.remove()

      return templates
    }, {})

    // Disabled domains
    const dynamicIcon = await getOption('dynamicIcon', false)

    if (dynamicIcon) {
      el.body.classList.add('dynamic-icon')
    }

    // Disabled domains
    let disabledDomains = await getOption('disabledDomains', [])

    // Dark mode
    const theme = await getOption('theme', 'light')

    if (theme === 'dark') {
      el.body.classList.add('dark')
      el.headerThemeLight.classList.remove('header__icon--hidden')
      el.headerThemeDark.classList.add('header__icon--hidden')
    }

    // Terms
    const termsAccepted =
      agent === 'chrome' || (await getOption('termsAccepted', false))

    if (termsAccepted) {
      el.terms.classList.add('terms--hidden')

      Popup.driver('getDetections').then(Popup.onGetDetections.bind(this))
    } else {
      el.terms.classList.remove('terms--hidden')
      el.empty.classList.add('empty--hidden')
      el.detections.classList.add('detections--hidden')
      el.issue.classList.add('issue--hidden')
      el.footer.classList.add('footer--hidden')
      el.tabPlus.classList.add('tab--disabled')

      el.termsButtonAccept.addEventListener('click', async () => {
        await setOption('termsAccepted', true)
        await setOption('tracking', true)

        el.terms.classList.add('terms--hidden')
        el.footer.classList.remove('footer--hidden')
        el.tabPlus.classList.remove('tab--disabled')

        Popup.driver('getDetections').then(Popup.onGetDetections.bind(this))
      })

      el.termsButtonDecline.addEventListener('click', async () => {
        await setOption('termsAccepted', true)
        await setOption('tracking', false)

        el.terms.classList.add('terms--hidden')
        el.footer.classList.remove('footer--hidden')
        el.tabPlus.classList.remove('tab--disabled')

        Popup.driver('getDetections').then(Popup.onGetDetections.bind(this))
      })
    }

    let url

    const tabs = await promisify(chrome.tabs, 'query', {
      active: true,
      currentWindow: true,
    })

    if (tabs && tabs.length) {
      ;[{ url }] = tabs

      if (url.startsWith('http')) {
        Popup.cache.url = url

        const { hostname } = new URL(url)

        setDisabledDomain(disabledDomains.includes(hostname))

        el.headerSwitchDisabled.addEventListener('click', async () => {
          disabledDomains = disabledDomains.filter(
            (_hostname) => _hostname !== hostname
          )

          await setOption('disabledDomains', disabledDomains)

          setDisabledDomain(false)

          Popup.driver('getDetections').then(Popup.onGetDetections.bind(this))
        })

        el.headerSwitchEnabled.addEventListener('click', async () => {
          disabledDomains.push(hostname)

          await setOption('disabledDomains', disabledDomains)

          setDisabledDomain(true)

          Popup.driver('getDetections').then(Popup.onGetDetections.bind(this))
        })
      } else {
        for (const headerSwitch of el.headerSwitches) {
          headerSwitch.classList.add('header__switch--hidden')
        }

        el.tabPlus.classList.add('tab--disabled')
      }
    }

    // Plus configuration
    el.plusConfigureApiKey.value = await getOption('apiKey', '')

    el.plusConfigureSave.addEventListener('click', async (event) => {
      await setOption('apiKey', el.plusConfigureApiKey.value)

      await Popup.getPlus(url)
    })

    // Header
    el.headerSettings.addEventListener('click', () =>
      chrome.runtime.openOptionsPage()
    )

    // Theme
    el.headerThemes.forEach((headerTheme) =>
      headerTheme.addEventListener('click', async () => {
        const theme = await getOption('theme', 'light')

        el.body.classList[theme === 'dark' ? 'remove' : 'add']('dark')
        el.body.classList[theme === 'dark' ? 'add' : 'remove']('light')
        el.headerThemeDark.classList[theme === 'dark' ? 'remove' : 'add'](
          'header__icon--hidden'
        )
        el.headerThemeLight.classList[theme === 'dark' ? 'add' : 'remove'](
          'header__icon--hidden'
        )

        await setOption('theme', theme === 'dark' ? 'light' : 'dark')
      })
    )

    // Tabs
    el.tabs.forEach((tab, index) => {
      tab.addEventListener('click', async () => {
        el.tabs.forEach((tab) => tab.classList.remove('tab--active'))
        el.tabItems.forEach((item) => item.classList.add('tab-item--hidden'))

        tab.classList.add('tab--active')
        el.tabItems[index].classList.remove('tab-item--hidden')

        el.credits.classList.add('credits--hidden')
        el.plusDownload.classList.remove('plus-download--hidden')
        el.footer.classList.remove('footer--hidden')

        if (tab.classList.contains('tab--plus')) {
          await Popup.getPlus(url)
        }
      })
    })

    // Download
    el.plusDownloadLink.addEventListener('click', Popup.downloadCsv)

    // Footer
    const item =
      footers[
        Math.round(Math.random())
          ? 0
          : Math.round(Math.random() * (footers.length - 1))
      ]

    el.footerHeadingText.textContent = item.heading
    el.footerContentBody.textContent = item.body
    el.footerButtonText.textContent = item.buttonText
    el.footerButtonLink.href = item.buttonLink

    const collapseFooter = await getOption('collapseFooter', false)

    if (collapseFooter) {
      el.footer.classList.add('footer--collapsed')
      el.footerToggleClose.classList.add('footer__toggle--hidden')
      el.footerToggleOpen.classList.remove('footer__toggle--hidden')
    }

    el.footerHeading.addEventListener('click', async () => {
      const collapsed = el.footer.classList.contains('footer--collapsed')

      el.footer.classList[collapsed ? 'remove' : 'add']('footer--collapsed')
      el.footerToggleClose.classList[collapsed ? 'remove' : 'add'](
        'footer__toggle--hidden'
      )
      el.footerToggleOpen.classList[collapsed ? 'add' : 'remove'](
        'footer__toggle--hidden'
      )

      await setOption('collapseFooter', !collapsed)
    })

    Array.from(document.querySelectorAll('a[href^="http"]')).forEach((a) => {
      a.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopImmediatePropagation()

        const { version } = chrome.runtime.getManifest()

        open(a.href.replace(/__URL__/g, url).replace(/__VERSION__/g, version))

        return false
      })
    })

    // Game
    el.playGame.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopImmediatePropagation()

      el.playGame.classList.add('empty__play-game--hidden')
      el.game.classList.remove('ttt-game--hidden')
    })

    // Apply internationalization
    i18n()

    Popup.cache.categories = await Popup.driver('getCategories')
  },

  driver(func, args) {
    return sendMessage('popup.js', func, args)
  },

  /**
   * Log debug messages to the console
   * @param {String} message
   */
  log(message) {
    Popup.driver('log', message)
  },

  /**
   * Group technologies into categories
   * @param {Object} technologies
   */
  categorise(technologies) {
    return Object.values(
      technologies
        .filter(({ confidence }) => confidence >= 50)
        .reduce((categories, technology) => {
          technology.categories.forEach((category) => {
            categories[category.id] = categories[category.id] || {
              ...category,
              technologies: [],
            }

            categories[category.id].technologies.push(technology)
          })

          return categories
        }, {})
    )
  },

  /**
   * Callback for getDetection listener
   * @param {Array} detections
   */
  async onGetDetections(detections = []) {
    Popup.cache.detections = detections

    const el = {
      empty: document.querySelector('.empty'),
      playGame: document.querySelector('.empty__play-game'),
      game: document.querySelector('.ttt-game'),
      detections: document.querySelector('.detections'),
      issue: document.querySelector('.issue'),
      plusDownload: document.querySelector('.plus-download'),
    }

    detections = (detections || [])
      .filter(({ confidence }) => confidence >= 50)
      .filter(({ slug }) => slug !== 'cart-functionality')

    if (!detections || !detections.length) {
      el.empty.classList.remove('empty--hidden')
      el.playGame.classList.remove('empty__play-game--hidden')
      el.game.classList.add('ttt-game--hidden')
      el.detections.classList.add('detections--hidden')
      el.issue.classList.add('issue--hidden')
      el.plusDownload.classList.add('plus-download--hidden')

      return
    }

    el.empty.classList.add('empty--hidden')
    el.detections.classList.remove('detections--hidden')
    el.issue.classList.remove('issue--hidden')
    el.plusDownload.classList.remove('plus-download--hidden')

    while (el.detections.firstChild) {
      el.detections.removeChild(detections.firstChild)
    }

    const pinnedCategory = await getOption('pinnedCategory')

    const categorised = Popup.categorise(detections)

    categorised.forEach(({ id, name, slug: categorySlug, technologies }) => {
      const categoryNode = Popup.templates.category.cloneNode(true)

      const el = {
        detections: document.querySelector('.detections'),
        link: categoryNode.querySelector('.category__link'),
        pins: categoryNode.querySelectorAll('.category__pin'),
        pinsActive: document.querySelectorAll('.category__pin--active'),
      }

      el.link.href = `https://www.wappalyzer.com/technologies/${categorySlug}/?utm_source=popup&utm_medium=extension&utm_campaign=wappalyzer`
      el.link.dataset.i18n = `categoryName${id}`

      if (pinnedCategory === id) {
        el.pins.forEach((pin) => pin.classList.add('category__pin--active'))
      }

      el.pins.forEach((pin) =>
        pin.addEventListener('click', async () => {
          const pinnedCategory = await getOption('pinnedCategory')

          el.pinsActive.forEach((pin) =>
            pin.classList.remove('category__pin--active')
          )

          if (pinnedCategory === id) {
            await setOption('pinnedCategory', null)
          } else {
            await setOption('pinnedCategory', id)

            el.pins.forEach((pin) => pin.classList.add('category__pin--active'))
          }
        })
      )

      technologies.forEach(
        ({ name, slug, confidence, version, icon, website }) => {
          const technologyNode = Popup.templates.technology.cloneNode(true)

          const el = {
            technologies: categoryNode.querySelector('.technologies'),
            iconImage: technologyNode.querySelector('.technology__icon img'),
            link: technologyNode.querySelector('.technology__link'),
            name: technologyNode.querySelector('.technology__name'),
            version: technologyNode.querySelector('.technology__version'),
            confidence: technologyNode.querySelector('.technology__confidence'),
          }

          el.iconImage.src = `../images/icons/${icon}`

          el.link.href = `https://www.wappalyzer.com/technologies/${categorySlug}/${slug}/?utm_source=popup&utm_medium=extension&utm_campaign=wappalyzer`
          el.name.textContent = name

          if (confidence < 100) {
            el.confidence.textContent = `${confidence}% sure`
          } else {
            el.confidence.remove()
          }

          if (version) {
            el.version.textContent = version
          } else {
            el.version.remove()
          }

          el.technologies.appendChild(technologyNode)
        }
      )

      el.detections.appendChild(categoryNode)
    })

    if (categorised.length === 1) {
      el.detections.appendChild(Popup.templates.category.cloneNode(true))
    }

    Array.from(document.querySelectorAll('a')).forEach((a) =>
      a.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopImmediatePropagation()

        open(a.href)

        return false
      })
    )

    i18n()
  },

  /**
   * Show company and contact details
   * @param {String} url
   */
  async getPlus(url) {
    const apiKey = await getOption('apiKey', '')

    const el = {
      loading: document.querySelector('.loading'),
      panels: document.querySelector('.panels'),
      empty: document.querySelector('.plus-empty'),
      crawl: document.querySelector('.plus-crawl'),
      error: document.querySelector('.plus-error'),
      download: document.querySelector('.plus-download'),
      errorMessage: document.querySelector('.plus-error__message'),
      configure: document.querySelector('.plus-configure'),
      credits: document.querySelector('.credits'),
      creditsRemaining: document.querySelector('.credits__remaining'),
      footer: document.querySelector('.footer'),
    }

    el.error.classList.add('plus-error--hidden')
    el.download.classList.add('plus-download--hidden')

    if (apiKey) {
      el.loading.classList.remove('loading--hidden')
      el.configure.classList.add('plus-configure--hidden')
      el.footer.classList.remove('footer--hidden')
    } else {
      el.loading.classList.add('loading--hidden')
      el.configure.classList.remove('plus-configure--hidden')
      el.footer.classList.add('footer--hidden')

      return
    }

    el.panels.classList.add('panels--hidden')
    el.empty.classList.add('plus-empty--hidden')
    el.crawl.classList.add('plus-crawl--hidden')
    el.error.classList.add('plus-error--hidden')

    while (el.panels.lastElementChild) {
      el.panels.removeChild(el.panels.lastElementChild)
    }

    try {
      const response = await fetch(
        `https://api.wappalyzer.com/v2/plus/${encodeURIComponent(url)}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const error = new Error()

        error.data = data
        error.response = response

        throw error
      }

      const { attributes, creditsRemaining, crawl } = data

      if (Popup.cache.detections.length) {
        attributes.signals = attributes.signals || []

        attributes.signals.technologySpend = getTechnologySpend(
          Popup.cache.detections
        )
      }

      el.creditsRemaining.textContent = parseInt(
        creditsRemaining || 0,
        10
      ).toLocaleString()

      el.loading.classList.add('loading--hidden')
      el.credits.classList.remove('credits--hidden')

      if (crawl) {
        document
          .querySelector('.plus-crawl')
          .classList.remove('plus-crawl--hidden')

        return
      }

      if (!Object.keys(attributes).length) {
        el.empty.classList.remove('plus-empty--hidden')
        el.download.classList.remove('plus-download--hidden')

        return
      }

      const attributeValues = {}

      Object.keys(attributes).forEach((set) => {
        const panel = document.createElement('div')
        const header = document.createElement('div')
        const content = document.createElement('div')
        const table = document.createElement('table')

        panel.classList.add('panel')
        header.classList.add('panel__header')
        content.classList.add('panel__content')

        header.setAttribute(
          'data-i18n',
          `set${set.charAt(0).toUpperCase() + set.slice(1)}`
        )

        Object.keys(attributes[set]).forEach((key) => {
          const value = attributes[set][key]

          const tr = document.createElement('tr')

          const th = document.createElement('th')
          const td = document.createElement('td')

          th.setAttribute(
            'data-i18n',
            `attribute${
              key.charAt(0).toUpperCase() + key.slice(1).replace('.', '_')
            }`
          )

          attributeValues[key] = []

          if (Array.isArray(value)) {
            value.forEach((value) => {
              const div = document.createElement('div')

              if (typeof value === 'object') {
                attributeValues[key].push(value.text)

                const a = document.createElement('a')

                a.href = value.to
                a.textContent = value.text

                if (key === 'keywords') {
                  a.style = 'padding-right: .3rem;'

                  const space = document.createTextNode(' ')

                  td.append(a, space)
                } else if (
                  ['email', 'verifiedEmail', 'safeEmail'].includes(key)
                ) {
                  const { email, name, title } = parseEmail(value.text)

                  a.textContent = email

                  const div = document.createElement('div')
                  const elName = document.createElement('span')
                  const elTitle = document.createElement('span')
                  const elBreak1 = document.createElement('br')
                  const elBreak2 = document.createElement('br')

                  elName.textContent = name
                  elTitle.textContent = `${title}`

                  elTitle.className = 'light-text'

                  div.append(a)

                  if (name && name !== email) {
                    div.appendChild(elBreak1)
                    div.appendChild(elName)

                    if (title) {
                      div.appendChild(elBreak2)
                      div.appendChild(elTitle)
                    }
                  }

                  td.append(div)
                } else {
                  div.appendChild(a)
                  td.appendChild(div)
                }
              } else if (key === 'employees') {
                attributeValues[key].push(value)

                const [name, title] = value.split(' -- ')

                const elName = document.createElement('span')
                const elTitle = document.createElement('span')
                const elBreak = document.createElement('br')

                elTitle.className = 'light-text'

                elName.textContent = name
                elTitle.textContent = title

                div.appendChild(elName)
                div.appendChild(elBreak)
                div.appendChild(elTitle)
                td.appendChild(div)
              } else {
                attributeValues[key].push(value)

                div.textContent = value
                td.appendChild(div)
              }
            })
          } else if (key === 'companyName') {
            attributeValues[key].push(value)

            const strong = document.createElement('strong')

            strong.textContent = value

            td.appendChild(strong)
          } else {
            attributeValues[key].push(value)

            td.textContent = value
          }

          if (key !== 'keywords') {
            tr.appendChild(th)
          }

          tr.appendChild(td)
          table.appendChild(tr)
        })

        content.appendChild(table)

        panel.appendChild(header)
        panel.appendChild(content)
        el.panels.appendChild(panel)
      })

      Popup.cache.attributeValues = attributeValues

      el.panels.classList.remove('panels--hidden')
      el.download.classList.remove('plus-download--hidden')
    } catch (error) {
      Popup.log(error.data)

      // eslint-disable-next-line
      console.log(error)

      el.errorMessage.textContent = `Sorry, something went wrong${
        error.response ? ` (${error.response.status})` : ''
      }. Please try again later.`

      if (error.response) {
        if (error.response.status === 403) {
          el.errorMessage.textContent =
            typeof error.data === 'string'
              ? error.data
              : 'No access. Please check your API key.'

          el.configure.classList.remove('plus-configure--hidden')
        } else if (error.response.status === 429) {
          el.errorMessage.textContent =
            'Too many requests. Please try again in a few seconds.'
        } else if (
          error.response.status === 400 &&
          typeof error.data === 'string'
        ) {
          el.errorMessage.textContent = error.data
        }
      }

      el.loading.classList.add('loading--hidden')
      el.error.classList.remove('plus-error--hidden')
    }

    Array.from(document.querySelectorAll('.panels a')).forEach((a) =>
      a.addEventListener('click', (event) => {
        event.preventDefault()

        open(a.href)

        return false
      })
    )

    i18n()
  },

  async downloadCsv(event) {
    event.preventDefault()

    const { csv, filename } = getCsv()

    const file = URL.createObjectURL(
      new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8' })
    )

    const granted = await promisify(chrome.permissions, 'request', {
      permissions: ['downloads'],
    })

    if (granted) {
      chrome.downloads.download({
        url: file,
        filename,
      })
    }

    return false
  },
}

if (/complete|interactive|loaded/.test(document.readyState)) {
  Popup.init()
} else {
  document.addEventListener('DOMContentLoaded', Popup.init)
}
