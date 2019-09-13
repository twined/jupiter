// import Headroom from 'headroom.js'
import { TweenLite } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {}

export default class StackedBoxes {
  constructor (app, opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.initialize()
  }

  initialize () {
    // TODO: ensure images are loaded?

    const boxes = document.querySelectorAll('[data-boxes-stacked]')

    const observer = new IntersectionObserver(entries => {
      const [{ isIntersecting, target }] = entries
      if (isIntersecting) {
        this.adjustBox(target)
      }
    })

    Array.from(boxes).forEach(box => {
      observer.observe(box)
    })
  }

  adjustBox (box) {
    const sizeTarget = box.querySelector('[data-boxes-stacked-size-target]')
    const sizeSrc = box.querySelector('[data-boxes-stacked-size-src]')

    if (sizeTarget) {
      this.size(sizeTarget, sizeSrc)
    }

    const pull = box.querySelector('[data-boxes-stacked-pull]')

    if (pull) {
      const pullAmount = pull.getAttribute('data-boxes-stacked-pull')
      console.log(pullAmount)
      let pullPx

      switch (pullAmount) {
        case '1/3':
          pullPx = pull.clientHeight / 3
          break

        case '2/3':
          pullPx = (pull.clientHeight / 3) * 2
          break

        case '1/2':
          pullPx = pull.clientHeight / 2
          break

        default:
          console.error('==> JUPITER/STACKEDBOXES: `data-boxes-stacked-pull` has wrong value')
      }
      this.pull(pull, pullPx)
    }
  }

  pull (box, amnt) {
    TweenLite.set(box, { y: amnt * -1, marginBottom: amnt * -1 })
  }

  size (target, src) {
    TweenLite.set(target, { height: src.clientHeight })
  }
}
