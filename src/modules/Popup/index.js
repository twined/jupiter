import { gsap } from 'gsap'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  tweenIn: (el, popup) => {
    gsap.set(popup.backdrop, { display: 'block' })
    gsap.to(popup.backdrop, 0.3, {
      opacity: 1,
      onComplete: () => {
        gsap.fromTo(el, 0.3, {
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
    gsap.to(popups, 0.3, { opacity: 0, display: 'none' })
    gsap.to(popup.backdrop, 0.3, {
      opacity: 0,
      onComplete: () => {
        gsap.set(popup.backdrop, { display: 'none' })
      }
    })
  }
}

export default class Popup {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.createBackdrop()
    this.bindTriggers()
  }

  bindTriggers () {
    const triggers = document.querySelectorAll('[data-popup-trigger]')
    const closers = document.querySelectorAll('[data-popup-close]')

    Array.from(triggers).forEach(trigger => {
      const triggerTarget = trigger.getAttribute('data-popup-trigger')
      trigger.addEventListener('click', event => {
        event.stopImmediatePropagation()
        event.preventDefault()
        this.open(triggerTarget)
      })
    })

    Array.from(closers).forEach(closer => {
      closer.addEventListener('click', event => {
        event.stopImmediatePropagation()
        event.preventDefault()
        this.close()
      })
    })
  }

  createBackdrop () {
    const backdrop = document.createElement('div')
    backdrop.setAttribute('data-popup-backdrop', '')
    gsap.set(backdrop, { opacity: 0, display: 'none', zIndex: 4999 })

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
