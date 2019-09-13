<p align="center">
  <sup><em>«Earth people, I was born on»</em></sup>
</p>

![](http://univers.agency/jupiter.svg)

<p align="center">
  <a href="https://travis-ci.org/univers-agency/jupiter"><img src="https://img.shields.io/travis/univers-agency/jupiter/master.svg" alt="Build Status"></a>
</p>

------

## Events

`APPLICATION:INITIALIZED`
`APPLICATION:READY`
`APPLICATION:SCROLL`
`APPLICATION:RESIZE`
`APPLICATION:MOBILE_MENU:OPEN`
`APPLICATION:MOBILE_MENU:CLOSE`

## Application

```es6

const app = new Application()

app.registerCallback(Events.APPLICATION_PRELUDIUM, () => { ... })
app.registerCallback(Events.APPLICATION_INITIALIZED, () => { ... })
app.registerCallback(Events.APPLICATION_READY, () => { ... })

```

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