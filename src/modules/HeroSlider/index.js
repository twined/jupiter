/**
 *
 * HERO SLIDER
 * ============
 *
 * ## Example
 *
 *    const hs = HeroSlider(sliderEl, opts)
 *
 */

import { gsap } from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import _defaultsDeep from 'lodash.defaultsdeep'
import prefersReducedMotion from '../../utils/prefersReducedMotion'
import * as Events from '../../events'
import imageIsLoaded from '../../utils/imageIsLoaded'

gsap.registerPlugin(CSSPlugin)

const DEFAULT_OPTIONS = {
  el: '[data-hero-slider]',
  /* time between slides */
  interval: 4.2,
  /* the slide number we start with */
  initialSlideNumber: 0,
  /* are the slider images lazyloaded? */
  lazyImages: false,
  /* zIndexes for the slide mechanism */
  zIndex: {
    visible: 5,
    next: 4,
    regular: 3
  },
  transition: {
    /* how long the actual transition from slide to slide takes */
    duration: 0.8,
    /* the transition type. 'parallax' or 'fade' */
    type: 'parallax',
    /* how much to scale when 'idle' */
    scale: 1.05
  },

  onTransition: hs => {
    hs.slide('parallax')
  },

  onInitialize: (/* hs */) => {},

  onFadeIn: (hs, callback) => {
    if (hs.slides.length > 1) {
      gsap.to(hs.el, {
        duration: 0.25,
        opacity: 1,
        onComplete: () => { callback() }
      })
    } else {
      gsap.to(hs.el, {
        duration: 0.25,
        opacity: 1
      })
    }
  }
}

export default class HeroSlider {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    if (typeof this.opts.el === 'string') {
      this.el = document.querySelector(this.opts.el)
    } else {
      this.el = this.opts.el
    }

    if (!this.el) {
      return
    }

    this.initialize()
  }

  initialize () {
    this._addResizeHandler()
    // style the container
    gsap.set(this.el, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    })

    this.slides = this.el.querySelectorAll('[data-hero-slide]')
    this.images = this.el.querySelectorAll('.hero-slide-img')

    this.slideCount = this.slides.length - 1
    this._currentSlideIdx = this.opts.initialSlideNumber

    // style the slides
    Array.from(this.slides).forEach(s => {
      gsap.set(s, {
        zIndex: this.opts.zIndex.regular,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })

      const img = s.querySelector('.hero-slide-img')

      if (img) {
        gsap.set(img, {
          width: document.body.clientWidth,
          height: '100%',
          top: 0,
          left: 0,
          position: 'absolute'
        })
      } else {
        console.error('==> JUPITER/HEROSLIDER: MISSING .hero-slide-img INSIDE [data-hero-slide]')
      }
    })

    this.slides[0].style.zIndex = this.opts.zIndex.visible
    if (this.slides[1]) {
      this.slides[1].style.zIndex = this.opts.zIndex.next
    }

    this.opts.onInitialize(this)

    const callback = (this.slides.length > 1) ? this.next.bind(this) : () => {}

    window.addEventListener(Events.APPLICATION_REVEALED, () => {
      /* Wait for the first image to load, then fade in container element */
      const firstImg = this.slides[this._currentSlideIdx].querySelector('img')

      if (firstImg) {
        imageIsLoaded(firstImg, this.opts.lazyImages).then(() => {
          this.opts.onFadeIn(this, callback)
        })
      }
    })
  }

  /**
   * Calculate which slide is next, and call the slide function
   */
  next () {
    if (prefersReducedMotion()) {
      return
    }

    if (this._currentSlideIdx === this.slideCount) {
      this._previousSlide = this.slides[this._currentSlideIdx]
      // last slide --> next slide will be 0
      this._currentSlideIdx = 0
      this._nextSlide = this.slides[this._currentSlideIdx + 1]
    } else {
      this._previousSlide = this.slides[this._currentSlideIdx]
      this._currentSlideIdx += 1
      if (this._currentSlideIdx === this.slideCount) {
        [this._nextSlide] = this.slides
      } else {
        this._nextSlide = this.slides[this._currentSlideIdx + 1]
      }
    }

    this._currentSlide = this.slides[this._currentSlideIdx]

    this.opts.onTransition(this)
  }

  /**
   * Switches between slides
   */
  slide (type) {
    const timeline = gsap.timeline()

    switch (type) {
      case 'fade':
        timeline
          .set(this._currentSlide, {
            opacity: 0,
            scale: 1,
            zIndex: this.opts.zIndex.visible
          })
          .set(this._nextSlide, {
            opacity: 0
          })
          .to(this._previousSlide, {
            duration: this.opts.interval,
            scale: this.opts.transition.scale
          })
          .to(this._currentSlide, {
            duration: this.opts.transition.duration,
            opacity: 1,
            delay: this.opts.interval - this.opts.transition.duration,
            force3D: true,
            ease: 'sine.inOut'
          })
          .set(this._previousSlide, {
            opacity: 0
          })
          .call(() => {
            this._nextSlide.style.zIndex = this.opts.zIndex.visible
            this._currentSlide.style.zIndex = this.opts.zIndex.regular
            this._previousSlide.style.zIndex = this.opts.zIndex.regular
            this.next()
          }, null, this)

        break

      case 'parallax':
        timeline
          .set(this._currentSlide, {
            zIndex: this.opts.zIndex.next,
            scale: 1.0,
            width: '100%'
          })
          .fromTo(this._previousSlide, {
            duration: this.opts.interval,
            overflow: 'hidden'
          }, {
            duration: this.opts.interval,
            scale: this.opts.transition.scale
          })
          .to(this._previousSlide, {
            duration: this.opts.transition.duration,
            width: 0,
            ease: 'power3.in',
            autoRound: true,
            overwrite: 'preexisting'
          })
          .set(this._nextSlide, {
            zIndex: this.opts.zIndex.next
          })
          .set(this._currentSlide, {
            zIndex: this.opts.zIndex.visible,
            width: '100%'
          })
          .set(this._previousSlide, {
            zIndex: this.opts.zIndex.regular,
            scale: 1.0,
            width: '100%'
          })
          .call(() => {
            this.next()
          })

        break

      default:
        console.error('==> JUPITER/HEROSLIDER: Unrecognized `opts.transition.type` option.')
    }
  }

  /**
   * Add a window resize handler that resizes slide widths
   */
  _addResizeHandler () {
    this.observer = new IntersectionObserver(entries => {
      const [{ isIntersecting }] = entries
      if (isIntersecting) {
        this._resizeSlides()
        window.addEventListener(Events.APPLICATION_RESIZE, this._resizeSlides.bind(this))
      } else {
        window.removeEventListener(Events.APPLICATION_RESIZE, this._resizeSlides.bind(this))
      }
    })

    this.observer.observe(this.el)
  }

  _resizeSlides () {
    gsap.to(this.images, {
      duration: 0.15,
      width: document.body.clientWidth,
      overwrite: 'all'
    })
  }
}
