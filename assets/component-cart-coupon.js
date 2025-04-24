defineCustomElement('cart-coupon', () => {
  return class CartCoupon extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('input');
      this.submitButton = this.querySelector('.coupon__button');
      this.couponList = this.querySelector('.cart__coupon-list');
      this.errorTips = this.querySelector('.coupon-error-message');

      this.init();
    }

    init() {
      this.bindClose();
      this.bindSubmit();
    }

    bindClose() {
      this.couponList.addEventListener('click', (e) => {
        const target = e.target.closest('.coupon__close');
        if (!target) {
          return;
        }
        const item = target.closest('.coupon__list-item');
        const { code } = item.dataset;
        this.remove(code)
          .then((res) => res.json())
          .then((res) => {
            if (res.message) {
              this.showError(res.message);
              return;
            }

            this.updateCartInfo(res);
          });
      });
    }

    bindSubmit() {
      this.input.addEventListener('keyup', (e) => {
        if (e.code === 'Enter') {
          this.submit();
        }
      });
      this.submitButton.addEventListener('click', () => this.submit());
    }

    submit() {
      const code = this.input.value;

      if (this.disabled) {
        return;
      }

      this.toggleLoading(true);
      this.apply(code)
        .then((res) => res.json())
        .then((res) => {
          this.toggleLoading(false);

          if (res.message) {
            this.showError(res.message);
            return;
          }

          this.input.value = '';
          this.updateCartInfo(res);
        });
    }

    updateCartInfo(res) {
      this.getSectionsToRender().forEach((section) => {
        const sectionElement = document.getElementById(section.id);
        if (!sectionElement) {
          return;
        }
        const replaceHtml = (selector) => {
          const elementToReplace = sectionElement.querySelector(selector) || sectionElement;
          elementToReplace.innerHTML = this.getSectionInnerHTML(res.sections[section.section], selector);
        };

        if (Array.isArray(section.selectors)) {
          section.selectors.forEach((selector) => {
            replaceHtml(selector);
          });
        } else {
          replaceHtml(section.selector);
        }
      });

      window.Shopline.AdditionalButton.init();
    }

    apply(code) {
      const config = window.fetchConfig();
      config.body = JSON.stringify({
        code,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname,
      });
      return fetch(window.routes.cart_discount_code_apply_url, config);
    }

    remove(code) {
      const config = window.fetchConfig();
      config.body = JSON.stringify({
        code,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname,
      });
      return fetch(window.routes.cart_discount_code_remove_url, config);
    }

    toggleLoading(loading) {
      if (loading) {
        this.submitButton.classList.add('loading');
      } else {
        this.submitButton.classList.remove('loading');
      }
    }

    showError(msg) {
      this.querySelector('.coupon__input').classList.add('field--error');
      this.errorTips.innerHTML = msg;
    }

    getSectionInnerHTML(html, selector) {
      return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
    }

    getSectionsToRender() {
      const url = window.location.pathname;
      const inCartPage = url === window.routes.cart_url;

      let sections = [
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
          id: 'cart-drawer',
          section: 'cart-drawer',
          selectors: ['.cart-drawer__inner', '.cart-fixed-checkout'],
        },
      ];

      if (inCartPage) {
        sections = [
          ...sections,
          {
            id: 'main-cart-items',
            section: document.getElementById('main-cart-items').dataset.id,
            selector: '.main-cart-items-container',
          },
          {
            id: 'main-cart-footer',
            section: document.getElementById('main-cart-footer').dataset.id,
            selectors: ['.cart__checkout-subtotal', '.cart-fixed-checkout'],
          },
        ];
      }

      return sections;
    }
  };
});
