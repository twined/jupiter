export default class Dom {
  constructor () {
    this.body = document.body
    this.html = document.documentElement
  }

  find (arg1, arg2) {
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
}
