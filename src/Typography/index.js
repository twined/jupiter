export default class Typography {
  constructor (parent, settings = {}) {
    const self = this

    // Set some settings, by merging defaults and passed settings
    self.settings = {
      minWords: 4,
      selector: 'h1,h2,h3,p',
      ignoreClass: 'no-typo-fix',
      ignoreExistingSpaceChars: false,
      ...settings
    }

    // Either load from root or the passed parent element
    if (typeof (parent) === 'undefined') {
      self.elems = [...document.querySelectorAll(self.settings.selector)]
    } else {
      self.elems = [...parent.querySelectorAll(self.settings.selector)]
    }

    this.apply()
  }

  /**
   * Apply formatting to the loaded elements
   * @return void
   */
  apply () {
    const self = this

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
      let result = ''

      // Split words/tags into array
      let textItems = elem.innerHTML.trim().replace(/&nbsp;/g, ' ').split(/ (?=[^>]*(?:<|$))/)

      // Check if the text warrants this module
      if (textItems.length < self.settings.minWords) {
        return false
      }

      // Run orphans filter
      textItems = self.preventOrphans(textItems)

      // Join the words back together
      result = textItems.join(' ')

      // Replace whitespace after no break spaces
      result = result.replace(/&nbsp; /g, '&nbsp;')

      // Set the content of the element with our shiny string
      elem.innerHTML = result

      return true
    })
  }

  /**
   * Apply the orphans filter to the passed text and return it
   * @param {string} textItems
   */
  preventOrphans (textItems) {
    // Find the second to last work
    const targetWord = textItems[(textItems.length - 2)]

    // Stick a no break space to the end of the word and replace the instance in the array
    textItems[(textItems.length - 2)] = `${targetWord}&nbsp;`

    return textItems
  }

  /**
   * Reset any formatting
   * @return void
   */
  reset () {
    const self = this

    self.elems.map(elem => {
      // Run the ignore checker nd bail if required
      if (self.shouldElementBeIgnored(elem)) {
        return false
      }

      elem.innerHTML = elem.innerHTML.replace(/&nbsp;/g, ' ')
      return true
    })
  }

  /**
   * Run checks to see if the passed element should be skipped
   *
   * @param {HTMLElement} elem
   * @returns boolean
   */
  shouldElementBeIgnored (elem) {
    const self = this

    // Check if the element already contains 1 or more &nbsp; characters and the
    // ignore setting is true. If so: bail.
    if ((elem.innerHTML.indexOf('&nbsp;') > -1) && self.settings.ignoreExistingSpaceChars) {
      return true
    }

    return false
  }
}
