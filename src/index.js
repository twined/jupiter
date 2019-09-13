import {
  TweenMax, TimelineLite, TimelineMax, CSSPlugin, Power3, Sine, Linear, Back
} from 'gsap/all'

import imagesLoaded from 'imagesloaded'
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

import prefersReducedMotion from './utils/prefersReducedMotion'
import loadScript from './utils/loadScript'

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
  prefersReducedMotion,
  loadScript,

  // Export some of the libs we use,
  // that can also be used in the main frontend.
  imagesLoaded,
  TweenMax,
  TimelineLite,
  TimelineMax,
  Power3,
  Back,
  Sine,
  Linear,
  CSSPlugin,
  scrollIntoView,
  Hammer
}
