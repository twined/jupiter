import _defaultsDeep from 'lodash.defaultsdeep'
import { TimelineLite, Linear } from 'gsap/all'
import * as Events from '../../events'

// Default Settings
const DEFAULT_OPTIONS = {
  el: '[data-parallax]',
  factor: 1.3,
  fadeContent: true
}

export default class Parallax {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.elements = {}

    if (typeof this.opts.el === 'string') {
      this.elements.wrapper = document.querySelector(this.opts.el)
    } else {
      this.elements.wrapper = this.opts.el
    }

    this.elements.content = this.elements.wrapper.querySelector('[data-parallax-content]')
    this.elements.figure = this.elements.wrapper.querySelector('[data-parallax-figure]')

    this.initializeTimeline()
    window.addEventListener(Events.APPLICATION_SCROLL, this.onScroll.bind(this))
  }

  initializeTimeline () {
    this.timeline = new TimelineLite({
      useFrames: true,
      paused: true
    })

    if (this.opts.fadeContent) {
      this.timeline
        .to(this.elements.content, this.app.size.height * 0.4, {
          opacity: 0,
          ease: Linear.easeNone
        }, 0)
    }

    this.timeline
      .to(this.elements.content, this.app.size.height * 0.5, {
        y: this.app.size.height * 0.1,
        ease: Linear.easeNone
      }, 0)

    this.timeline
      .fromTo(this.elements.figure, this.app.size.height, {
        yPercent: 0
      }, {
        yPercent: ((this.app.size.height * this.opts.factor) / 100),
        ease: Linear.easeNone
      }, 0)
  }

  onScroll () {
    const elTop = this.elements.wrapper.getBoundingClientRect().top
    const progress = Math.max(0, Math.min(elTop / this.timeline.duration(), 1))
    this.timeline.progress(progress)
  }
}
