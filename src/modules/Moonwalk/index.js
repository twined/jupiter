import { TimelineLite, Sine } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'
import prefersReducedMotion from '../../utils/prefersReducedMotion'
import imageIsLoaded from '../../utils/imageIsLoaded'
import imagesAreLoaded from '../../utils/imagesAreLoaded'

const DEFAULT_OPTIONS = {
  /**
   * If your app needs to do some initialization before the
   * application:ready has been fired, you can set this to
   * false. You will then have to call `this.ready()`
   * to start the reveals
   */

  fireOnReady: true,

  /**
   * Clear out all `data-ll-srcset` from moonwalk elements
   */
  clearLazyload: false,

  /**
   * Determines how early the IntersectionObserver triggers
   */
  rootMargin: '-15%',

  /**
   * How much of the element must be visible before IO trigger
   */
  threshold: 0,

  walks: {
    default: {
      /* How long between multiple entries in a moonwalk-section */
      interval: 0.1,
      /* How long each tween is */
      duration: 0.65,
      /* The transitions that will be tweened */
      transition: {
        from: {
          autoAlpha: 0,
          y: 5
        },
        to: {
          autoAlpha: 1,
          y: 0,
          ease: Sine.easeInOut,
          force3D: true /* if there are SVGs, we need this for Safari :( */
        }
      }
    }
  }
}

export default class Moonwalk {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    document.documentElement.classList.add('moonwalk')

    this.sections = this.buildSections()
    this.parseChildren()

    if (this.opts.clearLazyload) {
      this.clearLazyloads()
    }

    if (prefersReducedMotion()) {
      this.removeAllWalks()
    }

    if (this.opts.fireOnReady) {
      window.addEventListener(Events.APPLICATION_READY, this.ready.bind(this))
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
      timeline: new TimelineLite(),
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
            let cfg
            const walkName = entry.target.getAttribute('data-moonwalk')

            if (!walkName.length) {
              cfg = opts.walks.default
            } else {
              cfg = opts.walks[walkName]
            }

            const {
              duration, transition, interval
            } = cfg

            const overlapNumber = duration - interval
            let overlap = `-=${overlapNumber}`

            if (!section.timeline.isActive()) {
              overlap = '+=0'
            }

            let tween

            if (transition) {
              // js tween
              tween = () => {
                section.timeline.fromTo(
                  entry.target,
                  duration,
                  transition.from,
                  transition.to,
                  overlap
                )
              }
            } else {
              // css class animation
              tween = () => {
                section.timeline.to(
                  entry.target,
                  duration,
                  { css: { className: '+=moonwalked' } },
                  overlap
                )
              }
            }

            if (entry.target.tagName === 'IMG') {
              // ensure image is loaded before we tween
              imageIsLoaded(entry.target).then(() => tween())
            } else {
              const imagesInEntry = entry.target.querySelectorAll('img')
              if (imagesInEntry.length) {
                // entry has children elements that are images
                imagesAreLoaded(imagesInEntry).then(() => tween())
              } else {
                // regular entry, just tween it
                tween()
              }
            }

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
