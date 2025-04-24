defineCustomElement(
  'product-recently-viewed',
  () =>
    class ProductRecommendations extends HTMLElement {
      connectedCallback() {
        const handleIntersection = (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          observer.unobserve(this);

          const cacheKey = 'recently_viewed_products_ids';
          const cacheString = localStorage.getItem(cacheKey) || '[]';
          let ids = [];
          try {
            ids = JSON.parse(cacheString);
          } catch (error) {
            console.warn('[recently_viewed_products_ids parse - error]', error);
          }
          if (ids?.length > 0) {
            const { origin, search } = window.location;
            const { sectionTemplate, sectionId, productId } = this.dataset;

            const fetchParams = new URLSearchParams(search);
            fetchParams.append('section_template', sectionTemplate);
            fetchParams.append('section_id', sectionId);

            // filter out current product if in productDetail page
            if (productId) {
              ids = ids.filter((id) => id !== productId);
            }
            fetchParams.append('q', ids);

            const searchUrl = `${origin}/search?${fetchParams.toString()}`;
            fetch(searchUrl)
              .then((response) => response.text())
              .then((text) => {
                const html = document.createElement('div');
                html.innerHTML = text;
                const targetContainer = html.querySelector('product-recently-viewed');

                if (targetContainer && targetContainer.innerHTML.trim().length) {
                  this.innerHTML = targetContainer.innerHTML;
                }
              })
              .catch((err) => {
                console.warn('product-recently-viewed csr error:', err);
              });
          }
        };

        new IntersectionObserver(handleIntersection.bind(this), {
          rootMargin: '0px 0px 400px 0px',
        }).observe(this);
      }
    },
);
