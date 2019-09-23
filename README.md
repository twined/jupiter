<p align="center">
  <sup><em>«Earth people, I was born on»</em></sup>
</p>

![](http://univers.agency/jupiter.svg)

<p align="center">
  <a href="https://travis-ci.org/univers-agency/jupiter"><img src="https://img.shields.io/travis/univers-agency/jupiter/master.svg" alt="Build Status"></a>
</p>

------

## Application

```es6

const app = new Application()

app.registerCallback(Events.APPLICATION_PRELUDIUM, () => { ... })
app.registerCallback(Events.APPLICATION_INITIALIZED, () => { ... })
app.registerCallback(Events.APPLICATION_READY, () => { ... })

```

## Moonwalk

Moonwalks are divided into sections that are run in a timeline. Multiple
timelines can run at the same time.

You reference the configured `walks` by the `data-moonwalk="walkname"`
syntax. If no value is provided, we run the `default` walk.

Sample code
```
<div data-moonwalk-section>
  <div data-moonwalk>
    Default walk
  </div>
  <div data-moonwalk="fast">
    `Fast` walk
  </div>
</div>
```

### Stages

A stage will run a transition on itself before introducing the rest
of the moonwalks. For instance, if a section should be animated to
"open" by scaling Y from 0 to 100. When the stage's tween is finished,
the rest are called as they intersect.

Sample code

```html
<div class="slideshow" data-moonwalk-section data-moonwalk-stage="scaleup">
  <div data-moonwalk="slow">...</div>
  <div data-moonwalk>...</div>
  <div data-moonwalk="slow">...</div>
</div>
```

Sample config

```es6
walks: {
  scaleup: {
    interval: 0,
    duration: 1,
    transition: {
      from: {
        scaleY: 0,
        transformOrigin: '50% 50%'
      },

      to: {
        scaleY: 1,
        ease: Sine.easeOut
      }
    }
  }
}
```

### Named sections

A named section will autoplay its children when intersecting with the viewport. Needs the `sectionTargets` key in config.

Sample code

```html
<div class="slideshow" data-moonwalk-section="slider">
  <div class="slides-wrapper">
    <picture class="image">
      ...
    </picture>
    <picture class="image">
      ...
    </picture>
  </div>
</div>
```

Sample config:

```es6
slider: {
  sectionTargets: '.image',
  interval: 0.2,
  duration: 1.2,
  alphaTween: true,
  transition: {
    from: {
      autoAlpha: 0,
      y: 21
    },
    to: {
      ease: Sine.easeOut,
      y: 0
    }
  }
}

```

## Events

`APPLICATION:INITIALIZED`
`APPLICATION:READY`
`APPLICATION:SCROLL`
`APPLICATION:RESIZE`
`APPLICATION:MOBILE_MENU:OPEN`
`APPLICATION:MOBILE_MENU:CLOSE`


## StackedBoxes

```
<div class="v-module" data-v="quote|image" data-moonwalk-section data-boxes-stacked>
  <aside data-boxes-stacked-size-target>
    <blockquote>
      Quote here
    </blockquote>
    <cite>
      Name
    </cite>
  </aside>
  <figure data-boxes-stacked-pull="2/3" data-boxes-stacked-size-src>
    <%= picture_tag Enum.at(@works, 2).cover, img_class: "img-fluid", alt: "--", key: :original, prefix: media_url() %>
  </figure>
</div>
```

## StickyHeader

 * header element should not have position: fixed


 ## FixedHeader

 * header element needs position: fixed;

 ```
 header[data-nav] {
  @include container();

  z-index: 10;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  backface-visibility: hidden;
  transition: padding-top 500ms ease, padding-bottom 500ms ease;

  @each $bp-name, $bp-size in $grid-breakpoints {
    @include media('>=#{$bp-name}') {
      @each $key, $val in map-get($header-padding, $bp-name) {
        #{$key}: #{$val};
      }
    }
  }

  &[data-header-small] {
    transition: padding-top 500ms ease, padding-bottom 500ms ease;

    @each $bp-name, $bp-size in $grid-breakpoints {
      @include media('>=#{$bp-name}') {
        @each $key, $val in map-get($header-padding-small, $bp-name) {
          #{$key}: #{$val};
        }
      }
    }
  }
 }
 ```


## CSS/JS QUIRKS

  - autoplay hero video.
    - iOS safari needs `playsinline`, `muted` and `loop` attributes