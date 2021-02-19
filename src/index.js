import {
  CSSPlugin,
  Draggable,
  ScrollToPlugin,
  ScrollTrigger,
  gsap
} from 'gsap/all'

import Hammer from '@egjs/hammerjs'
import _defaultsDeep from 'lodash.defaultsdeep'

import Application from './modules/Application'
import Breakpoints from './modules/Breakpoints'
import Cookies from './modules/Cookies'
import CoverOverlay from './modules/CoverOverlay'
import Dom from './modules/Dom'
import Dropdown from './modules/Dropdown'
import * as Events from './events'
import FixedHeader from './modules/FixedHeader'
import FooterReveal from './modules/FooterReveal'
import Parallax from './modules/Parallax'
import HeroSlider from './modules/HeroSlider'
import HeroVideo from './modules/HeroVideo'
import Lazyload from './modules/Lazyload'
import Lightbox from './modules/Lightbox'
import Links from './modules/Links'
import Marquee from './modules/Marquee'
import MobileMenu from './modules/MobileMenu'
import Moonwalk from './modules/Moonwalk'
import Popup from './modules/Popup'
import ScrollSpy from './modules/ScrollSpy'
import StackedBoxes from './modules/StackedBoxes'
import StickyHeader from './modules/StickyHeader'
import Typography from './modules/Typography'

import imageIsLoaded from './utils/imageIsLoaded'
import imagesAreLoaded from './utils/imagesAreLoaded'
import loadScript from './utils/loadScript'
import rafCallback from './utils/rafCallback'
import prefersReducedMotion from './utils/prefersReducedMotion'

export {
  Application,
  Breakpoints,
  Cookies,
  CoverOverlay,
  Dom,
  Draggable,
  Dropdown,
  Events,
  FixedHeader,
  FooterReveal,
  Parallax,
  HeroSlider,
  HeroVideo,
  Lazyload,
  Lightbox,
  Links,
  Marquee,
  MobileMenu,
  Moonwalk,
  Popup,
  ScrollSpy,
  StackedBoxes,
  StickyHeader,
  Typography,

  // Export utils
  imageIsLoaded,
  imagesAreLoaded,
  loadScript,
  prefersReducedMotion,
  rafCallback,
  _defaultsDeep,

  // Export some of the libs we use,
  // that can also be used in the main frontend.
  gsap,
  CSSPlugin,
  ScrollToPlugin,
  ScrollTrigger,
  Hammer
}
