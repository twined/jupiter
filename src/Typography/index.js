export default class Typography {
  constructor (parent, settings = {}) {
    let self = this

    // Set some settings, by merging defaults and passed settings
    self.settings = Object.assign({
      minWords: 4,
      selector: 'h1,h2,h3,p',
      ignoreClass: 'js-typemate__ignore',
      ignoreExistingSpaceChars: false
    }, settings)

    // Either load from root or the passed parent element
    if (typeof (parent) === 'undefined') {
      self.elems = [...document.querySelectorAll(self.settings.selector)]
    } else {
      self.elems = [...parent.querySelectorAll(self.settings.selector)]
    }

    this.apply()
    this.fitText = new FitText(document.querySelectorAll('[data-fittext]'))
  }

  /**
   * Apply formatting to the loaded elements
   * @return void
   */
  apply () {
    let self = this

    self.elems.map(elem => {
      // Bail out if the ignore class is present on this element
      if (elem.classList.contains(self.settings.ignoreClass)) {
        return false
      }

      // Run the ignore checker nd bail if required
      if (self.shouldElementBeIgnored(elem)) {
        return false
      }

      // The result string will be tacked on to this
      var result = ''

      // Split words/tags into array
      let textItems = elem.innerHTML.trim().replace(/&nbsp;/g, ' ').split(/ (?=[^>]*(?:<|$))/)

      // Check if the text warrants this module
      if (textItems.length < self.settings.minWords) {
        return
      }

      // Run orphans filter
      textItems = self.preventOrphans(textItems)

      // Join the words back together
      result = textItems.join(' ')

      // Replace whitespace after no break spaces
      result = result.replace(/&nbsp; /g, '&nbsp;')

      // Set the content of the element with our shiny string
      elem.innerHTML = result
    })
  }

  /**
   * Apply the orphans filter to the passed text and return it
   * @param {string} textItems
   */
  preventOrphans (textItems) {
    // Find the second to last work
    var targetWord = textItems[(textItems.length - 2)]

    // Stick a no break space to the end of the word and replace the instance in the array
    textItems[(textItems.length - 2)] = targetWord + '&nbsp;'

    return textItems
  }

  /**
   * Reset any formatting
   * @return void
   */
  reset () {
    let self = this

    self.elems.map(elem => {
      // Run the ignore checker nd bail if required
      if (self.shouldElementBeIgnored(elem)) {
        return false
      }

      elem.innerHTML = elem.innerHTML.replace(/&nbsp;/g, ' ')
    })
  }

  /**
   * Run checks to see if the passed element should be skipped
   *
   * @param {HTMLElement} elem
   * @returns boolean
   */
  shouldElementBeIgnored (elem) {
    let self = this

    // Check if the element already contains 1 or more &nbsp; characters and the
    // ignore setting is true. If so: bail.
    if ((elem.innerHTML.indexOf('&nbsp;') > -1) && self.settings.ignoreExistingSpaceChars) {
      return true
    }

    return false
  }
}

class FitText {
  constructor (elements, options = {}) {
    if (!elements.length) {
      return
    }

    this.DrawState = {
      IDLE: 0,
      DIRTY_CONTENT: 1,
      DIRTY_LAYOUT: 2,
      DIRTY: 3
    }
    this.fitties = []
    this.redrawFrame = null
    // default mutation observer settings
    this.mutationObserverDefaultSetting = {
      subtree: true,
      childList: true,
      characterData: true
    }

    // default fitty options
    this.defaultOptions = {
      minSize: 16,
      maxSize: 512,
      multiLine: true,
      observeMutations: this.mutationObserverDefaultSetting
    }

    this.resizeDebounce = null

    const events = ['resize', 'orientationchange']
    events.forEach(e => {
      window.addEventListener(e, this.onWindowResized.bind(this))
    })

    // fitty global properties (by setting observeWindow to true the events above get added)
    this.observeWindow = true
    this.observeWindowDelay = 100

    // public fit all method, will force redraw no matter what
    this.fitAll = this.redrawAll(this.DrawState.DIRTY)

    // set options object
    const fittyOptions = {

      // expand default options
      ...this.defaultOptions,

      // override with custom options
      ...options
    }

    // create fitties
    const publicFitties = [...elements].map(element => {
      const f = {
        ...fittyOptions,
        element
      }

      // register this fitty
      this.subscribe(f)

      // should we observe DOM mutations
      this.observeMutations(f)

      // expose API
      return {
        element,
        fit: this.fit(f, this.DrawState.DIRTY),
        unsubscribe: this.unsubscribe(f)
      }
    })

    // call redraw on newly initiated fitties
    this.requestRedraw()

    // expose fitties
    return publicFitties
  }

  // node list to array helper method
  toArray (nl) {
    return [].slice.call(nl)
  }

  // group all redraw calls till next frame, we cancel each frame request when a new one comes in. If no support for request animation frame, this is an empty function and supports for fitty stops.
  requestRedraw () {
    window.cancelAnimationFrame(this.redrawFrame)
    this.redrawFrame = window.requestAnimationFrame(() => {
      this.redraw(this.fitties.filter(f => f.dirty))
    })
  }

  // sets all fitties to dirty so they are redrawn on the next redraw loop, then calls redraw
  redrawAll (type) {
    this.fitties.forEach(f => {
      f.dirty = type
    })
    this.requestRedraw()
  };

  // redraws fitties so they nicely fit their parent container
  redraw (fitties) {
    // getting info from the DOM at this point should not trigger a reflow, let's gather as much intel as possible before triggering a reflow

    // check if styles of all fitties have been computed
    fitties
      .filter(f => !f.styleComputed)
      .forEach(f => { f.styleComputed = this.computeStyle(f) })

    // restyle elements that require pre-styling, this triggers a reflow, please try to prevent by adding CSS rules (see docs)
    fitties
      .filter(this.shouldPreStyle)
      .forEach(this.applyStyle)

    // we now determine which fitties should be redrawn
    this.fittiesToRedraw = this.fitties.filter(this.shouldRedraw.bind(this))

    // we calculate final styles for these fitties
    this.fittiesToRedraw.forEach(this.calculateStyles)

    // now we apply the calculated styles from our previous loop
    this.fittiesToRedraw.forEach(f => {
      this.applyStyle(f)
      this.markAsClean(f)
    })

    // now we dispatch events for all restyled fitties
    this.fittiesToRedraw.forEach(this.dispatchFitEvent)
  };

  markAsClean (f) {
    f.dirty = this.DrawState.IDLE
  }

  calculateStyles (f) {
    // get available width from parent node
    f.availableWidth = f.element.parentNode.clientWidth

    // the space our target element uses
    f.currentWidth = f.element.scrollWidth

    // remember current font size
    f.previousFontSize = f.currentFontSize

    // let's calculate the new font size
    f.currentFontSize = Math.min(
      Math.max(
        f.minSize,
        (f.availableWidth / f.currentWidth) * f.previousFontSize
      ),
      f.maxSize
    )

    // if allows wrapping, only wrap when at minimum font size (otherwise would break container)
    f.whiteSpace = f.multiLine && f.currentFontSize === f.minSize
      ? 'normal'
      : 'nowrap'
  }

  // should always redraw if is not dirty layout, if is dirty layout, only redraw if size has changed
  shouldRedraw (f) {
    return f.dirty !== this.DrawState.DIRTY_LAYOUT || (f.dirty === this.DrawState.DIRTY_LAYOUT && f.element.parentNode.clientWidth !== f.availableWidth)
  }

  // every fitty element is tested for invalid styles
  computeStyle (f) {
    // get style properties
    const style = window.getComputedStyle(f.element, null)

    // get current font size in pixels (if we already calculated it, use the calculated version)
    f.currentFontSize = parseInt(style.getPropertyValue('font-size'), 10)

    // get display type and wrap mode
    f.display = style.getPropertyValue('display')
    f.whiteSpace = style.getPropertyValue('white-space')
  }

  // determines if this fitty requires initial styling, can be prevented by applying correct styles through CSS
  shouldPreStyle (f) {
    let preStyle = false

    // if we already tested for prestyling we don't have to do it again
    if (f.preStyleTestCompleted) {
      return false
    }

    // should have an inline style, if not, apply
    if (!/inline-/.test(f.display)) {
      preStyle = true
      f.display = 'inline-block'
    }

    // to correctly calculate dimensions the element should have whiteSpace set to nowrap
    if (f.whiteSpace !== 'nowrap') {
      preStyle = true
      f.whiteSpace = 'nowrap'
    }

    // we don't have to do this twice
    f.preStyleTestCompleted = true

    return preStyle
  };

  // apply styles to single fitty
  applyStyle (f) {
    // remember original style, we need this to restore the fitty style when unsubscribing
    if (!f.originalStyle) {
      f.originalStyle = f.element.getAttribute('style') || ''
    }

    // set the new style to the original style plus the fitty styles
    f.element.style.cssText = `${f.originalStyle};white-space:${f.whiteSpace};display:${f.display};font-size:${f.currentFontSize}px`
  };

  // dispatch a fit event on a fitty
  dispatchFitEvent (f) {
    f.element.dispatchEvent(new CustomEvent('fit', {
      detail: {
        oldValue: f.previousFontSize,
        newValue: f.currentFontSize,
        scaleFactor: f.currentFontSize / f.previousFontSize
      }
    }))
  }

  // fit method, marks the fitty as dirty and requests a redraw (this will also redraw any other fitty marked as dirty)
  fit (f, type) {
    f.dirty = type
    this.requestRedraw()
  }

  // add a new fitty, does not redraw said fitty
  subscribe (f) {
    // this is a new fitty so we need to validate if it's styles are in order
    f.newbie = true

    // because it's a new fitty it should also be dirty, we want it to redraw on the first loop
    f.dirty = true

    // we want to be able to update this fitty
    this.fitties.push(f)
  }

  // remove an existing fitty
  unsubscribe (f) {
    // remove from fitties array
    this.fitties = this.fitties.filter(_ => _.element !== f.element)

    // stop observing DOM
    if (f.observeMutations) {
      f.observer.disconnect()
    }

    // reset font size to inherited size
    f.element.style.cssText = f.originalStyle
  };

  observeMutations (f) {
    // no observing?
    if (!f.observeMutations) {
      return
    }

    // start observing mutations
    f.observer = new MutationObserver(() => this.fit(f, this.DrawState.DIRTY_CONTENT))

    // start observing
    f.observer.observe(
      f.element,
      f.observeMutations
    )
  }

  // handles viewport changes, redraws all fitties, but only does so after a timeout
  onWindowResized () {
    window.clearTimeout(this.resizeDebounce)
    this.resizeDebounce = window.setTimeout(
      () => this.redrawAll(this.DrawState.DIRTY_LAYOUT),
      this.observeWindowDelay
    )
  }
}
