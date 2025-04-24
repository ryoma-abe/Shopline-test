defineCustomElement(
  'cart-notification',
  () =>
    class CartNotification extends HTMLElement {
      constructor() {
        super();

        this.notification = document.getElementById('cart-notification');
        this.header = document.querySelector('sticky-header');
        this.onBodyClick = this.handleBodyClick.bind(this);

        this.querySelectorAll('button[type="button"]').forEach((closeButton) => {
          closeButton.addEventListener('click', this.close.bind(this));
        });
        this.querySelector('.cart-notification__close').addEventListener('click', this.close.bind(this));
      }

      open() {
        this.notification.classList.add('animate', 'active');
        document.body.addEventListener('click', this.onBodyClick);
        if (!this.header) {
          this.notification.addEventListener(
            'transitionend',
            () => {
              window.scrollTo(0, 0);
            },
            { once: true },
          );
        }
      }

      close() {
        this.notification.classList.remove('active');
        document.body.removeEventListener('click', this.onBodyClick);
      }

      renderContents(parsedState) {
        this.cartItemKey = parsedState.key;
        this.getSectionsToRender().forEach((section) => {
          document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.id],
            section.selector,
          );
        });

        if (this.header) this.header.reveal();
        this.open();
      }

      getSectionsToRender() {
        return [
          {
            id: 'cart-notification-product',
            selector: `[id="cart-notification-product-${this.cartItemKey}"]`,
          },
          {
            id: 'cart-notification-button',
            selector: '.cart-notification-button',
          },
          {
            id: 'cart-icon-bubble',
            selector: '#cart-icon-bubble-wrapper',
          },
          {
            id: 'cart-icon-bubble-mobile',
            selector: '#cart-icon-bubble-wrapper-mobile',
          },
          {
            id: 'cart-notification-subtotal',
            selector: '.cart-notification-subtotal',
          },
        ];
      }

      getSectionInnerHTML(html, selector = '.shopline-section') {
        return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
      }

      handleBodyClick(evt) {
        const { target } = evt;
        if (target !== this.notification && !target.closest('cart-notification')) {
          this.close();
        }
      }
    },
);
