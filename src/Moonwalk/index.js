import ScrollReveal from 'scrollreveal'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  /* if your app needs to do some initialization while the application:ready has been fired,
  /* you can set this to false. You will then have to call `this.ready()` to start the reveals */
  fireOnReady: true,
  walks: {
    default: {
      duration: 800,
      distance: '20px',
      easing: 'ease',
      viewFactor: 0.0,
      delay: 50,
      interval: 90,
      useDelay: 'once'
    }
  }
}

export default class Moonwalk {
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.SR = ScrollReveal()
    this.parseChildren()

    if (this.opts.fireOnReady) {
      window.addEventListener('application:ready', this.ready.bind(this))
    }
  }

  parseChildren () {
    Object.keys(this.opts.walks).forEach(key => {
      this.findElementsByKey(key)
    })
  }

  findElementsByKey (key) {
    let searchAttr = ''
    let attr = ''

    if (key === 'default') {
      searchAttr = '[data-moonwalk-children]'
      attr = 'data-moonwalk'
    } else {
      searchAttr = `[data-moonwalk-${key}-children]`
      attr = `data-moonwalk-${key}`
    }

    let elements = document.querySelectorAll(searchAttr)
    return this.setAttrs(elements, attr)
  }

  setAttrs (elements, attr) {
    const affectedElements = []
    Array.prototype.forEach.call(elements, function (el, i) {
      let children = el.children
      Array.prototype.forEach.call(children, function (c, x) {
        c.setAttribute(attr, '')
        affectedElements.push(c)
      })
    })
    return affectedElements
  }

  ready () {
    const walkSections = document.querySelectorAll('[data-moonwalk-section]')

    // loop through walk sections
    for (let i = 0; i < walkSections.length; i++) {
      // process walksection
      Object.keys(this.opts.walks).forEach(key => {
        let searchAttr = ''
        if (key === 'default') {
          searchAttr = '[data-moonwalk]:not(.lazyload)'
        } else {
          searchAttr = `[data-moonwalk-${key}]:not(.lazyload)`
        }
        let walks = walkSections[i].querySelectorAll(searchAttr)
        this.reveal(walks, this.opts.walks[key])
      })
    }
  }

  reveal (elements, config, callback = null) {
    if (callback) {
      config = { ...config, beforeReveal: callback }
    }
    if (elements.length) {
      this.SR.reveal(elements, config)
    }
  }
}
