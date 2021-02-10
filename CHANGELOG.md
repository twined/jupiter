#### 3.40.1

- FixedHeader: Check props as preflight
- FixedHeader: Set data-header-transitions after initial preflight

#### 3.40.0

- Dropdown: New module
- Scrollspy: New module

#### 3.39.1

- FixedHeader: Fix `onOutline` callback
- Lazyload: Also set `sizes` on `source` tags


#### 3.39.0

- Lightbox: Add support for srcset. Add `data-srcset` to your anchor tag with `data-lightbox`
- FixedHeader: Remove unused intersect logic.
- Lazyload: Fix setting `srcset` on `source` tags that have `data-srcset`


#### 3.38.0

- Application: Prevent scrollLock running while already locked, since this would reset scrollbar
  width padding compensation
- Application: Add `extraPaddedElements` param to `scrollLock`. If for instance your nav needs
  the same padding as the body element when compensating for scrollbar width.
  `app.scrollLock(['header[data-nav] nav']);`
- Cookies: Expire cookie law cookie one year in the future.
- Dom: Add `Dom.inViewport(el)` to check if parts of `el` is currently visible
- Dom: Add `Dom.create('div', ['my-class1', 'my-class2'])` convenience function
- Dom: Add `Dom.remove(el)` convenience function for removing `el` from document
- Dom: Add `Dom.append(el)` convenience function for appending `el` to `body`
- Lazyload: Set `data-ll-loaded` on finished lazy loaded images.
- Lazyload: Prevent repeat lazyloading already loaded image
- Lazyload: Prevent repeat lazyloading already loaded image
- Lazyload: Dynamically set `sizes` for images with `[data-sizes="auto"]`
- Moonwalk: Add `container` param to constructor. For instance if we want to run Moonwalk
  on a json loaded doc.


#### 3.37.0

- update GSAP, export ScrollTrigger
- Application: add `app.section`
- HeroSlider: add `lazyImages` config. If true, tries to lazyload first image before
  setting slider as ready


#### 3.36.0

- Moonwalk: Fix space in class name when css tweening
- Moonwalk: add `clearMoonwalkOnAnchors`. Removes all moonwalks if called from a link with hash/anchor.
I.e if the URL is `/news#latest`, all moonwalks are removed. This can sort out a rendering bug with
IntersectionObserver that sometimes happens.
- Application: add `respectReducedMotion`. Set to false if you don't want to respect the user's
reduced-motion settings. May prevent some rendering bugs in extreme cases, but not recommended.
- General: Don't include polyfills in package, include from application
- General: Only try to call object-fit polyfill on IE11
- General: Set capture/passive for events where applicable.
- Lazyload: Force picturefill after lazyload on IE11


#### 3.35.0

- Dom: `setCSSVar`
- FixedHeader: fix `onOutline` event
- Lightbox: `swipe: true/false` cfg setting. If swipe is true, native zoom won't work, so allow to choose.
- Moonwalk: add `clearNestedSections` -- NOTE: This is enabled by default, since nested sections
  usually leads to trouble!
- StickyHeader: add `beforeEnter` event
- StickyHeader: add `unPinOnResize` cfg.


#### 3.34.1

- Cookies: Set `cookielaw` cookie to ROOT


#### 3.34.0

- Lightbox: Add `trigger` to opts.
- Drop node 8 from travis


#### 3.33.0

- Add `APPLICATION_REVEALED` to registerable callbacks.
  app.registerCallback(Events.APPLICATION_REVEALED, () => {})


#### 3.32.0

- FixedHeader: Add `onOutline` event that pins header when outline is enabled. Replaces `pinOnOutline`.
- Moonwalk: Change default starting style to be `opacity 0` instead of `visibility: hidden`, since the latter
screws up tabbing. Make sure your css reflects this by setting `[data-moonwalk], [data-moonwalk-section], ...`
to `opacity: 0` instead of `visibility: hidden`. If you update `europacss` this is fixed automatically.


#### 3.31.0

- Fix cookielaw banner not respecting cookie set


#### 3.30.0

- Kill all faders


#### 3.29.0

- HeroVideo: Add `data-src` option for choosing mobile/desktop versions.


#### 3.28.0

- Bug fixes
- Update GSAP to 3.1.1
- Moonwalk: Fix CSS transitions


#### 3.27.0

- Moonwalk: Allow setting named children - `data-moonwalk-children="slide"`
- Moonwalk: Clear out more keys on reduced-motion. Update EuropaCSS too for fixes.
- HeroVideo: Add `data-cover` for cover image.


#### 3.26.0

- Links: Add `triggerEvents` and `scrollDuration` to config.


#### 3.25.0

- Fix Safari back button bug where fader would stay activated.


#### 3.24.2

- Lock GSAP to 3.0.4 due to a timeline regression.


#### 3.24.1

- Remove debug log


#### 3.24.0

- MobileMenu: Fix: Prevent default when binding click event


#### 3.23.0

- MobileMenu: Fix: Pass self to `onResize` event.


#### 3.22.0

- Moonwalk: Fix visual bug
- Moonwalk: Add runs. Runs a function when element comes into view.


#### 3.21.0

- gsap 3!
- FixedHeader: Allow function as `offset` and `offsetBg`


#### 3.20.0

- FixedHeader: Allow element as `offset`
- Move `unPinOnResize` to section config!


#### 3.19.0

- HeroVideo: Don't autoplay when in viewport if pause is pressed
- Links: Ignore `noanim` classed anchors


#### 3.18.0

- Applicaton: Add `Application.pollForElement` and `Application.pollForVariable`
- FixedHeader: Add `onMobileMenuOpen` and `onMobileMenuClose` callbacks
- Dom: Add `Dom.offset` and `Dom.position`


#### 3.17.0

- StickyHeader: Add `opts.pinOnForcedScroll`
- Application: Add `Application.scrollTo`
- HeroVideo: Add pause/play.
  `opts.elements.play` and `opts.elements.pause` are strings representing the SVG icons.
  They get wrapped in a button with `[data-hero-video-pause].


#### 3.16.0

- Lightbox: track pointer direction in `pointerDirection`
- Lightbox: expose `onClick`, `onPointerLeft` and `onPointerRight` events.
- StickyHeader: add `onClone` event to customize how the auxillary header is created.

#### 3.15.0

- HeroSlider: better initialization. Expose `onFadeIn` event
- Export `_defaultsDeep`


#### 3.14.0

- StickyHeader: reveals on `Events.APPLICATION_REVEALED`. Can be set with `opts.on`
- Moonwalk: Force section element to be visible (Set `visibility: hidden`
  in pcss for `[data-moonwalk-section]`)
- Application: remove default fader delay.


#### 3.13.0

- Lightbox: Add keyboard navigation


#### 3.12.0

- Lightbox: Use timelines for even more flexibility with captions


#### 3.11.0

- Lightbox: Rewritten to be more flexible. Exposes more events. Preloads more images.


#### 3.10.0

- Moonwalk: Removed `opts.fireOnReady`. Added `opts.on` option instead. Pass the event
  we should listen for. The default is `on: Events.APPLICATION_REVEALED`
- Moonwalk: add `opts.initialDelay`. This is an added delay before `ready()` is fired.
- FixedHeader: add `opts.on` option for listening to an event before firing `enter()`
- FixedHeader: added `opts.<section>.beforeEnter`. This gets called during init, so
  it's a good place to hide items that should be revealed in `opts.<section>.enter`.


#### 3.9.0

- FixedHeader: Allow locking/unlocking pin/unpin
- StickyHeader: Allow locking/unlocking pin/unpin


#### 3.8.0

- Lightbox: Lock scroll
- Lightbox: Ensure image is loaded before fading in


#### 3.7.0

- Cookielaw: Show after application is revealed. Delay by 0.5 as standard.
- Fontloader: Check that fonts are loaded before calling fadeIn() / revealed event


#### 3.6.0

- Lightbox: More hooks
- Breakpoints: Initialize earlier to ensure breakpoints are available to other modules
- Remove `no-js`/`js` feature test. Handle this at the application
level instead to try and avoid fouc. Newest Brando version does this for us
in the `render_meta`.


#### 3.5.0

- Dom: Add `overlapsVertically` function
- FixedHeader: Add `unPinOnResize` boolean switch
- Export `rafCallback` function


#### 3.4.0

- Add `Dom` class


#### 3.3.0

- Force update Parallax after Git tries to ruin everything


#### 3.2.0

- Popup: Add triggers for opening and closing popups. Add docs in README


#### 3.1.0

- Application: Set dimensions on application init
- Application: Extended debug info (screen size, viewport, features)
- Moonwalk: Clean up Moonwalk code
- Parallax: Fix parallax up a bit. Still mainly for hero usage.
- Parallax: Fix parallax up a bit. Still mainly for hero usage.
