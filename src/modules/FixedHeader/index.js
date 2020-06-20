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

import { gsap } from 'gsap'
import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'
import Dom from '../Dom'

const DEFAULT_EVENTS = {
  onPin: h => {
    gsap.to(h.el, {
      duration: 0.35,
      yPercent: '0',
      ease: 'sine.out',
      autoRound: true
    })
  },

  onUnpin: h => {
    h._hiding = true
    gsap.to(h.el, {
      duration: 0.25,
      yPercent: '-100',
      ease: 'sine.in',
      autoRound: true,
      onComplete: () => {
        h._hiding = false
      }
    })
  },

  onAltBg: h => {
    gsap.to(h.el, {
      duration: 0.2,
      backgroundColor: h.opts.altBgColor
    })
  },

  onNotAltBg: h => {
    gsap.to(h.el, {
      duration: 0.4,
      backgroundColor: h.opts.regBgColor
    })
  },

  // eslint-disable-next-line no-unused-vars
  onSmall: h => {},
  // eslint-disable-next-line no-unused-vars
  onNotSmall: h => {},
  // eslint-disable-next-line no-unused-vars
  onTop: h => {},
  // eslint-disable-next-line no-unused-vars
  onNotTop: h => {},
  // eslint-disable-next-line no-unused-vars
  onBottom: h => {},
  // eslint-disable-next-line no-unused-vars
  onNotBottom: h => {},
  // eslint-disable-next-line no-unused-vars
  onMobileMenuOpen: h => { },
  // eslint-disable-next-line no-unused-vars
  onMobileMenuClose: h => { },
  // eslint-disable-next-line no-unused-vars
  onIntersect: h => { },
  onOutline: h => {
    h.preventUnpin = true
    h.pin()
  }
}

const DEFAULT_OPTIONS = {
  el: 'header[data-nav]',
  on: Events.APPLICATION_REVEALED,

  default: {
    unPinOnResize: true,
    canvas: window,
    intersects: null,
    beforeEnter: h => {
      const timeline = gsap.timeline()
      timeline
        .set(h.el, { yPercent: -100 })
        .set(h.lis, { opacity: 0 })
    },

    enter: h => {
      const timeline = gsap.timeline()
      timeline
        .to(h.el, {
          duration: 1,
          yPercent: 0,
          delay: h.opts.enterDelay,
          ease: 'power3.out',
          autoRound: true
        })
        .staggerTo(h.lis, 0.8, { opacity: 1, ease: 'sine.in' }, 0.1, '-=1')
    },

    enterDelay: 0,
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
  constructor (app, opts = {}) {
    this.app = app
    this.mainOpts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    window.addEventListener(Events.APPLICATION_OUTLINE, () => {
      this.mainOpts.onOutline(this)
    })

    if (typeof this.mainOpts.el === 'string') {
      this.el = document.querySelector(this.mainOpts.el)
    } else {
      this.el = this.mainOpts.el
    }

    if (!this.el) {
      return
    }

    const section = document.body.getAttribute('data-script')

    this.opts = this._getOptionsForSection(section, opts)
    this.lis = this.el.querySelectorAll('li')

    this.preventPin = false
    this.preventUnpin = false
    this._firstLoad = true
    this._pinned = true
    this._top = false
    this._bottom = false
    this._small = false
    this._altBg = false
    this._isResizing = false
    this._hiding = false // if we're in the process of hiding the bar
    this.lastKnownScrollY = 0
    this.currentScrollY = 0
    this.mobileMenuOpen = false
    this.timer = null
    this.resetResizeTimer = null

    if (this.opts.intersects) {
      this.intersectingElements = Dom.all('[data-intersect]')
    }

    this.initialize()
  }

  initialize () {
    // bind to canvas scroll
    this.lastKnownScrollY = this.getScrollY()
    this.currentScrollY = this.lastKnownScrollY

    if (typeof this.opts.offsetBg === 'string') {
      // get offset of element, with height of header subtracted
      const offsetBgElm = document.querySelector(this.opts.offsetBg)
      this.opts.offsetBg = offsetBgElm.offsetTop
    } else if (typeof this.opts.offsetBg === 'function') {
      this.opts.offsetBg = this.opts.offsetBg(this) - 1
    }

    if (typeof this.opts.offset === 'string') {
      // get offset of element, with height of header subtracted
      const offsetElm = document.querySelector(this.opts.offset)
      this.opts.offset = offsetElm.offsetTop - 1
    } else if (typeof this.opts.offset === 'function') {
      this.opts.offset = this.opts.offset(this) - 1
    }

    if (typeof this.opts.offsetSmall === 'string') {
      // get offsetSmall of element, with height of header subtracted
      const offsetSmallElm = document.querySelector(this.opts.offsetSmall)
      this.opts.offsetSmall = offsetSmallElm.offsetTop - 1
    } else if (typeof this.opts.offsetSmall === 'function') {
      this.opts.offsetSmall = this.opts.offsetSmall(this) - 1
    }

    window.addEventListener(Events.APPLICATION_FORCED_SCROLL_START, this.unpin.bind(this), false)
    window.addEventListener(Events.APPLICATION_FORCED_SCROLL_END, this.pin.bind(this), false)
    window.addEventListener(Events.APPLICATION_SCROLL, this.update.bind(this), false)
    window.addEventListener(Events.APPLICATION_READY, this.unpinIfScrolled.bind(this))
    window.addEventListener(this.mainOpts.on, this.enter.bind(this))

    this._bindMobileMenuListeners()

    if (this.opts.unPinOnResize) {
      window.addEventListener(Events.APPLICATION_RESIZE, this.setResizeTimer.bind(this), false)
    }

    this.opts.beforeEnter(this)
  }

  lock () {
    this.preventPin = true
    this.preventUnpin = true
  }

  unlock () {
    this.preventPin = false
    this.preventUnpin = false
  }

  isScrolled () {
    return (window.pageYOffset
      || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0) > 0
  }

  unpinIfScrolled () {
    if (this.isScrolled()) {
      // page is scrolled on ready -- unpin
      this.unpin()
    }
  }

  enter () {
    if (this.opts.enter) {
      this.checkSize(true)
      this.checkBg(true)
      this.checkTop(true)
      this.opts.enter(this)
    }
  }

  setResizeTimer () {
    this._isResizing = true
    if (this._pinned) {
      // unpin if resizing to prevent visual clutter
      this.unpin()
    }

    if (this.resetResizeTimer) {
      clearTimeout(this.resetResizeTimer)
    }
    this.resetResizeTimer = setTimeout(() => {
      this._isResizing = false
      clearTimeout(this.resetResizeTimer)
      this.resetResizeTimer = null
    }, 500)
  }

  update () {
    this.redraw()
  }

  checkSize (force) {
    if (this.currentScrollY > this.opts.offsetSmall) {
      if (force) {
        this.small()
      } else if (!this._small) {
        this.small()
      }
    } else if (force) {
      this.notSmall()
    } else if (this._small) {
      this.notSmall()
    }
  }

  checkBg (force) {
    if (this.currentScrollY > this.opts.offsetBg) {
      if (force) {
        this.altBg()
      } else if (!this._altBg && !this._hiding) {
        this.altBg()
      }
    } else if (force) {
      this.notAltBg()
    } else if (this._altBg) {
      this.notAltBg()
    }
  }

  checkIntersects () {
    if (this.opts.intersects) {
      const headerBottom = this.el.offsetHeight
      // check if we overlap any of the intersects?
      this.intersectingElements.forEach(ie => {
        const { top } = ie.getBoundingClientRect()
        const { bottom } = ie.getBoundingClientRect()
        if (bottom > 0 && top < headerBottom) {
          console.log('intersects')
        }
        // height of header
        // if (Dom.overlapsVertically(ie, this.el)) {
        //   console.log('OMG')
        //   this.opts.onIntersect(this, ie)
        // }
      })
    }
  }

  checkTop (force) {
    if (this.currentScrollY <= this.opts.offset) {
      if (force) {
        this.top()
      } else if (!this._top) {
        this.top()
      }
    } else if (force) {
      this.notTop()
    } else if (this._top) {
      this.notTop()
    }
  }

  checkBot (force) {
    if (this.currentScrollY + this.getViewportHeight() >= this.getScrollerHeight()) {
      if (force) {
        this.bottom()
      } else if (!this._bottom) {
        this.bottom()
      }
    } else if (force) {
      this.notBottom()
    } else if (this._bottom) {
      this.notBottom()
    }
  }

  checkPin (force, toleranceExceeded) {
    if (this.shouldUnpin(toleranceExceeded)) {
      if (this.mobileMenuOpen) {
        return
      }
      if (force) {
        this.unpin()
      } else if (this._pinned) {
        this.unpin()
      }
    } else if (this.shouldPin(toleranceExceeded)) {
      if (force) {
        this.pin()
      } else if (!this._pinned) {
        this.pin()
      }
    }
  }

  redraw () {
    this.currentScrollY = this.getScrollY()
    const toleranceExceeded = this.toleranceExceeded()

    if (this.isOutOfBounds()) { // Ignore bouncy scrolling in OSX
      return
    }

    this.checkSize(false)
    this.checkBg(false)
    this.checkIntersects(false)
    this.checkTop(false)
    this.checkBot(false)
    this.checkPin(false, toleranceExceeded)

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
    if (this.preventUnpin) {
      return
    }
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
    if (this._isResizing) {
      return false
    }

    const scrollingUp = this.currentScrollY < this.lastKnownScrollY
    const pastOffset = this.currentScrollY <= this.opts.offset

    return (scrollingUp && toleranceExceeded) || pastOffset
  }

  isOutOfBounds () {
    const pastTop = this.currentScrollY < 0
    const pastBottom = this.currentScrollY
      + this.getScrollerPhysicalHeight()
      > this.getScrollerHeight()

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
    const { body } = document
    const { documentElement } = document

    return Math.max(
      body.scrollHeight, documentElement.scrollHeight,
      body.offsetHeight, documentElement.offsetHeight,
      body.clientHeight, documentElement.clientHeight
    )
  }

  getViewportHeight () {
    return window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight
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
    if (this.opts.canvas.pageYOffset !== undefined) {
      return this.opts.canvas.pageYOffset
    }
    if (this.opts.canvas.scrollTop !== undefined) {
      return this.opts.canvas.scrollTop
    }
    return (document.documentElement || document.body.parentNode || document.body).scrollTop
  }

  toleranceExceeded () {
    return Math.abs(this.currentScrollY - this.lastKnownScrollY) >= this.opts.tolerance
  }

  _getOptionsForSection (section, opts) {
    // if section is not a key in opts, return default opts
    if (!Object.prototype.hasOwnProperty.call(opts, 'sections') || !Object.prototype.hasOwnProperty.call(opts.sections, section)) {
      return opts.default
    }

    // merge in default events, in case they're not supplied
    const sectionOpts = opts.sections[section]
    opts = _defaultsDeep(sectionOpts, DEFAULT_EVENTS, opts.default || {})
    return opts
  }

  _bindMobileMenuListeners () {
    window.addEventListener('APPLICATION:MOBILE_MENU:OPEN', this._onMobileMenuOpen.bind(this))
    window.addEventListener('APPLICATION:MOBILE_MENU:CLOSED', this._onMobileMenuClose.bind(this))
  }

  _onMobileMenuOpen () {
    this.opts.onMobileMenuOpen(this)
    this.mobileMenuOpen = true
  }

  _onMobileMenuClose () {
    this.opts.onMobileMenuClose(this)
    this.mobileMenuOpen = false
  }
}
