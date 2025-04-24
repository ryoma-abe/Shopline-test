defineCustomElement('tool-tip', () => {
  return class Tooltip extends HTMLElement {
    constructor() {
      super();
      this.parentNode.classList.add('has_tool-tip');
    }

    toggle() {
      if (this.parentNode.classList.contains('tool-tip--open')) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.parentNode.classList.add('tool-tip--open');
    }

    close() {
      this.parentNode.classList.remove('tool-tip--open');
    }
  };
});
