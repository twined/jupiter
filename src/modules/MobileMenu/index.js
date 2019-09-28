import { TimelineLite, Power3, Sine } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'

const DEFAULT_OPTIONS = {
  logoColor: '#000',
  logoPathSelector: 'svg path',
  contentSelector: 'section',
  hamburgerColor: '#000',

  onResize: null,
  openTween: m => {
    const timeline = new TimelineLite()

    m.hamburger.classList.toggle('is-active')
    document.body.classList.toggle('open-menu')

    timeline
      .fromTo(m.bg, 0.35, { x: '0%', opacity: 0, height: window.innerHeight }, { opacity: 1, ease: Sine.easeIn })
      .to(m.logo, 0.35, { opacity: 0, ease: Power3.easeOut }, '-=0.35')
      .to(m.header, 0.55, { backgroundColor: 'transparent', ease: Power3.easeOut }, '-=0.35')
      .call(() => { m.nav.style.gridTemplateRows = 'auto 1fr' })
      .set(m.nav, { height: window.innerHeight })
      .set(m.content, { display: 'block' })
      .set(m.logoPath, { fill: m.opts.logoColor })
      .set(m.logo, { xPercent: 3 })
      .staggerFromTo(
        m.lis,
        1, {
          opacity: 0, x: 20
        },
        {
          x: 0,
          opacity: 1,
          ease: Power3.easeOut
        }, 0.05,
      )
      .to(m.logo, 0.55, { opacity: 1, xPercent: 0, ease: Power3.ease }, '-=1.2')
      .call(m._emitMobileMenuOpenEvent)
  },

  closeTween: m => {
    document.body.classList.toggle('open-menu')
    const timeline = new TimelineLite()

    timeline
      .call(() => { m.hamburger.classList.toggle('is-active') })
      .fromTo(
        m.logo,
        0.2, {
          opacity: 1,
          xPercent: 0
        },
        {
          opacity: 0,
          xPercent: 5,
          ease: Power3.easeOut
        },
      )
      .set(m.logoPath, { clearProps: 'fill' })
      .staggerTo(m.lis, 0.5, { opacity: 0, x: 20, ease: Power3.easeOut }, 0.04)
      .set(m.nav, { clearProps: 'height' })
      .to(m.bg, 0.25, { x: '100%', ease: Sine.easeIn }, '-=0.3')
      .call(() => { m._emitMobileMenuClosedEvent() })
      .set(m.content, { display: 'none' })
      .call(() => { m.nav.style.gridTemplateRows = 'auto' })
      .set(m.lis, { clearProps: 'opacity' })
      .to(m.logo, 0.35, { opacity: 1, ease: Power3.easeIn })
  }
}

export default class MobileMenu {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    this.header = document.querySelector('header')
    this.bg = this.header.querySelector('.mobile-bg')
    this.logo = this.header.querySelector('figure.brand')
    this.logoPath = this.logo ? this.logo.querySelectorAll(this.opts.logoPathSelector) : null
    this.menuButton = this.header.querySelector('figure.menu-button')
    this.hamburger = this.menuButton ? this.menuButton.querySelector('.hamburger') : null
    this.hamburgerInner = this.menuButton ? this.menuButton.querySelector('.hamburger-inner') : null
    this.content = this.header.querySelectorAll(this.opts.contentSelector)
    this.lis = this.header.querySelectorAll('li')
    this.nav = this.header.querySelector('nav')

    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => {
        this.toggleMenu()
      })
    }

    if (this.opts.onResize) {
      window.addEventListener(Events.APPLICATION_RESIZE, this.opts.onResize.bind(this))
    }
  }

  toggleMenu () {
    if (document.body.classList.contains('open-menu')) {
      this.toggleMenuClosed()
    } else {
      this.toggleMenuOpen()
    }
  }

  toggleMenuClosed () {
    // CLOSING MENU
    this.opts.closeTween(this)
  }

  toggleMenuOpen () {
    // OPENING MENU
    this.opts.openTween(this)
  }

  _emitMobileMenuOpenEvent () {
    const mobileMenuOpenEvent = new window.CustomEvent(Events.APPLICATION_MOBILE_MENU_OPEN)
    window.dispatchEvent(mobileMenuOpenEvent)
  }

  _emitMobileMenuClosedEvent () {
    const mobileMenuClosedEvent = new window.CustomEvent(Events.APPLICATION_MOBILE_MENU_CLOSED)
    window.dispatchEvent(mobileMenuClosedEvent)
  }
}
