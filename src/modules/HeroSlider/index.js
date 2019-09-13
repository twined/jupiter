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

import {
  TweenMax, Sine, Power3, CSSPlugin, TimelineLite
} from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import prefersReducedMotion from '../../utils/prefersReducedMotion'
import * as Events from '../../events'

// eslint-disable-next-line no-unused-vars
const plugins = [CSSPlugin]

if ('objectFit' in document.documentElement.style === false) {
  document.addEventListener('DOMContentLoaded', () => {
    Array.prototype.forEach.call(document.querySelectorAll('.hero-bg img'), image => {
      (image.runtimeStyle || image.style).background = `url("${image.src}") no-repeat 50%/${image.currentStyle ? image.currentStyle['object-fit'] : image.getAttribute('data-object-fit')}`
      image.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${image.width}' height='${image.height}'%3E%3C/svg%3E`
    })
  })
}

const DEFAULT_OPTIONS = {
  /* time between slides */
  interval: 4.2,
  /* the slide number we start with */
  initialSlideNumber: 0,
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
  }
}

export default class HeroSlider {
  constructor (el, opts = {}) {
    if (typeof el === 'string') {
      this.el = document.querySelector(el)
    } else {
      this.el = el
    }

    if (!this.el) {
      return
    }

    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.initialize()
  }

  initialize () {
    this._addResizeHandler()
    // style the container
    TweenMax.set(this.el, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      opacity: 0
    })

    this.slides = this.el.querySelectorAll('[data-hero-slide]')
    this.images = this.el.querySelectorAll('.hero-slide-img')

    this.slideCount = this.slides.length - 1
    this._currentSlideIdx = this.opts.initialSlideNumber

    // style the slides
    Array.from(this.slides).forEach(s => {
      TweenMax.set(s, {
        zIndex: this.opts.zIndex.regular,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })

      const img = s.querySelector('.hero-slide-img')

      if (img) {
        TweenMax.set(img, {
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

    const fadeIn = () => {
      if (this.slides.length > 1) {
        TweenMax.to(this.el, 0.250, {
          opacity: 1,
          onComplete: () => { this.next() }
        })
      } else {
        TweenMax.to(this.el, 0.250, {
          opacity: 1
        })
      }
    }

    window.addEventListener(Events.APPLICATION_READY, () => {
      /* Wait for the first image to load, then fade in container element */
      const firstImg = this.slides[this._currentSlideIdx].querySelector('img')

      if (firstImg) {
        if (firstImg.complete) {
          fadeIn()
        } else {
          firstImg.onload = () => {
            fadeIn()
          }
        }
      } else {
        // could be a video?
        const firstVid = this.slides[this._currentSlideIdx].querySelector('video')
        if (firstVid.complete) {
          fadeIn()
        } else {
          firstVid.oncanplay = () => {
            if (prefersReducedMotion()) {
              firstVid.stop()
            } else {
              firstVid.play()
            }

            fadeIn()
          }
        }
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
      this._currentSlideIdx = this._currentSlideIdx + 1
      if (this._currentSlideIdx === this.slideCount) {
        [this._nextSlide] = this.slides
      } else {
        this._nextSlide = this.slides[this._currentSlideIdx + 1]
      }
    }

    this._currentSlide = this.slides[this._currentSlideIdx]

    this.slide()
  }

  /**
   * Switches between slides
   */
  slide () {
    const timeline = new TimelineLite()

    switch (this.opts.transition.type) {
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
          .to(this._previousSlide, this.opts.interval, {
            scale: this.opts.transition.scale
          })
          .to(this._currentSlide, this.opts.transition.duration, {
            opacity: 1,
            delay: this.opts.interval - this.opts.transition.duration,
            force3D: true,
            ease: Sine.easeInOut
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
          .fromTo(this._previousSlide, this.opts.interval, {
            overflow: 'hidden'
          }, {
            scale: this.opts.transition.scale
          })
          .to(this._previousSlide, this.opts.transition.duration, {
            width: 0,
            ease: Power3.easeIn,
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
          .call(this.next, null, this)

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
    TweenMax.to(this.images, 0.150, {
      width: document.body.clientWidth,
      overwrite: 'all'
    })
  }
}
