/**
 * A header that stays fixed. Hides when scrolling down and is revealed on scrolling up.
 *
 * You can pass different configs for different sections:
 *
 *  this.header = new StickyHeader(
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

import {
  TweenLite, Power3, Sine, TimelineLite
} from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'

const DEFAULT_EVENTS = {
  onMainVisible: h => {
    TweenLite.to(
      h.el,
      3,
      { opacity: 1, delay: 0.5 },
    )
  },

  onMainInvisible: h => {
    TweenLite.to(
      h.el,
      1,
      { opacity: 0 },
    )
  },

  onPin: h => {
    TweenLite.to(
      h.auxEl,
      0.35,
      {
        yPercent: '0',
        ease: Sine.easeOut,
        autoRound: true
      },
    )
  },

  onUnpin: h => {
    h._hiding = true
    TweenLite.to(
      h.auxEl,
      0.25,
      {
        yPercent: '-100',
        ease: Sine.easeIn,
        autoRound: true,
        onComplete: () => {
          h._hiding = false
        }
      },
    )
  }
}

const DEFAULT_OPTIONS = {
  el: 'header[data-nav]',
  on: Events.APPLICATION_REVEALED,
  pinOnOutline: false,
  pinOnForcedScroll: true,

  default: {
    onClone: h => h.el.cloneNode(true),
    canvas: window,
    enter: h => {
      const timeline = new TimelineLite()
      timeline
        .set(h.auxEl, { yPercent: -100 })
        .set(h.lis, { opacity: 0 })
        .to(h.auxEl, 1, {
          yPercent: 0, delay: h.opts.enterDelay, ease: Power3.easeOut, autoRound: true
        })
        .staggerTo(h.lis, 0.8, { opacity: 1, ease: Sine.easeIn }, 0.1, '-=1')
    },
    enterDelay: 1.2,
    tolerance: 3,
    offset: 0, // how far from the top before we trigger hide
    offsetSmall: 50, // how far from the top before we trigger the shrinked padding,
    offsetBg: 200, // how far down before changing backgroundcolor
    ...DEFAULT_EVENTS
  }
}

export default class StickyHeader {
  constructor (app, opts = {}) {
    this.app = app
    this.mainOpts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    if (this.mainOpts.pinOnOutline) {
      window.addEventListener(Events.APPLICATION_OUTLINE, () => {
        this.preventUnpin = true
        this.pin()
      })
    }

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

    this.auxEl = this.opts.onClone(this)
    this.auxEl.setAttribute('data-header-pinned', '')
    this.auxEl.setAttribute('data-auxiliary-nav', '')
    this.auxEl.removeAttribute('data-nav')

    document.body.appendChild(this.auxEl)

    this.small()
    this.unpin()

    this.lis = this.el.querySelectorAll('li')
    this.preventPin = false
    this.preventUnpin = false
    this._isResizing = false
    this._firstLoad = true
    this._pinned = true
    this._top = false
    this._bottom = false
    this._small = false
    this._hiding = false // if we're in the process of hiding the bar
    this.lastKnownScrollY = 0
    this.currentScrollY = 0
    this.mobileMenuOpen = false
    this.timer = null
    this.resetResizeTimer = null
    this.firstReveal = true

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

    this.setupObserver()

    window.addEventListener(this.mainOpts.on, this.bindObserver.bind(this))
    this._bindMobileMenuListeners()
  }

  setupObserver () {
    this.observer = new IntersectionObserver(entries => {
      const [{
        isIntersecting
      }] = entries

      if (isIntersecting) {
        if (this._navVisible !== true) {
          this.opts.onMainVisible(this)
          if (this.firstReveal) {
            this.firstReveal = false
          }
        }
        this._navVisible = true
      } else {
        if (this._navVisible === true) {
          this.opts.onMainInvisible(this)
        }
        this._navVisible = false
      }
    })

    window.addEventListener(Events.APPLICATION_SCROLL, this.update.bind(this), false)

    if (this.mainOpts.pinOnForcedScroll) {
      window.addEventListener(Events.APPLICATION_FORCED_SCROLL_START, () => {
        this.preventUnpin = false
        this.unpin()
        this.preventPin = true
      })
      window.addEventListener(Events.APPLICATION_FORCED_SCROLL_END, () => {
        this.preventPin = false
        this.pin()
        this.preventUnpin = false
      }, false)
    }

    window.addEventListener(Events.APPLICATION_RESIZE, this.setResizeTimer.bind(this), false)
  }

  bindObserver () {
    this.observer.observe(this.el)
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

  _hideAlt () {
    this.unpin()
  }

  _showAlt () {
    this.pin()
  }

  update () {
    this.redraw(false)
  }

  lock () {
    this.preventPin = true
    this.preventUnpin = true
  }

  unlock () {
    this.preventPin = false
    this.preventUnpin = false
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
    if (this._navVisible) {
      if (this._pinned) {
        this.unpin()
        return
      }
    }

    if (this.shouldUnpin(toleranceExceeded)) {
      if (this.mobileMenuOpen) {
        return
      }
      if (this._pinned) {
        this.unpin()
      }
    } else if (this.shouldPin(toleranceExceeded)) {
      if (!this._pinned) {
        this.pin()
      }
    }
  }

  redraw (force = false) {
    this.currentScrollY = this.getScrollY()
    const toleranceExceeded = this.toleranceExceeded()

    if (this.isOutOfBounds()) { // Ignore bouncy scrolling in OSX
      return
    }

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
    if (!this.preventUnpin) {
      this._pinned = false
      this.opts.onUnpin(this)
    }
  }

  pin () {
    if (!this.preventPin) {
      this._pinned = true
      this.opts.onSmall(this)
      this.opts.onPin(this)
    }
  }

  notSmall () {
    this._small = false
    this.auxEl.setAttribute('data-header-big', '')
    this.auxEl.removeAttribute('data-header-small')
    this.opts.onNotSmall(this)
  }

  small () {
    this._small = true
    this.auxEl.setAttribute('data-header-small', '')
    this.auxEl.removeAttribute('data-header-big')
    this.opts.onSmall(this)
  }

  shouldUnpin (toleranceExceeded) {
    if (this._navVisible) {
      return true
    }
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
      body.clientHeight, documentElement.clientHeight,
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
      el.clientHeight,
    )
  }

  getElementPhysicalHeight (el) {
    return Math.max(
      el.offsetHeight,
      el.clientHeight,
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
    window.addEventListener(
      Events.APPLICATION_MOBILE_MENU_OPEN,
      this._onMobileMenuOpen.bind(this)
    )
    window.addEventListener(
      Events.APPLICATION_MOBILE_MENU_CLOSED,
      this._onMobileMenuClose.bind(this)
    )
  }

  _onMobileMenuOpen () {
    this.mobileMenuOpen = true
  }

  _onMobileMenuClose () {
    this.mobileMenuOpen = false
  }
}
