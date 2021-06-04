import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import _defaultsDeep from 'lodash.defaultsdeep'
import rafCallback from '../../utils/rafCallback'
import prefersReducedMotion from '../../utils/prefersReducedMotion'
import * as Events from '../../events'
import Breakpoints from '../Breakpoints'
import FeatureTests from '../FeatureTests'
import Fontloader from '../Fontloader'
import Dom from '../Dom'

gsap.registerPlugin(ScrollToPlugin)
gsap.defaults({ overwrite: 'auto', ease: 'sine.out' })

window.onpageshow = event => {
  if (event.persisted) {
    gsap.to(document.querySelector('#fader'), { duration: 0.35, autoAlpha: 0 })
    gsap.to(document.querySelectorAll('[data-fader]'), { duration: 0.35, autoAlpha: 0 })
  }
}

const DEFAULT_OPTIONS = {
  respectReducedMotion: true,
  featureTests: {
    touch: true
  },

  focusableSelectors: [
    'a', 'input', 'select', 'button', 'textarea', 'iframe' // , 'video'?
  ],

  bindScroll: true,
  bindResize: true,

  // Big Sur + Safari 14 is now trying to display webp, but fails intermittently
  disableWebpSafari: true,

  faderOpts: {
    fadeIn: (callback = () => {}) => {
      const fader = document.querySelector('#fader')
      gsap.to(fader, {
        opacity: 0,
        ease: 'power1.inOut',
        delay: 0,
        duration: 0.65,
        onComplete: () => {
          gsap.set(fader, { display: 'none' })
          document.body.classList.remove('unloaded')
          callback()
        }
      })
    }
  }
}
export default class Application {
  constructor (opts = {}) {
    this.debugType = 1
    this.debugOverlay = null
    this.userAgent = navigator.userAgent
    this._lastWindowHeight = 0
    this.breakpoint = null

    this.size = {
      width: 0,
      height: 0,
      initialInnerHeight: 0,
      initialOuterHeight: 0,
      initialInnerWidth: 0,
      initialOuterWidth: 0
    }

    this.position = {
      top: 0,
      left: 0
    }

    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.focusableSelectors = this.opts.focusableSelectors

    this.featureTests = new FeatureTests(this, this.opts.featureTests)
    if (typeof this.opts.breakpointConfig === 'object') {
      this.breakpoints = new Breakpoints(this, this.opts.breakpointConfig)
    } else {
      this.breakpoints = new Breakpoints(this, this.opts.breakpointConfig(this))
    }

    this.hacks()

    this.setDims()
    this.fontLoader = new Fontloader(this)

    this.fader = null
    this.callbacks = {}

    this.SCROLL_LOCKED = false
    this.SCROLLBAR_WIDTH = null
    this.getScrollBarWidth()

    this.INITIALIZED = false

    this.PREFERS_REDUCED_MOTION = prefersReducedMotion()
    if (this.PREFERS_REDUCED_MOTION && this.opts.respectReducedMotion) {
      gsap.globalTimeline.timeScale(200)
      document.documentElement.classList.add('prefers-reduced-motion')
    }
    window.addEventListener(Events.BREAKPOINT_CHANGE, this.onBreakpointChanged.bind(this))

    this.beforeInitializedEvent = new window.CustomEvent(Events.APPLICATION_PRELUDIUM, this)
    this.initializedEvent = new window.CustomEvent(Events.APPLICATION_INITIALIZED, this)
    this.readyEvent = new window.CustomEvent(Events.APPLICATION_READY, this)
    this.revealedEvent = new window.CustomEvent(Events.APPLICATION_REVEALED, this)

    /**
     * Grab common events and defer
     */
    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this))
    window.addEventListener('orientationchange', this.onResize.bind(this), {
      capture: false,
      passive: true
    })

    if (opts.bindScroll) {
      window.addEventListener('scroll', rafCallback(this.onScroll.bind(this)), {
        capture: false,
        passive: true
      })
    }

    if (opts.bindResize) {
      window.addEventListener('resize', rafCallback(this.onResize.bind(this)), {
        capture: false,
        passive: true
      })
    }
  }

  /**
   * Main init. Called from client application on DOMReady.
   */
  initialize () {
    this._emitBeforeInitializedEvent()
    this.setSection()
    this.executeCallbacks(Events.APPLICATION_PRELUDIUM)
    this.setupDebug()
    this._emitInitializedEvent()
    this.executeCallbacks(Events.APPLICATION_INITIALIZED)
    this.ready()
  }

  /**
  * Application is initialized and ready.
  * Fade in, then execute callbacks
  */
  ready () {
    this.fontLoader.loadFonts(this.opts.fonts).then(() => {
      this._emitReadyEvent()
      this.executeCallbacks(Events.APPLICATION_READY)
      this.fadeIn()
    })
  }

  /**
   * Fade in application, as declared in the `faderOpts`
   */
  fadeIn () {
    this.opts.faderOpts.fadeIn(this._emitRevealedEvent.bind(this))
  }

  /**
   * Register callbacks by `type`
   */
  registerCallback (type, callback) {
    if (!Object.prototype.hasOwnProperty.call(this.callbacks, type)) {
      this.callbacks[type] = []
    }
    this.callbacks[type].push(callback)
  }

  /**
   * Execute callbacks by `type`
   */
  executeCallbacks (type) {
    if (!Object.prototype.hasOwnProperty.call(this.callbacks, type)) {
      return
    }
    this.callbacks[type].forEach(cb => cb(this))
  }

  /**
   * Set section
   */
  setSection () {
    this.section = document.body.getAttribute('data-script')
  }

  /**
   * Check if document is scrolled
   */
  isScrolled () {
    return (window.pageYOffset
      || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0) > 0
  }

  /**
   * Locks body scroll
   * `extraPaddedElements` can be a list of elements that also need padding, such as the header!
   * @param {*} extraPaddedElements
   */
  scrollLock (extraPaddedElements = []) {
    if (this.SCROLL_LOCKED) {
      return
    }
    const currentScrollbarWidth = this.getCurrentScrollBarWidth()
    const ev = new window.CustomEvent(Events.APPLICATION_SCROLL_LOCKED, this)
    this._scrollPaddedElements = [document.body, ...extraPaddedElements]
    window.dispatchEvent(ev)
    this.SCROLL_LOCKED = true
    gsap.set(document.body, { overflow: 'hidden' })
    gsap.set(this._scrollPaddedElements, { paddingRight: currentScrollbarWidth })
    document.addEventListener('touchmove', this.scrollVoid, false)
  }

  scrollRelease () {
    if (!this.SCROLL_LOCKED) {
      return
    }
    const ev = new window.CustomEvent(Events.APPLICATION_SCROLL_RELEASED, this)
    window.dispatchEvent(ev)
    this.SCROLL_LOCKED = false
    gsap.set(document.body, { clearProps: 'overflow' })
    gsap.set(this._scrollPaddedElements, { clearProps: 'paddingRight' })
    document.removeEventListener('touchmove', this.scrollVoid, false)
  }

  /**
   *
   * @param {*} target
   * this can be an object too if you want to override scrollTo: `{y: "#someID", offsetY: 50}`
   * @param {*} time
   * @param {*} emitEvents
   */
  scrollTo (target, time = 0.8, emitEvents = true) {
    let scrollToData
    const forcedScrollEventStart = new window.CustomEvent(Events.APPLICATION_FORCED_SCROLL_START)
    if (emitEvents) {
      window.dispatchEvent(forcedScrollEventStart)
    }

    if (typeof target === 'object') {
      scrollToData = target
    } else {
      scrollToData = { y: target, autoKill: false }
    }

    gsap.to(window, {
      duration: time,
      scrollTo: scrollToData,
      onComplete: () => {
        const forcedScrollEventEnd = new window.CustomEvent(Events.APPLICATION_FORCED_SCROLL_END)
        if (emitEvents) {
          window.dispatchEvent(forcedScrollEventEnd)
        }
      },
      ease: 'sine.inOut'
    })
  }

  hardScrollTo (target) {
    const element = Dom.find(target)
    if (element) {
      element.scrollIntoView()
    }
  }

  scrollVoid (e) {
    e.preventDefault()
  }

  /**
   * Get current scrollbar width — if there is none, there is none
   */
  getCurrentScrollBarWidth () {
    return window.innerWidth - document.documentElement.clientWidth
  }

  /**
   * Get scrollbar width by FORCE. No matter if there is
   * currently a scrollbar or not
   */
  getScrollBarWidth () {
    if (!this.SCROLLBAR_WIDTH) {
      // Creating invisible container
      const outer = document.createElement('div')
      outer.style.visibility = 'hidden'
      outer.style.overflow = 'scroll' // forcing scrollbar to appear
      outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
      document.body.appendChild(outer)

      // Creating inner element and placing it in the container
      const inner = document.createElement('div')
      outer.appendChild(inner)

      // Calculating difference between container's full width and the child width
      this.SCROLLBAR_WIDTH = (outer.offsetWidth - inner.offsetWidth)

      // Removing temporary elements from the DOM
      outer.parentNode.removeChild(outer)
    }
  }

  /**
   * Ugly hacks
   */
  hacks () {
    if (this.opts.disableWebpSafari) {
      if (this.browser === 'safari') {
        console.debug('==> disable webp')
        const webps = Dom.all('source[type="image/webp"]')
        for (let i = 0; i < webps.length; i += 1) {
          webps[i].remove()
        }
      }
    }
  }

  getIOSCurrentInnerHeight () {
    return window.innerHeight
  }

  getIOSInnerHeightMax () {
    if (!navigator.userAgent.match(/iphone|ipod|ipad/i)) {
      return window.innerHeight
    }

    const axis = Math.abs(window.orientation)
    const dims = { w: 0, h: 0 }

    const createRuler = () => {
      let ruler = document.createElement('div')

      ruler.style.position = 'fixed'
      ruler.style.height = '100vh'
      ruler.style.width = 0
      ruler.style.top = 0

      document.documentElement.appendChild(ruler)

      dims.w = axis === 90 ? ruler.offsetHeight : window.innerWidth
      dims.h = axis === 90 ? window.innerWidth : ruler.offsetHeight

      document.documentElement.removeChild(ruler)
      ruler = null
    }

    createRuler()

    if (Math.abs(window.orientation) !== 90) {
      return dims.h
    }

    return dims.w
  }

  /**
   * Event emitters
   */
  _emitBeforeInitializedEvent () {
    window.dispatchEvent(this.beforeInitializedEvent)
  }

  _emitInitializedEvent () {
    window.dispatchEvent(this.initializedEvent)
    this.INITIALIZED = true
  }

  _emitReadyEvent () {
    window.dispatchEvent(this.readyEvent)
    document.body.dataset.appReady = true
  }

  _emitRevealedEvent () {
    window.dispatchEvent(this.revealedEvent)
    this.executeCallbacks(Events.APPLICATION_REVEALED)
    document.body.dataset.appRevealed = true
  }

  setDims () {
    const root = document.querySelector(':root')

    this.size.initialInnerHeight = window.innerHeight
    this.size.initialOuterHeight = window.outerHeight
    this.size.initialInnerWidth = window.innerWidth
    this.size.initialOuterWidth = window.outerWidth

    root.style.setProperty('--vp-initial-inner-h', `${this.size.initialInnerHeight}px`)
    root.style.setProperty('--vp-initial-outer-h', `${this.size.initialOuterHeight}px`)
    root.style.setProperty('--vp-initial-inner-w', `${this.size.initialInnerWidth}px`)
    root.style.setProperty('--vp-initial-outer-w', `${this.size.initialOuterWidth}px`)
    this.setvh100Max()
    this.setvh100()

    this.size.container = Dom.getCSSVar('--container-padding')
    this.size.width = window.innerWidth
    this.size.height = window.innerHeight
    this.position.top = window.pageYOffset
    this.position.left = window.pageXOffset
  }

  /**
   * Inner height of mobiles may change when showing hiding bottom bar.
   */
  setvh100 () {
    const root = document.querySelector(':root')
    root.style.setProperty('--vp-100vh', `${window.innerHeight}px`)
    root.style.setProperty('--vp-1vh', `${window.innerHeight * 0.01}px`)
  }

  /**
   * Get the max 100vh for iOS
   */
  setvh100Max () {
    const root = document.querySelector(':root')
    const vh100 = this.featureTests.results.ios
      ? this.getIOSInnerHeightMax() : this.size.initialInnerHeight
    root.style.setProperty('--vp-100vh-max', `${vh100}px`)
    this.size.vh100max = vh100
  }

  onBreakpointChanged () {
    this.size.container = Dom.getCSSVar('--container-padding')
  }

  /**
   * RAF'ed resize event
   */
  onResize (e) {
    this.size.width = window.innerWidth
    this.size.height = window.innerHeight
    this.setvh100()

    const evt = new CustomEvent(Events.APPLICATION_RESIZE, e)
    window.dispatchEvent(evt)
  }

  /**
  * RAF'ed scroll event
  */
  onScroll (e) {
    if (this.SCROLL_LOCKED) {
      e.preventDefault()
      return
    }

    this.position.top = window.pageYOffset
    this.position.left = window.pageXOffset

    const evt = new CustomEvent(Events.APPLICATION_SCROLL, e)
    window.dispatchEvent(evt)
  }

  onVisibilityChange (e) {
    let evt = new CustomEvent(Events.APPLICATION_VISIBILITY_CHANGE, e)
    window.dispatchEvent(evt)

    if (document.visibilityState === 'hidden') {
      evt = new CustomEvent(Events.APPLICATION_HIDDEN, e)
      window.dispatchEvent(evt)
    } else if (document.visibilityState === 'visible') {
      evt = new CustomEvent(Events.APPLICATION_VISIBLE, e)
      window.dispatchEvent(evt)
    }
  }

  pollForElement (selector, time = 500, callback = () => {}) {
    const el = document.querySelector(selector)
    if (el !== null) {
      callback(el)
    } else {
      setTimeout(() => {
        this.pollForElement(selector, time, callback)
      }, time)
    }
  }

  pollForVar (variable, time = 500, callback = () => { }) {
    if (variable !== null) {
      callback(variable)
    } else {
      setTimeout(() => {
        this.pollForVar(variable, time, callback)
      }, time)
    }
  }

  setupDebug () {
    this.setupGridoverlay()
    this.debugOverlay = document.querySelector('.dbg-breakpoints')
    if (!this.debugOverlay) {
      return
    }
    this.debugOverlay.addEventListener('click', this.toggleDebug.bind(this))

    const userAgent = this.debugOverlay.querySelector('.user-agent')
    gsap.set(userAgent, { display: 'none' })
    userAgent.innerHTML = `<b>&rarr; ${this.userAgent}</b> >> <span>KOPIER</span>`

    const span = userAgent.querySelector('span')
    const windowWidth = window.innerWidth || document.documentElement.clientWidth
      || document.body.clientWidth
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
      || document.body.clientHeight

    span.addEventListener('click', () => {
      const copyText = userAgent.querySelector('b')
      const textArea = document.createElement('textarea')
      textArea.value = `
${copyText.textContent}
SCREEN >> ${window.screen.width}x${window.screen.height}
WINDOW >> ${windowWidth}x${windowHeight}

FEATURES >>
${JSON.stringify(this.featureTests.results, undefined, 2)}
      `
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('Copy')
      textArea.remove()
      span.innerHTML = 'OK!'
      setTimeout(() => {
        span.innerHTML = 'KOPIER'
      }, 1500)
    })
  }

  toggleDebug () {
    const tl = gsap.timeline()
    const breakpoint = this.debugOverlay.querySelector('.breakpoint')
    const userAgent = this.debugOverlay.querySelector('.user-agent')

    if (this.debugType >= 2) {
      this.debugType = 0
    } else {
      this.debugType += 1
    }

    switch (this.debugType) {
      case 0:
        // hide all except branding
        tl.to([breakpoint, userAgent], { duration: 0.3, autoAlpha: 0 })
          .to([breakpoint, userAgent], { duration: 0.7, width: 0 })
          .call(() => { gsap.set([breakpoint, userAgent], { display: 'none' }) })
        break

      case 1:
        //
        gsap.set(breakpoint, { width: 'auto', display: 'block' })
        tl.from(breakpoint, { duration: 0.7, width: 0 })
          .to(breakpoint, { duration: 0.3, autoAlpha: 1 })
        break

      case 2:
        //
        gsap.set(userAgent, { width: 'auto', display: 'block' })
        tl.from(userAgent, { duration: 0.7, width: 0 })
          .to(userAgent, { duration: 0.3, autoAlpha: 1 })
        break

      default:
        break
    }
  }

  /**
   * CTRL-G to show grid overlay
   */
  setupGridoverlay () {
    const gridKeyPressed = e => {
      if (e.keyCode === 71 && e.ctrlKey) {
        const guides = Dom.find('.dbg-grid')
        const cols = Dom.all(guides, 'b')

        if (!guides || !cols) {
          return
        }

        if (Dom.hasClass(guides, 'visible')) {
          gsap.set(cols, { width: 'auto' })
          gsap.to(cols, {
            duration: 0.35,
            width: 0,
            stagger: 0.02,
            ease: 'sine.inOut',
            onComplete: () => {
              guides.classList.toggle('visible')
            }
          })
        } else {
          gsap.set(cols, { width: 0 })
          guides.classList.toggle('visible')
          gsap.to(cols, {
            duration: 0.35,
            width: '100%',
            stagger: 0.02,
            ease: 'sine.inOut'
          })
        }
      }
    }
    document.onkeydown = gridKeyPressed
  }

  /**
   * Add in extra selectors that are focusable
   * @param {array} extraSelectors
   */
  addFocusableSelectors (extraSelectors) {
    if (extraSelectors.length) {
      this.focusableSelectors = this.focusableSelectors.concat(extraSelectors)
    }
  }

  /**
   * Set focusable selectors. Replaces default array.
   * @param {array} selectors
   */
  setFocusableSelectors (selectors) {
    if (selectors.length) {
      this.focusableSelectors = selectors
    }
  }

  /**
   * Returns focusable selectors as a comma separated list
   */
  getFocusableSelectors () {
    return this.focusableSelectors.join(',')
  }
}
