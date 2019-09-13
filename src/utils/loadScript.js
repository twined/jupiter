export default (url, completeCallback) => {
  const script = document.createElement('script'); let done = false;
  const head = document.getElementsByTagName('head')[0];
  script.src = url;

  script.onreadystatechange = function cb () {
    if (!done
      && (!this.readyState
      || this.readyState === 'loaded'
      || this.readyState === 'complete')) {
      done = true
      completeCallback()

      // IE memory leak
      script.onload = null
      script.onreadystatechange = null

      head.removeChild(script)
    }
  }
  script.onload = script.onreadystatechange
  head.appendChild(script)
}
