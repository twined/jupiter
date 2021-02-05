import { gsap } from 'gsap'
import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'

const DEFAULT_OPTIONS = {
  logoColor: '#000',
  logoPathSelector: 'svg path',
  contentSelector: 'section',
  liSelector: 'li',
  hamburgerColor: '#000',

  onResize: null,
  openTween: m => {
    const timeline = gsap.timeline()

    m.hamburger.classList.toggle('is-active')
    document.body.classList.toggle('open-menu')

    timeline
      .fromTo(m.bg, {
        duration: 0.35,
        x: '0%',
        opacity: 0,
        height: window.innerHeight
      }, {
        duration: 0.35,
        opacity: 1,
        ease: 'sine.in'
      })
      .to(m.logo, {
        duration: 0.35,
        opacity: 0,
        ease: 'power3.out'
      }, '-=0.35')
      .to(m.header, {
        duration: 0.55,
        backgroundColor: 'transparent',
        ease: 'power3.out'
      }, '-=0.35')
      .call(() => { m.nav.style.gridTemplateRows = 'auto 1fr' })
      .set(m.nav, { height: window.innerHeight })
      .set(m.content, { display: 'block' })
      .set(m.logoPath, { fill: m.opts.logoColor })
      .set(m.logo, { xPercent: 3 })
      .staggerFromTo(m.lis, {
        duration: 1,
        opacity: 0,
        x: 20
      }, {
        duration: 1,
        x: 0,
        opacity: 1,
        ease: 'power3.out'
      }, 0.05)
      .to(m.logo, {
        duration: 0.55,
        opacity: 1,
        xPercent: 0,
        ease: 'power3.inOut'
      }, '-=1.2')
      .call(m._emitMobileMenuOpenEvent)
  },

  closeTween: m => {
    document.body.classList.toggle('open-menu')
    const timeline = gsap.timeline()

    timeline
      .call(() => { m.hamburger.classList.toggle('is-active') })
      .fromTo(m.logo, {
        duration: 0.2,
        opacity: 1,
        xPercent: 0
      },
      {
        duration: 0.2,
        opacity: 0,
        xPercent: 5,
        ease: 'power3.out'
      })
      .set(m.logoPath, { clearProps: 'fill' })
      .staggerTo(m.lis, {
        duration: 0.5, opacity: 0, x: 20, ease: 'power3.out'
      }, 0.04)
      .set(m.nav, { clearProps: 'height' })
      .to(m.bg, {
        duration: 0.25,
        x: '100%',
        ease: 'sine.in'
      }, '-=0.3')
      .call(() => { m._emitMobileMenuClosedEvent() })
      .set(m.content, { display: 'none' })
      .call(() => { m.nav.style.gridTemplateRows = 'auto' })
      .set(m.lis, { clearProps: 'opacity' })
      .to(m.logo, {
        duration: 0.35,
        opacity: 1,
        ease: 'power3.in'
      })
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
    this.lis = this.header.querySelectorAll(this.opts.liSelector)
    this.nav = this.header.querySelector('nav')

    if (this.hamburger) {
      this.hamburger.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        this.toggleMenu()
      })
    }

    if (this.opts.onResize) {
      window.addEventListener(Events.APPLICATION_RESIZE, () => { this.opts.onResize(this) })
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
