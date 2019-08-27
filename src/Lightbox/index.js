import imagesLoaded from 'imagesloaded'
import { Manager, Swipe } from '@egjs/hammerjs'
import { TweenMax, Sine } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'

TweenMax.defaultEase = Sine.easeOut

const DEFAULT_OPTIONS = {
  captions: false,

  onClose: h => {
    if (h.opts.captions) {
      TweenMax.to(h.caption, 0.45, { opacity: 0 })
    }

    TweenMax.to([h.imgWrapper, h.nextArrow, h.prevArrow, h.close, h.dots], 0.50, {
      opacity: 0,
      onComplete: () => {
        TweenMax.to(h.wrapper, 0.45, {
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

    this.lightboxes.forEach(lightbox => {
      const href = lightbox.getAttribute('data-lightbox')
      const imgInLightbox = lightbox.querySelector('img')
      const alt = imgInLightbox.getAttribute('alt')
      this.imgs.push(href)
      this.imgAlts.push(alt)

      lightbox.addEventListener('click', e => {
        e.preventDefault()
        const idx = this.imgs.indexOf(href)
        this.showBox(idx)
      })
    })
  }

  showBox (idx) {
    this.fader.style.display = 'block'

    TweenMax.to(this.fader, 0.450, {
      opacity: 1,
      onComplete: () => {
        this.buildBox(idx)
      }
    })
  }

  buildBox (idx) {
    let bIdx = idx

    this.wrapper = document.createElement('div')
    this.content = document.createElement('div')
    this.imgWrapper = document.createElement('div')
    this.img = document.createElement('img')
    this.dots = document.createElement('div')
    this.nextArrow = document.createElement('a')
    this.prevArrow = document.createElement('a')
    this.close = document.createElement('a')

    this.content.classList.add('lightbox-content')
    this.nextArrow.classList.add('lightbox-next')
    this.prevArrow.classList.add('lightbox-prev')
    this.close.classList.add('lightbox-close')
    this.dots.classList.add('lightbox-dots')
    this.wrapper.classList.add('lightbox-backdrop')
    this.imgWrapper.classList.add('lightbox-image-wrapper')
    this.img.classList.add('lightbox-image', 'm-lg')

    this.close.appendChild(document.createTextNode('×'))
    this.close.href = '#'

    let sp1 = document.createElement('span')
    sp1.classList.add('arrow-r')
    sp1.appendChild(document.createTextNode('→'))
    this.nextArrow.appendChild(sp1)
    this.nextArrow.href = '#'

    this.nextArrow.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      const oldIdx = bIdx
      bIdx = this.getNextIdx(oldIdx)
      this.setImg(bIdx, oldIdx)
    })

    this.prevArrow.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      const oldIdx = bIdx
      bIdx = this.getPrevIdx(oldIdx)
      this.setImg(bIdx, oldIdx)
    })

    sp1 = document.createElement('span')
    sp1.classList.add('arrow-l')
    sp1.appendChild(document.createTextNode('←'))
    this.prevArrow.appendChild(sp1)
    this.prevArrow.href = '#'

    // add dot links
    let activeLink

    this.imgs.forEach((img, x) => {
      const a = document.createElement('a')
      a.setAttribute('href', '#')
      a.setAttribute('data-idx', x)

      if (x === bIdx) {
        a.classList.add('active')
        activeLink = a
      }

      a.addEventListener('click', e => {
        a.classList.add('active')
        activeLink.classList.remove('active')
        activeLink = a
        e.stopPropagation()
        e.preventDefault()
        this.setImg(x, this.imgs, null)
      })

      a.appendChild(document.createTextNode('▪'))
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

    this.setImg(idx, this.getPrevIdx(idx))
    this.attachSwiper(this.content, idx)

    imagesLoaded(this.wrapper, () => {
      TweenMax.to(this.wrapper, 0.5, {
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
    })
  }

  setImg (x, oldIdx) {
    let oIdx = oldIdx
    if (oIdx === null) {
      oIdx = this.content.getAttribute('data-current-id')
    }

    this.content.setAttribute('data-current-idx', x)

    let a = document.querySelector('.lightbox-dots a.active')

    if (a) {
      a.classList.remove('active')
    }

    a = document.querySelector(`.lightbox-dots a[data-idx="${x}"]`)
    a.classList.add('active')

    if (this.caption) {
      TweenMax.to(this.caption, 0.5, {
        opacity: 0,
        onComplete: () => {
          this.caption.innerHTML = this.imgAlts[x]
        }
      })
    }

    TweenMax.to(this.img, 0.5, {
      opacity: 0,
      onComplete: () => {
        this.img.src = this.imgs[x]

        TweenMax.to(this.img, 0.5, {
          opacity: 1
        })

        if (this.caption) {
          TweenMax.to(this.caption, 0.5, { opacity: 1 })
        }
      }
    })
  }

  getNextIdx (idx) {
    if (idx === this.imgs.length - 1) {
      return 0
    }
    return idx + 1
  }

  getPrevIdx (idx) {
    if (idx === 0) {
      return this.imgs.length - 1
    }
    return idx - 1
  }

  attachSwiper (el, initialIdx) {
    const hammerManager = new Manager(el)
    const swipeHandler = new Swipe()

    this.content.setAttribute('data-current-idx', initialIdx)

    hammerManager.add(swipeHandler)

    hammerManager.on('swipeleft', () => {
      const oldIdx = parseInt(this.content.getAttribute('data-current-idx'))
      const idx = this.getNextIdx(oldIdx)
      this.setImg(idx, oldIdx)
    })

    hammerManager.on('swiperight', () => {
      const oldIdx = parseInt(this.content.getAttribute('data-current-idx'))
      const idx = this.getPrevIdx(oldIdx)
      this.setImg(idx, oldIdx)
    })
  }
}
