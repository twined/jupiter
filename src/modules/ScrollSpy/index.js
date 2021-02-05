import _defaultsDeep from 'lodash.defaultsdeep'
import Dom from '../Dom'

const DEFAULT_OPTIONS = {}

export default class ScrollSpy {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.initialize()
  }

  initialize () {
    this.triggers = Dom.all('[data-scrollspy-trigger]')
    const config = {
      rootMargin: '-55px 0px -85%'
    }

    const observer = new IntersectionObserver((entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.intersectionHandler(entry)
        }
      })
    }), config)

    this.triggers.forEach(section => observer.observe(section))
  }

  intersectionHandler (entry) {
    const id = entry.target.dataset.scrollspyTrigger
    const currentlyActive = document.querySelector('[data-scrollspy-active]')
    const shouldBeActive = document.querySelector(`[data-scrollspy-target="${id}"]`)

    if (currentlyActive) {
      currentlyActive.removeAttribute('data-scrollspy-active')
    }
    if (shouldBeActive) {
      shouldBeActive.dataset.scrollspyActive = ''
    }
  }
}
