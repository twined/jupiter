import { IMAGE_LAZYLOADED } from '../events'

export default function imageIsLoaded (img, lazy = false) {
  return new Promise(resolve => {
    if (lazy) {
      if (img.hasAttribute('data-ll-loaded')) {
        resolve({ img, status: 'ok' })
      } else {
        img.addEventListener(IMAGE_LAZYLOADED, () => {
          resolve({ img, status: 'ok' })
        })
      }
    } else if (img.complete) {
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
