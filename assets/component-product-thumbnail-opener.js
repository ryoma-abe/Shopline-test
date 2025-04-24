defineCustomElement('product-thumbnail-opener', () => {
  return class ModalOpener extends HTMLElement {
    constructor() {
      super();

      const button = this.querySelector('button');

      this.handleMagnifier();

      if (!button) return;
      button.addEventListener('click', (e) => {
        if (this.enableHover) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        const modalId = this.getAttribute('data-modal').slice(1);
        const modals = document.querySelectorAll(`[id="${modalId}"]`);
        const targetModal = modals[modals.length - 1];
        if (targetModal) targetModal.open(button);
      });
    }

    get enableHover() {
      return this.getAttribute('data-pc-magnifier-type') === 'hover' && !detectingScreen().isMobileScreen;
    }

    handleMagnifier() {
      if (this.enableHover) {
        const container = this.querySelector('.product__media');
        const button = this.querySelector('button');
        const img = container.querySelector('img');

        const hoverImg = document.createElement('img');
        const zoom = 1.5;
        hoverImg.className = 'magnifier-hover-img';
        hoverImg.style.opacity = 0;
        hoverImg.src = img.src;

        container.appendChild(hoverImg);

        button.addEventListener('mousemove', (e) => {
          if (!this.enableHover) {
            return;
          }
          const rect = container.getBoundingClientRect();
          const height = Math.max(container.dataset.height, rect.height) * zoom;
          const width = Math.max(container.dataset.width, rect.width) * zoom;
          hoverImg.style.height = `${height}px`;
          hoverImg.style.width = `${width}px`;

          hoverImg.style.opacity = 1;
          img.style.opacity = 0;
          const mx = e.clientX - rect.x;
          const my = e.clientY - rect.y;
          hoverImg.style.left = `${-width * (mx / rect.width) + mx}px`;
          hoverImg.style.top = `${-height * (my / rect.height) + my}px`;
        });

        button.addEventListener('mouseleave', () => {
          if (!this.enableHover) {
            return;
          }
          hoverImg.style.opacity = 0;
          img.style.opacity = 1;
        });
      }
    }
  };
});
