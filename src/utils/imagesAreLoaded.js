import imageIsLoaded from './imageIsLoaded';

export default function imagesAreLoaded (imgs, lazy = false) {
  if (imgs && imgs.nodeType) {
    imgs = imgs.querySelectorAll('img')
  }

  const promises = []

  for (let i = 0; i < imgs.length; i += 1) {
    const img = imgs[i];
    promises.push(imageIsLoaded(img, lazy))
  }

  return Promise.all(promises)
}
