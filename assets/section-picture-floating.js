defineCustomElement(
  'picture-floating',
  () =>
    class PictureFloating extends HTMLElement {
      constructor() {
        super();
        // pc
        this.slideImageItems = this.querySelectorAll('.splide__slide-image');
        this.mobileDuration = this.getAttribute('data-mobile-duration');
        detectingScreen(({ isMobileScreen }) => {
          if (!isMobileScreen) {
            const fn = this.handleItemMouseEnter.bind(this);
            this.initItemEvent(fn);
            return () => {
              this.destroyItemEvent(fn);
            };
          }
        }, true);
        // mobile
        if (!window.Splide) return;
        const splide = new window.Splide(this.querySelector('.splide'), {
          type: 'fade',
          rewind: true,
          pagination: false,
          arrows: false,
          autoplay: true,
          interval: this.mobileDuration * 1000,
          mediaQuery: 'min',
          breakpoints: {
            959: {
              destroy: true,
            },
          },
        });
        this.splide = splide;
        splide.mount();
      }

      resetItemActive() {
        this.slideImageItems.forEach((item) => {
          this.handleItemActive(item, 'remove');
        });
      }

      handleItemActive(target, handleType) {
        if (handleType === 'add') {
          target.classList.add('active');
        }
        if (handleType === 'remove') {
          target.classList.remove('active');
        }
      }

      handleItemMouseEnter(event) {
        this.resetItemActive();
        this.handleItemActive(event.currentTarget, 'add');
      }

      initItemEvent(fn) {
        this.slideImageItems.forEach((item) => {
          item.addEventListener('mouseenter', fn);
        });
      }

      destroyItemEvent(fn) {
        this.slideImageItems.forEach((item) => {
          item.removeEventListener('mouseenter', fn);
        });
      }

      splideTo(index) {
        detectingScreen(({ isMobileScreen }) => {
          if (!isMobileScreen) {
            this.slideImageItems[index]?.dispatchEvent(new Event('mouseenter'));
          } else {
            this.splide?.Components.Autoplay.pause();
            this.splide?.go(index);
          }
        }, true);
      }
    },
);
