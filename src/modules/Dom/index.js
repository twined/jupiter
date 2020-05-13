class DOM {
  constructor () {
    this.body = document.body
    this.html = document.documentElement
  }

  find (arg1, arg2) {
    if (typeof arg1 === 'string' && typeof arg2 === 'object') {
      throw new Error('Dom.find: Wrong syntax, use -> Dom.find(node, selector)')
    }

    if (typeof arg1 === 'string') {
      return document.querySelector(arg1)
    }

    if (typeof arg2 === 'string') {
      return arg1.querySelector(arg2)
    }

    return null
  }

  all (arg1, arg2) {
    if (typeof arg1 === 'string') {
      return Array.from(document.querySelectorAll(arg1))
    }

    if (typeof arg2 === 'string') {
      return Array.from(arg1.querySelectorAll(arg2))
    }

    return []
  }

  addClass (element, ...classes) {
    classes.forEach(className => {
      element.classList.add(className)
    })
    return element
  }

  removeClass (element, ...classes) {
    classes.forEach(className => {
      element.classList.remove(className)
    })
    return element
  }

  hasClass (element, className) {
    return element.classList.contains(className)
  }

  toggleClass (element, ...classes) {
    return classes.map(className => element.classList.toggle(className))
  }

  overlapsVertically ($div1, $div2) {
    // Div 1 data
    const d1Offset = $div1.getBoundingClientRect()
    const d1Height = this.outerHeight($div1)
    const d1DistanceFromTop = d1Offset.top + d1Height

    // Div 2 data
    const d2Offset = $div2.getBoundingClientRect()
    const d2Height = this.outerHeight($div2)
    const d2DistanceFromTop = d2Offset.top + d2Height

    if (d1DistanceFromTop > d2Offset.top) {
      return d1DistanceFromTop - d2Offset.top
    }

    if (d1Offset.top > d2DistanceFromTop) {
      return d1Offset.top - d2DistanceFromTop
    }

    return 0
  }

  outerHeight (el) {
    let height = el.offsetHeight
    const style = getComputedStyle(el)

    height += parseInt(style.marginTop) + parseInt(style.marginBottom)
    return height
  }

  outerWidth (el) {
    let width = el.offsetWidth
    const style = getComputedStyle(el)

    width += parseInt(style.marginLeft) + parseInt(style.marginRight)
    return width
  }

  getCSSVar (key) {
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim()
  }

  offset (el) {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  }

  position (el) {
    return {
      top: el.offsetTop,
      left: el.offsetLeft
    };
  }
}

export default new DOM()
