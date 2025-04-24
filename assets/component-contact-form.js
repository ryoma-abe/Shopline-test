// Form languageData form submit
class ContactForm extends HTMLElement {
  constructor() {
    super();
    this.formDom = this.querySelector('form');
    if (!this.formDom) return;
    const btnSubmit = this.formDom.querySelector("button[type='submit']");
    btnSubmit.addEventListener('click', this.languageAssignment.bind(this));
  }

  languageAssignment() {
    const inputs = this.formDom.elements;
    const translateInput = this.formDom.querySelector('input[name=_translate]');
    const translate = {};
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const title = input.getAttribute('title');
      const name = input.getAttribute('name');
      if (/contact|attribute\[[\w]+\]/.test(name)) {
        translate[name] = title;
      }
    }
    translateInput.setAttribute('value', JSON.stringify(translate));
  }
}
defineCustomElement('contact-form', () => ContactForm);
