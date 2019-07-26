import { TimelineLite, Power3, Sine } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import _debounce from 'lodash.debounce'

const DEFAULT_OPTIONS = {
  logoColor: '#000',
  logoPathSelector: 'svg path',
  contentSelector: 'section',
  hamburgerColor: '#000',

  onResize: null,
  openTween: (m) => {
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
      .staggerFromTo(m.lis, 1, { opacity: 0, x: 20 }, { x: 0, opacity: 1, ease: Power3.easeOut }, 0.05)
      .to(m.logo, 0.55, { opacity: 1, xPercent: 0, ease: Power3.ease }, '-=1.2')
      .call(m._emitMobileMenuOpenEvent)
  },

  closeTween: (m) => {
    document.body.classList.toggle('open-menu')
    const timeline = new TimelineLite()

    timeline
      .call(() => { m.hamburger.classList.toggle('is-active') })
      .fromTo(m.logo, 0.2, { opacity: 1, xPercent: 0 }, { opacity: 0, xPercent: 5, ease: Power3.easeOut })
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
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.header = document.querySelector('header')

    this.bg = this.header.querySelector('.mobile-bg')
    this.logo = this.header.querySelector('figure.brand')
    this.logoPath = this.logo.querySelectorAll(this.opts.logoPathSelector)
    this.menuButton = this.header.querySelector('figure.menu-button')
    this.hamburger = this.menuButton.querySelector('.hamburger')
    this.hamburgerInner = this.menuButton.querySelector('.hamburger-inner')
    this.content = this.header.querySelectorAll(this.opts.contentSelector)
    this.lis = this.header.querySelectorAll('li')
    this.nav = this.header.querySelector('nav')

    this.hamburger.addEventListener('click', e => {
      this.toggleMenu()
    })

    if (this.opts.onResize) {
      window.addEventListener('resize', _debounce(() => this.opts.onResize(this), 150))
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
    const mobileMenuOpenEvent = new window.CustomEvent('application:mobile_menu:open')
    window.dispatchEvent(mobileMenuOpenEvent)
  }

  _emitMobileMenuClosedEvent () {
    const mobileMenuClosedEvent = new window.CustomEvent('application:mobile_menu:closed')
    window.dispatchEvent(mobileMenuClosedEvent)
  }
}
