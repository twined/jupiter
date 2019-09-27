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
