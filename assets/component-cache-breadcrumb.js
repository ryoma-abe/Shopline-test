defineCustomElement('cache-breadcrumb', () => {
  return class CacheBreadcrumb extends HTMLElement {
    constructor() {
      super();
      window.sessionStorage.setItem(
        'breadcrumb',
        JSON.stringify({
          collection: this.dataset.collection,
          link: window.location.pathname + window.location.search,
        }),
      );
    }
  };
});
