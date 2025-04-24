defineCustomElement('quantity-input', () => {
  return class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('input');
      this.minusButton = this.querySelector('button[name="minus"]');
      this.plusButton = this.querySelector('button[name="plus"]');
      this.changeEvent = new Event('change', {
        bubbles: true,
      });
      this.quantityUpdateUnSubscriber = undefined;

      [this.minusButton, this.plusButton].forEach((button) =>
        button.addEventListener('click', this.onButtonClick.bind(this)),
      );

      this.input.addEventListener('blur', () => {
        this.onInputBlur();
      });

      this.input.addEventListener('change', () => {
        this.onInputChange();
      });
    }

    connectedCallback() {
      this.init();
      this.quantityUpdateUnSubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.onInputChange.bind(this));
    }

    disconnectedCallback() {
      if (this.quantityUpdateUnSubscriber) {
        this.quantityUpdateUnSubscriber();
      }
    }

    init() {
      this.onInputChange();
    }

    onButtonClick(event) {
      event.preventDefault();
      const previousValue = this.input.value;

      event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
      if (previousValue !== this.input.value) {
        this.input.dispatchEvent(this.changeEvent);
      }
    }

    onInputBlur() {
      const value = Number(this.input.value);
      const min = Number(this.input.min);
      const max = Number(this.input.max);

      const noValue = value !== 0 && !value;
      if (noValue || value < min) {
        this.input.value = min;
        this.input.dispatchEvent(this.changeEvent);
      } else if (value > max) {
        this.input.value = max;
        this.input.dispatchEvent(this.changeEvent);
      }
    }

    onInputChange() {
      const value = Number(this.input.value);
      const min = Number(this.input.min);
      const max = Number(this.input.max);

      if (min === value && max === value) {
        this.minusButton.classList.add('disabled');
        this.plusButton.classList.add('disabled');
        return;
      }

      if (value <= min) {
        this.plusButton.classList.remove('disabled');
        this.minusButton.classList.add('disabled');
      } else if (value >= max) {
        this.plusButton.classList.add('disabled');
        this.minusButton.classList.remove('disabled');
      } else {
        this.plusButton.classList.remove('disabled');
        this.minusButton.classList.remove('disabled');
      }
    }
  };
});
