defineCustomElement('price-per-item', () => {
  return class PricePerItem extends HTMLElement {
    constructor() {
      super();
      this.variantIdChangedUnSubscriber = undefined;
      this.variantId = this.dataset.variantId;
      this.input = document.getElementById(`Quantity-${this.dataset.sectionId || this.dataset.variantId}`);
      if (this.input) {
        this.input.addEventListener('change', this.onInputChange.bind(this));
      }

      this.getVolumePricingArray();
    }

    connectedCallback() {
      // Update variantId if variant is switched on product page
      this.variantIdChangedUnSubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
        this.variantId = event.data.variant.id.toString();
        this.getVolumePricingArray();
      });
    }

    disconnectedCallback() {
      if (this.variantIdChangedUnSubscriber) {
        this.variantIdChangedUnSubscriber();
      }
    }

    onInputChange() {
      this.updatePricePerItem();
    }

    updatePricePerItem(updatedCartQuantity) {
      if (this.input) {
        this.enteredQty = Number(this.input.value);
        this.step = Number(this.input.step);
      }

      this.currentQtyForVolumePricing = this.getCartQuantity(updatedCartQuantity) + this.enteredQty;

      for (let index = 0; index < this.qtyPricePairs.length; index++) {
        const [qty, price] = this.qtyPricePairs[index];
        if (this.currentQtyForVolumePricing >= qty) {
          const pricePerItemCurrent = document.querySelector(
            `price-per-item[id^="Price-Per-Item-${
              this.dataset.sectionId || this.dataset.variantId
            }"] .price-per-item span`,
          );
          console.log('pricePerItemCurrent', pricePerItemCurrent, this.qtyPricePairs[index]);
          pricePerItemCurrent.innerHTML = price;
          break;
        }
      }
    }

    getCartQuantity() {
      return 0;
    }

    getVolumePricingArray() {
      const volumePricing = document.getElementById(`Volume-${this.dataset.sectionId || this.dataset.variantId}`);
      this.qtyPricePairs = [];

      if (volumePricing) {
        volumePricing.querySelectorAll('li').forEach((li) => {
          const qty = parseInt(li.querySelector('span:first-child').textContent, 10);
          const price = li.querySelector('span:not(:first-child):last-child').dataset.text;
          this.qtyPricePairs.push([qty, price]);
        });
      }
      this.qtyPricePairs.reverse();
    }
  };
});
