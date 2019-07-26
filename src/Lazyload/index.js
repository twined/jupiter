export default class Lazyload {
  constructor () {
    this.initialize()
  }

  initialize () {
    // if we have native lazyload, use it.
    if ('loading' in HTMLImageElement.prototype) {
      const lazyImages = document.querySelectorAll('[data-ll-image]')
      lazyImages.forEach(img => {
        img.src = img.dataset.src
      })
    } else {
      this.imgObserver = new IntersectionObserver(this.imgLazyLoad)
      this.lazyImages = document.querySelectorAll('[data-ll-image]')
      this.lazyImages.forEach(img => {
        this.imgObserver.observe(img)
      })

      this.pictureObserver = new IntersectionObserver(this.picLazyLoad)
      this.lazyPictures = document.querySelectorAll('[data-ll-srcset]')
      this.lazyPictures.forEach(img => {
        this.pictureObserver.observe(img)
      })
    }
  }

  imgLazyLoad (elements) {
    elements.forEach(item => {
      if (item.intersectionRatio > 0) {
        const image = item.target
        image.src = image.dataset.src

        // stop observing this element. Our work here is done!
        this.unobserve(image)
      };
    })
  }

  picLazyLoad (elements) {
    elements.forEach(item => {
      if (item.intersectionRatio > 0) {
        const picture = item.target

        // gather all the source elements in picture
        const sources = picture.querySelectorAll('source')

        for (let s = 0; s < sources.length; s++) {
          const source = sources[s]

          if (source.hasAttribute('srcset')) {
            source.setAttribute('srcset', source.dataset.srcset)
          }
        }

        const img = picture.querySelector('img')

        img.addEventListener('load', image => {
          img.removeAttribute('data-ll-placeholder')
        }, false)

        if (img.hasAttribute('src')) {
          img.setAttribute('src', img.dataset.src)
        }

        // safari sometimes caches, so force load
        if (img.complete) {
          img.removeAttribute('data-ll-placeholder')
        }

        this.unobserve(picture)
      }
    })
  }
}
