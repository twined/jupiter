import {
  TweenMax, TimelineLite, CSSPlugin, Power3, Sine, Linear, Back
} from 'gsap/all'

import imagesLoaded from 'imagesloaded'
import scrollIntoView from 'smooth-scroll-into-view-if-needed'
import Hammer from '@egjs/hammerjs'

import Breakpoints from './Breakpoints'
import Cookies from './Cookies'
import CoverOverlay from './CoverOverlay'
import Fader from './Fader'
import FixedHeader from './FixedHeader'
import FooterReveal from './FooterReveal'
import Parallax from './Parallax'
import HeroSlider from './HeroSlider'
import Lazyload from './Lazyload'
import Lightbox from './Lightbox'
import Links from './Links'
import MobileMenu from './MobileMenu'
import Moonwalk from './Moonwalk'
import Popup from './Popup'
import StackedBoxes from './StackedBoxes'
import StickyHeader from './StickyHeader'
import Typography from './Typography'

import prefersReducedMotion from './utils/prefersReducedMotion'

export {
  Breakpoints,
  Cookies,
  CoverOverlay,
  Fader,
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

  // Export some of the libs we use,
  // that can also be used in the main frontend.
  imagesLoaded,
  TweenMax,
  TimelineLite,
  Power3,
  Back,
  Sine,
  Linear,
  CSSPlugin,
  scrollIntoView,
  Hammer
}
