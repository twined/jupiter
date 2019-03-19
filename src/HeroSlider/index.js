/**
 *
 * HERO SLIDER
 * ===========
 *
 * ## Example
 *
 *    const hs = HeroSlider(sliderEl, opts)
 *
 */

import imagesLoaded from 'imagesloaded'
import { TweenLite, Power3, CSSPlugin } from 'gsap/all'
const plugins = [CSSPlugin]

const DEFAULT_OPTIONS = {
  /* time between slides */
  interval: 4.2,
  /* the slide number we start with */
  initialSlideNumber: 0,
  /* zIndexes for the slide mechanism */
  zIndex: {
    visible: 5,
    next: 4,
    regular: 3,
  },
  transition: {
    /* how long the actual transition from slide to slide takes */
    duration: 0.8,
    /* the transition type. 'parallax' or 'fade' */
    type: 'parallax'
  }
}

export default class HeroSlider {
  constructor (el, opts = {}) {
    if (!el) {
      console.error('==> JUPITER/HEROSLIDER: NO ELEMENT PROVIDED TO CONSTRUCTOR')
      return
    }

    this.el = el

    Object.assign(this, {
      opts: DEFAULT_OPTIONS
    }, opts)

    this.initialize()
  }

  initialize () {
    // style the container
    TweenLite.set(this.el, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      opacity: 0
    })

    this.slides = this.el.querySelectorAll('.hero-slide')
    this.slideCount = this.slides.length - 1
    this._currentSlideIdx = this.opts.initialSlideNumber

    // style the slides
    for (let s of Array.from(this.slides)) {
      TweenLite.set(s, {
        zIndex: this.opts.zIndex.regular,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })

      let img = s.querySelector('.hero-slide-img')

      if (img) {
        TweenLite.set(img, {
          width: document.body.clientWidth,
          height: '100%',
          top: 0,
          left: 0,
          position: 'absolute'
        })
      } else {
        console.error('==> JUPITER/HEROSLIDER: MISSING .hero-slide-img with background image inside .hero-slide')
      }
    }

    this.slides[0].style.zIndex = this.opts.zIndex.visible
    this.slides[1].style.zIndex = this.opts.zIndex.next

    /* Wait for the first image to load, then fade in container element */
    imagesLoaded(this.slides[this._currentSlideIdx], () => {
      TweenLite.to(this.el, 0.250, {
        opacity: 1,
        onComplete: () => { this.next() }
      })
    })
  }

  /**
   * Calculate which slide is next, and call the slide function
   */
  next () {
    if (this._currentSlideIdx === this.slideCount) {
      this._previousSlide = this.slides[this._currentSlideIdx]
      // last slide --> next slide will be 0
      this._currentSlideIdx = 0
      this._nextSlide = this.slides[this._currentSlideIdx + 1]
    } else {
      this._previousSlide = this.slides[this._currentSlideIdx]
      this._currentSlideIdx = this._currentSlideIdx + 1
      if (this._currentSlideIdx === this.slideCount) {
        this._nextSlide = this.slides[0]
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
    switch (this.opts.transition.type) {
      case 'fade':
        TweenLite.set(this._currentSlide, {
          opacity: 0,
          zIndex: this.opts.zIndex.visible
        })

        TweenLite.set(this._nextSlide, {
          opacity: 0
        })

        TweenLite.to(this._currentSlide, this.opts.transition.duration, {
          opacity: 1,
          force3D: true,
          ease: Power3.easeInOut,
          onComplete: () => {
            this._nextSlide.style.zIndex = this.opts.zIndex.visible
            this._currentSlide.style.zIndex = this.opts.zIndex.regular
            this._previousSlide.style.zIndex = this.opts.zIndex.regular

            TweenLite.set(this._previousSlide, {
              opacity: 0
            })

            this.next()
          }
        })
        break

      case 'parallax':
        TweenLite.set(this._currentSlide, {
          zIndex: this.opts.zIndex.next,
          scale: 1.0,
          width: '100%',
          overwrite: 'all'
        })

        TweenLite.set(this._previousSlide, {
          overflow: 'hidden'
        })

        TweenLite.to(this._previousSlide, this.opts.interval, {
          scale: 1.05,
          onComplete: () => {
            TweenLite.to(this._previousSlide, this.opts.transition.duration, {
              width: 0,
              ease: Power3.easeIn,
              autoRound: true,
              overwrite: 'all',
              onComplete: () => {
                TweenLite.set(this._nextSlide, {
                  zIndex: this.opts.zIndex.next,
                  overwrite: 'all'
                })

                TweenLite.set(this._currentSlide, {
                  zIndex: this.opts.zIndex.visible,
                  width: '100%',
                  overwrite: 'all'
                })

                TweenLite.set(this._previousSlide, {
                  zIndex: this.opts.zIndex.regular,
                  scale: 1.0,
                  width: '100%',
                  overwrite: 'all'
                })

                this.next()
              }
            })
          }
        })
        break
    }
  }

  /**
   * Add a window resize handles that resizes image widths
   */
  _addResizeHandler () {
    window.addEventListener('resize', e => {
      TweenLite.set(document.querySelectorAll('.hero-slide-img'), {
        width: document.body.clientWidth,
        overwrite: 'all'
      })
    })
  }
}
