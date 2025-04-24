defineCustomElement('product-breadcrumb', () => {
  return class ProductBreadcrumb extends HTMLElement {
    constructor() {
      super();
      const breadCrumbCache = JSON.parse(
        window.sessionStorage.getItem('breadcrumb') ? window.sessionStorage.getItem('breadcrumb') : '""',
      );
      if (breadCrumbCache) {
        let link = this.querySelector(`.breadcrumb__collection [data-id="${breadCrumbCache.collection}"]`);
        if (link) {
          link.parentElement.href = breadCrumbCache.link || link.dataset.url;
        } else {
          link = this.querySelector(`.breadcrumb__collection span:first-child`);
          link.parentElement.href = link.dataset.url;
        }

        if (link) {
          link.classList.remove('display-none');
          this.classList.remove('display-none');
        }
      }
    }
  };
});
