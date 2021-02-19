/**
 * MARQUEE
 *
 * HTML syntax:
 *
 *    <article b-tpl="marquee" data-marquee>
 *      <div data-marquee-container>
 *        <p>My marquee</p>
 *      </div>
 *    </article>
 *
 * Note that this module only does the cloning of the element.
 * The rest is handled through CSS:
 *
 *    [b-tpl="marquee"] {
 *      width: 100%;
 *      margin: 0 auto;
 *      white-space: nowrap;
 *      overflow: hidden;
 *      [data-marquee-container] {
 *        display: table-row;
 *        white-space: nowrap;
 *        animation: marquee 20s linear infinite;
 *
 *        p {
 *          @fontsize 120px;
 *          font-weight: bold;
 *          width: 100%;
 *          padding-left: 250px;
 *          display: table-cell;
 *        }
 *      }
 *    }
 *
 *    @keyframes marquee {
 *      0% { transform: translate(0, 0); }
 *      100% { transform: translate(-100%, 0); }
 *    }
 */

import { gsap } from 'gsap'
import _defaultsDeep from 'lodash.defaultsdeep'
import Dom from '../Dom'
import { APPLICATION_RESIZE } from '../../events'

const DEFAULT_OPTIONS = {}

class Marquee {
  constructor (app, opts = {}) {
    this.app = app
    this.opts = _defaultsDeep(opts, DEFAULT_OPTIONS)

    this.element = Dom.find('[data-marquee]')

    if (!this.element) {
      return
    }
    this.originalContent = this.element.children[0]

    this.setBounds()
    this.calculateRepetition()
    this.createWrapper()
    this.cloneNodes()

    window.addEventListener(APPLICATION_RESIZE, this.refresh.bind(this))
  }

  setBounds () {
    this.originalContent.style.display = 'inline-block'

    this.bounds = {
      element: this.element.getBoundingClientRect(),
      content: this.element.querySelector('[data-marquee-container]').getBoundingClientRect()
    }
  }

  calculateRepetition () {
    const repetitions = (this.bounds.element.width + this.bounds.content.width) / this.bounds.content.width
    this.repetitions = Math.ceil(repetitions)
  }

  getChildren () {
    if (this.element.children.length > 1) {
      throw 'Please only have one wrapper with `.marquee-container` selector.'
    } else {
      const elem = this.element.children[0]
      elem.classList.add('marquee-copy')
      return elem
    }
  }

  createWrapper () {
    const wrapper = document.createElement('div')
    wrapper.classList.add('marquee-wrapper')
    wrapper.style.whiteSpace = 'nowrap'
    this.element.appendChild(wrapper)
    this.element.style.overflow = 'hidden'
    this.wrapper = wrapper
  }

  cloneNodes (amount) {
    [...Array(amount || this.repetitions)].map((val, index) => {
      const clone = this.originalContent.cloneNode(true)
      this.wrapper.appendChild(clone)
      return clone
    })

    if (!amount) this.originalContent.remove()
  }

  refresh () {
    const prevRepetitions = this.repetitions

    this.calculateRepetition()

    const diff = this.repetitions - prevRepetitions
    if (diff > 0) this.cloneNodes(diff)

    this.setBounds()
  }
}

export default Marquee
