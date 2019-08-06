/**
 * A header that stays fixed. Hides when scrolling down and is revealed on scrolling up.
 *
 * You can pass different configs for different sections:
 *
 *  this.header = new FixedHeader(
      document.querySelector('header'),
      {
        default: {
          offset: 60,
          offsetSmall: 1,
          offsetBg: 200,
          regBgColor: 'transparent'
        },

        sections: {
          index: {
            offsetBg: '#content'
          }
        }
      }
    )
 *
 */

import { TweenMax, Power3, Sine, TimelineLite } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_EVENTS = {
  onPin: (h) => {
    TweenMax.to(
      h.el,
      0.35,
      {
        yPercent: '0',
        ease: Sine.easeOut,
        autoRound: true
      }
    )
  },

  onUnpin: (h) => {
    h._hiding = true
    TweenMax.to(
      h.el,
      0.25,
      {
        yPercent: '-100',
        ease: Sine.easeIn,
        autoRound: true,
        onComplete: () => {
          h._hiding = false
        }
      }
    )
  },

  onAltBg: (h) => {
    TweenMax.to(
      h.el,
      0.2,
      {
        backgroundColor: h.opts.altBgColor
      }
    )
  },

  onNotAltBg: (h) => {
    TweenMax.to(
      h.el,
      0.4,
      {
        backgroundColor: h.opts.regBgColor
      }
    )
  },

  onSmall: (h) => {},
  onNotSmall: (h) => {},
  onTop: (h) => {},
  onNotTop: (h) => {},
  onBottom: (h) => {},
  onNotBottom: (h) => {}
}

const DEFAULT_OPTIONS = {
  default: {
    canvas: window,
    enter: h => {
      const timeline = new TimelineLite()
      timeline
        .set(h.el, { yPercent: -100 })
        .set(h.lis, { opacity: 0 })
        .to(h.el, 1, { yPercent: 0, delay: h.opts.enterDelay, ease: Power3.easeOut, autoRound: true })
        .staggerTo(h.lis, 0.8, { opacity: 1, ease: Sine.easeIn }, 0.1, '-=1')
    },
    enterDelay: 1.2,
    tolerance: 3,
    offset: 0, // how far from the top before we trigger hide
    offsetSmall: 50, // how far from the top before we trigger the shrinked padding,
    offsetBg: 200, // how far down before changing backgroundcolor
    regBgColor: 'transparent',
    altBgColor: '#ffffff',
    ...DEFAULT_EVENTS
  }
}

export default class FixedHeader {
  constructor (el, opts = {}) {
    if (typeof el === 'string') {
      this.el = document.querySelector(el)
    } else {
      this.el = el
    }

    if (!this.el) {
      return
    }

    opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    const section = document.body.getAttribute('data-script')
    this.opts = this._getOptionsForSection(section, opts)

    this.lis = this.el.querySelectorAll('li')

    this._firstLoad = true
    this._pinned = true
    this._top = false
    this._bottom = false
    this._small = false
    this._altBg = false
    this._hiding = false // if we're in the process of hiding the bar
    this.lastKnownScrollY = 0
    this.currentScrollY = 0
    this.mobileMenuOpen = false
    this.timer = null

    this.initialize()
  }

  initialize () {
    // bind to canvas scroll
    this.lastKnownScrollY = this.getScrollY()
    this.currentScrollY = this.lastKnownScrollY

    if (typeof this.opts.offsetBg === 'string') {
      // get offset of element, with height of header subtracted
      const elm = document.querySelector(this.opts.offsetBg)
      this.opts.offsetBg = elm.offsetTop - this.el.offsetHeight
    }

    window.addEventListener('scroll', this.requestTick.bind(this), false)
    this.redraw(true)
    this._bindMobileMenuListeners()
  }

  requestTick () {
    if (!this.ticking) {
      requestAnimationFrame(this.update.bind(this))
    }
    this.ticking = true
  }

  update () {
    this.ticking = false
    this.redraw(false)
  }

  checkSize (force) {
    if (this.currentScrollY > this.opts.offsetSmall) {
      if (force) {
        this.small()
      } else {
        if (!this._small) {
          this.small()
        }
      }
    } else {
      if (force) {
        this.notSmall()
      } else {
        if (this._small) {
          this.notSmall()
        }
      }
    }
  }

  checkBg (force) {
    if (this.currentScrollY > this.opts.offsetBg) {
      if (force) {
        this.altBg()
      } else {
        if (!this._altBg && !this._hiding) {
          this.altBg()
        }
      }
    } else {
      if (force) {
        this.notAltBg()
      } else {
        if (this._altBg) {
          this.notAltBg()
        }
      }
    }
  }

  checkTop (force) {
    if (this.currentScrollY <= this.opts.offset) {
      if (force) {
        this.top()
      } else {
        if (!this._top) {
          this.top()
        }
      }
    } else {
      if (force) {
        this.notTop()
      } else {
        if (this._top) {
          this.notTop()
        }
      }
    }
  }

  checkBot (force) {
    if (this.currentScrollY + this.getViewportHeight() >= this.getScrollerHeight()) {
      if (force) {
        this.bottom()
      } else {
        if (!this._bottom) {
          this.bottom()
        }
      }
    } else {
      if (force) {
        this.notBottom()
      } else {
        if (this._bottom) {
          this.notBottom()
        }
      }
    }
  }

  checkPin (force, toleranceExceeded) {
    if (this.shouldUnpin(toleranceExceeded)) {
      if (this.mobileMenuOpen) {
        return
      }
      if (force) {
        this.unpin()
      } else {
        if (this._pinned) {
          this.unpin()
        }
      }
    } else if (this.shouldPin(toleranceExceeded)) {
      if (force) {
        this.pin()
      } else {
        if (!this._pinned) {
          this.pin()
        }
      }
    }
  }

  redraw (force = false, enter = true) {
    if (force && this.opts.enter) {
      this.checkSize(force)
      this.checkBg(force)
      this.checkTop(force)

      if (enter) {
        this.opts.enter(this)
      }

      return
    }

    this.currentScrollY = this.getScrollY()
    const toleranceExceeded = this.toleranceExceeded()

    if (this.isOutOfBounds()) { // Ignore bouncy scrolling in OSX
      return
    }

    this.checkSize(force)
    this.checkBg(force)
    this.checkTop(force)
    this.checkBot(force)
    this.checkPin(force, toleranceExceeded)

    this.lastKnownScrollY = this.currentScrollY

    this._firstLoad = false
  }

  notTop () {
    this._top = false
    this.el.removeAttribute('data-header-top')
    this.el.setAttribute('data-header-not-top', '')
    this.opts.onNotTop(this)
  }

  top () {
    this._top = true
    this.el.setAttribute('data-header-top', '')
    this.el.removeAttribute('data-header-not-top')
    this.opts.onTop(this)
  }

  notBottom () {
    this._bottom = false
    this.el.setAttribute('data-header-not-bottom', '')
    this.el.removeAttribute('data-header-bottom')
    this.opts.onNotBottom(this)
  }

  bottom () {
    this._bottom = true
    this.el.setAttribute('data-header-bottom', '')
    this.el.removeAttribute('data-header-not-bottom')
    this.opts.onBottom(this)
  }

  unpin () {
    this._pinned = false
    this.el.setAttribute('data-header-unpinned', '')
    this.el.removeAttribute('data-header-pinned')
    this.opts.onUnpin(this)
  }

  pin () {
    this._pinned = true
    this.el.setAttribute('data-header-pinned', '')
    this.el.removeAttribute('data-header-unpinned')
    this.opts.onPin(this)
  }

  notSmall () {
    this._small = false
    this.el.setAttribute('data-header-big', '')
    this.el.removeAttribute('data-header-small')
    this.opts.onNotSmall(this)
  }

  small () {
    this._small = true
    this.el.setAttribute('data-header-small', '')
    this.el.removeAttribute('data-header-big')
    this.opts.onSmall(this)
  }

  notAltBg () {
    this._altBg = false
    this.el.setAttribute('data-header-reg-bg', '')
    this.el.removeAttribute('data-header-alt-bg')
    this.opts.onNotAltBg(this)
  }

  altBg () {
    this._altBg = true
    this.el.setAttribute('data-header-alt-bg', '')
    this.el.removeAttribute('data-header-reg-bg')
    this.opts.onAltBg(this)
  }

  shouldUnpin (toleranceExceeded) {
    const scrollingDown = this.currentScrollY > this.lastKnownScrollY
    const pastOffset = this.currentScrollY >= this.opts.offset

    return scrollingDown && pastOffset && toleranceExceeded
  }

  shouldPin (toleranceExceeded) {
    const scrollingUp = this.currentScrollY < this.lastKnownScrollY
    const pastOffset = this.currentScrollY <= this.opts.offset

    return (scrollingUp && toleranceExceeded) || pastOffset
  }

  isOutOfBounds () {
    const pastTop = this.currentScrollY < 0
    const pastBottom = this.currentScrollY + this.getScrollerPhysicalHeight() > this.getScrollerHeight()

    return pastTop || pastBottom
  }

  getScrollerPhysicalHeight () {
    return (this.opts.canvas === window || this.opts.canvas === document.body)
      ? this.getViewportHeight()
      : this.getElementPhysicalHeight(this.opts.canvas)
  }

  getScrollerHeight () {
    return (this.opts.canvas === window || this.opts.canvas === document.body)
      ? this.getDocumentHeight()
      : this.getElementHeight(this.opts.canvas)
  }

  getDocumentHeight () {
    const body = document.body
    const documentElement = document.documentElement

    return Math.max(
      body.scrollHeight, documentElement.scrollHeight,
      body.offsetHeight, documentElement.offsetHeight,
      body.clientHeight, documentElement.clientHeight
    )
  }

  getViewportHeight () {
    return window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight
  }

  getElementHeight (el) {
    return Math.max(
      el.scrollHeight,
      el.offsetHeight,
      el.clientHeight
    )
  }

  getElementPhysicalHeight (el) {
    return Math.max(
      el.offsetHeight,
      el.clientHeight
    )
  }

  getScrollY () {
    return (this.opts.canvas.pageYOffset !== undefined)
      ? this.opts.canvas.pageYOffset
      : (this.opts.canvas.scrollTop !== undefined)
        ? this.opts.canvas.scrollTop
        : (document.documentElement || document.body.parentNode || document.body).scrollTop
  }

  toleranceExceeded () {
    return Math.abs(this.currentScrollY - this.lastKnownScrollY) >= this.opts.tolerance
  }

  _getOptionsForSection (section, opts) {
    // if section is not a key in opts, return default opts
    if (!Object.prototype.hasOwnProperty.call(opts, 'sections') || !Object.prototype.hasOwnProperty.call(opts, section)) {
      return opts.default
    }

    // merge in default events, in case they're not supplied
    const sectionOpts = opts.sections[section]
    opts = _defaultsDeep(sectionOpts, DEFAULT_EVENTS, opts.default || {})
    return opts
  }

  _bindMobileMenuListeners () {
    window.addEventListener('application:mobile_menu:open', this._onMobileMenuOpen.bind(this))
    window.addEventListener('application:mobile_menu:closed', this._onMobileMenuClose.bind(this))
  }

  _onMobileMenuOpen () {
    this.mobileMenuOpen = true
  }

  _onMobileMenuClose () {
    this.mobileMenuOpen = false
  }
}
