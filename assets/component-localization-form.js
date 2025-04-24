class LocalizationForm extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      country: this.querySelector('input[name="country_code"]'),
      language: this.querySelector('input[name="locale_code"]'),
      form: this.querySelector('form'),
    };

    this.elements.country && this.elements.country.addEventListener('change', this.handleSubmit.bind(this));
    this.elements.language && this.elements.language.addEventListener('change', this.handleSubmit.bind(this));
  }

  handleSubmit() {
    this.elements.form.submit();
  }
}

defineCustomElement('localization-form', () => LocalizationForm);
