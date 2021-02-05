import { Manager, Swipe } from '@egjs/hammerjs'
import { gsap } from 'gsap'
import _defaultsDeep from 'lodash.defaultsdeep'
import imageIsLoaded from '../../utils/imageIsLoaded'
import Dom from '../Dom'

const DEFAULT_OPTIONS = {
  /* enable captions */
  captions: false,

  /* enable swipe — this breaks native zoom! */
  swipe: true,

  /* set to a selector if you want a specific trigger element to open the box */
  trigger: false,

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

  onClick: (lightbox, section, e) => {
    e.stopPropagation()
    e.preventDefault()

    if (lightbox.pointerDirection === 'left') {
      lightbox.setImg(section, lightbox.getPrevIdx(section))
    } else {
      lightbox.setImg(section, lightbox.getNextIdx(section))
    }
  },

  onPointerLeft: () => {},

  onPointerRight: () => {},

  onCaptionOut: (lightbox, captionHasChanged) => {
    if (!captionHasChanged) {
      return
    }

    lightbox.timelines.caption
      .to(lightbox.elements.caption, { duration: 0.4, autoAlpha: 0 })
  },

  onCaptionIn: (lightbox, captionHasChanged) => {
    if (!captionHasChanged) {
      return
    }

    lightbox.timelines.caption
      .to(lightbox.elements.caption, { duration: 0.4, autoAlpha: 1 })
  },

  onImageOut: lightbox => {
    lightbox.timelines.image
      .to(lightbox.currentImage, { duration: 0.5, autoAlpha: 0 })
  },

  onImageIn: lightbox => {
    const delay = lightbox.firstTransition ? 0.6 : 0.4
    lightbox.timelines.image
      .to(lightbox.nextImage, { duration: 0.5, autoAlpha: 1, delay })
  },

  onBeforeOpen: () => {},

  onOpen: h => {
    h.app.scrollLock()

    gsap.to(h.elements.wrapper, {
      duration: 0.5,
      opacity: 1
    })
  },

  onAfterClose: () => {},

  onClose: h => {
    if (h.opts.captions) {
      gsap.to(h.elements.caption, {
        duration: 0.45,
        opacity: 0
      })
    }

    gsap.to([
      h.elements.imgWrapper,
      h.elements.nextArrow,
      h.elements.prevArrow,
      h.elements.close,
      h.elements.dots
    ], {
      duration: 0.50,
      opacity: 0,
      onComplete: () => {
        gsap.to(h.elements.wrapper, {
          duration: 0.45,
          opacity: 0,
          onComplete: () => {
            h.app.scrollRelease()
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
    this.lightboxes = document.querySelectorAll('[data-lightbox]')
    this.elements = {}
    this.imgAlts = []
    this.imgs = []
    this.sections = {}
    this.currentIndex = null
    this.firstTransition = true
    this.previousCaption = null
    this.timelines = {
      caption: gsap.timeline({ paused: true }),
      image: gsap.timeline({ paused: true })
    }

    this.lightboxes.forEach(lightbox => {
      const href = lightbox.getAttribute('data-lightbox')
      const srcset = lightbox.getAttribute('data-srcset')
      const originalImage = lightbox.querySelector('img')
      const alt = originalImage.getAttribute('alt')
      const section = lightbox.getAttribute('data-lightbox-section') || 'general'
      let trigger = lightbox
      if (this.opts.trigger) {
        trigger = Dom.find(lightbox, this.opts.trigger) || lightbox
      }

      if (!Object.prototype.hasOwnProperty.call(this.sections, section)) {
        this.sections[section] = []
      }

      const image = {
        href,
        alt,
        srcset
      }

      const index = this.sections[section].push(image) - 1

      trigger.addEventListener('click', e => {
        e.preventDefault()
        this.showBox(section, index)
      })
    })
  }

  showBox (section, index) {
    this.opts.onBeforeOpen(this)
    this.buildBox(section, index)
  }

  buildBox (section, index) {
    this.elements.wrapper = document.createElement('div')
    this.elements.content = document.createElement('div')
    this.elements.imgWrapper = document.createElement('div')
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

    document.addEventListener('keyup', event => {
      this.onKeyup(event, section)
    })

    this.elements.wrapper.addEventListener('mousemove', event => {
      this.onMouseMove(event)
    })

    this.elements.wrapper.addEventListener('click', event => {
      this.onClick(event, section)
    })

    this.elements.prevArrow.appendChild(this.opts.elements.arrowLeft())
    this.elements.prevArrow.href = '#'

    // add dot links
    let activeLink

    this.sections[section].forEach((img, x) => {
      const imgElement = document.createElement('img')
      gsap.set(imgElement, { autoAlpha: 0 })
      imgElement.classList.add('lightbox-image', 'm-lg')
      imgElement.setAttribute('data-idx', x)
      this.elements.imgWrapper.appendChild(imgElement)
      this.imgs.push(imgElement)

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

    this.elements.content.appendChild(this.elements.close)
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
    if (this.opts.swipe) {
      this.attachSwiper(section, this.elements.content, index)
    }

    this.opts.onOpen(this)

    this.elements.close.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      this.close()
    })
  }

  close () {
    document.removeEventListener('keyup', this.onKeyup.bind(this))
    this.opts.onClose(this)
    this.opts.onAfterClose(this)
    this.currentIndex = null
    this.currentImage = null
    this.firstTransition = true
    this.imgs = []
  }

  destroy () {
    this.elements.wrapper.parentNode.removeChild(this.elements.wrapper)
  }

  setImg (section, index) {
    let captionHasChanged = false

    this.currentIndex = index
    this.elements.content.setAttribute('data-current-idx', index)

    let activeDot = document.querySelector('.lightbox-dots a.active')

    if (activeDot) {
      activeDot.classList.remove('active')
    }

    activeDot = document.querySelector(`.lightbox-dots a[data-idx="${index}"]`)
    activeDot.classList.add('active')

    if (this.elements.caption) {
      captionHasChanged = (
        this.previousCaption !== this.sections[section][index].alt
      )
      this.previousCaption = this.sections[section][index].alt
      this.opts.onCaptionOut(this, captionHasChanged)
      this.timelines.caption.call(() => {
        this.elements.caption.innerHTML = this.sections[section][index].alt
      })
    }

    if (this.currentImage) {
      // fade out current image
      this.opts.onImageOut(this)
    }

    // preload a few

    for (let x = 0; x < 3; x += 1) {
      if (this.imgs[index + x]) {
        this.imgs[index + x].src = this.sections[section][index + x].href
        if (this.sections[section][index + x].srcset) {
          this.imgs[index + x].setAttribute('srcset', this.sections[section][index + x].srcset)
        }
      } else {
        break
      }
    }

    this.nextImage = this.imgs[index]
    this.nextImage.src = this.sections[section][index].href
    if (this.sections[section][index].srcset) {
      this.nextImage.setAttribute('srcset', this.sections[section][index].srcset)
    }

    this.opts.onImageIn(this)
    this.timelines.image.call(() => {
      if (this.firstTransition) {
        this.firstTransition = false
      }
    })

    if (this.elements.caption) {
      this.opts.onCaptionIn(this, captionHasChanged)
    }

    imageIsLoaded(this.nextImage).then(() => {
      this.timelines.caption.play()
      this.timelines.image.play()
    })

    this.currentImage = this.nextImage
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

  onClick (e, section) {
    this.opts.onClick(this, section, e)
  }

  onKeyup (e, section) {
    const key = e.keyCode || e.which

    switch (key) {
      case 27:
        this.close()
        break
      case 37:
        this.setImg(section, this.getPrevIdx(section))
        break
      case 39:
        this.setImg(section, this.getNextIdx(section))
        break
      default:
        break
    }
  }

  onMouseMove (e) {
    if (e.clientX < (this.app.size.width / 2)) {
      if (this.pointerDirection === 'left') {
        return
      }
      this.pointerDirection = 'left'
      this.opts.onPointerLeft(this)
    } else {
      if (this.pointerDirection === 'right') {
        return
      }
      this.pointerDirection = 'right'
      this.opts.onPointerRight(this)
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
