import { Manager, Swipe } from '@egjs/hammerjs'
import { TweenLite, Sine } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import imagesAreLoaded from '../../utils/imagesAreLoaded'

TweenLite.defaultEase = Sine.easeOut

const DEFAULT_OPTIONS = {
  captions: false,

  elements: {
    arrowRight: () => {
      const sp1 = document.createElement('span')
      sp1.classList.add('arrow-r')
      sp1.appendChild(document.createTextNode('→'))
      return sp1
    },

    arrowLeft: () => {
      const sp1 = document.createElement('span')
      sp1.classList.add('arrow-l')
      sp1.appendChild(document.createTextNode('←'))
      return sp1
    },

    close: () => document.createTextNode('×'),
    dot: () => document.createTextNode('▪')
  },

  onClose: h => {
    if (h.opts.captions) {
      TweenLite.to(h.elements.caption, 0.45, { opacity: 0 })
    }

    TweenLite.to([
      h.elements.imgWrapper,
      h.elements.nextArrow,
      h.elements.prevArrow,
      h.elements.close,
      h.elements.dots
    ], 0.50, {
      opacity: 0,
      onComplete: () => {
        TweenLite.to(h.elements.wrapper, 0.45, {
          opacity: 0,
          onComplete: () => {
            h.destroy()
          }
        })
      }
    })
  }
}

export default class Lightbox {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    this.fader = document.querySelector('#fader')
    this.lightboxes = document.querySelectorAll('[data-lightbox]')
    this.elements = {}
    this.imgs = []
    this.imgAlts = []
    this.sections = {}
    this.currentIndex = null

    this.lightboxes.forEach(lightbox => {
      const href = lightbox.getAttribute('data-lightbox')
      const originalImage = lightbox.querySelector('img')
      const alt = originalImage.getAttribute('alt')
      const section = lightbox.getAttribute('data-lightbox-section') || 'general'

      if (!Object.prototype.hasOwnProperty.call(this.sections, section)) {
        this.sections[section] = []
      }

      const image = {
        href,
        alt
      }

      const index = this.sections[section].push(image) - 1

      lightbox.addEventListener('click', e => {
        e.preventDefault()
        this.showBox(section, index)
      })
    })
  }

  showBox (section, index) {
    this.fader.style.display = 'block'

    document.addEventListener('keyup', this.onKeyup.bind(this))

    TweenLite.to(this.fader, 0.450, {
      opacity: 1,
      onComplete: () => {
        this.buildBox(section, index)
      }
    })
  }

  buildBox (section, index) {
    this.elements.wrapper = document.createElement('div')
    this.elements.content = document.createElement('div')
    this.elements.imgWrapper = document.createElement('div')
    this.elements.img = document.createElement('img')
    this.elements.dots = document.createElement('div')
    this.elements.nextArrow = document.createElement('a')
    this.elements.prevArrow = document.createElement('a')
    this.elements.close = document.createElement('a')

    this.elements.content.setAttribute('data-current-idx', index)

    this.elements.content.classList.add('lightbox-content')
    this.elements.nextArrow.classList.add('lightbox-next')
    this.elements.prevArrow.classList.add('lightbox-prev')
    this.elements.close.classList.add('lightbox-close')
    this.elements.dots.classList.add('lightbox-dots')
    this.elements.wrapper.classList.add('lightbox-backdrop')
    this.elements.wrapper.setAttribute('data-lightbox-wrapper-section', section)
    this.elements.imgWrapper.classList.add('lightbox-image-wrapper')
    this.elements.img.classList.add('lightbox-image', 'm-lg')

    this.elements.close.appendChild(this.opts.elements.close())
    this.elements.close.href = '#'

    this.elements.nextArrow.appendChild(this.opts.elements.arrowRight())
    this.elements.nextArrow.href = '#'

    this.elements.nextArrow.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      this.setImg(section, this.getNextIdx(section))
    })

    this.elements.prevArrow.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      this.setImg(section, this.getPrevIdx(section))
    })

    this.elements.prevArrow.appendChild(this.opts.elements.arrowLeft())
    this.elements.prevArrow.href = '#'

    // add dot links
    let activeLink

    this.sections[section].forEach((img, x) => {
      const a = document.createElement('a')
      a.setAttribute('href', '#')
      a.setAttribute('data-idx', x)

      if (x === index) {
        a.classList.add('active')
        activeLink = a
      }

      a.addEventListener('click', e => {
        a.classList.add('active')
        activeLink.classList.remove('active')
        activeLink = a
        e.stopPropagation()
        e.preventDefault()
        this.setImg(section, x, null)
      })

      a.appendChild(this.opts.elements.dot())
      this.elements.dots.appendChild(a)
    })

    this.elements.imgWrapper.appendChild(this.elements.img)
    this.elements.imgWrapper.appendChild(this.elements.close)
    this.elements.content.appendChild(this.elements.imgWrapper)
    this.elements.content.appendChild(this.elements.nextArrow)
    this.elements.content.appendChild(this.elements.prevArrow)
    this.elements.content.appendChild(this.elements.dots)

    if (this.opts.captions) {
      this.elements.caption = document.createElement('div')
      this.elements.caption.classList.add('lightbox-caption')
      this.elements.content.appendChild(this.elements.caption)
    }

    this.elements.wrapper.appendChild(this.elements.content)
    document.body.appendChild(this.elements.wrapper)

    this.setImg(section, index, this.getPrevIdx(index))
    this.attachSwiper(section, this.elements.content, index)

    const imgs = this.elements.wrapper.querySelectorAll('img')

    imagesAreLoaded(imgs).then(() => {
      TweenLite.to(this.elements.wrapper, 0.5, {
        opacity: 1,
        onComplete: () => {
          this.fader.style.display = 'none'
          this.fader.style.opacity = 0
        }
      })
    })

    this.elements.close.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      this.close()
    })
  }

  close () {
    document.removeEventListener('keyup', this.onKeyup.bind(this))
    this.opts.onClose(this)
    this.currentIndex = null
  }

  destroy () {
    this.elements.wrapper.parentNode.removeChild(this.elements.wrapper)
  }

  setImg (section, index) {
    this.currentIndex = index
    this.elements.content.setAttribute('data-current-idx', index)

    let activeDot = document.querySelector('.lightbox-dots a.active')

    if (activeDot) {
      activeDot.classList.remove('active')
    }

    activeDot = document.querySelector(`.lightbox-dots a[data-idx="${index}"]`)
    activeDot.classList.add('active')

    if (this.elements.caption) {
      TweenLite.to(this.elements.caption, 0.5, {
        opacity: 0,
        onComplete: () => {
          this.elements.caption.innerHTML = this.sections[section][index].alt
        }
      })
    }

    TweenLite.to(this.elements.img, 0.5, {
      opacity: 0,
      onComplete: () => {
        this.elements.img.src = this.sections[section][index].href

        TweenLite.to(this.elements.img, 0.5, {
          opacity: 1
        })

        if (this.elements.caption) {
          TweenLite.to(this.elements.caption, 0.5, { opacity: 1 })
        }
      }
    })
  }

  getNextIdx (section) {
    const index = this.currentIndex
    if (index === this.sections[section].length - 1) {
      return 0
    }
    return index + 1
  }

  getPrevIdx (section) {
    const index = this.currentIndex
    if (index === 0) {
      return this.sections[section].length - 1
    }
    return index - 1
  }

  onKeyup (e) {
    const key = e.keyCode || e.which

    if (key === 27) {
      this.close()
    }
  }

  attachSwiper (section, el, initialIdx) {
    const hammerManager = new Manager(el)
    const swipeHandler = new Swipe()

    this.elements.content.setAttribute('data-current-idx', initialIdx)

    hammerManager.add(swipeHandler)

    hammerManager.on('swipeleft', () => {
      const index = this.getNextIdx(section)
      this.setImg(section, index)
    })

    hammerManager.on('swiperight', () => {
      const index = this.getPrevIdx(section)
      this.setImg(section, index)
    })
  }
}
