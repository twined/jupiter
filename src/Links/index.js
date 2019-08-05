// import Headroom from 'headroom.js'
import { TweenLite, Power3 } from 'gsap/all'
import scrollIntoView from 'smooth-scroll-into-view-if-needed'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  mobileMenuDelay: 800,
  linkQuery: 'a:not([href^="#"]):not([target="_blank"]):not([data-lightbox]):not(.noanim)',
  anchorQuery: 'a[href^="#"]',

  onTransition: href => {
    const main = document.querySelector('main')
    const fader = document.querySelector('#fader')

    fader.style.display = 'block'
    TweenLite.to(main, 0.8, {
      y: 25,
      ease: Power3.easeOut
    })

    TweenLite.to(fader, 0.2, {
      opacity: 1,
      onComplete: () => {
        window.location = href
      }
    })
  }
}

export default class Links {
  constructor (app, opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.app = app

    const links = document.querySelectorAll(this.opts.linkQuery)
    const anchors = document.querySelectorAll(this.opts.anchorQuery)

    this.bindAnchors(anchors)
    this.bindLinks(links)
  }

  bindAnchors (anchors) {
    let wait = false
    for (const anchor of Array.from(anchors)) {
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
            scrollIntoView(dataTarget, { block: 'start', behavior: 'smooth' })
          }

          if (this.app.header && dataTarget.id !== 'top') {
            setTimeout(() => { this.app.header.unpin() }, 800)
          }
        }

        if (wait) {
          setTimeout(move, this.opts.mobileMenuDelay)
        } else {
          move()
        }
      })
    }
  }

  bindLinks (links) {
    for (const link of Array.from(links)) {
      link.addEventListener('click', e => {
        const loadingContainer = document.querySelector('.loading-container')
        const href = link.getAttribute('href')
        loadingContainer.style.display = 'none'

        if (e.shiftKey || e.metaKey || e.ctrlKey || e.isDefaultPrevented()) {
          return
        }

        if (href.indexOf(document.location.hostname) > -1 || href.startsWith('/')) {
          e.preventDefault()
          this.opts.onTransition(href)
        }
      })
    }
  }
}
