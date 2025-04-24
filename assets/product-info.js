defineCustomElement('product-info', () => {
  return class ProductInfo extends HTMLElement {
    constructor() {
      super();
      this.sectionId = this.dataset.section;
      this.input = this.querySelector('.quantity__input');
      this.quantityForm = this.querySelector(`#Quantity-Form-${this.sectionId}`);
      this.currentVariant = this.querySelector('.product-variant-id');
      this.variantSelects = this.querySelector('variant-radios');
      this.submitButton = this.querySelector('[type="submit"]');
      this.variantChangeUnSubscriber = undefined;
    }

    connectedCallback() {
      if (!this.input || !this.quantityForm) return;
      this.setQuantityBoundary();
      this.variantChangeUnSubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
        const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;
        if (event.data.sectionId !== sectionId) return;
        this.updateQuantityRules(event.data.sectionId, event.data.html);
        this.setQuantityBoundary();
      });
    }

    disconnectedCallback() {
      if (this.variantChangeUnSubscriber) {
        this.variantChangeUnSubscriber();
      }
    }

    setQuantityBoundary() {
      const data = {
        cartQuantity: this.input.dataset.cartQuantity ? Number(this.input.dataset.cartQuantity) : 0,
        min: this.input.dataset.min ? Number(this.input.dataset.min) : 1,
        max: this.input.dataset.max ? Number(this.input.dataset.max) : null,
        step: this.input.step ? Number(this.input.step) : 1,
      };

      let { min } = data;
      const max = data.max === null ? data.max : data.max - data.cartQuantity;
      if (max !== null) min = Math.min(min, max);
      if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

      this.input.min = min;
      this.input.max = max;
      this.input.value = min;
      publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
    }

    updateQuantityRules(sectionId, html) {
      const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`);
      const selectors = ['.quantity__input', '.quantity__rules', '.quantity__label'];

      for (let index = 0; index < selectors.length; index++) {
        const selector = selectors[index];
        const current = this.quantityForm.querySelector(selector);
        const updated = quantityFormUpdated.querySelector(selector);
        if (current && updated) {
          if (selector === '.quantity__input') {
            const attributes = ['data-cart-quantity', 'data-min', 'data-max', 'step'];
            attributes.forEach((attribute) => {
              const valueUpdated = updated.getAttribute(attribute);
              if (valueUpdated !== null) current.setAttribute(attribute, valueUpdated);
            });
          } else {
            current.innerHTML = updated.innerHTML;
          }
        }
      }
    }
  };
});
