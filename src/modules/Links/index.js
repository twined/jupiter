import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import _defaultsDeep from 'lodash.defaultsdeep'

gsap.registerPlugin(ScrollToPlugin)

const DEFAULT_OPTIONS = {
  triggerEvents: true,
  scrollDuration: 0.8,
  mobileMenuDelay: 800,
  linkQuery: 'a:not([href^="#"]):not([target="_blank"]):not([data-lightbox]):not(.noanim)',
  anchorQuery: 'a[href^="#"]:not(.noanim)',

  onAnchor: (target, links) => {
    links.app.scrollTo(target, links.opts.scrollDuration, links.opts.triggerEvents)
  },

  onTransition: href => {
    const main = document.querySelector('main')
    const fader = document.querySelector('#fader')

    if (fader) {
      gsap.set(fader, { display: 'block', opacity: 0 })
      gsap.to(main, {
        duration: 0.8,
        y: 25,
        ease: 'power3.out'
      })
      gsap.to(fader, {
        duration: 0.2,
        opacity: 1,
        onComplete: () => {
          window.location = href
        }
      })
    } else {
      gsap.to(main, {
        duration: 0.8,
        y: 25,
        ease: 'power3.out'
      })
      gsap.to(main, {
        duration: 0.2,
        opacity: 0,
        onComplete: () => {
          window.location = href
        }
      })
    }
  }
}

export default class Links {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    const links = document.querySelectorAll(this.opts.linkQuery)
    const anchors = document.querySelectorAll(this.opts.anchorQuery)

    this.bindHeroLink()
    this.bindAnchors(anchors)
    this.bindLinks(links)
  }

  bindHeroLink () {
    const el = document.querySelector('[data-link-to-content]')
    if (el) {
      el.addEventListener('click', e => {
        const dataTarget = document.querySelector('main')
        e.preventDefault()
        if (dataTarget) {
          this.opts.onAnchor(dataTarget, this)
        }
      })
    }
  }

  bindAnchors (anchors) {
    let wait = false
    Array.from(anchors).forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault()
        const href = anchor.getAttribute('href')

        if (document.body.classList.contains('open-menu')) {
          this.app.mobileMenu.toggleMenuClosed()
          wait = true
        }

        const move = () => {
          const dataID = href
          const dataTarget = document.querySelector(dataID)

          e.preventDefault()

          if (dataTarget) {
            this.opts.onAnchor(dataTarget, this)

            if (this.app.header && dataTarget.id !== 'top') {
              setTimeout(() => { this.app.header.unpin() }, 800)
            }
          }
        }

        if (wait) {
          setTimeout(move, this.opts.mobileMenuDelay)
        } else {
          move()
        }
      })
    })
  }

  bindLinks (links) {
    Array.from(links).forEach(link => {
      link.addEventListener('click', e => {
        const loadingContainer = document.querySelector('.loading-container')
        const href = link.getAttribute('href')

        if (e.shiftKey || e.metaKey || e.ctrlKey) {
          return
        }

        if (loadingContainer) {
          loadingContainer.style.display = 'none'
        }

        if (href.indexOf(document.location.hostname) > -1 || href.startsWith('/')) {
          e.preventDefault()
          this.opts.onTransition(href)
        }
      })
    })
  }
}
