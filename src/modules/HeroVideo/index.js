/**
 *
 * HERO VIDEO
 *
 * ## Example
 *
 *    const hs = HeroVideo(opts)
 *
 */

import {
  TweenLite, CSSPlugin
} from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'
import prefersReducedMotion from '../../utils/prefersReducedMotion'

// eslint-disable-next-line no-unused-vars
const plugins = [CSSPlugin]

if ('objectFit' in document.documentElement.style === false) {
  document.addEventListener('DOMContentLoaded', () => {
    Array.prototype.forEach.call(document.querySelectorAll('[data-hero-background]'), image => {
      (image.runtimeStyle || image.style).background = `url("${image.src}") no-repeat 50%/${image.currentStyle ? image.currentStyle['object-fit'] : image.getAttribute('data-object-fit')}`
      image.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${image.width}' height='${image.height}'%3E%3C/svg%3E`
    })
  })
}

const DEFAULT_OPTIONS = {
  el: '[data-hero-video]',
  onFadeIn: hero => {
    TweenLite.to(hero.el, 1, {
      opacity: 1
    })
  }
}

export default class HeroVideo {
  constructor (app, opts = {}) {
    this.app = app
    this.booting = true
    this.playing = false
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
    TweenLite.set(this.el, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      opacity: 0
    })

    this.videoDiv = this.el.querySelector('[data-hero-video-content]')
    this.video = this.videoDiv.querySelector('video')

    this.addObserver()
    this.addEvents()

    TweenLite.set(this.videoDiv, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    })

    if (!this.video) {
      console.error('==> JUPITER/HEROVIDEO: MISSING <video> INSIDE [data-hero-video-content]')
      return
    }
    this.video.muted = true

    TweenLite.set(this.video, {
      width: document.body.clientWidth,
      height: '100%',
      top: 0,
      left: 0,
      position: 'absolute'
    })

    window.addEventListener(Events.APPLICATION_INITIALIZED, () => {
      /* Wait for the video to load, then fade in container element */
      if (!this.video.playing && !prefersReducedMotion() && this.video.readyState >= 3) {
        this.play()
        this.fadeIn()
        this.booting = false
      }
    })
  }

  addEvents () {
    this.video.addEventListener('canplay', () => {
      if (!this.playing) {
        if (!prefersReducedMotion()) {
          this.play()
          this.fadeIn()
          this.booting = false
        } else {
          TweenLite.set(this.el, { opacity: 1 })
        }
      }
    })
  }

  play () {
    this.video.play()
    this.playing = true
  }

  pause () {
    this.video.pause()
    this.playing = false
  }

  fadeIn () {
    this.opts.onFadeIn(this)
  }

  addObserver () {
    const observer = new IntersectionObserver(entries => {
      const [{ isIntersecting }] = entries
      if (isIntersecting) {
        if (!this.booting && !this.playing) {
          this.play()
        } else {
          this.play()
          this.fadeIn()
          this.booting = false
        }
      } else if (this.playing) {
        this.pause()
      }
    })

    observer.observe(this.el)
  }

  /**
   * Add a window resize handler that resizes video width
   */
  _addResizeHandler () {
    this.observer = new IntersectionObserver(entries => {
      const [{ isIntersecting }] = entries
      if (isIntersecting) {
        this._resize()
        window.addEventListener(Events.APPLICATION_RESIZE, this._resize.bind(this))
      } else {
        window.removeEventListener(Events.APPLICATION_RESIZE, this._resize.bind(this))
      }
    })

    this.observer.observe(this.el)
  }

  _resize () {
    TweenLite.to(this.video, 0.150, {
      width: document.body.clientWidth,
      overwrite: 'all'
    })
  }
}
