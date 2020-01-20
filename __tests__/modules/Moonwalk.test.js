import { Moonwalk } from '../../src'

test('creates sections', () => {
  // Set up our document body
  document.body.innerHTML = `
  <html>
    <head></head>
    <body>
      <div data-moonwalk-section>
        <div data-moonwalk>
          1
        </div>
        <div data-moonwalk>
          2
        </div>
        <div data-moonwalk>
          3
        </div>
      </div>
      <div data-moonwalk-section>
        <div data-moonwalk>
          1
        </div>
        <div data-moonwalk>
          2
        </div>
        <div data-moonwalk>
          3
        </div>
      </div>
    </body>
  </html>
  `
  const moonwalk = new Moonwalk()

  expect(moonwalk.sections.length).toEqual(2)
})

test('creates named section', () => {
  // Set up our document body
  document.body.innerHTML = `
  <html>
    <head></head>
    <body>
      <div data-moonwalk-section>
        <div data-moonwalk>
          1
        </div>
        <div data-moonwalk>
          2
        </div>
        <div data-moonwalk>
          3
        </div>
      </div>
      <div data-moonwalk-section="sectionName">
        <div data-moonwalk>
          1
        </div>
        <div data-moonwalk>
          2
        </div>
        <div data-moonwalk>
          3
        </div>
      </div>
    </body>
  </html>
  `
  const moonwalk = new Moonwalk()

  expect(moonwalk.sections.length).toEqual(2)
  expect(moonwalk.sections[1].name).toEqual('sectionName')
})

test('creates runs', () => {
  // Set up our document body
  document.body.innerHTML = `
  <html>
    <head></head>
    <body>
      <div data-moonwalk-section>
        <div data-moonwalk-run="test">
          <div>
          </div>
        </div>
        <div data-moonwalk-run="test2">
          <div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `
  const moonwalk = new Moonwalk({}, {
    runs: {
      test: {
        threshold: 0,
        callback: () => {}
      },
      test2: {
        threshold: 0,
        callback: () => {}
      }
    }
  })

  expect(moonwalk.runs.length).toEqual(2)
})

test('creates children', () => {
  // Set up our document body
  document.body.innerHTML = `
  <html>
    <head></head>
    <body>
      <div data-moonwalk-section>
        <div data-moonwalk-children>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
        </div>
      </div>
    </body>
  </html>
  `

  const CORRECT_DOC = `
    <div data-moonwalk-section="">
      <div data-moonwalk-children="">
        <div data-moonwalk="">1</div>
        <div data-moonwalk="">2</div>
        <div data-moonwalk="">3</div>
        <div data-moonwalk="">4</div>
        <div data-moonwalk="">5</div>
      </div>
    </div>
  `

  // eslint-disable-next-line no-new
  new Moonwalk()

  expect(document.body.innerHTML.replace(/\s/g, '')).toEqual(CORRECT_DOC.replace(/\s/g, ''))
})

test('creates named children', () => {
  // Set up our document body
  document.body.innerHTML = `
  <html>
    <head></head>
    <body>
      <div data-moonwalk-section>
        <div data-moonwalk-children="slide">
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
        </div>
      </div>
    </body>
  </html>
  `

  const CORRECT_DOC = `
    <div data-moonwalk-section="">
      <div data-moonwalk-children="slide">
        <div data-moonwalk="slide">1</div>
        <div data-moonwalk="slide">2</div>
        <div data-moonwalk="slide">3</div>
        <div data-moonwalk="slide">4</div>
        <div data-moonwalk="slide">5</div>
      </div>
    </div>
  `

  // eslint-disable-next-line no-new
  new Moonwalk()

  expect(document.body.innerHTML.replace(/\s/g, '')).toEqual(CORRECT_DOC.replace(/\s/g, ''))
})
