import _defaultsDeep from 'lodash.defaultsdeep'

const DEFAULT_OPTIONS = {
  intersectionObserverConfig: {
    rootMargin: '350px 0px',
    threshold: 0.0
  },
  useNativeLazyloadIfAvailable: true,
  mode: 'default'
}

export default class Lazyload {
  constructor (opts = {}) {
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.initialize()
  }

  initialize () {
    // if we have native lazyload, use it.
    if ('loading' in HTMLImageElement.prototype && this.opts.useNativeLazyloadIfAvailable) {
      const lazyImages = document.querySelectorAll('[data-ll-image]')
      lazyImages.forEach(img => {
        img.setAttribute('loading', 'lazy')
        this.swapImage(img)
      })

      const lazyPictures = document.querySelectorAll('[data-ll-srcset]')
      lazyPictures.forEach(picture => {
        picture.querySelectorAll('img').forEach(img => {
          img.setAttribute('loading', 'lazy')
        })
        this.swapPicture(picture)
      })
    } else {
      this.imgObserver = new IntersectionObserver(
        this.lazyloadImages.bind(this),
        this.opts.intersectionObserverConfig
      )

      this.lazyImages = document.querySelectorAll('[data-ll-image]')
      this.lazyImages.forEach(img => {
        img.setAttribute('data-ll-blurred', '')
        this.imgObserver.observe(img)
      })

      this.pictureObserver = new IntersectionObserver(
        this.lazyloadPictures.bind(this),
        this.opts.intersectionObserverConfig
      )

      this.lazyPictures = document.querySelectorAll('[data-ll-srcset]')
      this.lazyPictures.forEach(picture => {
        picture.querySelectorAll('img').forEach(img => { img.setAttribute('data-ll-blurred', '') })
        this.pictureObserver.observe(picture)
      })
    }
  }

  lazyloadImages (elements) {
    elements.forEach(item => {
      if (item.intersectionRatio > 0) {
        const image = item.target
        this.swapImage(image)
        this.imgObserver.unobserve(image)
      }
    })
  }

  lazyloadPictures (elements) {
    elements.forEach(item => {
      if (item.intersectionRatio > 0) {
        const picture = item.target
        this.swapPicture(picture)
        this.pictureObserver.unobserve(picture)
      }
    })
  }

  swapImage (image) {
    image.src = image.dataset.src
    image.setAttribute('data-ll-loaded', '')
  }

  swapPicture (picture) {
    // gather all the source elements in picture
    const sources = picture.querySelectorAll('source')

    for (let s = 0; s < sources.length; s += 1) {
      const source = sources[s]

      if (source.hasAttribute('srcset')) {
        source.setAttribute('srcset', source.dataset.srcset)
        source.setAttribute('data-ll-loaded', '')
      }
    }

    const img = picture.querySelector('img')

    img.addEventListener('load', () => {
      img.removeAttribute('data-ll-placeholder')
      img.removeAttribute('data-ll-blurred')
    }, false)

    if (img.hasAttribute('src')) {
      img.setAttribute('src', img.dataset.src)
      img.setAttribute('data-ll-loaded', '')
    }

    // safari sometimes caches, so force load
    if (img.complete) {
      img.removeAttribute('data-ll-placeholder')
      img.removeAttribute('data-ll-blurred')
      img.setAttribute('data-ll-loaded', '')
    }
  }
}
