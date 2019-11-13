/**
 *
 * HERO VIDEO
 *
 * ## Example
 *
 *    const hs = HeroVideo(opts)
 *
 */

import { gsap } from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import objectFitPolyfill from 'objectFitPolyfill'
import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'
import prefersReducedMotion from '../../utils/prefersReducedMotion'


gsap.registerPlugin(CSSPlugin)
// eslint-disable-next-line no-unused-vars
const plugins = [objectFitPolyfill]

const DEFAULT_OPTIONS = {
  el: '[data-hero-video]',
  onFadeIn: hero => {
    gsap.to(hero.el, 1, {
      opacity: 1
    })
  },

  onPlayReady: () => {},
  onClickPlay: () => {},
  onClickPause: () => {},

  /**
   * Where to attach the pause button
   */
  pauseParent: '.hero-content',

  elements: {
    pause: () => `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 350 350"><circle cx="175" cy="175" r="172.5" stroke="#000" stroke-width="10"/><path stroke="#000" stroke-width="10" d="M227.5 100v150M127.5 100v150"/></svg>
    `,

    play: () => `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 350 350"><circle cx="175" cy="175" r="172.5" stroke="#000" stroke-width="10"/><path stroke="#000" stroke-width="10" d="M240 174l-112-72v148l112-76z"/></svg>
    `
  }
}

export default class HeroVideo {
  constructor (app, opts = {}) {
    this.app = app
    this.booting = true
    this.playing = false
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.elements = {}

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
      overflow: 'hidden',
      opacity: 0
    })

    const pauseParent = document.querySelector(this.opts.pauseParent)
    const pauseButton = document.createRange().createContextualFragment(`
      <button data-hero-video-pause></button>
    `)

    if (pauseParent) {
      pauseParent.append(pauseButton)
      this.elements.pause = pauseParent.querySelector('[data-hero-video-pause]')
      this.elements.pause.innerHTML = this.opts.elements.pause()
    }

    this.videoDiv = this.el.querySelector('[data-hero-video-content]')
    this.video = this.videoDiv.querySelector('video')

    this.addObserver()
    this.addEvents()

    gsap.set(this.videoDiv, {
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

    gsap.set(this.video, {
      width: document.body.clientWidth,
      height: '100%',
      top: 0,
      left: 0,
      position: 'absolute'
    })

    window.addEventListener(Events.APPLICATION_READY, () => {
      /* Wait for the video to load, then fade in container element */
      if (!this.video.playing && !prefersReducedMotion() && this.video.readyState >= 3) {
        this.play()
        this.fadeIn()
        this.booting = false
      }
      window.objectFitPolyfill()
    })
  }

  addEvents () {
    this.video.addEventListener('canplay', () => {
      if (!this.playing) {
        if (!prefersReducedMotion()) {
          this.opts.onPlayReady(this)
          this.play()
          this.fadeIn()
          this.booting = false
        } else {
          gsap.set(this.el, { opacity: 1 })
        }
      }
    })
    if (this.elements.pause) {
      this.elements.pause.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        if (this.playing) {
          this.opts.onClickPause(this)
          this.pause()
          this.elements.pause.innerHTML = this.opts.elements.play()
        } else {
          this.opts.onClickPlay(this)
          this.play()
          this.elements.pause.innerHTML = this.opts.elements.pause()
        }
      })
    }
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
    gsap.to(this.video, 0.150, {
      width: document.body.clientWidth,
      overwrite: 'all'
    })
  }
}
