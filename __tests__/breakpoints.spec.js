import { Breakpoints } from '../src'

const events = {
  initializedEvent: new window.CustomEvent('application:initialized'),
  readyEvent: new window.CustomEvent('application:ready')
}

function setBreakpointVars () {
  document.documentElement.style.setProperty('--breakpoint-xs', '0')
  document.documentElement.style.setProperty('--breakpoint-sm', '500px')
  document.documentElement.style.setProperty('--breakpoint-md', '1000px')
  document.documentElement.style.setProperty('--breakpoint-lg', '1500px')
}

it('reads breakpoint css vars', () => {
  setBreakpointVars()
  const breakpoints = new Breakpoints()
  window.dispatchEvent(events.initialized)
  console.log(breakpoints)
})
