defineCustomElement('color-swatch', () => {
  return class ColorSwatch extends HTMLElement {
    constructor() {
      super();
      this.cached = {};
      this.variantId = this.dataset.variantId;
      this.container = this.closest('.card-wrapper');
      this.swatchList = this.closest('.card__colors');

      if (this.variantId) {
        this.addEventListener('mouseenter', this.onHoverHandler.bind(this));
        this.querySelector('a').addEventListener('click', (event) => event.preventDefault());
      } else {
        this.addEventListener('mouseenter', this.onHoverHandler.bind(this));
      }
    }

    onHoverHandler() {
      if (this.variantId) {
        this.singleAttrHandler();
        this.doubleAttrHandler();
      } else {
        this.updateTitle();
      }
      this.colorSwatchChange();
    }

    colorSwatchChange() {
      const image = this.container.querySelector('.card__media img');
      const currentSkuImage = this.querySelector('img');

      if (image !== null) {
        if (currentSkuImage !== null) {
          image.src = currentSkuImage.src;
          image.srcset = currentSkuImage.srcset;
        }

        const swatches = this.container.querySelectorAll('.color-swatch');
        swatches.forEach((swatch) => {
          swatch.classList.remove('is-active');
        });

        this.classList.add('is-active');
      }
    }

    singleAttrHandler() {
      if (Number(this.swatchList.dataset.propertyNumber) !== 1) {
        return;
      }
      this.updateTitle();
      this.colorSwatchFetch();
    }

    doubleAttrHandler() {
      if (Number(this.swatchList.dataset.propertyNumber) !== 2) {
        return;
      }
      this.updateTitle();
      this.colorSwatchFetch();
    }

    colorSwatchFetch() {
      const productUrl = `${this.querySelector('a.color-swatch__inner').href}&section_id=product-card-fragment`;

      if (this.cached[productUrl]) {
        this.renderProductInfo(this.cached[productUrl]);
        return;
      }

      fetch(productUrl)
        .then((response) => response.text())
        .then((responseText) => {
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          this.cached[productUrl] = responseHTML;
          this.renderProductInfo(responseHTML);
        })
        .catch((e) => {
          console.error(e);
        });
    }

    renderProductInfo(html) {
      this.updateButtons(html);
      this.updatePrice(html);
    }

    updateTitle() {
      const selector = '.product__title .color-suffix';
      const destination = this.container.querySelector(selector);

      if (this.title && destination) destination.innerHTML = `- ${this.title}`;
    }

    updatePrice(html) {
      const selector = '.price';
      const destination = this.container.querySelector(selector);
      const source = html.querySelector(selector);

      if (source && destination) destination.innerHTML = source.innerHTML;
    }

    updateButtons(html) {
      const destination = this.container.querySelector('.card__button');
      const source = html.querySelector('.card__button');

      if (source && destination) {
        destination.innerHTML = source.innerHTML;
      }

      destination.classList.remove('is-expanded');
      if (source.classList.contains('is-expanded')) destination.classList.add('is-expanded');

      const colorSwatchQuickAddBtn = destination.querySelector('.swatch__quick-add');

      if (colorSwatchQuickAddBtn && !colorSwatchQuickAddBtn.classList.contains('display-none')) {
        const cardHoverQuickAddBtn = this.container.querySelector('.card__center-actions .quick-add-button--hover');

        if (cardHoverQuickAddBtn) {
          cardHoverQuickAddBtn.classList.add('display-none');
        }
      }
    }
  };
});
