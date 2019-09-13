import imageIsLoaded from './imageIsLoaded';

export default function imagesAreLoaded (el) {
  const imgs = el.querySelectorAll('img')
  if (imgs.length) {
    return Promise.all(Array.from(imgs).map(imageIsLoaded))
  }
  return new Promise(resolve => { resolve({ imgs, status: 'ok' }) })
}
