import ScrollReveal from 'scrollreveal'
import _defaultsDeep from 'lodash.defaultsdeep'

const SR = ScrollReveal()
const DEFAULT_OPTIONS = {
  walks: {
    default: {
      duration: 800,
      distance: '20px',
      easing: 'ease',
      viewFactor: 0.0,
      delay: 50,
      interval: 90,
      useDelay: 'once'
    },
    fade: {
      duration: 1200,
      distance: '0px',
      easing: 'ease',
      viewFactor: 0.0,
      delay: 50,
      interval: 120,
      useDelay: 'once'
    },

    offset: {
      duration: 1200,
      distance: '20px',
      easing: 'ease',
      viewFactor: 0.0,
      viewOffset: { top: 0, right: 0, bottom: -400, left: 0 },
      delay: 500,
      useDelay: 'once'
    }
  }
}

export default class Moonwalk {
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.parseChildren()
    window.addEventListener('application:ready', this.ready.bind(this))
  }

  parseChildren () {
    Object.keys(this.opts.walks).forEach(key => {
      let searchAttr = ''
      let setAttr = ''

      if (key === 'default') {
        searchAttr = '[data-moonwalk-children]'
        setAttr = 'data-moonwalk'
      } else {
        searchAttr = `[data-moonwalk-${key}-children]`
        setAttr = `data-moonwalk-${key}`
      }

      let elements = document.querySelectorAll(searchAttr)
      Array.prototype.forEach.call(elements, function (el, i) {
        let children = el.children
        Array.prototype.forEach.call(children, function (c, x) {
          c.setAttribute(setAttr, '')
        })
      })
    })
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
        SR.reveal(walks, this.opts.walks[key])
      })
    }
  }
}
