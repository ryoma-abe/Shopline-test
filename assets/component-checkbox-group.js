defineCustomElement(
  'checkbox-group',
  () =>
    class CheckboxGroup extends HTMLElement {
      constructor() {
        super();

        this.init();
      }

      get type() {
        return this.getAttribute('type') || 'checkbox';
      }

      get inputs() {
        return Array.from(this.querySelectorAll(`input[type="${this.type}"]`));
      }

      init() {
        this._updateInputStatus();
        this.addEventListener('change', (event) => {
          if (event.target.type !== this.type) return;
          this._updateInputStatus();
        });
      }

      _updateInputStatus() {
        this.inputs.forEach((radio) => {
          const label = radio.closest('label');
          if (!label) return;
          label[radio.checked ? 'setAttribute' : 'removeAttribute']('checked', radio.checked);
        });
      }
    },
);
