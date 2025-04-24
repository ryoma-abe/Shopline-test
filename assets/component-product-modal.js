defineCustomElement(
  'product-modal',
  () =>
    class ProductModal extends ModalDialog {
      constructor() {
        super();
        this.container = this.querySelector('[role="document"]');
        this.mediaVideoAutoPlay = this.getAttribute('data-video-autoplay') === 'true';
      }

      connectedCallback() {
        if (this.container) {
          this.container.addEventListener('scroll', this.checkDeferredMedia.bind(this));
        }
      }

      isInViewPort(element) {
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const { top, right, width, height } = element.getBoundingClientRect();

        return width > 0 && height > 0 && top >= 0 && right <= viewWidth && top <= viewHeight;
      }

      checkDeferredMedia() {
        if (!this.mediaVideoAutoPlay) return;
        const medias = this.container.querySelectorAll('.deferred-media');
        medias.forEach((el) => {
          if (this.isInViewPort(el)) {
            el.loadContent(false);
          }
        });
      }

      close() {
        super.close();
      }

      open(opener) {
        super.open(opener);
        this.showActiveMedia();
      }

      showActiveMedia() {
        this.querySelectorAll(
          `[data-media-id]:not([data-media-id="${this.openedBy.getAttribute('data-media-id')}"])`,
        ).forEach((element) => {
          element.classList.remove('active');
        });

        const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute('data-media-id')}"]`);
        activeMedia.classList.add('active');
        activeMedia.scrollIntoView();

        this.container.scrollLeft = (activeMedia.width - this.container.clientWidth) / 2;
      }
    },
);
