defineCustomElement('quick-add-modal', () => {
  return class QuickAddModal extends DetailsModal {
    constructor() {
      super();
      this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');
    }

    close() {
      this.modalContent.innerHTML = '';
      super.close().then(() => {
        document.body.dispatchEvent(new CustomEvent('modalClosed'));
      });
    }

    connectedCallback() {
      super.connectedCallback();
      if (this.moved) return;
      this.moved = true;
      document.body.appendChild(this);
    }

    observeCssParsed(opener) {
      const target = opener.closest('modal-opener');

      const onCssParsed = (event) => {
        if (event.animationName === 'cssParsed') {
          super.open(opener);
          this.loading = false;
          target.removeEventListener('animationstart', onCssParsed);
        }
      };

      target.addEventListener('animationstart', onCssParsed);
    }

    open(opener) {
      if (opener.classList.contains('loading')) {
        return;
      }

      opener.classList.add('loading');
      opener.querySelector('.loading-overlay__spinner').classList.add('display-flex');

      fetch(opener.getAttribute('data-product-url'))
        .then((response) => response.text())
        .then((responseText) => {
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          this.productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
          this.productElement.querySelector('.product').setAttribute('mount', 'quick-add-modal');
          this.productElement
            .querySelector('media-gallery')
            .setAttribute('data-parent-container', `#${this.modalContent.id}.${this.modalContent.className}`);
          this.preventDuplicatedIDs();
          this.removeDOMElements();

          // To avoid flickering use animations as a sign that style parsing is complete
          const flag = this.cssParsedFlag();
          this.observeCssParsed(opener);
          this.setInnerHTML(this.modalContent, this.productElement.innerHTML + flag);

          if (window.Shopline && window.Shopline.PaymentButton) {
            window.Shopline.PaymentButton.init();
          }
          this.preventVariantURLSwitching();
        })
        .finally(() => {
          opener.classList.remove('loading');
          opener.querySelector('.loading-overlay__spinner').classList.remove('display-flex');
        });
    }

    setInnerHTML(element, html) {
      
      element.innerHTML = html;

      // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
      element.querySelectorAll('script').forEach((oldScriptTag) => {
        const newScriptTag = document.createElement('script');
        Array.from(oldScriptTag.attributes).forEach((attribute) => {
          newScriptTag.setAttribute(attribute.name, attribute.value);
        });
        newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
        oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
      });
    }

    cssParsedFlag() {
      const html = `
        <style>
          @keyframes cssParsed {
            0% {
              opacity: 0.99;
            }
            100% {
              opacity: 1;
            }
          }

          [data-modal="#${this.id}"] {
            animation: 0.1s cssParsed;
          }

        </style>
      `;

      return html;
    }

    preventVariantURLSwitching() {
      const variantPicker = this.modalContent.querySelector('variant-radios,variant-selects');
      if (!variantPicker) return;

      variantPicker.setAttribute('data-update-url', 'false');
    }

    removeDOMElements() {
      const productModal = this.productElement.querySelector('product-modal');
      if (productModal) productModal.remove();

      const modalDialog = this.productElement.querySelectorAll('modal-dialog');
      if (modalDialog) modalDialog.forEach((modal) => modal.remove());
    }

    preventDuplicatedIDs() {
      const sectionId = this.productElement.dataset.section;
      this.productElement.innerHTML = this.productElement.innerHTML.replace(
        new RegExp(sectionId, 'g'),
        `quickadd-${sectionId}`,
      );
      this.productElement.querySelectorAll('variant-selects, variant-radios, product-info').forEach((variantSelect) => {
        
        variantSelect.dataset.originalSection = sectionId;
      });
    }
  };
});
