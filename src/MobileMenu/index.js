import { TimelineLite, Power3, Sine } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  logoColor: '#000',
  logoPathSelector: 'svg path',

  openTween: (m) => {
    const timeline = new TimelineLite()
    m.hamburger.classList.toggle('is-active')
    document.body.classList.toggle('open-menu')

    timeline
      .to(m.logo, 0.2, { opacity: 0, ease: Power3.easeOut })
      .set(m.bg, { x: '100%', opacity: 1, height: window.innerHeight })
      .set(m.content, { display: 'block' })
      .set(m.lis, { opacity: 0, xPercent: 10 })
      .to(m.bg, 0.35, { x: '0%', ease: Sine.easeIn })
      .set(m.logoPath, { fill: m.opts.logoColor })
      .staggerTo(m.lis, 1, { xPercent: 0, opacity: 1, ease: Power3.easeOut }, 0.05, '-=0.1')
      .to(m.logo, 0.35, { opacity: 1, ease: Power3.easeIn }, '-=1.2')
      .call(m._emitMobileMenuOpenEvent)
  },

  closeTween: (m) => {
    document.body.classList.toggle('open-menu')
    const timeline = new TimelineLite()
    timeline
      .call(() => { m.hamburger.classList.toggle('is-active') })
      .to(m.logo, 0.2, { opacity: 0, ease: Power3.easeOut })
      .set(m.logoPath, { clearProps: 'fill' })
      .staggerTo(m.lis, 0.5, { opacity: 0, ease: Power3.easeOut }, 0.01, '-=0.2')
      .to(m.bg, 0.25, { x: '100%', ease: Sine.easeIn }, '-=0.3')

      .call(() => {
        m._emitMobileMenuClosedEvent()
      })
      .set(m.content, { display: 'none' })
      .set(m.lis, { clearProps: 'opacity' })
      .to(m.logo, 0.35, { opacity: 1, ease: Power3.easeIn })
  }
}

export default class MobileMenu {
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.header = document.querySelector('header')

    this.bg = this.header.querySelector('.mobile-bg')
    this.logo = this.header.querySelector('figure.brand')
    this.logoPath = this.logo.querySelector(this.opts.logoPathSelector)
    this.menuButton = this.header.querySelector('figure.menu-button')
    this.hamburger = this.menuButton.querySelector('.hamburger')
    this.hamburgerInner = this.menuButton.querySelector('.hamburger-inner')
    this.content = this.header.querySelectorAll('section')
    this.lis = this.header.querySelectorAll('li')
    this.nav = this.header.querySelector('nav')

    this.hamburger.addEventListener('click', e => {
      this.toggleMenu()
    })
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
    const mobileMenuOpenEvent = new window.CustomEvent('application:mobile_menu:open')
    window.dispatchEvent(mobileMenuOpenEvent)
  }

  _emitMobileMenuClosedEvent () {
    const mobileMenuClosedEvent = new window.CustomEvent('application:mobile_menu:closed')
    window.dispatchEvent(mobileMenuClosedEvent)
  }
}
