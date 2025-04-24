defineCustomElement(
  'featured-recommend-products-slider',
  () =>
    class FeaturedProductsSlider extends SliderComponent {
      constructor() {
        super();

        this.addEventListener('visible', this.init.bind(this));
        this.addEventListener('slideChanged', this.slideChange.bind(this));
      }

      init() {
        // Bind page number click event
        this.sliderControlLinksArray = Array.from(this.querySelectorAll('.slider-counter__link'));
        this.sliderControlLinksArray.forEach((controlLink) =>
          controlLink.addEventListener('click', this.linkToSlide.bind(this)),
        );

        this.slideChange();
        this.setAutoPlay();
      }

      linkToSlide(event) {
        event.preventDefault();
        this.slideTo(this.sliderControlLinksArray.indexOf(event.currentTarget) + 1);
      }

      slideChange() {
        if (this.sliderControlLinksArray.length) {
          const ACTIVE_CLASS = 'slider-counter__link--active';
          this.sliderControlLinksArray.forEach((link) => link.classList.remove(ACTIVE_CLASS));
          this.sliderControlLinksArray[this.currentPage - 1].classList.add(ACTIVE_CLASS);
        }

        // Restart Autoplay
        this.play();
      }

      setAutoPlay() {
        this.autoPlay = this.slider.dataset.autoplay === 'true';
        if (!this.autoPlay) return;
        this.autoPlaySpeed = this.slider.dataset.speed * 1000;
        this.play();
      }

      play() {
        if (!this.autoPlaySpeed) return;
        clearInterval(this._autoPlayTimer);
        this._autoPlayTimer = setInterval(
          () => this.slideTo((this.currentPage + 1) % this.totalPage || this.totalPage),
          this.autoPlaySpeed,
        );
      }

      pause() {
        clearInterval(this.autoplay);
      }
    },
);
