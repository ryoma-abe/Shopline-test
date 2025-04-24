defineCustomElement(
  'announcement-bar-slider',
  () =>
    class AnnouncementBarSlider extends HTMLElement {
      constructor() {
        super();

        this.itemHeight = this.querySelector('.announcement-bar--item').offsetHeight;
        this.displayMode = this.dataset.displayMode;
        this.speed = (Number(this.dataset.speed) || 5) * 1000;
        this.autoplay = this.getAttribute('autoplay') === 'true';

        this.initSlider();
      }

      initSlider() {
        if (!window.Splide) return;
        const direction = this.displayMode === '4' ? 'ttb' : 'ltr';
        const resetOptions =
          this.displayMode === '2'
            ? {
                mediaQuery: 'min',
                breakpoints: {
                  959: {
                    destroy: true,
                  },
                },
              }
            : {};
        const splide = new window.Splide(this.querySelector('.splide'), {
          type: 'loop',
          pagination: false,
          perPage: 1,
          arrows: false,
          autoplay: this.autoplay,
          interval: this.speed,
          height: `${this.itemHeight}px`,
          direction,
          ...resetOptions,
        });
        this.splideInstance = splide;
        splide.mount();
        if (this.displayMode === '6') {
          const arrows = this.querySelectorAll('.announcement-bar__arrow[name="previous"]');
          if (arrows.length > 0) {
            arrows.forEach((ele) => {
              ele.addEventListener('click', () => {
                splide.go('<');
              });
            });
            this.querySelectorAll('.announcement-bar__arrow[name="next"]').forEach((ele) => {
              ele.addEventListener('click', () => {
                splide.go('>');
              });
            });
          }
        }
      }

      splideTo(index) {
        this.splideInstance?.Components.Autoplay.pause();
        this.splideInstance?.go(index);
      }

      play() {
        this.splideInstance?.Components.Autoplay.play();
      }

      disconnectedCallback() {}
    },
);
