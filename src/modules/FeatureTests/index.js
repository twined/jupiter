import * as Events from '../../events'

export default class FeatureTests {
  constructor (app, tests) {
    this.app = app

    document.documentElement.classList.remove('no-js')
    document.documentElement.classList.add('js')

    this.testFns = {
      touch: this.testTouch
    }

    this.results = {}

    const testKeys = Object.keys(tests)
    const wantedTests = testKeys.filter(t => tests[t])

    this.runTests(wantedTests)
    this.bindEventTests()
  }

  runTests (tests) {
    tests.forEach(test => {
      this.testFor(test, this.testFns[test]())
    })
  }

  testFor (feature, result) {
    this.results[feature] = result
    document.documentElement.setAttribute(`data-${feature}`, result)
  }

  /**
   * Check if we should outline elements. If the user hits TAB, we should outline,
   * otherwise we skip it.
   */
  testOutlineEvents () {
    document.addEventListener('mousedown', () => {
      this.testFor('outline', false)
    })

    document.addEventListener('keydown', e => {
      if (e.keyCode === 9 || e.which === 9) {
        this.testFor('outline', true)
        const outlineEvent = new window.CustomEvent(Events.APPLICATION_OUTLINE)
        window.dispatchEvent(outlineEvent)
      }
    })
  }

  /**
   * Sometimes the initial test for touch/mouse fail, so
   * listen for events as well
   */
  testTouchMouseEvents () {
    const onTouchStart = () => {
      if (!this.results.touch) {
        this.results.touch = true
        this.results.mouse = false
        this.testFor('touch', true)
        this.testFor('mouse', false)
        this.deviceLastTouched = Date.now()
      }
    }

    const onTouchEnd = () => {
      this.deviceLastTouched = Date.now()
    }

    document.addEventListener('touchstart', onTouchStart, false)
    document.addEventListener('touchend', onTouchEnd, false)

    const onMouseMove = () => {
      if (!this.results.mouse) {
        if ((Date.now() - this.devicelastTouched) > 300) {
          this.results.touch = false
          this.results.mouse = true
          this.testFor('touch', false)
          this.testFor('mouse', true)
        }
      }
    }

    document.addEventListener('mousemove', onMouseMove, false)
  }

  bindEventTests () {
    this.testOutlineEvents()
    this.testTouchMouseEvents()
  }

  testTouch () {
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
  }
}
