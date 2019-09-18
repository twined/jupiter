import { TimelineLite, Sine, TweenLite } from 'gsap/all'
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

  /**
   * Create unique `id` prop for each moonwalk element
   */
  uniqueIds: false,

  /**
   * Create indexes inside of each section per key
   */
  addIndexes: false,

  walks: {
    default: {
      /* How long between multiple entries in a moonwalk-section */
      interval: 0.1,
      /* How long each tween is */
      duration: 0.65,
      /* */
      alphaTween: false,
      /* The transitions that will be tweened */
      transition: {
        from: {},
        to: {}
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

  addIds (section) {
    Array.from(section.querySelectorAll('[data-moonwalk]')).forEach(el => {
      el.setAttribute('data-moonwalk-id', Math.random().toString(36).substring(7))
    })
  }

  addIndexes (section) {
    Object.keys(this.opts.walks).forEach(key => {
      let searchAttr

      if (key === 'default') {
        searchAttr = '[data-moonwalk=""]'
      } else {
        searchAttr = `[data-moonwalk="${key}"]`
      }

      const elements = section.querySelectorAll(searchAttr)

      Array.from(elements).forEach((element, index) => {
        element.setAttribute('data-moonwalk-idx', index + 1)
      })
    }, this)
  }

  buildSections () {
    const sections = document.querySelectorAll('[data-moonwalk-section]')

    return Array.from(sections).map(section => {
      this.parseChildren(section)

      if (this.opts.uniqueIds) {
        this.addIds(section)
      }

      if (this.opts.addIndexes) {
        this.addIndexes(section)
      }

      return {
        id: Math.random().toString(36).substring(7),
        el: section,
        name: section.getAttribute('data-moonwalk-section') || null,
        timeline: new TimelineLite({
          // autoRemoveChildren: true
          // smoothChildTiming: true
        }),
        observer: null,
        stage: {
          name: section.getAttribute('data-moonwalk-stage') || null,
          running: false,
          firstTween: false
        },
        elements: []
      }
    })
  }

  clearLazyloads () {
    const srcsets = document.querySelectorAll('[data-ll-srcset][data-moonwalk]')
    Array.from(srcsets).forEach(srcset => srcset.removeAttribute('data-moonwalk'))
  }

  parseChildren (section) {
    Object.keys(this.opts.walks).forEach(key => {
      const { elements, attr, val } = this.findChildElementsByKey(section, key)
      this.setAttrs(elements, attr, val)
    }, this)
  }

  findChildElementsByKey (section, key) {
    let searchAttr = ''
    let attr = ''
    let val = ''

    if (key === 'default') {
      searchAttr = '[data-moonwalk-children]'
      attr = 'data-moonwalk'
    } else {
      searchAttr = `[data-moonwalk-${key}-children]`
      attr = 'data-moonwalk'
      val = key
    }

    return {
      elements: section.querySelectorAll(searchAttr),
      attr,
      val
    }
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

  buildSectionObserver (section) {
    if (!section.stage.name && !section.name) {
      return
    }

    const { opts: { walks } } = this
    const observer = new IntersectionObserver((entries, self) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          /* stage section */
          if (section.stage.name) {
            if (!section.stage.running) {
              // we have a stage and the section is not running.
              // run stage tween
              const stageTween = walks[section.stage.name]

              // TODO: Set the FROM transition when we first go through sections,
              // and change this to a `from` method, so that they are completely minimized on run!

              section.timeline.fromTo(
                entry.target,
                stageTween.duration,
                stageTween.transition.from,
                stageTween.transition.to,
                0
              )

              section.stage.firstTween = true
            }
          }

          /* named section. stagger reveal children */
          if (section.name) {
            const tween = walks[section.name]

            if (!tween) {
              console.error(`==> JUPITER: Walk [${section.name}] not found in config`)
            }


            if (typeof tween.alphaTween === 'object') {
              tween.alphaTween.duration = tween.alphaTween.duration
                ? tween.alphaTween.duration : tween.duration
            } else if (tween.alphaTween === true) {
              tween.alphaTween = {
                duration: tween.duration,
                ease: Sine.easeIn
              }
            }

            section.timeline.staggerTo(
              section.children,
              tween.duration,
              tween.transition.to,
              tween.interval,
              0
            )

            if (tween.alphaTween) {
              section.timeline.staggerTo(
                section.children,
                tween.alphaTween.duration,
                {
                  autoAlpha: 1,
                  ease: tween.alphaTween.ease
                },
                tween.interval,
                0
              )
            }
          }

          self.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px' })

    observer.observe(section.el)
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

      if (section.name) {
        // set initial tweens
        const sectionWalk = opts.walks[section.name]
        section.children = section.el.querySelectorAll(sectionWalk.sectionTargets)
        TweenLite.set(section.children, sectionWalk.transition.from)
      }

      this.buildSectionObserver(section)

      if (!section.name) {
        section.observer = new IntersectionObserver((entries, self) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              section.running = true

              const walkName = entry.target.getAttribute('data-moonwalk')
              const cfg = !walkName.length ? opts.walks.default : opts.walks[walkName]

              const {
                duration,
                transition,
                interval
              } = cfg

              let { alphaTween } = cfg
              let overlap = duration - interval

              if (section.stage.firstTween) {
                overlap = 0
                section.stage.firstTween = false
              }

              if (typeof alphaTween === 'object' && alphaTween !== null) {
                alphaTween.duration = alphaTween.duration ? alphaTween.duration : duration
              } else if (alphaTween === true) {
                alphaTween = {
                  duration,
                  ease: Sine.easeIn
                }
              }

              const tween = transition ? this.tweenJS : this.tweenCSS

              if (entry.target.tagName === 'IMG') {
                // ensure image is loaded before we tween
                imageIsLoaded(entry.target).then(() => tween(
                  section,
                  entry.target,
                  duration,
                  transition,
                  overlap,
                  alphaTween
                ))
              } else {
                const imagesInEntry = entry.target.querySelectorAll('img')
                if (imagesInEntry.length) {
                  // entry has children elements that are images
                  imagesAreLoaded(imagesInEntry).then(() => tween(
                    section,
                    entry.target,
                    duration,
                    transition,
                    overlap,
                    alphaTween
                  ))
                } else {
                  // regular entry, just tween it
                  tween(
                    section,
                    entry.target,
                    duration,
                    transition,
                    overlap,
                    alphaTween
                  )
                }
              }
              self.unobserve(entry.target)
            }
          })
        }, {
          rootMargin,
          threshold: opts.threshold
        })
      }

      section.elements = section.el.querySelectorAll('[data-moonwalk]')
      section.elements.forEach(box => section.observer.observe(box))
    })
  }

  tweenJS (section, target, tweenDuration, tweenTransition, tweenOverlap, alphaTween) {
    let tweenPosition
    let alphaPosition
    const startingPoint = tweenDuration - tweenOverlap

    if (section.timeline.isActive() && section.timeline.recent()) {
      // console.log('[ ', id, ' ] - active and recent')
      if (section.timeline.recent().time() > startingPoint) {
        // We're late for this tween if it was supposed to be sequential.
        // Insert at current time
        tweenPosition = () => section.timeline.time()
        alphaPosition = () => section.timeline.time()
      } else {
        // Still time, add as normal overlap at the end
        tweenPosition = () => `-=${tweenOverlap}`
        alphaPosition = () => `-=${tweenDuration}`
      }
    } else {
      tweenPosition = () => '+=0'
      alphaPosition = () => `-=${tweenDuration}`
    }

    TweenLite.set(target, tweenTransition.from)
    section.timeline.to(
      target,
      tweenDuration,
      tweenTransition.to,
      tweenPosition(),
    )

    if (alphaTween) {
      section.timeline.to(
        target,
        alphaTween.duration,
        { autoAlpha: 1, ease: alphaTween.ease },
        alphaPosition()
      )
    }
  }

  tweenCSS (section, target, duration, transition, overlap) {
    section.timeline.to(
      target,
      duration,
      { css: { className: '+=moonwalked' } },
      overlap
    )
  }
}
