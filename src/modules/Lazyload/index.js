import _defaultsDeep from 'lodash.defaultsdeep'
import { IMAGE_LAZYLOADED, SECTION_LAZYLOADED } from '../../events'
import dispatchElementEvent from '../../utils/dispatchElementEvent'
import imagesAreLoaded from '../../utils/imagesAreLoaded'
import Dom from '../Dom'

const DEFAULT_OPTIONS = {
  intersectionObserverConfig: {
    rootMargin: '350px 0px',
    threshold: 0.0
  },
  useNativeLazyloadIfAvailable: true,
  mode: 'default'
}

export default class Lazyload {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)
    this.initialize()
  }

  initialize () {
    // look for lazyload sections. if we find, add an observer that triggers
    // lazyload for all images within.
    this.initializeSections()

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

  initializeSections () {
    const sections = document.querySelectorAll('[data-lazyload-section]')
    if (sections) {
      const sectionObserver = (section, children) => {
        const imagesInSection = Dom.all(section, 'img')
        return new IntersectionObserver((entries, self) => {
          entries.forEach(entry => {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              children.forEach(picture => {
                this.swapPicture(picture)
                this.pictureObserver.unobserve(picture)
              })
              imagesAreLoaded(imagesInSection, true).then(() => {
                dispatchElementEvent(section, SECTION_LAZYLOADED)
              })
              self.unobserve(section)
            }
          })
        },
        {
          rootMargin: '350px 0px',
          threshold: 0.0
        })
      }

      sections.forEach(section => {
        const children = section.querySelectorAll('picture')
        const obs = sectionObserver(section, children)
        obs.observe(section)
      })
    }
  }

  lazyloadImages (elements) {
    elements.forEach(item => {
      if (item.isIntersecting || item.intersectionRatio > 0) {
        const image = item.target
        this.swapImage(image)
        this.imgObserver.unobserve(image)
      }
    })
  }

  lazyloadPictures (elements) {
    elements.forEach(item => {
      if (item.isIntersecting || item.intersectionRatio > 0) {
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

    if (img.dataset.src) {
      img.setAttribute('src', img.dataset.src)
    }

    if (img.dataset.srcset) {
      img.setAttribute('srcset', img.dataset.srcset)
    }

    img.setAttribute('data-ll-loaded', '')

    if (this.app.featureTests.results.ie11) {
      if (window.picturefill) {
        window.picturefill({ reevaluate: true })
      }
    }

    dispatchElementEvent(img, IMAGE_LAZYLOADED)

    // safari sometimes caches, so force load
    if (img.complete) {
      img.removeAttribute('data-ll-placeholder')
      img.removeAttribute('data-ll-blurred')
      img.setAttribute('data-ll-loaded', '')
    }
  }
}
