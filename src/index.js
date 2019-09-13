import {
  Back,
  CSSPlugin,
  Linear,
  Power3,
  Sine,
  TweenLite,
  TimelineLite
} from 'gsap/all'

import scrollIntoView from 'smooth-scroll-into-view-if-needed'
import Hammer from '@egjs/hammerjs'

import Application from './modules/Application'
import Breakpoints from './modules/Breakpoints'
import Cookies from './modules/Cookies'
import CoverOverlay from './modules/CoverOverlay'
import * as Events from './events'
import FixedHeader from './modules/FixedHeader'
import FooterReveal from './modules/FooterReveal'
import Parallax from './modules/Parallax'
import HeroSlider from './modules/HeroSlider'
import Lazyload from './modules/Lazyload'
import Lightbox from './modules/Lightbox'
import Links from './modules/Links'
import MobileMenu from './modules/MobileMenu'
import Moonwalk from './modules/Moonwalk'
import Popup from './modules/Popup'
import StackedBoxes from './modules/StackedBoxes'
import StickyHeader from './modules/StickyHeader'
import Typography from './modules/Typography'

import imageIsLoaded from './utils/imageIsLoaded'
import imagesAreLoaded from './utils/imagesAreLoaded'
import loadScript from './utils/loadScript'
import prefersReducedMotion from './utils/prefersReducedMotion'

export {
  Application,
  Breakpoints,
  Cookies,
  CoverOverlay,
  Events,
  FixedHeader,
  FooterReveal,
  Parallax,
  HeroSlider,
  Lazyload,
  Lightbox,
  Links,
  MobileMenu,
  Moonwalk,
  Popup,
  StackedBoxes,
  StickyHeader,
  Typography,

  // Export utils
  imageIsLoaded,
  imagesAreLoaded,
  loadScript,
  prefersReducedMotion,

  // Export some of the libs we use,
  // that can also be used in the main frontend.
  Back,
  CSSPlugin,
  Hammer,
  Linear,
  Power3,
  scrollIntoView,
  Sine,
  TweenLite,
  TimelineLite
}
