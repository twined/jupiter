import { TweenLite } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  backdropColor: '#ffffff',

  tweenIn: (el, popup) => {
    TweenLite.set(popup.backdrop, { display: 'block', backgroundColor: popup.opts.backdropColor })
    TweenLite.to(popup.backdrop, 0.3, {
      opacity: 1,
      onComplete: () => {
        TweenLite.fromTo(el, 0.3, {
          yPercent: -50,
          x: -5,
          xPercent: -50,
          opacity: 0,
          display: 'block'
        }, {
          yPercent: -50,
          xPercent: -50,
          x: 0,
          opacity: 1
        })
      }
    })
  },

  tweenOut: popup => {
    const popups = document.querySelectorAll('[data-popup]')
    TweenLite.to(popups, 0.3, { opacity: 0, display: 'none' })
    TweenLite.to(popup.backdrop, 0.3, {
      opacity: 0,
      onComplete: () => {
        TweenLite.set(popup.backdrop, { display: 'none' })
      }
    })
  }
}

export default class Popup {
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.createBackdrop()
  }

  createBackdrop () {
    const backdrop = document.createElement('div')
    backdrop.setAttribute('data-popup-backdrop', '')
    TweenLite.set(backdrop, { opacity: 0, display: 'none', zIndex: 4999 })

    backdrop.addEventListener('click', e => {
      e.stopPropagation()
      this.close()
    })

    document.body.append(backdrop)
    this.backdrop = backdrop
  }

  open (el) {
    if (typeof el === 'string') {
      el = document.querySelector(el)
    }

    if (!el) {
      console.error(`JUPITER/POPUP >>> Element ${el} not found`)
    }

    this.opts.tweenIn(el, this)
  }

  close () {
    this.opts.tweenOut(this)
  }
}
