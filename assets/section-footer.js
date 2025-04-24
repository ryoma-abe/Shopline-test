defineCustomElement(
  'footer-menu',
  () =>
    class FooterMenu extends HTMLElement {
      constructor() {
        super();
        this.head = this.querySelector('.footer-block__heading');
        this.panel = this.querySelector('.footer-block__details-content');

        detectingScreen(({ isMobileScreen }) => {
          if (isMobileScreen) {
            const fn = this.handleMenuCollapse.bind(this);
            this.head?.addEventListener('click', fn);
            return () => {
              this.head?.removeEventListener('click', fn);
            };
          }
        }, true);
      }

      handleMenuCollapse() {
        const isClosed = this.getAttribute('open') == null;

        const doAnimate = () => {
          const animate = [
            { height: 0, opacity: 0 },
            {
              height: `${this.panel.getBoundingClientRect().height}px`,
              opacity: 1,
            },
          ];
          if (!isClosed) {
            animate.reverse();
          }
          return this.panel.animate(animate, {
            iterations: 1,
            duration: 200,
            easing: 'ease',
          });
        };

        if (isClosed) {
          this.toggleAttribute('open');
          doAnimate();
        } else {
          doAnimate().onfinish = () => {
            this.toggleAttribute('open');
          };
        }
      }

      openMenu() {
        detectingScreen(({ isMobileScreen }) => {
          if (isMobileScreen) {
            this.toggleAttribute('open', false);
            this.handleMenuCollapse();
          }
        }, true);
      }

      closeMenu() {
        detectingScreen(({ isMobileScreen }) => {
          if (isMobileScreen) {
            this.toggleAttribute('open', true);
            this.handleMenuCollapse();
          }
        }, true);
      }
    },
);
