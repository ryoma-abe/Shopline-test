defineCustomElement(
  'text-image-slide-section',
  () =>
    class TextImageSlideSection extends SliderComponent {
      constructor() {
        super();

        this.enableSliderLooping = true;
        this.addEventListener('visible', this.init.bind(this));
        this.addEventListener('slideChanged', this.slideChange.bind(this));
      }

      init() {}

      slideChange() {}

      splideTo(index) {
        detectingScreen(({ isMobileScreen }) => {
          if (isMobileScreen) {
            super.slideTo(index);
          }
        }, true);
      }
    },
);
