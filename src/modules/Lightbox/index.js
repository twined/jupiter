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
      TweenLite.to(h.caption, 0.45, { opacity: 0 })
    }

    TweenLite.to([h.imgWrapper, h.nextArrow, h.prevArrow, h.close, h.dots], 0.50, {
      opacity: 0,
      onComplete: () => {
        TweenLite.to(h.wrapper, 0.45, {
          opacity: 0,
          onComplete: () => {
            h.wrapper.parentNode.removeChild(h.wrapper)
          }
        })
      }
    })
  }
}

export default class Lightbox {
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    this.lightboxes = document.querySelectorAll('[data-lightbox]')
    this.fader = document.querySelector('#fader')
    this.imgs = []
    this.imgAlts = []
    this.sections = {}
    this.currentIdx = null

    this.lightboxes.forEach(lightbox => {
      const href = lightbox.getAttribute('data-lightbox')
      const imgInLightbox = lightbox.querySelector('img')
      const alt = imgInLightbox.getAttribute('alt')
      const section = lightbox.getAttribute('data-lightbox-section') || 'general'

      if (!Object.prototype.hasOwnProperty.call(this.sections, section)) {
        this.sections[section] = []
      }

      const image = {
        href,
        alt
      }

      const idx = this.sections[section].push(image) - 1

      lightbox.addEventListener('click', e => {
        e.preventDefault()
        this.showBox(section, idx)
      })
    })
  }

  showBox (section, idx) {
    this.fader.style.display = 'block'

    TweenLite.to(this.fader, 0.450, {
      opacity: 1,
      onComplete: () => {
        this.buildBox(section, idx)
      }
    })
  }

  buildBox (section, idx) {
    this.wrapper = document.createElement('div')
    this.content = document.createElement('div')
    this.imgWrapper = document.createElement('div')
    this.img = document.createElement('img')
    this.dots = document.createElement('div')
    this.nextArrow = document.createElement('a')
    this.prevArrow = document.createElement('a')
    this.close = document.createElement('a')

    this.content.setAttribute('data-current-idx', idx)

    this.content.classList.add('lightbox-content')
    this.nextArrow.classList.add('lightbox-next')
    this.prevArrow.classList.add('lightbox-prev')
    this.close.classList.add('lightbox-close')
    this.dots.classList.add('lightbox-dots')
    this.wrapper.classList.add('lightbox-backdrop')
    this.wrapper.setAttribute('data-lightbox-wrapper-section', section)
    this.imgWrapper.classList.add('lightbox-image-wrapper')
    this.img.classList.add('lightbox-image', 'm-lg')

    this.close.appendChild(this.opts.elements.close())
    this.close.href = '#'

    this.nextArrow.appendChild(this.opts.elements.arrowRight())
    this.nextArrow.href = '#'

    this.nextArrow.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      this.setImg(section, this.getNextIdx(section))
    })

    this.prevArrow.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      this.setImg(section, this.getPrevIdx(section))
    })

    this.prevArrow.appendChild(this.opts.elements.arrowLeft())
    this.prevArrow.href = '#'

    // add dot links
    let activeLink

    this.sections[section].forEach((img, x) => {
      const a = document.createElement('a')
      a.setAttribute('href', '#')
      a.setAttribute('data-idx', x)

      if (x === idx) {
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
      this.dots.appendChild(a)
    })

    this.imgWrapper.appendChild(this.img)
    this.imgWrapper.appendChild(this.close)
    this.content.appendChild(this.imgWrapper)
    this.content.appendChild(this.nextArrow)
    this.content.appendChild(this.prevArrow)
    this.content.appendChild(this.dots)

    if (this.opts.captions) {
      this.caption = document.createElement('div')
      this.caption.classList.add('lightbox-caption')
      this.content.appendChild(this.caption)
    }

    this.wrapper.appendChild(this.content)
    document.body.appendChild(this.wrapper)

    this.setImg(section, idx, this.getPrevIdx(idx))
    this.attachSwiper(section, this.content, idx)

    imagesAreLoaded(this.wrapper).then(() => {
      TweenLite.to(this.wrapper, 0.5, {
        opacity: 1,
        onComplete: () => {
          this.fader.style.display = 'none'
          this.fader.style.opacity = 0
        }
      })
    })

    this.close.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      this.opts.onClose(this)
      this.currentIdx = null
    })
  }

  setImg (section, x) {
    this.currentIdx = x
    this.content.setAttribute('data-current-idx', x)

    let a = document.querySelector('.lightbox-dots a.active')

    if (a) {
      a.classList.remove('active')
    }

    a = document.querySelector(`.lightbox-dots a[data-idx="${x}"]`)
    a.classList.add('active')

    if (this.caption) {
      TweenLite.to(this.caption, 0.5, {
        opacity: 0,
        onComplete: () => {
          this.caption.innerHTML = this.sections[section][x].alt
        }
      })
    }

    TweenLite.to(this.img, 0.5, {
      opacity: 0,
      onComplete: () => {
        this.img.src = this.sections[section][x].href

        TweenLite.to(this.img, 0.5, {
          opacity: 1
        })

        if (this.caption) {
          TweenLite.to(this.caption, 0.5, { opacity: 1 })
        }
      }
    })
  }

  getNextIdx (section) {
    const idx = this.currentIdx
    if (idx === this.sections[section].length - 1) {
      return 0
    }
    return idx + 1
  }

  getPrevIdx (section) {
    const idx = this.currentIdx
    if (idx === 0) {
      return this.sections[section].length - 1
    }
    return idx - 1
  }

  attachSwiper (section, el, initialIdx) {
    const hammerManager = new Manager(el)
    const swipeHandler = new Swipe()

    this.content.setAttribute('data-current-idx', initialIdx)

    hammerManager.add(swipeHandler)

    hammerManager.on('swipeleft', () => {
      const idx = this.getNextIdx(section)
      this.setImg(section, idx)
    })

    hammerManager.on('swiperight', () => {
      const idx = this.getPrevIdx(section)
      this.setImg(section, idx)
    })
  }
}
