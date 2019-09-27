// import Headroom from 'headroom.js'
import { TimelineLite, Sine } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {}

export default class CoverOverlay {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.initialize()
  }

  initialize () {
    const coveredModules = document.querySelectorAll('[data-cover-overlay]')

    Array.from(coveredModules).forEach(v => {
      const overlay = v.querySelector('.picture-wrapper')
      const btn = v.querySelector('[data-cover-overlay-button]')
      const iframe = v.querySelector('iframe')
      let player

      iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture')

      if (v.hasAttribute('data-cover-overlay-vimeo-play')) {
        if (window.Vimeo) {
          player = new window.Vimeo.Player(iframe)
        } else {
          console.error('==> JUPITER// Missing vimeo JS')
        }
      }

      btn.addEventListener('click', () => {
        const timeline = new TimelineLite()

        timeline
          .set(iframe, { opacity: 1 })
          .to(btn, 0.5, { opacity: 0, ease: Sine.easeIn })
          .to(overlay, 1, { opacity: 0, ease: Sine.easeIn })
          .set(overlay, { display: 'none' })
          .call(() => {
            if (player) {
              player.play()
            }
          })
      })
    })
  }
}
