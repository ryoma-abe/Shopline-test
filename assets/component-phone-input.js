defineCustomElement(
  'phone-input',
  () =>
    class PhoneInput extends HTMLElement {
      constructor() {
        super();
        this.init();
      }

      init() {
        this.countrySelect = this.querySelector('.country-select');
        if (this.countrySelect) {
          const span = this.querySelector('span[data-id="country-select-label"]');
          this.countrySelect.addEventListener('change', (e) => {
            span.innerText = `+${e.target.value}`;
          });

          const currentCountry =
            this.countrySelect.querySelector('option[selected="selected"]') ||
            this.countrySelect.querySelector('option');

          if (currentCountry) {
            this.countrySelect.value = currentCountry.value;
            span.innerText = `+${currentCountry.value}`;
          }
        }
      }
    },
);
