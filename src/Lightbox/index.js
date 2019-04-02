import imagesLoaded from 'imagesloaded'
import Hammer from 'hammerjs'
import { TweenLite, Sine } from 'gsap/all'

TweenLite.defaultEase = Sine.easeOut

export default class Lightbox {
  constructor (opts = {}) {
    this.lightboxes = document.querySelectorAll('[data-lightbox]')
    this.imgs = []

    for (let lightbox of Array.from(this.lightboxes)) {
      let href = lightbox.getAttribute('data-lightbox')
      this.imgs.push(href)

      lightbox.addEventListener('click', e => {
        e.preventDefault()
        let idx = this.imgs.indexOf(href)
        this.showBox(idx)
      })
    }
  }

  showBox (idx) {
    const fader = document.querySelector('#fader')
    fader.style.display = 'block'

    TweenLite.to(fader, 0.450, {
      opacity: 1,
      onComplete: () => {
        this.buildBox(idx)
      }
    })
  }

  buildBox (idx) {
    const fader = document.querySelector('#fader')

    const wrapper = document.createElement('div')
    const content = document.createElement('div')
    const imgWrapper = document.createElement('div')
    const img = document.createElement('img')
    const dots = document.createElement('div')
    const nextArrow = document.createElement('a')
    const prevArrow = document.createElement('a')
    const close = document.createElement('a')

    content.classList.add('lightbox-content')
    nextArrow.classList.add('lightbox-next')
    prevArrow.classList.add('lightbox-prev')
    close.classList.add('lightbox-close')
    dots.classList.add('lightbox-dots')
    wrapper.classList.add('lightbox-backdrop')
    imgWrapper.classList.add('lightbox-image-wrapper')
    img.classList.add('lightbox-image', 'm-lg')

    close.appendChild(document.createTextNode('×'))
    close.href = '#'

    let sp1 = document.createElement('span')
    sp1.classList.add('arrow-r')
    sp1.appendChild(document.createTextNode('→'))
    nextArrow.appendChild(sp1)
    nextArrow.href = '#'

    nextArrow.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      let oldIdx = idx
      idx = this.getNextIdx(oldIdx)
      this.setImg(idx, oldIdx)
    })

    prevArrow.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      let oldIdx = idx
      idx = this.getPrevIdx(oldIdx)
      this.setImg(idx, oldIdx)
    })

    sp1 = document.createElement('span')
    sp1.classList.add('arrow-l')
    sp1.appendChild(document.createTextNode('←'))
    prevArrow.appendChild(sp1)
    prevArrow.href = '#'

    img.src = this.imgs[idx]

    // add dot links
    let activeLink

    for (let x = 0; x < this.imgs.length; x++) {
      let a = document.createElement('a')
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
        this.setImg(x, this.imgs, null)
      })
      a.appendChild(document.createTextNode('▪'))
      dots.appendChild(a)
    }

    imgWrapper.appendChild(img)
    imgWrapper.appendChild(close)
    content.appendChild(imgWrapper)
    content.appendChild(nextArrow)
    content.appendChild(prevArrow)
    content.appendChild(dots)

    wrapper.appendChild(content)
    document.body.appendChild(wrapper)

    this.attachSwiper(content, idx)

    imagesLoaded(wrapper, () => {
      TweenLite.to(wrapper, 0.5, {
        opacity: 1,
        onComplete: () => {
          fader.style.display = 'none'
          fader.style.opacity = 0
        }
      })
    })

    close.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      TweenLite.to([imgWrapper, nextArrow, prevArrow, close, dots], 0.75, {
        opacity: 0,
        onComplete: () => {
          TweenLite.to(wrapper, 0.85, {
            opacity: 0,
            onComplete: () => {
              wrapper.parentNode.removeChild(wrapper)
            }
          })
        }
      })
    })
  }

  setImg (x, oldIdx) {
    let c = document.querySelector('.lightbox-content')
    let img = document.querySelector('.lightbox-image')

    if (oldIdx === null) {
      oldIdx = c.getAttribute('data-current-id')
    }

    c.setAttribute('data-current-idx', x)

    let a = document.querySelector(`.lightbox-dots a.active`)

    if (a) {
      a.classList.remove('active')
    }

    a = document.querySelector(`.lightbox-dots a[data-idx="${x}"]`)
    a.classList.add('active')

    TweenLite.to(img, 0.5, {
      opacity: 0,
      onComplete: () => {
        img.src = this.imgs[x]
        TweenLite.to(img, 0.5, {
          opacity: 1
        })
      }
    })
  }

  getNextIdx (idx) {
    if (idx === this.imgs.length - 1) {
      return 0
    } else {
      return idx + 1
    }
  }

  getPrevIdx (idx) {
    if (idx === 0) {
      return this.imgs.length - 1
    } else {
      return idx - 1
    }
  }

  attachSwiper (el, initialIdx) {
    const c = document.querySelector('.lightbox-content')
    const hammer = new Hammer.Manager(el)
    const swipe = new Hammer.Swipe()

    c.setAttribute('data-current-idx', initialIdx)

    hammer.add(swipe)

    hammer.on('swipeleft', () => {
      let oldIdx = parseInt(c.getAttribute('data-current-idx'))
      let idx = this.getNextIdx(oldIdx)
      this.setImg(idx, oldIdx)
    })

    hammer.on('swiperight', () => {
      let oldIdx = parseInt(c.getAttribute('data-current-idx'))
      let idx = this.getPrevIdx(oldIdx)
      this.setImg(idx, oldIdx)
    })
  }
}
