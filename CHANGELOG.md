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
