defineCustomElement(
  'multilevel-filter',
  () =>
    class MultilevelFilter extends BaseElement {
      constructor() {
        super();

        this.selectors = Array.from(this.querySelectorAll('.multilevel-filter__selector-input'));
        this.form = this.querySelector('.multilevel-filter__form');

        this.addEventListener('visible', () => this.initSelector(this.selectors[0]), { once: true });
        this.selectors.forEach((selector, index) =>
          selector.addEventListener('change', this.onSelectorChange.bind(this, selector, index)),
        );
      }

      get fetchFiltersUrl() {
        const uri = new URL(this.form.action);
        uri.searchParams.set('section_id', 'collection-filters');
        this.selectors.forEach((selector) => {
          if (selector.value && selector.name) {
            uri.searchParams.append(selector.name, selector.value);
          }
        });
        return uri.toString();
      }

      async getFilters() {
        this.fetchController?.abort('stop request');
        this.fetchController = new AbortController();

        const response = await fetch(this.fetchFiltersUrl, {
          signal: this.fetchController.signal,
        });
        const responseHTML = await response.text();
        const responseDom = window.createDom(responseHTML);
        const allFilters = JSON.parse(responseDom.querySelector('#filters').textContent || '[]');

        return new Map(allFilters.filter((filter) => filter.type === 'list').map((filter) => [filter.label, filter]));
      }

      async initSelector(targetSelector) {
        try {
          const currentIndex = this.selectors.findIndex((selector) => selector === targetSelector);
          const updateSelectors = this.selectors.slice(currentIndex);

          updateSelectors.forEach((selector) => {
            // Reset selector status
            selector.value = '';
            selector.loading = false;
            selector.disabled = true;
            selector.options = [];
          });

          targetSelector.loading = true;

          const filters = await this.getFilters();
          const targetFilter = filters.get(targetSelector.dataset.filter);

          if (targetFilter) {
            targetSelector.options = targetFilter.values
              .filter((item) => item.count > 0 && !item.active)
              .map((item) => ({
                value: item.value,
                label: item.label,
                selected: item.active,
                disabled: false,
              }));
            targetSelector.name = targetFilter.param_name;
          }

          targetSelector.disabled = false;
        } finally {
          targetSelector.loading = false;
        }
      }

      async onSelectorChange(targetSelector, index) {
        const nextSelector = this.selectors[index + 1];

        if (!targetSelector.value || !nextSelector) return;

        await this.initSelector(nextSelector);

        !window.isMobileScreen() && nextSelector.open();
      }
    },
);
