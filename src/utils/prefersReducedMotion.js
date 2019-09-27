/**
 * Checks if OS prefers reduced motion
 */
export default function () {
  if (!window.matchMedia) {
    return false
  }

  const matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)')

  if (matchMediaObj) {
    return matchMediaObj.matches
  }

  return false
}
