import { TweenLite } from 'gsap/all'

// lazyload the first image of the heroslider
// don't start the slider before it is loaded

export default class Lazyload {
  constructor (callback) {
    // set all lazyload elements to a low opacity
    this.ll = document.querySelectorAll('.lazyload')
    TweenLite.set(this.ll, { opacity: 0 })
    for (let l of Array.from(this.ll)) {
      let parent = l.parentNode
      TweenLite.set(parent, { backgroundColor: '#fff' })
      let blurImg = l.cloneNode(false)
      TweenLite.set(blurImg, { scale: 7.2 })
      l.onload = () => {
        TweenLite.to(l, 1, { opacity: 1, onComplete: () => { if (callback) { callback(l) } } })
        TweenLite.to(blurImg, 1, { scale: 1, opacity: 0 })
      }
      l.setAttribute('srcset', l.getAttribute('data-srcset'))
      parent.insertBefore(blurImg, l.nextSibling)
      blurImg.onload = () => {
        TweenLite.to(blurImg, 1, { opacity: 1 })
      }
    }
  }
}
