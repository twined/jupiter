import { TimelineMax } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import prefersReducedMotion from '../utils/prefersReducedMotion'

const DEFAULT_OPTIONS = {
  /**
   * if your app needs to do some initialization while the
   * application:ready has been fired, you can set this to
   * false. You will then have to call `this.ready()`
   * to start the reveals
   */

  fireOnReady: true,
  clearLazyload: false,

  rootMargin: '-15%',
  threshold: 0,

  walks: {
    default: {
      overlap: '-=0.3',
      duration: 800,
      transition: {
        from: {
          y: -20
        },
        to: {
          autoAlpha: 1,
          y: 0
        }
      }
    }
  }
}

export default class Moonwalk {
  constructor (opts) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.sections = this.buildSections()
    this.parseChildren()

    if (this.opts.clearLazyload) {
      this.clearLazyloads()
    }

    if (prefersReducedMotion()) {
      this.removeAllWalks()
    }

    if (this.opts.fireOnReady) {
      window.addEventListener('application:ready', this.ready.bind(this))
    }
  }

  removeAllWalks () {
    const key = '[data-moonwalk]'
    const elems = document.querySelectorAll(key)

    Array.from(elems).forEach(el => el.removeAttribute(key))
  }

  buildSections () {
    const sections = document.querySelectorAll('[data-moonwalk-section]')

    return Array.from(sections).map(section => ({
      el: section,
      timeline: new TimelineMax(),
      observer: null,
      elements: []
    }))
  }

  clearLazyloads () {
    const srcsets = document.querySelectorAll('[data-ll-srcset][data-moonwalk]')
    Array.from(srcsets).forEach(srcset => srcset.removeAttribute('data-moonwalk'))
  }

  parseChildren () {
    Object.keys(this.opts.walks).forEach(key => {
      this.findElementsByKey(key)
    }, this)
  }

  findElementsByKey (key) {
    let searchAttr = ''
    let attr = ''
    let val = ''

    if (key === 'default') {
      searchAttr = '[data-moonwalk-children]'
      attr = 'data-moonwalk'
      val = ''
    } else {
      searchAttr = `[data-moonwalk-${key}-children]`
      attr = 'data-moonwalk'
      val = key
    }

    const elements = document.querySelectorAll(searchAttr)
    return this.setAttrs(elements, attr, val)
  }

  setAttrs (elements, attr, val) {
    const affectedElements = []

    Array.prototype.forEach.call(elements, el => {
      const { children } = el

      Array.prototype.forEach.call(children, c => {
        c.setAttribute(attr, val)
        affectedElements.push(c)
      })
    })

    return affectedElements
  }

  ready () {
    const { opts } = this

    this.sections.forEach((section, idx) => {
      // if this is the last section, set rootMargin to 0
      let rootMargin

      if (idx === this.sections.length - 1) {
        rootMargin = '0px'
      } else {
        rootMargin = opts.rootMargin
      }

      section.observer = new IntersectionObserver(((entries, self) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Get cfg
            let cfg
            const walkName = entry.target.getAttribute('data-moonwalk')

            if (!walkName.length) {
              cfg = opts.walks.default
            } else {
              cfg = opts.walks[walkName]
            }

            const {
              duration, transition
            } = cfg

            let { overlap } = cfg

            if (!section.timeline.isActive()) {
              overlap = '+=0'
            }

            section.timeline.fromTo(
              entry.target,
              duration,
              transition.from,
              transition.to,
              overlap
            )

            self.unobserve(entry.target)
          }
        });
      }), {
        rootMargin,
        threshold: opts.threshold
      })

      section.elements = section.el.querySelectorAll('[data-moonwalk]')
      section.elements.forEach(box => {
        section.observer.observe(box)
      })
    })
  }
}
