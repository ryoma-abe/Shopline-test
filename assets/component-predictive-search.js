defineCustomElement(
  'predictive-search',
  () =>
    class PredictiveSearch extends BaseElement {
      constructor() {
        super();

        this.cachedResults = {};
        this.input = this.querySelector('input[type="search"]');
        this.predictiveSearchResults = this.querySelector('[data-predictive-search]');

        this.setupEventListeners();
        this.initSearchItem();
        this.resizeWidth();
      }

      resizeWidth() {
        window.addEventListener('resize', this.initSearchItem.bind(this));
      }

      initSearchItem() {
        const detail = this.getBoundingClientRect();
        if (detail.width > 1200) {
          this.setAttribute('data-col', 4);
        } else if (detail.width > 980) {
          this.setAttribute('data-col', 3);
        } else if (detail.width > 600) {
          this.setAttribute('data-col', 2);
        } else {
          this.setAttribute('data-col', 1);
        }
      }

      get isOpen() {
        return this.getAttribute('open') === 'true';
      }

      get showSuggestedMenu() {
        const show = this.getAttribute('data-show-suggested-menu') === 'true' && !this.input.value;
        if (show) {
          this.setAttribute('data-show-menu', true);
        } else {
          this.removeAttribute('data-show-menu');
        }
        return show;
      }

      get query() {
        return this.input.value.trim();
      }

      get resultsMaxHeight() {
        return window.innerHeight - document.getElementById('shopline-section-header').getBoundingClientRect().bottom;
      }

      get loading() {
        return this.getAttribute('loading') === 'true';
      }

      set loading(isLoading) {
        if (isLoading) {
          this.setAttribute('loading', true);
        } else {
          this.removeAttribute('loading');
        }
      }

      setupEventListeners() {
        const form = this.querySelector('form.search');
        form.addEventListener('submit', this.onFormSubmit.bind(this));

        this.input.addEventListener('input', window.debounce(this.onChange.bind(this), 300));
        this.input.addEventListener('focus', this.onFocus.bind(this));
        this.addEventListener('focusout', this.onFocusOut.bind(this));
        this.addEventListener('keyup', this.onKeyup.bind(this));
        this.addEventListener('keydown', this.onKeydown.bind(this));
        if (this.input.attributes?.autofocus) {
          this.onFocus();
        }
      }

      onFormSubmit(event) {
        if (!this.query.length) event.preventDefault();
      }

      onChange() {
        const searchTerm = this.query;
        if (this.showSuggestedMenu) {
          this.open();
          return;
        }
        if (!searchTerm.length) return this.close(true);

        this.getSearchResults(searchTerm);
      }

      onFocus() {
        this.initSearchItem();
        this.setAttribute('data-focus', true);
        const searchTerm = this.query;

        if (this.showSuggestedMenu) {
          this.open();
          return;
        }

        if (!searchTerm.length) return;

        if (this.getAttribute('results') === 'true') {
          this.open();
        } else {
          this.getSearchResults(searchTerm);
        }
      }

      onFocusOut() {
        setTimeout(() => {
          if (!this.contains(document.activeElement)) {
            this.removeAttribute('data-focus');
            this.close();
          }
        });
      }

      onKeyup(event) {
        if (!this.query.length) this.close(true);
        event.preventDefault();

        switch (event.code) {
          case 'ArrowUp':
            this.switchOption('up');
            break;
          case 'ArrowDown':
            this.switchOption('down');
            break;
          case 'Enter':
            this.selectOption();
            break;
          default:
        }
      }

      onKeydown(event) {
        if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
          event.preventDefault();
        }
      }

      switchOption(direction) {
        if (!this.isOpen) return;

        const moveUp = direction === 'up';
        const selectedElement = this.querySelector('[selected="true"]');
        const allElements = this.querySelectorAll('li');
        let activeElement = this.querySelector('li');

        if (moveUp && !selectedElement) return;

        if (!moveUp && selectedElement) {
          activeElement = selectedElement.nextElementSibling || allElements[0];
        } else if (moveUp) {
          activeElement = selectedElement.previousElementSibling || allElements[allElements.length - 1];
        }

        if (activeElement === selectedElement) return;

        activeElement.setAttribute('selected', true);
        if (selectedElement) selectedElement.setAttribute('selected', false);
      }

      selectOption() {
        const selectedProduct = this.querySelector('[selected="true"] a, [selected="true"] button');

        if (selectedProduct) selectedProduct.click();
      }

      getSearchResults(searchTerm) {
        const queryKey = searchTerm.replace(' ', '-').toLowerCase();

        this.loading = true;

        if (this.predictiveSearchResults.querySelectorAll('.predictive-search__item').length === 0) {
          this.predictiveSearchResults.innerHTML = '';
        }

        if (this.cachedResults[queryKey]) {
          return this.renderSearchResult(queryKey, this.cachedResults[queryKey]);
        }

        fetch(
          `${window.routes.predictive_search_url}?q=${encodeURIComponent(
            searchTerm,
          )}&field=title&resource_type=product&limit=5&available_type=show&section_id=predictive-search`,
        )
          .then((response) => {
            if (!response.ok) {
              this.close();
              throw new Error(response.status);
            }
            return response.text();
          })
          .then((text) => {
            const resultHtml = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.predictive-search-results').innerHTML;
            this.cachedResults[queryKey] = resultHtml;
            this.renderSearchResult(queryKey, resultHtml);
          })
          .catch((error) => {
            this.close();
            throw error;
          });
      }

      renderSearchResult(queryKey, resultHtml) {
        this.loading = false;
        this.predictiveSearchResults.innerHTML = resultHtml.replace('__QUERY_KEY__', window.sanitizeInput(queryKey));
        this.setAttribute('results', true);
        if (this.contains(document.activeElement)) this.open();
      }

      open() {
        this.setAttribute('open', true);
        this.predictiveSearchResults.style.maxHeight = `${this.resultsMaxHeight}px`;
      }

      close(clearSearchTerm = false) {
        if (clearSearchTerm) {
          this.input.value = '';
          this.removeAttribute('result');
          this.predictiveSearchResults.innerHTML = '';
        }

        const selectedTarget = this.querySelector('[selected="true"]');

        if (selectedTarget) selectedTarget.setAttribute('selected', false);

        this.removeAttribute('open');
        this.predictiveSearchResults.removeAttribute('style');
      }
    },
);
