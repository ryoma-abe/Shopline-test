defineCustomElement('color-swatch-radios', () => {
  return class ColorSwatchRadios extends HTMLElement {
    constructor() {
      super();

      this.classes = {
        loading: 'loading',
      };
      this.selectors = {
        cardWrapper: '.card-wrapper',
        priceWrapper: '.price',
        price: '.price__regular .price-item--regular',
      };

      this.init();

      const buttons = this.querySelectorAll('.swatch:not(.disabled)');
      buttons.forEach((button) => button.addEventListener('mouseenter', this.onEnterHandler.bind(this)));
      buttons.forEach((button) => button.addEventListener('mouseleave', this.onLeaveHandler.bind(this)));

      const inputs = this.querySelectorAll('.swatch:not(.disabled) input');
      inputs.forEach((input) => input.addEventListener('click', this.onClickHandler.bind(this)));
    }

    cacheElements() {
      this.container = this.closest(this.selectors.cardWrapper);
      this.cache = {
        priceWrapper: this.container.querySelector(this.selectors.priceWrapper),
        priceHTML: this.container.querySelector(this.selectors.priceWrapper).cloneNode(true).innerHTML,
      };
    }

    onClickHandler(event) {
      const input = event.currentTarget;
      const button = input.parentNode;
      const variantId = this.currentVariant.id;
      const productForm = this.container.querySelector('product-form');
      const productFormID = productForm.querySelector(`input[name="id"]`);
      const productFormButton = productForm.querySelector(`button[type="submit"]`);

      if (variantId) {
        input.setAttribute('disabled', '');
        button.classList.add(this.classes.loading);
        productFormID.value = variantId;
        productFormButton.dispatchEvent(
          new Event('click', {
            bubbles: true,
            cancelable: true,
          }),
        );
        productForm.fetchInstance.then((response) => {
          if (response.message) {
            //  error
            input.parentNode.classList.add('disabled');
          } else {
            input.removeAttribute('disabled');
          }
          button.classList.remove(this.classes.loading);
        });
      }
    }

    onEnterHandler(event) {
      const target = event.currentTarget;
      const input = target.querySelector('input');
      input.checked = true;

      this.onVariantChange();

      setTimeout(() => {
        this.cacheElements();
        this.updatePrice();
      });
    }

    onLeaveHandler() {
      this.cache.priceWrapper.innerHTML = this.cache.priceHTML;
    }

    onVariantChange() {
      this.updateOptions();
      this.updateMasterId();
    }

    init() {
      this.updateOptions();
      this.updateMasterId();
      this.setAvailability();
    }

    updatePrice() {
      // if (html.querySelector('color-swatch-radios')) return;
      const selector = '.price';
      const destination = this.container.querySelector(selector);
      const source = this.querySelector(
        `.variant-item-price[data-variants-id="${this.currentVariant.id}"] ${selector}`,
      );

      if (source && destination) destination.innerHTML = source.innerHTML;
    }

    updateOptions() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      this.options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked)?.value;
      });
    }

    updateMasterId() {
      if (!this.getVariantData()) return;
      this.currentVariant = this.variantData.find((variant) => {
        return !variant.options
          .map((option, index) => {
            return this.options[index] === option;
          })
          .includes(false);
      });
    }

    getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }

    setAvailability() {
      if (!this.currentVariant) return;

      this.querySelectorAll('.variant-input-wrapper').forEach((group) => {
        this.disableVariantGroup(group);
      });

      const currentlySelectedValues = this.currentVariant.options.map((value, index) => {
        return { value, index: `option${index + 1}` };
      });
      const initialOptions = this.createAvailableOptionsTree(this.variantData, currentlySelectedValues);

      Object.entries(initialOptions).forEach(([option, values]) => {
        this.manageOptionState(option, values);
      });
    }

    enableVariantOption(group, obj) {
      
      const value = obj.value.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
      const input = group.querySelector(`input[value="${value}"]`);

      if (!input) return;

      // Variant exists - enable & show variant
      input.removeAttribute('disabled');
      input.parentNode.classList.remove('disabled');

      // Variant sold out - cross out option (remains selectable)
      if (obj.soldOut) {
        input.setAttribute('disabled', '');
        input.parentNode.classList.add('disabled');
      }
    }

    disableVariantGroup(group) {
      group.querySelectorAll('input').forEach((input) => {
        input.setAttribute('disabled', '');
        input.parentNode.classList.add('disabled');
      });
    }

    manageOptionState(option, values) {
      const group = this.querySelector(`.variant-input-wrapper[data-option-index="${option}"]`);

      // Loop through each option value
      values.forEach((obj) => {
        this.enableVariantOption(group, obj);
      });
    }

    createAvailableOptionsTree(variants, currentlySelectedValues) {
      // Reduce variant array into option availability tree
      return variants.reduce(
        (options, variant) => {
          // Check each option group (e.g. option1, option2, option3) of the variant
          Object.keys(options).forEach((index) => {
            if (variant[index] === null) return;

            let entry = options[index].find((option) => option.value === variant[index]);

            if (typeof entry === 'undefined') {
              // If option has yet to be added to the options tree, add it
              entry = { value: variant[index], soldOut: true };
              options[index].push(entry);
            }

            const currentOption1 = currentlySelectedValues.find((selectedValue) => {
              return selectedValue.index === 'option1';
            });
            const currentOption2 = currentlySelectedValues.find((selectedValue) => {
              return selectedValue.index === 'option2';
            });
            switch (index) {
              case 'option1':
                // Option1 inputs should always remain enabled based on all available variants
                entry.soldOut = entry.soldOut && variant.available ? false : entry.soldOut;
                break;
              case 'option2':
                // Option2 inputs should remain enabled based on available variants that match first option group
                if (currentOption1 && variant.option1 === currentOption1.value) {
                  entry.soldOut = entry.soldOut && variant.available ? false : entry.soldOut;
                }
                break;
              case 'option3':
                // Option 3 inputs should remain enabled based on available variants that match first and second option group
                if (
                  currentOption1 &&
                  variant.option1 === currentOption1.value &&
                  currentOption2 &&
                  variant.option2 === currentOption2.value
                ) {
                  entry.soldOut = entry.soldOut && variant.available ? false : entry.soldOut;
                }
                break;
              default:
            }
          });

          return options;
        },
        { option1: [], option2: [], option3: [] },
      );
    }
  };
});
