// import Headroom from 'headroom.js'
import { TweenLite, Power3 } from 'gsap/all'
// import scrollIntoView from 'smooth-scroll-into-view-if-needed'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  selector: '[data-hero-parallax]',
  power: 0.4,
  onScroll: (hp) => {
    TweenLite.set(hp.el, { y: (hp.delta * hp.opts.power) * -1, opacity: 1 - (hp.delta * (0.2) / 100 * -1) })
  }
}

export default class HeroParallax {
  constructor (app, opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.initialScrollY = 0
    this.delta = 0
    this.el = document.querySelector(this.opts.selector)

    if (!this.el) {
      console.error(`==> JUPITER/HEROPARALLAX: Parallax element not found (${this.opts.selector})`)
      return
    }

    this.observer = new IntersectionObserver(entries => {
      let [{ isIntersecting }] = entries
      if (isIntersecting) {
        // get scrollpos
        this.initialScrollY = window.scrollY
        window.addEventListener('scroll', this.onScroll.bind(this), { capture: false, passive: true })
      } else {
        console.log('not intersecting')
        window.removeEventListener('scroll', this.onScroll.bind(this), { capture: false, passive: true })
      }
    })

    this.observer.observe(this.el)
  }

  onScroll (ev) {
    this.delta = this.initialScrollY - window.scrollY
    this.opts.onScroll(this)
  }
}
