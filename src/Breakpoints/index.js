import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  breakpoints: [
    'xs',
    'sm',
    'md',
    'lg'
  ],

  listeners: {
    xs: (mq) => {
      // if (mq.matches) {
      //   console.log('XS NOW!')
      // } else {
      //   console.log('NOT XS')
      // }
    }
  }
}

export default class Breakpoints {
  constructor (opts = {}) {
    this.mediaQueries = {}
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    window.addEventListener('application:initialized', this.initialize.bind(this))
  }

  initialize () {
    for (let size of this.opts.breakpoints) {
      let val = this._getVal(`--breakpoint-${size}`)
      this.mediaQueries[size] = val
    }
    let keys = Object.keys(this.mediaQueries)
    for (let key of keys) {
      let query = ''
      let next = keys[(keys.indexOf(key) + 1) % keys.length]
      if (key === 'xs' && this.mediaQueries[key] === '0') {
        query = `(min-width: 0px) and (max-width: ${parseInt(this.mediaQueries[next]) - 1}px)`
      } else {
        if (next === 'xs') {
          // max size
          query = `(min-width: ${this.mediaQueries[key]})`
        } else {
          query = `(min-width: ${this.mediaQueries[key]}) and (max-width: ${parseInt(this.mediaQueries[next]) - 1}px)`
        }
      }

      this.mediaQueries[key] = window.matchMedia(query)

      if (this.opts.listeners.hasOwnProperty(key)) {
        this.mediaQueries[key].addListener(this.opts.listeners[key])
      }
    }
  }

  _getVal (key) {
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim()
  }
}
