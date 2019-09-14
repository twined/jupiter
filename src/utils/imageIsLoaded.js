export default function imageIsLoaded (img) {
  return new Promise(resolve => {
    if (img.complete) {
      resolve({ img, status: 'ok' })
    } else {
      img.onload = () => {
        resolve({ img, status: 'ok' })
      }
      img.onerror = () => {
        resolve({ img, status: 'error' })
      }
    }
  })
}
