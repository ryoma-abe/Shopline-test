defineCustomElement(
  'header-modal',
  () =>
    class HeaderModal extends DetailsModal {
      constructor() {
        super();
        this.header = document.getElementById('shopline-section-header');
        this.focusToggle = true;
      }

      open() {
        this.header.classList.add('menu-open');
        super.open();
      }

      close() {
        super.close().then(() => {
          setTimeout(() => {
            this.header.classList.remove('menu-open');
          });
        });
      }
    },
);
