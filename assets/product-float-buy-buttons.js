defineCustomElement('product-float-buy-buttons', () => {
  return class FloatButton extends HTMLElement {
    constructor() {
      super();
      this.id = this.getAttribute('id');
      this.buttonLayout = this.getAttribute('data-button-layout');
      this.mainBuyButtons = document.getElementById(`${this.id}__wrapper`);
      this.floatBuyButtons = document.getElementById(`${this.id}-float__wrapper`)?.parentElement;

      this.init();
    }

    init() {
      // To avoid blocking the footer
      this.mutationObserver();
      this.setPlaceholderForFooter();
      if (this.buttonLayout === 'float') {
        this.floatBuyButtons.classList.add('show');
        return;
      }
      window.addEventListener('scroll', this.handleFloatBuyButtonsState.bind(this));
    }

    // observer payment button mount after change height
    mutationObserver() {
      const observer = new MutationObserver(() => {
        this.setPlaceholderForFooter();
      });
      const config = { childList: true, subtree: true };
      observer.observe(this.floatBuyButtons, config);
    }

    setPlaceholderForFooter() {
      const placeholderId = 'product-float-buy-buttons-placeholder';
      const floatBuyButtonsHeight = this.floatBuyButtons.offsetHeight;
      const floatButtonPlaceholder = document.getElementById(`${placeholderId}`);
      if (floatButtonPlaceholder) {
        floatButtonPlaceholder.style.height = `${floatBuyButtonsHeight}px`;
        return;
      }
      const placeholderDom = new DOMParser().parseFromString(
        `<div id=${placeholderId} class="display-none-desktop" style="height: ${floatBuyButtonsHeight}px"></div>`,
        'text/html',
      );
      document.body.appendChild(placeholderDom.querySelector(`#${placeholderId}`));
    }

    handleFloatBuyButtonsState() {
      requestAnimationFrame(() => {
        const triggerScrollHeight = this.mainBuyButtons ? this.mainBuyButtons.offsetTop : 0;
        const buffer = 30;
        if (window.scrollY > triggerScrollHeight + buffer) {
          this.floatBuyButtons.classList.add('show');
        } else {
          this.floatBuyButtons.classList.remove('show');
        }
      });
    }

    disconnectedCallback() {
      this.destroy();
    }

    destroy() {
      window.removeEventListener('scroll', this.handleFloatBuyButtonsState.bind(this));
    }
  };
});
