defineCustomElement(
  'cart-drawer-entry',
  () =>
    class CartDrawerEntry extends HTMLElement {
      constructor() {
        super();
        // getElementsByTagName updates itself automatically
        this.CartDrawer = document.getElementsByTagName('cart-drawer');
      }

      renderContents(parsedState) {
        this.getSectionsToRender().forEach((section) => {
          const sectionElement = section.selector
            ? document.querySelector(section.selector)
            : document.getElementById(section.id);
          sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
        });

        this.CartDrawer[0].open();

        window.Shopline.AdditionalButton.init();
      }

      getSectionInnerHTML(html, selector = '.shopline-section') {
        return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
      }

      getSectionsToRender() {
        return [
          {
            id: 'cart-drawer',
            selector: '.cart-drawer__body',
          },
          {
            id: 'cart-icon-bubble',
            selector: '#cart-icon-bubble-wrapper',
          },
          {
            id: 'cart-icon-bubble-mobile',
            selector: '#cart-icon-bubble-wrapper-mobile',
          },
        ];
      }

      getSectionDOM(html, selector = '.shopline-section') {
        return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
      }

      open() {
        const cartDrawer = this.CartDrawer[0];
        cartDrawer.classList.add('animate', 'active');
        document.body.classList.add('overflow-hidden');
      }

      close() {
        const cartDrawer = this.CartDrawer[0];
        cartDrawer.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
        const fixedCheckoutContainer = cartDrawer.querySelector('.cart-fixed-checkout');

        if (fixedCheckoutContainer) {
          fixedCheckoutContainer.classList.add('collapsed');
        }
      }
    },
);

defineCustomElement(
  'cart-drawer',
  () =>
    
    class CartDrawer extends CartDrawerEntry {
      constructor() {
        super();
        this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
        this.setHeaderCartIconAccessibility();
        this.bindCartFooterToggleEvent();
      }

      setHeaderCartIconAccessibility() {
        const cartLink = document.querySelector('#cart-icon-bubble');
        cartLink.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.open(cartLink);
        });
        const mobileCartLink = document.querySelector('#cart-icon-bubble-mobile');
        mobileCartLink.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.open(mobileCartLink);
        });
      }

      bindCartFooterToggleEvent() {
        const container = this.querySelector('#CartDrawer');

        container.addEventListener('click', (event) => {
          const { target } = event;
          const fixedCheckoutContainer = container.querySelector('.cart-fixed-checkout');

          if (
            target.matches('.cart-fixed-checkout__dropdown-button') ||
            target.closest('.cart-fixed-checkout__dropdown-button')
          ) {
            fixedCheckoutContainer.classList.toggle('collapsed');
          }

          if (target.matches('.cart-drawer__dropdown-toggle') || target.closest('.cart-drawer__dropdown-toggle')) {
            fixedCheckoutContainer.classList.toggle('collapsed');
          }
        });
      }
    },
);

defineCustomElement(
  'cart-drawer-items',
  () =>
    
    class CartDrawerItems extends CartItems {
      getSectionsToRender() {
        return [
          {
            id: 'CartDrawer',
            section: 'cart-drawer',
            selector: '.cart-drawer__body',
          },
          {
            id: 'cart-icon-bubble',
            section: 'cart-icon-bubble',
            selector: '#cart-icon-bubble-wrapper',
          },
          {
            id: 'cart-icon-bubble-mobile',
            section: 'cart-icon-bubble-mobile',
            selector: '#cart-icon-bubble-wrapper-mobile',
          },
        ];
      }
    },
);
