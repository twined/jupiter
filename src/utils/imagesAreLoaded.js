import imageIsLoaded from './imageIsLoaded';

export default function imagesAreLoaded (imgs) {
  const promises = []

  for (let i = 0; i < imgs.length; i += 1) {
    const img = imgs[i];
    promises.push(imageIsLoaded(img))
  }

  return Promise.all(promises)
}
