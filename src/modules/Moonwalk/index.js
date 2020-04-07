/**
 * Vendor imports
 */
import { gsap } from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import _defaultsDeep from 'lodash.defaultsdeep'

/**
 * Jupiter imports
 */
import * as Events from '../../events'
import prefersReducedMotion from '../../utils/prefersReducedMotion'
import imageIsLoaded from '../../utils/imageIsLoaded'
import imagesAreLoaded from '../../utils/imagesAreLoaded'
import Dom from '../Dom'

gsap.registerPlugin(CSSPlugin)

const DEFAULT_OPTIONS = {
  /**
   * If your app needs to do some initialization before the
   * application:ready has been fired, you can set this to
   * `() => {}`. You will then have to call `this.ready()`
   * to start the reveals
   */

  on: Events.APPLICATION_REVEALED,

  /**
   * Set a delay for the initial reveal. Could be useful if you want the reveal to happen
   * after for instance a header has been revealed
   */
  initialDelay: 0.1,

  /**
   * Clear out all `data-ll-srcset` from moonwalk elements
   */
  clearLazyload: false,

  /**
   * Determines how early the IntersectionObserver triggers
   */
  rootMargin: '-10% 0%',

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

  runs: {},

  walks: {
    default: {
      /* How long to wait before firing timeline */
      startDelay: 0,
      /* How long between multiple entries in a moonwalk-section */
      interval: 0.15,
      /* How long each tween is */
      duration: 0.65,
      /* */
      alphaTween: true,
      /* The transitions that will be tweened */
      transition: {
        from: {
          y: 20
        },
        to: {
          y: 0
        }
      }
    }
  }
}

export default class Moonwalk {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.addClass()
    this.sections = this.initializeSections()
    this.runs = this.initializeRuns()

    if (this.opts.clearLazyload) {
      this.clearLazyloads()
    }

    if (prefersReducedMotion()) {
      this.removeAllWalks()
    }

    if (this.opts.on) {
      window.addEventListener(this.opts.on, this.onReady.bind(this))
    }
  }

  /**
   * Add `moonwalk` class to html element to identify ourselves.
   */
  addClass () {
    document.documentElement.classList.add('moonwalk')
  }

  /**
   * Remove all moonwalks. Useful for clients who prefer reduced motion
   */
  removeAllWalks () {
    const keys = ['data-moonwalk', 'data-moonwalk-run', 'data-moonwalk-section']
    keys.forEach(key => {
      const elems = document.querySelectorAll(`[${key}]`)
      Array.from(elems).forEach(el => el.removeAttribute(key))
    })
  }

  /**
   * Add a random ID to each moonwalk element
   *
   * @param {*} section
   */
  addIds (section) {
    Array.from(section.querySelectorAll('[data-moonwalk]')).forEach(el => {
      el.setAttribute('data-moonwalk-id', Math.random().toString(36).substring(7))
    })
  }

  /**
   * Add index to each moonwalk element in `section`
   *
   * @param {*} section
   */
  addIndexes (section) {
    Object.keys(this.opts.walks).forEach(key => {
      const searchAttr = key === 'default' ? '[data-moonwalk=""]' : `[data-moonwalk="${key}"]`
      const elements = section.querySelectorAll(searchAttr)

      Array.from(elements).forEach((element, index) => {
        element.setAttribute('data-moonwalk-idx', index + 1)
      })
    }, this)
  }

  /**
   * Go through each `data-moonwalk-run`, parse children, add IDs/indexes
   * (if wanted), initialize a new object for each.
   */
  initializeRuns () {
    const runs = document.querySelectorAll('[data-moonwalk-run]')
    return Array.from(runs).map(run => ({
      el: run,
      threshold: this.opts.runs[run.getAttribute('data-moonwalk-run')].threshold || 0,
      callback: this.opts.runs[run.getAttribute('data-moonwalk-run')].callback
    }))
  }

  /**
   * Go through each `data-moonwalk-section`, parse children, add IDs/indexes
   * (if wanted), initialize a new object for each.
   */
  initializeSections () {
    const sections = document.querySelectorAll('[data-moonwalk-section]')
    return Array.from(sections).map(section => {
      this.parseChildren(section)

      if (this.opts.uniqueIds) {
        this.addIds(section)
      }

      if (this.opts.addIndexes) {
        this.addIndexes(section)
      }

      const timeline = gsap.timeline({
        // autoRemoveChildren: true
        smoothChildTiming: true
      })

      return {
        id: Math.random().toString(36).substring(7),
        el: section,
        name: section.getAttribute('data-moonwalk-section') || null,
        timeline,
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

  /**
   * Removes `data-moonwalk` from all elements who already have `data-ll-srcset´
   * Can be used if Moonwalking interferes with custom lazyloading animations
   */
  clearLazyloads () {
    const srcsets = document.querySelectorAll('[data-ll-srcset][data-moonwalk]')
    Array.from(srcsets).forEach(srcset => srcset.removeAttribute('data-moonwalk'))
  }

  /**
   * Look through section for `data-moonwalk-children` or
   * `data-moonwalk-children="{walkName}"`, then convert all children to
   * `data-moonwalk` or `data-moonwalk-{walkName}`
   *
   * @param {*} section
   */
  parseChildren (section) {
    const mwc = Dom.all(section, '[data-moonwalk-children]')

    Array.from(mwc).forEach(c => {
      const key = c.getAttribute('data-moonwalk-children')
      this.setAttrs(c, key)
    })
  }

  /**
   * Sets all `element`s childrens `data-moonwalk` to `val`
   *
   * @param {*} element
   * @param {*} val
   */
  setAttrs (element, val) {
    const affectedElements = []

    Array.prototype.forEach.call(element.children, c => {
      c.setAttribute('data-moonwalk', val)
      affectedElements.push(c)
    })

    return affectedElements
  }

  /**
   * If we have advanced sections, either named sections or section stages.
   * Resets the entry's `from` state, then creates an observer that will
   * watch this section.
   *
   * @param {*} section
   */
  setupNamesAndStages (section) {
    gsap.set(section.el, { opacity: 1 })

    if (!section.stage.name && !section.name) {
      return
    }

    const { opts: { walks } } = this

    if (section.name) {
      // set initial tweens
      const sectionWalk = walks[section.name]
      if (sectionWalk.sectionTargets) {
        section.children = this.orderChildren(
          section.el.querySelectorAll(sectionWalk.sectionTargets)
        )
      } else {
        section.children = this.orderChildren(
          section.el.children
        )
      }

      const fromTransition = sectionWalk.alphaTween ? {
        ...sectionWalk.transition.from,
        opacity: 0
      } : sectionWalk.transition.from

      gsap.set(section.children, fromTransition)
    }

    if (section.stage.name) {
      // reset the element to its `from` state.
      const stageTween = walks[section.stage.name]
      gsap.set(section.el, stageTween.transition.from)
    }

    const observer = this.sectionObserver(section)
    observer.observe(section.el)
  }

  /**
   * Create and return an observer for `section`
   *
   * @param {*} section
   */
  sectionObserver (section) {
    // const { opts: { walks } } = this
    const { opts } = this
    const { walks } = opts

    return new IntersectionObserver((entries, self) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i]

        if (entry.isIntersecting) {
          /* stage section */
          if (section.stage.name) {
            if (!section.stage.running) {
              // we have a stage and the section is not running.
              // run stage tween
              const stageTween = walks[section.stage.name]

              const to = {
                ...stageTween.transition.to,
                duration: stageTween.duration
              }

              section.timeline.to(entry.target, to, 0)
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
                ease: 'sine.in'
              }
            }

            if (tween.startDelay) {
              tween.transition.to = {
                ...tween.transition.to,
                delay: tween.startDelay
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
                  opacity: 1,
                  ease: tween.alphaTween.ease,
                  delay: tween.startDelay || 0
                },
                tween.interval,
                0
              )
            }
          }

          self.unobserve(entry.target)
        }
      }
    }, { rootMargin: opts.rootMargin })
  }

  /**
   * Order `children` by `data-moonwalk-order`.
   *
   * @param {*} children
   */
  orderChildren (children) {
    return Array.from(children).sort((a, b) => {
      const orderA = a.getAttribute('data-moonwalk-order') ? parseInt(a.getAttribute('data-moonwalk-order')) : null
      const orderB = a.getAttribute('data-moonwalk-order') ? parseInt(b.getAttribute('data-moonwalk-order')) : null

      if (!orderA && !orderB) {
        return 0
      }

      if (orderA && !orderB) {
        return -1
      }

      if (!orderA && orderB) {
        return 1
      }

      return orderA - orderB
    })
  }


  onReady () {
    if (this.opts.initialDelay) {
      setTimeout(() => {
        this.ready()
      }, this.opts.initialDelay)
    } else {
      this.ready()
    }
  }

  /**
   * Called on `APPLICATION_READY` event, if `config.fireOnReady`.
   * Otherwise must be triggered manually
   */
  ready () {
    const { opts } = this

    for (let idx = 0; idx < this.runs.length; idx += 1) {
      const run = this.runs[idx]
      // if this is the last section, set rootMargin to 0
      let rootMargin

      if (idx === this.sections.length - 1) {
        rootMargin = '0px'
      } else {
        rootMargin = opts.rootMargin
      }

      const runObserver = this.runObserver(run, rootMargin)
      runObserver.observe(run.el)
    }

    for (let idx = 0; idx < this.sections.length; idx += 1) {
      const section = this.sections[idx]
      // if this is the last section, set rootMargin to 0
      let rootMargin

      if (idx === this.sections.length - 1) {
        rootMargin = '0px'
      } else {
        rootMargin = opts.rootMargin
      }

      this.setupNamesAndStages(section)

      if (!section.name) {
        section.observer = this.observer(section, rootMargin)
      }

      section.elements = section.el.querySelectorAll('[data-moonwalk]')
      section.elements.forEach(box => section.observer.observe(box))
    }
  }

  /**
   * Creates and returns the RUN observer for data-moonwalk-run elements
   *
   * @param {*} run
   * @param {*} rootMargin
   */
  runObserver (run, rootMargin) {
    return new IntersectionObserver((entries, self) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i]
        if (entry.isIntersecting) {
          run.callback(entry.target)
          self.unobserve(entry.target)
        }
      }
    }, {
      rootMargin,
      threshold: run.threshold
    })
  }

  /**
   * Creates and returns the standard observer for all moonwalk elements
   * inside a section.
   *
   * @param {*} section
   * @param {*} rootMargin
   */
  observer (section, rootMargin) {
    const { opts } = this

    return new IntersectionObserver((entries, self) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i]

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
              ease: 'sine.in'
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
      }
    }, {
      rootMargin,
      threshold: opts.threshold
    })
  }

  /**
   * The main tween function
   *
   * @param {*} section
   * @param {*} target
   * @param {*} tweenDuration
   * @param {*} tweenTransition
   * @param {*} tweenOverlap
   * @param {*} alphaTween
   */
  tweenJS (section, target, tweenDuration, tweenTransition, tweenOverlap, alphaTween) {
    let tweenPosition
    const startingPoint = tweenDuration - tweenOverlap

    if (section.timeline.isActive() && section.timeline.recent()) {
      if (section.timeline.recent().time() > startingPoint) {
        /* We're late for this tween if it was supposed to be sequential,
        so insert at current time in timeline instead */
        tweenPosition = () => section.timeline.time()
      } else {
        /* Still time, add as normal overlap at the end */
        tweenPosition = () => `>-${tweenOverlap}`
      }
    } else {
      tweenPosition = () => '+=0'
    }

    gsap.set(target, tweenTransition.from)

    section.timeline.to(
      target, {
        ...tweenTransition.to,
        duration: tweenDuration
      },
      tweenPosition()
    )

    if (alphaTween) {
      section.timeline.to(target, {
        duration: alphaTween.duration,
        opacity: 1,
        ease: alphaTween.ease
      },
      '<')
    }
  }

  /**
   * CSS version. Not quite ready yet.
   *
   * @param {*} section
   * @param {*} target
   * @param {*} duration
   * @param {*} transition
   * @param {*} overlap
   */
  tweenCSS (section, target, tweenDuration, tweenTransition, tweenOverlap) {
    let tweenPosition
    const startingPoint = tweenDuration - tweenOverlap

    if (Dom.hasClass(target, 'moonwalked')) {
      return
    }

    if (section.timeline.isActive() && section.timeline.recent()) {
      if (section.timeline.recent().time() > startingPoint) {
        /* We're late for this tween if it was supposed to be sequential,
        so insert at current time in timeline instead */
        tweenPosition = () => section.timeline.time()
      } else {
        /* Still time, add as normal overlap at the end */
        tweenPosition = () => `>-${tweenOverlap}`
      }
    } else {
      tweenPosition = () => '+=0'
    }

    section.timeline.to(
      target, {
        css: {
          className: `${target.className} moonwalked`
        },
        duration: tweenDuration
      },
      tweenPosition()
    )
  }
}
