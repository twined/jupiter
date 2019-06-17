import { TweenLite, Power1 } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  fadeOutDuration: 0.85,
  fadeOutDelay: 0.35
}

export default class Fader {
  constructor (app, el, opts = {}) {
    if (!el) {
      console.error('==> JUPITER/FADER: NO ELEMENT GIVEN IN CONSTRUCTOR')
      return
    }
    this.el = el
    this.app = app

    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
  }

  out (callback = () => {}) {
    // fire ready event before fade
    this.app._emitReadyEvent()
    TweenLite.to(this.el, this.opts.fadeOutDuration, {
      opacity: 0,
      ease: Power1.easeInOut,
      delay: this.opts.fadeOutDelay,
      onComplete: () => {
        this.el.style.display = 'none'
        document.body.classList.remove('unloaded')
        callback.apply(this.app)
      }
    })
  }
}
