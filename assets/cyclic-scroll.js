defineCustomElement(
  'cyclic-scroll',
  () =>
    class CyclicScroll extends HTMLElement {
      constructor() {
        super();

        this.container = this.querySelector('.cyclic-scroll__container');
        this.resizeFn = debounce(() => {
          this.fillItem();
        }, 200);

        this.init();
      }

      init() {
        this.fillItem();
        this.bindResize();
      }

      bindResize() {
        window.addEventListener('resize', this.resizeFn);
      }

      unbindResize() {
        window.removeEventListener('resize', this.resizeFn);
      }

      fillItem() {
        if (!this.container) return;

        const inner = this.container.querySelectorAll('.cyclic-scroll__inner');

        // should stop when init
        if (!this.container.classList.contains('cyclic-scroll-stop')) {
          this.pause();
        }

        const windowWidth = window.innerWidth;
        const containerWidth = this.container.clientWidth;
        const innerItem = inner?.[0];
        const innerWidth = innerItem?.clientWidth;

        let num = Math.ceil((windowWidth + innerWidth - containerWidth) / innerWidth);

        if (num <= 0 || innerWidth <= 0 || !inner.length) {
          this.play();
          return;
        }

        while (num >= 0) {
          this.container.appendChild(innerItem?.cloneNode(true));
          --num;
        }
        this.play();
      }

      disconnectedCallback() {
        this.unbindResize();
      }

      pause() {
        this.container.classList.add('cyclic-scroll-stop');
      }

      play() {
        this.container.classList.remove('cyclic-scroll-stop');
        this.container.classList.remove('cyclic-scroll-clear-animation');
      }

      clearAnimation() {
        this.container.classList.add('cyclic-scroll-clear-animation');
      }

      scrollTo(index = 0) {
        this.pause();
        this.clearAnimation();

        const allInners = this.querySelectorAll('.cyclic-scroll__inner');
        const inner = allInners[0];
        const allItems = inner.querySelectorAll('.cyclic-scroll__item');
        const item = allItems[index];

        if (item) {
          this.container.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
        }
      }
    },
);
