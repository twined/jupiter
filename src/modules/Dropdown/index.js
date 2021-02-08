import { gsap } from 'gsap'
import _defaultsDeep from 'lodash.defaultsdeep'
import Dom from '../Dom'

/**
 * <ul data-dropdown>
 *   <li data-dropdown-trigger>Menu trigger</li>
 *   <ul data-dropdown-menu>
 *     <li>Item</li>
 *     <li>Item</li>
 *   </ul>
 * </ul>
 */

const DEFAULT_OPTIONS = {
  multipleActive: false,
  selectors: {
    trigger: '[data-dropdown-trigger]',
    menu: '[data-dropdown-menu]',
    menuItems: '[data-dropdown-menu] > li'
  },
  tweens: {
    items: {
      duration: 0.2,
      autoAlpha: 0,
      stagger: 0.03
    }
  }
}

export default class Dropdown {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.elements = {}
    this.open = false
    this.element = opts.el
    this.timeline = gsap.timeline({ paused: true, reversed: true })
    this.elements.trigger = Dom.find(this.element, this.opts.selectors.trigger)
    this.elements.menu = Dom.find(this.element, this.opts.selectors.menu)
    this.elements.menuItems = Dom.all(this.element, this.opts.selectors.menuItems)
    this.initialize()
  }

  initialize () {
    this.timeline.from(
      this.elements.menu, {
        duration: 0.3,
        className: `${this.elements.menu.className} zero-height`
      }, 'open'
    )
    this.timeline.to(
      this.elements.menu, {
        height: 'auto'
      }, 'open'
    )

    this.timeline.from(
      this.elements.menuItems,
      this.opts.tweens.items,
      'open+=.1'
    )

    if (!this.elements.trigger) {
      return
    }
    this.elements.trigger.addEventListener('click', this.onClick.bind(this))
  }

  onClick (event) {
    event.preventDefault()
    event.stopPropagation()

    if (this.open) {
      delete this.elements.trigger.dataset.dropdownActive
      this.closeMenu()
    } else {
      this.elements.trigger.dataset.dropdownActive = ''
      this.openMenu()
    }
  }

  openMenu () {
    if (!this.opts.multipleActive) {
      if (this.app.currentMenu) {
        this.app.currentMenu.closeMenu()
      }
      this.app.currentMenu = this
    }
    this.open = true

    if (this.timeline.reversed()) {
      this.timeline.play()
    } else {
      this.timeline.reverse()
    }
  }

  closeMenu () {
    this.app.currentMenu = null
    this.open = false

    if (this.timeline.reversed()) {
      this.timeline.play()
    } else {
      this.timeline.reverse()
    }
  }
}
