defineCustomElement(
  'main-product-detail',
  () =>
    class MainProduct extends HTMLElement {
      connectedCallback() {
        this.pageHeader = document.querySelector('header-layout');
        this.pageHeader.bindStickyCallback(this.onHeaderSticky.bind(this));
        this.stickyElements = this.querySelectorAll('.product__column-sticky');

        this.onViewProductDetail();
      }

      onViewProductDetail() {
        const cacheKey = 'recently_viewed_products_ids';
        const { productId } = this.dataset;

        if (productId) {
          let recentlyViewedProducts = localStorage.getItem(cacheKey);
          try {
            if (recentlyViewedProducts) {
              recentlyViewedProducts = JSON.parse(recentlyViewedProducts);
            } else {
              recentlyViewedProducts = [];
            }
            if (recentlyViewedProducts.includes(productId)) {
              recentlyViewedProducts = recentlyViewedProducts.filter((id) => id !== productId);
            }
            recentlyViewedProducts.unshift(String(productId));

            if (recentlyViewedProducts.length > 13) {
              recentlyViewedProducts = recentlyViewedProducts.slice(0, 13);
            }
            localStorage.setItem(cacheKey, JSON.stringify(recentlyViewedProducts));
          } catch (error) {
            console.warn('set rentlyViewedProducts error', error);
          }
        }
      }

      onHeaderSticky(data) {
        const { sticking, height, top } = data;

        this.stickyElements.forEach((element) => {
          if (sticking) {
            const myTop = top + height;
            element.style.top = `${myTop}px`;
          } else {
            element.style = null;
          }
        });
      }
    },
);
