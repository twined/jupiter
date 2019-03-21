import { TimelineLite, Power3, Sine } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  logoColor: '#000',
  logoPathSelector: '.navbar-brand svg path',

  openTween: (m) => {
    const timeline = new TimelineLite()
    m.hamburger.classList.toggle('is-active')
    document.body.classList.toggle('open-menu')

    timeline
      .to(m.logo, 0.2, { opacity: 0, ease: Power3.easeOut })
      .set(m.nav, { x: '100%', opacity: 1 })
      .set(m.lis, { opacity: 0 })
      .to(m.nav, 0.35, { x: '0%', ease: Sine.easeIn })
      .set(m.logoPath, { fill: m.opts.logoColor })
      .staggerTo(m.lis, 1, { opacity: 1, ease: Power3.easeOut }, 0.05, '-=0.1')
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
      .to(m.nav, 0.35, { x: '100%', ease: Sine.easeIn })
      .call(() => {
        m._emitMobileMenuClosedEvent()
      })
      .to(m.logo, 0.35, { opacity: 1, ease: Power3.easeIn })
  }
}

export default class MobileMenu {
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    this.logo = document.querySelector('.navbar-brand')
    this.logoPath = document.querySelector(this.opts.logoPathSelector)
    this.hamburger = document.querySelector('.hamburger')
    this.content = document.querySelector('#navbar-content')
    this.lis = this.content.querySelectorAll('li')
    this.nav = document.querySelector('nav')
    this.header = document.querySelector('header')

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
