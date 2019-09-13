import { TweenMax, Sine, Power1 } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import rafCallback from '../../utils/rafCallback'
import prefersReducedMotion from '../../utils/prefersReducedMotion'
import * as Events from '../../events'

const DEFAULT_OPTIONS = {
  faderOpts: {
    fadeIn: () => {
      const fader = document.querySelector('#fader')

      TweenMax.to(fader, 0.65, {
        opacity: 0,
        ease: Power1.easeInOut,
        delay: 0.35,
        onComplete: () => {
          TweenMax.set(fader, { display: 'none' })
          document.body.classList.remove('unloaded')
        }
      })
    }
  }
}

export default class Application {
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.fader = null
    this.callbacks = {}

    this.INITIALIZED = false
    this.PREFERS_REDUCED_MOTION = prefersReducedMotion()

    if (this.PREFERS_REDUCED_MOTION) {
      TweenMax.globalTimeScale(200)
      document.documentElement.classList.add('prefers-reduced-motion')
    }

    this.beforeInitializedEvent = new window.CustomEvent(Events.APPLICATION_PRELUDIUM, this)
    this.initializedEvent = new window.CustomEvent(Events.APPLICATION_INITIALIZED, this)
    this.readyEvent = new window.CustomEvent(Events.APPLICATION_READY, this)

    /**
     * Grab common events and defer
     */
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    window.addEventListener('orientationchange', this.onResize)
    window.addEventListener('scroll', rafCallback(this.onScroll))
    window.addEventListener('resize', rafCallback(this.onResize))

    TweenMax.defaultEase = Sine.easeOut
  }

  /**
   * Main init. Called from client application on DOMReady.
   */
  initialize () {
    this._emitBeforeInitializedEvent()
    this.executeCallbacks(Events.APPLICATION_PRELUDIUM)
    this.setupGridoverlay()
    this._emitInitializedEvent()
    this.executeCallbacks(Events.APPLICATION_INITIALIZED)
    this.ready()
  }

  ready () {
    this.fadeIn()
    this._emitReadyEvent()
    this.executeCallbacks(Events.APPLICATION_READY)
  }

  fadeIn () {
    this.opts.faderOpts.fadeIn()
  }

  registerCallback (type, callback) {
    if (!Object.prototype.hasOwnProperty.call(this.callbacks, type)) {
      this.callbacks[type] = []
    }
    this.callbacks[type].push(callback)
  }

  executeCallbacks (type) {
    if (!Object.prototype.hasOwnProperty.call(this.callbacks, type)) {
      return
    }
    this.callbacks[type].forEach(cb => cb(this))
  }

  _emitBeforeInitializedEvent () {
    window.dispatchEvent(this.beforeInitializedEvent)
  }

  _emitInitializedEvent () {
    window.dispatchEvent(this.initializedEvent)
    this.INITIALIZED = true
  }

  _emitReadyEvent () {
    window.dispatchEvent(this.readyEvent)
  }

  // raf'ed resize event
  onResize (e) {
    const evt = new CustomEvent(Events.APPLICATION_RESIZE, e)
    window.dispatchEvent(evt)
  }

  onScroll (e) {
    const evt = new CustomEvent(Events.APPLICATION_SCROLL, e)
    window.dispatchEvent(evt)
  }

  onVisibilityChange (e) {
    const evt = new CustomEvent(Events.APPLICATION_VISIBILITY_CHANGE, e)
    window.dispatchEvent(evt)
  }

  setupGridoverlay () {
    const gridKeyPressed = e => {
      if (e.keyCode === 71 && e.ctrlKey) {
        const guides = document.querySelector('.__dbg')
        guides.classList.toggle('visible')
      }
    }
    document.onkeydown = gridKeyPressed
  }
}
