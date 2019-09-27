export default function dispatchEvent (el, eventName) {
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, false, false, {})
  el.dispatchEvent(event)
}
