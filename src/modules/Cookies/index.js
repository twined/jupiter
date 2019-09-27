import { TimelineLite, Power3 } from 'gsap/all'
import _defaultsDeep from 'lodash.defaultsdeep'
import * as Events from '../../events'

const DEFAULT_OPTIONS = {
  onAccept: c => {
    const timeline = new TimelineLite()
    c.setCookie('cookielaw_accepted', 1)

    timeline
      .to(c.cc, 0.35, { y: '100%', ease: Power3.easeIn }, '0')
      .to(c.inner, 0.3, { opacity: 0, ease: Power3.easeIn }, '0')
      .set(c.cc, { display: 'none' })
  },

  showCC: c => {
    const timeline = new TimelineLite()

    timeline
      .fromTo(
        c.cc,
        0.5,
        { y: '100%', display: 'block' },
        { y: '0%', delay: '0.5', ease: Power3.easeOut },
        '0',
      )
      .fromTo(
        c.text,
        0.7,
        { opacity: 0 },
        { opacity: 1, ease: Power3.easeOut },
        '-=0.35',
      )
      .fromTo(
        c.btns,
        0.7,
        { opacity: 0 },
        { opacity: 1, ease: Power3.easeOut },
        '-=0.35',
      )
  }
}

export default class Cookies {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    this.cc = document.querySelector('.cookie-container')
    this.inner = document.querySelector('.cookie-container-inner')
    this.text = document.querySelector('.cookie-law-text')
    this.btns = document.querySelector('.cookie-law-buttons')
    this.btn = document.querySelector('.dismiss-cookielaw')

    if (!this.btn) {
      return
    }

    window.addEventListener(Events.APPLICATION_READY, () => { this.opts.showCC(this) })

    this.btn.addEventListener('click', () => {
      this.opts.onAccept(this)
    })
  }

  getCookie (sKey) {
    if (!sKey) {
      return null
    }
    return decodeURIComponent(document.cookie.replace(new RegExp(`(?:(?:^|.*;)\\s*${encodeURIComponent(sKey).replace(/[-.+*]/g, '\\$&')}\\s*\\=\\s*([^;]*).*$)|^.*$`), '$1')) || null
  }

  setCookie (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max-age|path|domain|secure)$/i.test(sKey)) { return false }
    let sExpires = ''
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : `; max-age=${vEnd}`
          break
        case String:
          sExpires = `; expires=${vEnd}`
          break
        case Date:
          sExpires = `; expires=${vEnd.toUTCString()}`
          break
        default:
          break
      }
    }
    document.cookie = `${encodeURIComponent(sKey)}=${encodeURIComponent(sValue)}${sExpires}${sDomain ? `; domain=${sDomain}` : ''}${sPath ? `; path=${sPath}` : ''}${bSecure ? '; secure' : ''}`
    return true
  }

  removeCookie (sKey, sPath, sDomain) {
    if (!this.hasCookie(sKey)) { return false }
    document.cookie = `${encodeURIComponent(sKey)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${sDomain ? `; domain=${sDomain}` : ''}${sPath ? `; path=${sPath}` : ''}`
    return true
  }

  hasCookie (sKey) {
    if (!sKey || /^(?:expires|max-age|path|domain|secure)$/i.test(sKey)) { return false }
    return (new RegExp(`(?:^|;\\s*)${encodeURIComponent(sKey).replace(/[-.+*]/g, '\\$&')}\\s*\\=`)).test(document.cookie)
  }

  keys () {
    const aKeys = document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:=[^;]*)?;\s*/)
    for (let nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx += 1) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx])
    }
    return aKeys
  }
}
