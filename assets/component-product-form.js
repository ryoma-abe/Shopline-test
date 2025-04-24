defineCustomElement('product-form', () => {
  return class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      if (!this.form) {
        return;
      }

      this.options = {
        onErrorShowToast: this.dataset.onErrorShowToast || false,
      };

      this.fetchInstance = Promise.resolve();
      const idInput = this.form.querySelector('[name=id]');
      idInput.disabled = false;
      this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer-entry');
      this.submitButton = this.querySelector('[type="submit"]');
      this.submitButton.addEventListener('click', this.submitButtonClickHandler.bind(this));
      // By default, if there is no variant id, it is disabled to prevent submission from in weak network conditions. Remove it after initializing js.
      const selectedOrFirstAvailableVariant = this.submitButton.getAttribute(
        'data-selected_or_first_available_variant',
      );
      if (selectedOrFirstAvailableVariant === 'true') {
        this.submitButton.disabled = false;
      }
    }

    // Because the editor hijack the a tag click event, the click event needs to be bound to prevent bubbling
    submitButtonClickHandler(e) {
      e.preventDefault();
      e.stopPropagation();
      this.onSubmitHandler();
    }

    onSubmitHandler() {
      if (this.submitButton.classList.contains('disabled') || this.submitButton.classList.contains('loading')) {
        return;
      }
      const formData = new FormData(this.form);
      const currentVariantId = formData.get('id');
      if (!currentVariantId) {
        window.Shopline.utils.toast.open({
          duration: 2000,
          content: t('products.product_list.select_product_all_options'),
        });
        return;
      }
      this.handleErrorMessage();

      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.add('display-flex');

      const config = window.fetchConfig();
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
      this.ensureQuantity(formData);
      formData.delete('returnTo');

      const isCartPage = document.body.getAttribute('data-template') === 'cart';
      if (this.cart && !isCartPage) {
        formData.append(
          'sections',
          this.cart.getSectionsToRender().map((section) => section.id),
        );
        formData.append('sections_url', window.location.pathname);
      }
      config.body = formData;
      const fetchInstance = fetch(`${window.routes.cart_add_url}`, config).then((response) => response.json());
      this.fetchInstance = fetchInstance;
      fetchInstance
        .then((response) => {
          if (response.message) {
            this.handleErrorMessage(response.message);
            const isQuickAdd = this.submitButton.classList.contains('quick-add__submit');
            if (!isQuickAdd) return response;
            this.submitButton.classList.add('disabled');
            this.submitButton.querySelector('span').classList.add('hidden');
            this.error = true;
            return response;
          }
          if (!this.cart || isCartPage) {
            window.location = window.routes.cart_url;
            return response;
          }

          this.error = false;
          const quickAddModal = this.closest('quick-add-modal');
          const SLQuickAddModal = (window.Shopline.utils || {}).quickAddModal;
          if (quickAddModal) {
            document.body.addEventListener(
              'modalClosed',
              () => {
                setTimeout(() => {
                  this.cart.renderContents(response);
                });
              },
              { once: true },
            );
            quickAddModal.close(true);
          } else if (SLQuickAddModal) {
            SLQuickAddModal.close().then(() => this.cart.renderContents(response));
          } else {
            this.cart.renderContents(response);
          }
          return response;
        })
        .catch((err) => {
          console.error('product form err', err);
          this.handleErrorMessage(this.getAttribute('data-default-error-message'));
        })
        .finally((response) => {
          this.submitButton.classList.remove('loading');
          this.querySelector('.loading-overlay__spinner').classList.remove('display-flex');
          return response;
        });
    }

    ensureQuantity(formData) {
      if (!formData.has('quantity')) {
        formData.set('quantity', '1');
      }
    }

    handleErrorMessage(errorMessage = false) {
      if (this.options.onErrorShowToast && errorMessage) {
        window.Shopline.utils.toast.open({
          content: errorMessage,
        });
      }
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  };
});

window.Shopline.loadFeatures(
  [
    {
      name: 'component-toast',
      version: '0.1',
    },
  ],
  function (error) {
    if (error) {
      throw error;
    }
  },
);
