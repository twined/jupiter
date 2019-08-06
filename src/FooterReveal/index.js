import { TweenMax } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  shadow: false,
  shadowColor: 'rgba(255, 255, 255, 1)'
}

export default class FooterReveal {
  constructor (opts) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    const main = document.querySelector('main')
    const footer = document.querySelector('[data-footer-reveal]')
    // fix footer
    TweenMax.set(footer, {
      'z-index': -100,
      position: 'fixed',
      bottom: 0
    })
    const footerHeight = footer.offsetHeight
    // add height as margin
    TweenMax.set(main, { marginBottom: footerHeight })
    if (this.opts.shadow) {
      const shadowStyle = `0 50px 50px -20px ${this.opts.shadowColor}`
      main.style['mozBoxShadow'] = shadowStyle
      main.style['webkitBoxShadow'] = shadowStyle
      main.style.boxShadow = shadowStyle
    }
  }
}
