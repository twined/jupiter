export default class Fontloader {
  constructor (app) {
    this.app = app
  }

  loadFonts () {
    return new Promise(resolve => {
      if (!window.FontFace) {
        setTimeout(() => { resolve() }, 800)
      } else {
        document.fonts.ready.then(() => {
          resolve()
        })
      }
    })
  }
}
