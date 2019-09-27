const DEFAULT_FPS = 60
const SCOPES = {}

export default (callback, fps = DEFAULT_FPS) => (...passedArgs) => requestAnimationFrame(() => {
  const msCurrent = new Date().getTime()
  const fpsInterval = 1000 / fps

  SCOPES[callback] = SCOPES[callback] || null

  const msDelta = SCOPES[callback] ? msCurrent - SCOPES[callback] : null

  if (msDelta === null || msDelta > fpsInterval) {
    SCOPES[callback] = msCurrent - (msDelta % fpsInterval)
    callback(...passedArgs)
  }
})
