defineCustomElement(
  'slide-pagination',
  () =>
    class SlidePagination extends HTMLElement {
      constructor() {
        super();
        // await SliderComponent init
        requestAnimationFrame(() => {
          this.init();
        });
      }

      init() {
        this.sliderId = this.dataset.sliderId;
        this.enabledClick = this.classList.contains('click');

        if (!this.sliderId) return;
        this.slider = document.querySelector(`#${this.sliderId}`);
        if (!this.slider) return;
        // find the web component
        while (this.slider) {
          if (this.slider instanceof SliderComponent) {
            break;
          }
          if (this.slider === document.body) {
            this.slider = null;
            break;
          }
          this.slider = this.slider.parentElement;
        }
        if (!this.slider) return;

        this.bullets = this.querySelectorAll('.slide-pagination-bullet');
        if (this.enabledClick) {
          this.initBulletClick();
        }
        this.slider.addEventListener('slideChanged', () => {
          this.updateProgress();
        });
        this.updateProgress();
      }

      initBulletClick() {
        this.bullets.forEach((bullet, index) => {
          bullet.addEventListener('click', () => {
            this.slider.slideTo(index + 1);
          });
        });
      }

      updateProgress() {
        if (!this.slider.totalPage) return;
        if (this.enabledClick) {
          this.bullets.forEach((bullet, index) => {
            bullet.classList.remove('is-active');
            if (index + 1 === this.slider.currentPage) {
              bullet.classList.add('is-active');
            }
          });
        } else {
          this.setAttribute('style', `--progress: ${(this.slider.currentPage / this.slider.totalPage) * 100}% `);
        }
      }
    },
);
