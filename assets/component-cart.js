defineCustomElement(
  'cart-remove-button',
  () =>
    class CartRemoveButton extends HTMLElement {
      constructor() {
        super();
        this.addEventListener('click', (event) => {
          event.preventDefault();
          const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
          const currentCartItem = event.target.closest('.cart-item');
          const currentCartItemKey = currentCartItem.dataset.key;
          const currentCartItemQuantity = currentCartItem.querySelector('.cart-item__quantity [name="quantity"]').value;
          // Get the same product quantity（Certain marketing campaigns may generate）
          const sameProductQuantity = Array.from(
            cartItems.querySelectorAll(`[data-key="${currentCartItemKey}"] .cart-item__quantity [name="quantity"]`),
          ).reduce((total, quantityInput) => total + parseInt(quantityInput.value, 10), 0);
          cartItems.updateQuantity(currentCartItemKey, sameProductQuantity - currentCartItemQuantity);
        });
      }
    },
);

defineCustomElement(
  'cart-item-quantity',
  () =>
    class CartItemQuantity extends HTMLElement {
      constructor() {
        super();
        this.volumePricingPopover = this.querySelector('.cart-item__volume-pricing-wrapper summary');
        if (this.volumePricingPopover) {
          this.volumePricingPopover.addEventListener('focusout', this.closePopover.bind(this));
        }
      }

      closePopover(event) {
        event.preventDefault();
        this.volumePricingPopover.parentElement.removeAttribute('open');
      }
    },
);

defineCustomElement(
  'cart-items',
  () =>
    class CartItems extends HTMLElement {
      constructor() {
        super();

        this.debouncedOnChange = window.debounce((event) => {
          this.onChange(event);
        }, 300);

        this.currentItemCount = Array.from(this.querySelectorAll('.cart-item__quantity [name="quantity"]')).reduce(
          (total, quantityInput) => total + parseInt(quantityInput.value, 10),
          0,
        );

        this.addEventListener('change', this.debouncedOnChange.bind(this));
      }

      onChange(event) {
        const cartItemKey = event.target.closest('.cart-item').dataset.key;
        // Get the same product quantity（Certain marketing campaigns may generate）
        const sameProductQuantity = Array.from(
          this.querySelectorAll(`[data-key="${cartItemKey}"] .cart-item__quantity [name="quantity"]`),
        ).reduce((total, quantityInput) => total + parseInt(quantityInput.value, 10), 0);
        this.updateQuantity(cartItemKey, sameProductQuantity);
      }

      getSectionsToRender() {
        const filterNoExistElem = (item) => {
          const foundElement =
            document.getElementById(item.id).querySelector(item.selector) || document.getElementById(item.id);
          return Boolean(foundElement);
        };
        const mainCartItemsDataset = document.getElementById('main-cart-items').dataset;
        const showFixedCheckout = mainCartItemsDataset.showFixedCheckout === 'true';
        const enableDiscount = mainCartItemsDataset.enableDiscount === 'true';

        return [
          {
            id: 'main-cart-items',
            section: document.getElementById('main-cart-items').dataset.id,
            selector: '.main-cart-items-container',
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
          {
            id: 'main-cart-footer',
            section: document.getElementById('main-cart-footer').dataset.id,
            selectors: [
              enableDiscount ? { selector: '.cart__coupon-wrapper', outer: true } : null,
              '.cart__amount-wrapper',
              showFixedCheckout ? '.cart-fixed-checkout__amount' : null,
              '.cart-fixed-checkout__footer .cart__total',
            ],
          },
        ].filter(filterNoExistElem);
      }

      updateQuantity(id, quantity) {
        if (!id) return;
        this.enableLoading(id);
        const body = JSON.stringify({
          id,
          quantity,
          sections: this.getSectionsToRender().map((section) => section.section),
          sections_url: window.location.pathname,
        });

        fetch(`${window.routes.cart_change_url}`, {
          ...window.fetchConfig(),
          ...{
            body,
          },
        })
          .then((response) => {
            return response.text();
          })
          .then((state) => {
            const parsedState = JSON.parse(state);
            const quantityElement =
              document.getElementById(`Quantity-${id}`) || document.getElementById(`Drawer-quantity-${id}`);
            const cartItems = document.querySelector('cart-items');

            if (parsedState.message) {
              quantityElement.value = quantityElement.getAttribute('value');
              this.updateLiveRegions(id, parsedState.message);
              return;
            }
            const cartFooter = document.getElementById('main-cart-footer');
            if (cartItems) cartItems.classList.toggle('cart-empty', parsedState.item_count === 0);
            if (cartFooter) cartFooter.classList.toggle('cart-empty', parsedState.item_count === 0);

            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              const cartDrawerWrapper = cartDrawer.querySelector('.cart-drawer__inner-wrapper');
              const cartDrawerFixedCheckout = cartDrawer.querySelector('.cart-fixed-checkout');
              if (cartDrawerWrapper) {
                cartDrawerWrapper.classList.toggle('cart-empty', parsedState.item_count === 0);
              }
              if (cartDrawerFixedCheckout) {
                cartDrawerFixedCheckout.classList.toggle('cart-empty', parsedState.item_count === 0);
              }
            }
            const replaceElement = (section, selectorOrOption) => {
              const selectorOption =
                typeof selectorOrOption === 'string'
                  ? {
                      selector: selectorOrOption,
                    }
                  : selectorOrOption;
              const { selector, outer } = selectorOption;

              const elementToReplace =
                document.getElementById(section.id).querySelector(selector) || document.getElementById(section.id);
              const html = parsedState.sections[section.section];

              if (outer) {
                elementToReplace.outerHTML = this.getSectionOuterHTML(html, selector);
              } else {
                elementToReplace.innerHTML = this.getSectionInnerHTML(html, selector);
              }
            };

            this.getSectionsToRender().forEach((section) => {
              if (Array.isArray(section.selectors)) {
                section.selectors.filter(Boolean).forEach((selector) => {
                  replaceElement(section, selector);
                });
              } else if (section.selector) {
                replaceElement(section, section.selector);
              }
            });

            window.Shopline.AdditionalButton.init();

            let message = '';
            // over stock case
            if (this.currentItemCount === parsedState.item_count) {
              message = window.t('cart.cart_quantity_error_html', {
                quantity: quantityElement.getAttribute('value'),
              });
              this.updateLiveRegions(id, message);
            }
            this.currentItemCount = parsedState.item_count;
          })
          .catch((err) => {
            console.log('catch', err);
            this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.remove('loading'));
            const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
            errors.textContent = window.t('cart.cart_error');
          })
          .finally(() => {
            this.disableLoading(id);
          });
      }

      updateLiveRegions(id, message) {
        const lineItemError =
          document.getElementById(`Line-item-error-${id}`) ||
          document.getElementById(`Line-item-error-CartDrawer-${id}`);

        const cartItemErrorText = lineItemError.querySelector('.cart-item__error-text');
        cartItemErrorText.innerHTML = message;
      }

      getSectionInnerHTML(html, selector) {
        return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
      }

      getSectionOuterHTML(html, selector) {
        return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).outerHTML;
      }

      enableLoading(id) {
        const mainCartItems =
          document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
        mainCartItems.classList.add('cart__items--disabled');

        const cartItemElements = this.querySelectorAll(`.cart-item[data-key="${id}"] .loading-overlay`);

        [...cartItemElements].forEach((overlay) => overlay.classList.add('loading'));
      }

      disableLoading(id) {
        const mainCartItems =
          document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
        mainCartItems.classList.remove('cart__items--disabled');

        const cartItemElements = this.querySelectorAll(`.cart-item[data-key="${id}"] .loading-overlay`);

        [...cartItemElements].forEach((overlay) => overlay.classList.remove('loading'));
      }
    },
);
