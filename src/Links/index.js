// import Headroom from 'headroom.js'
import { TweenLite, Power3 } from 'gsap/all'
import scrollIntoView from 'scroll-into-view-if-needed'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  mobileMenuDelay: 800,
  linkQuery: 'a:not([href^="#"]):not([target="_blank"]):not([data-lightbox]):not(.noanim)',
  anchorQuery: 'a[href^="#"]'
}

export default class Links {
  constructor (app, opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    const fader = document.querySelector('#fader')
    const links = document.querySelectorAll(this.opts.linkQuery)
    const anchors = document.querySelectorAll(this.opts.anchorQuery)

    let wait = false

    for (let link of Array.from(anchors)) {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const href = link.getAttribute('href')

        if (document.body.classList.contains('open-menu')) {
          app.mobileMenu.toggleMenuClosed()
          wait = true
        }

        const move = () => {
          let dataID = href
          let dataTarget = document.querySelector(dataID)
          e.preventDefault()
          if (dataTarget) {
            scrollIntoView(dataTarget, { block: 'start', behavior: 'smooth' })
          }
        }

        if (wait) {
          setTimeout(move, this.opts.mobileMenuDelay)
        } else {
          move()
        }
      })
    }

    for (let link of Array.from(links)) {
      link.addEventListener('click', e => {
        const loadingContainer = document.querySelector('.loading-container')
        const href = link.getAttribute('href')

        loadingContainer.style.display = 'none'

        if (href.indexOf(document.location.hostname) > -1 || href.startsWith('/')) {
          e.preventDefault()
          let main = document.querySelector('main')
          fader.style.display = 'block'
          TweenLite.to(main, 0.8, {
            yPercent: 3,
            ease: Power3.easeOut
          })

          TweenLite.to(fader, 0.350, {
            opacity: 1,
            onComplete: () => {
              window.location = href
            }
          })
        }
      })
    }
  }
}