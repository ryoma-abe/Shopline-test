defineCustomElement(
  'featured-slideshow-section',
  () =>
    class FeaturedSlideshowSection extends HTMLElement {
      constructor() {
        super();

        const autoplay = this.getAttribute('data-autoplay') === 'true';
        const speed = this.getAttribute('data-speed');
        const paginations = this.querySelectorAll('.splide__slide-pagination');
        this.paginations = paginations;

        // init splide
        if (!window.Splide) return;
        const splide = new window.Splide(this, {
          pagination: false,
          arrows: false,
          autoplay,
          type: 'loop',
          interval: speed * 1000,
          speed: 1000,
        });
        splide.mount();
        splide.on('move', function (cIndex) {
          // do something
          paginations?.forEach((item, index) => {
            if (index === cIndex) {
              item.classList?.add('is-active');
            } else {
              item.classList?.remove('is-active');
            }
          });
        });

        this.splide = splide;
        this.init();
      }

      init() {
        this.initPrevNextClick();
        this.initPageBtnClick();
      }

      initPageBtnClick() {
        this.paginations?.forEach((item) => {
          item.addEventListener('click', () => {
            this.splide?.go(Number(item.getAttribute('data-index')));
          });
        });
      }

      splideTo(index) {
        if (this.getAttribute('data-autoplay') === 'true') {
          this.splide?.Components.Autoplay.pause();
        }
        this.splide?.go(index);
      }

      play() {
        if (this.getAttribute('data-autoplay') === 'true') {
          this.splide?.Components.Autoplay.play();
        }
      }

      initPrevNextClick() {
        const prevBtn = this.querySelector('.featured-control__arrow-button[name=previous]');
        const nextBtn = this.querySelector('.featured-control__arrow-button[name=next]');
        prevBtn?.addEventListener('click', () => {
          this?.splide?.go('<');
        });

        nextBtn?.addEventListener('click', () => {
          this?.splide?.go('>');
        });
      }
    },
);
