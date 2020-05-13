import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'

const DEFAULT_OPTIONS = {
  runListenerOnInit: false,
  breakpoints: [
    'xs',
    'sm',
    'md',
    'lg'
  ],

  listeners: {
    // xs: (mq) => {
    //   if (mq.matches) {
    //     // XS NOW
    //   } else {
    //     // NOT XS ANYMORE
    //   }
    // }
  }
}

export default class Breakpoints {
  constructor (app, opts = {}) {
    this.app = app
    this.mediaQueries = {}
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    window.addEventListener(Events.APPLICATION_PRELUDIUM, this.initialize.bind(this))
  }

  initialize () {
    this.opts.breakpoints.forEach(size => { this.mediaQueries[size] = this._getVal(`--breakpoint-${size}`) })

    const keys = Object.keys(this.mediaQueries)
    keys.forEach(key => {
      let query = ''
      const next = keys[(keys.indexOf(key) + 1) % keys.length]
      if (key === this.opts.breakpoints[0] && this.mediaQueries[key] === '0') {
        query = `(min-width: 0px) and (max-width: ${parseInt(this.mediaQueries[next]) - 1}px)`
      } else if (next === this.opts.breakpoints[0]) {
        // max size
        query = `(min-width: ${this.mediaQueries[key]})`
      } else {
        query = `(min-width: ${this.mediaQueries[key]}) and (max-width: ${parseInt(this.mediaQueries[next]) - 1}px)`
      }

      this.mediaQueries[key] = window.matchMedia(query)
      this.mediaQueries[key].addListener(this.defaultListener)

      if (Object.prototype.hasOwnProperty.call(this.opts.listeners, key)) {
        this.mediaQueries[key].addListener(this.opts.listeners[key])
      }
    })

    if (this.opts.runListenerOnInit) {
      const { key, mq } = this.getCurrentBreakpoint()
      if (Object.prototype.hasOwnProperty.call(this.opts.listeners, key)) {
        this.opts.listeners[key](mq)
      }
    }
  }

  getCurrentBreakpoint () {
    const key = Object
      .keys(this.mediaQueries)
      .find(q => this.mediaQueries[q].matches)

    return { key, mq: this.mediaQueries[key] }
  }

  defaultListener (e) {
    const evt = new CustomEvent(Events.BREAKPOINT_CHANGE)
    window.dispatchEvent(evt)
  }

  _getVal (key) {
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim()
  }
}
