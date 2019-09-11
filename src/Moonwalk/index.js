import ScrollReveal from 'scrollreveal'
import _defaultsDeep from 'lodash.defaultsdeep'
import prefersReducedMotion from '../utils/prefersReducedMotion'

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

    if (prefersReducedMotion()) {
      this.removeAllWalks()
    } else {
      this.SR = ScrollReveal()
      this.parseChildren()

      if (this.opts.fireOnReady) {
        window.addEventListener('application:ready', this.ready.bind(this))
      }
    }
  }

  removeAllWalks () {
    Object.keys(this.opts.walks).forEach(key => {
      let searchAttr

      if (key === 'default') {
        searchAttr = 'data-moonwalk'
      } else {
        searchAttr = `data-moonwalk-${key}`
      }

      const elems = document.querySelectorAll(`[${searchAttr}]`)

      Array.from(elems).forEach(el => {
        el.removeAttribute(searchAttr)
      })
    }, this)
  }

  parseChildren () {
    Object.keys(this.opts.walks).forEach(key => {
      this.findElementsByKey(key)
    }, this)
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

    const elements = document.querySelectorAll(searchAttr)
    return this.setAttrs(elements, attr)
  }

  setAttrs (elements, attr) {
    const affectedElements = []

    Array.prototype.forEach.call(elements, el => {
      const { children } = el

      Array.prototype.forEach.call(children, c => {
        c.setAttribute(attr, '')
        affectedElements.push(c)
      })
    })
    return affectedElements
  }

  ready () {
    const walkSections = document.querySelectorAll('[data-moonwalk-section]')

    // loop through walk sections
    for (let i = 0; i < walkSections.length; i += 1) {
      // process walksection
      Object.keys(this.opts.walks).forEach(key => {
        let searchAttr = ''
        if (key === 'default') {
          searchAttr = '[data-moonwalk]:not(.lazyload)'
        } else {
          searchAttr = `[data-moonwalk-${key}]:not(.lazyload)`
        }
        const walks = walkSections[i].querySelectorAll(searchAttr)
        this.reveal(walks, this.opts.walks[key])
      }, this)
    }
  }

  reveal (elements, config, callback = null) {
    let modifiedConfig = config

    if (callback) {
      modifiedConfig = { ...config, beforeReveal: callback }
    }

    if (elements.length) {
      this.SR.reveal(elements, modifiedConfig)
    }
  }
}
