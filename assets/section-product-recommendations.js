defineCustomElement(
  'product-recommendations',
  () =>
    class ProductRecommendations extends HTMLElement {
      connectedCallback() {
        const handleIntersection = (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          observer.unobserve(this);

          fetch(this.dataset.url)
            .then((response) => response.text())
            .then((text) => {
              const html = document.createElement('div');
              html.innerHTML = text;
              const recommendations = html.querySelector('product-recommendations');

              if (recommendations && recommendations.innerHTML.trim().length) {
                this.innerHTML = recommendations.innerHTML;
              }
            })
            .catch((err) => {
              console.log('[product recommedations - error]', err);
            });
        };

        new IntersectionObserver(handleIntersection.bind(this), {
          rootMargin: '0px 0px 400px 0px',
        }).observe(this);
      }
    },
);
