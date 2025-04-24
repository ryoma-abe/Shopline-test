
class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach((summary) =>
      summary.addEventListener('click', this.onSummaryClick.bind(this)),
    );

    this.querySelector('.mobile-facets__close').addEventListener('click', this.closeMenuDrawer.bind(this));
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    }
  }

  closeMenuDrawer(event) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });

    this.closeAnimation(this.mainDetailsToggle);
    document.body.classList.remove('overflow-hidden');
  }

  openMenuDrawer() {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
      // add filter modal sticky entry high z-index
      const filterStickyEntry = this.closest('#main-collection-filters');
      if (filterStickyEntry) {
        filterStickyEntry.classList.add('improve-sticky-index');
      }
      document.body.classList.add('overflow-hidden');
    });
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        // remove filter modal sticky entry high z-index
        const filterStickyEntry = this.closest('#main-collection-filters');
        if (detailsElement === this.mainDetailsToggle && filterStickyEntry) {
          filterStickyEntry.classList.remove('improve-sticky-index');
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

defineCustomElement('menu-drawer', () => MenuDrawer);
class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.debouncedOnSubmit = debounce((event) => {
      // handle sort filter
      if (event.target.name === 'sort_by') {
        const closestDetailsModal = event.target.closest('details-modal');
        const closestDetails = event.target.closest('details');
        if (closestDetailsModal) {
          closestDetailsModal.close();
        }
        // details tag not includes details-modal
        if (closestDetails && !closestDetails.classList.contains('js-disclosure-has-modal')) {
          closestDetails.removeAttribute('open');
        }
      }
      // stop mobile drawer input change
      if (event.target.closest('form').id === 'FacetFiltersFormMobile') {
        return;
      }
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    this.addEventListener('click', (event) => {
      if (event.target.classList.contains('facets-js-confirm')) {
        this.onSubmitHandler(event);
        const menuDrawer = event.target.closest('menu-drawer');
        if (menuDrawer) {
          menuDrawer.querySelector('summary').click();
        }
      }
    });
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    // handling the browser back button
    window.addEventListener('popstate', onHistoryChange);
  }

  static renderPage(sourceSearchParams, event, updateURLHash = true) {
    console.log('sourceSearchParams', sourceSearchParams);

    let searchParams = sourceSearchParams;

    if (window.preview_query) {
      searchParams = `${sourceSearchParams}&${window.preview_query}`;
    }

    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    document.getElementById('ProductListContainer').querySelector('.collection').classList.add('loading');

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderSearchResults(html);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        FacetFiltersForm.updateInfiniteScrollParams(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const { html } = FacetFiltersForm.filterData.find(filterDataUrl);
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderSearchResults(html);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    FacetFiltersForm.updateInfiniteScrollParams(html);
  }

  static updateInfiniteScrollParams(html) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const source = parsedHTML.querySelector('infinite-scroll');
    if (!source) {
      return;
    }
    const target = document.querySelector('infinite-scroll');
    target.reset(source.dataset);
  }

  static updateURLHash(searchParams) {
    window.history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`,
    );
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter',
    );

    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter((element) => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = [
      '.mobile-facets__open',
      '.mobile-facets__count',
      '.js-sorting',
      '.js-mobile-sorting',
    ];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile')?.closest('menu-drawer')?.bindEvents();
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductListContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductListContainer').innerHTML;
  }

  static renderSearchResults(html) {
    if (!document.getElementById('main-search__results')) return;
    try {
      document.getElementById('main-search__results').innerHTML = new DOMParser()
        .parseFromString(html, 'text/html')
        .getElementById('main-search__results').innerHTML;
    } catch (error) {
      console.error(error, 'Please check whether the search page form is missing keyword form data');
    }
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML;
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    const ProductCountDesktopDrawer = document.getElementById('ProductCountDesktopDrawer');

    container.innerHTML = count;
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
    }
    if (ProductCountDesktopDrawer) {
      ProductCountDesktopDrawer.innerHTML = count;
    }
  }

  static getSections() {
    return [
      {
        section: document.getElementById('ProductListContainer').dataset.id,
      },
    ];
  }

  omitPrice(form) {
    form.delete('filter.v.price.gte');
    form.delete('filter.v.price.lte');
  }

  createSearchParams(form) {
    const formData = new FormData(form);

    const priceRange = form.querySelector('price-range');
    const shouldDelPrice = priceRange?.isFullRange();
    if (shouldDelPrice) {
      this.omitPrice(formData);
    }

    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();

    const sortFilterForms = document.querySelectorAll('facet-filters-form form');

    const forms = [];
    const targetFormType = event.target.closest('form').dataset.formType;
    const isMobile = detectingScreen()?.isMobileScreen;

    sortFilterForms.forEach((form) => {
      const { formType, device } = form.dataset;

      if (formType === targetFormType) {
        if (device) {
          // facets drawer mode there are two sort form at the same time
          if ((isMobile && device === 'tablet') || (!isMobile && device === 'desktop')) {
            forms.push(this.createSearchParams(form));
          }
        } else {
          forms.push(this.createSearchParams(form));
        }
      }
    });

    const validForms = forms.filter((item) => Boolean(item));
    this.onSubmitForm(validForms.join('&'), event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();

    const url =
      event.currentTarget.href.indexOf('?') === -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
FacetFiltersForm.setListeners();
defineCustomElement('facet-filters-form', () => FacetFiltersForm);

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.initialized = false;

    this.initRangeSlider();

    this.initialize();

    this.bindToggleInitialize();

    this.querySelectorAll('input').forEach((element) =>
      element.addEventListener('change', this.onRangeChange.bind(this)),
    );
  }

  bindToggleInitialize() {
    const detailsEle = this.closest('details');
    detailsEle.addEventListener('toggle', () => {
      if (detailsEle.open) {
        this.initialize();
      }
    });
  }

  initialize() {
    if (this.initialized) {
      this.updateUi();
      return;
    }
    this.handleUseCommaDecimals();
    this.setMinAndMaxValues();
    this.updateUi();
    this.initialized = true;
  }

  isFullRange() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    const minValue = minInput.value;
    const maxValue = maxInput.value;

    const transformMaxValue = this.maxValue;
    const flag = Number(minValue) === 0 && Number(maxValue) === Number(transformMaxValue);
    return flag;
  }

  get usingCommaDecimals() {
    const { currencyCode } = this.dataset;
    const currencyUsingCommaDecimals =
      'ANG,ARS,BRL,BYN,BYR,CLF,CLP,COP,CRC,CZK,DKK,EUR,HRK,HUF,IDR,ISK,MZN,NOK,PLN,RON,RUB,SEK,TRY,UYU,VES,VND'.split(
        ',',
      );
    const useCommaDecimals = currencyUsingCommaDecimals.includes(currencyCode);
    return useCommaDecimals;
  }

  get maxValue() {
    const { maxValue } = this.dataset;
    const transformMaxValue = this.handleDecimalsReplace(maxValue);
    return transformMaxValue;
  }

  // processing currency with decimal point as, or .
  handleDecimalsReplace(value) {
    if (value === undefined) return;
    if (this.usingCommaDecimals) {
      return value.replace(/\./g, '').replace(/,/g, '.');
    }
    return value.replace(/,/g, '');
  }

  handleUseCommaDecimals() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    const transformMaxValue = this.maxValue;
    minInput.setAttribute('max', transformMaxValue);
    maxInput.setAttribute('max', transformMaxValue);
    // When the decimal point of the currency is, the value is recognized as empty need to use getAttribute
    const maxInputInitialValue = maxInput.getAttribute('data-initial-value');
    const minInputInitialValue = minInput.getAttribute('data-initial-value');
    if (maxInputInitialValue) {
      const transformMaxInputInitialValue = this.handleDecimalsReplace(maxInputInitialValue);
      maxInput.value = transformMaxInputInitialValue;
      maxInput.setAttribute('value', transformMaxInputInitialValue);
    }
    if (minInputInitialValue) {
      const transformMinInputInitialValue = this.handleDecimalsReplace(minInputInitialValue);
      minInput.value = transformMinInputInitialValue;
      minInput.setAttribute('value', transformMinInputInitialValue);
    }
  }

  updateUi() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];

    const minValue = minInput.value;
    const maxValue = maxInput.value;

    this.slideUpperHandleTo(maxValue);
    this.slideLowerHandleTo(minValue);

    this.updateRangeBar();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));
    if (value < min) input.value = min;
    if (value > max) input.value = max;

    if (input.dataset.type === 'min') {
      this.slideLowerHandleTo(input.value);
    }
    if (input.dataset.type === 'max') {
      this.slideUpperHandleTo(input.value);
    }

    this.updateRangeBar();
  }

  initRangeSlider() {
    this.startVal = this.getAttribute('start') || 0;
    this.endVal = this.getAttribute('end') || 100;
    this.fromVal = this.getAttribute('from') || this.startVal;
    this.toVal = this.getAttribute('to') || this.endVal;

    this.isLowerDown = false;
    this.isUpperDown = false;

    this.rangeSlider = this.querySelector('.price-range-slider');
    this.rangeBar = this.rangeSlider.querySelector('.price-range-bar');
    this.lowerHandle = this.rangeSlider.querySelector('.price-range-dot--min');
    this.upperHandle = this.rangeSlider.querySelector('.price-range-dot--max');

    this.bindRangeSlider();
  }

  bindRangeSlider() {
    this.lowerHandle.addEventListener('mousedown', this.onGrabbingLowerHandle.bind(this));
    this.lowerHandle.addEventListener('touchstart', this.onGrabbingLowerHandle.bind(this));

    this.upperHandle.addEventListener('mousedown', this.onGrabbingUpperHandle.bind(this));
    this.upperHandle.addEventListener('touchstart', this.onGrabbingUpperHandle.bind(this));

    document.addEventListener('mouseup', this.onReleasingHandle.bind(this));
    document.addEventListener('touchend', this.onReleasingHandle.bind(this));

    document.addEventListener('mousemove', this.onMovingHandle.bind(this));
    document.addEventListener('touchmove', this.onMovingHandle.bind(this));
  }

  eventX(e) {
    return e.clientX || e.changedTouches[0].pageX;
  }

  onGrabbingLowerHandle(e) {
    this.isLowerDown = true;

    this.lowerStartX = this.eventX(e);
    this.lowerOffsetX = this.lowerHandle.getBoundingClientRect().left;
  }

  onGrabbingUpperHandle(e) {
    this.isUpperDown = true;

    this.upperStartX = this.eventX(e);
    this.upperOffsetX = this.upperHandle.getBoundingClientRect().left;
  }

  onReleasingHandle() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];

    if (this.isLowerDown) {
      minInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (this.isUpperDown) {
      maxInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    this.isLowerDown = false;
    this.isUpperDown = false;
  }

  onMovingHandle(e) {
    if (!this.isLowerDown && !this.isUpperDown) {
      return;
    }

    const { width: sliderWidth, left: sliderX } = this.rangeSlider.getBoundingClientRect();
    const { width: upperHandleWidth, left: upperHandleX } = this.upperHandle.getBoundingClientRect();
    const { width: lowerHandleWidth, left: lowerHandleX } = this.lowerHandle.getBoundingClientRect();

    const pointerX = this.eventX(e);

    if (this.isLowerDown) {
      const distance = pointerX - this.lowerStartX;
      let newX = this.lowerOffsetX + distance;

      const maxX = upperHandleX - lowerHandleWidth;
      const minX = sliderX;

      if (newX < minX) {
        newX = minX;
      }

      if (newX > maxX) {
        newX = maxX;
      }

      const offset = newX - sliderX;

      this.lowerHandle.style.transform = `translate(${offset}px, -50%)`;
    }

    if (this.isUpperDown) {
      const distance = pointerX - this.upperStartX;
      let newX = this.upperOffsetX + distance;

      const minX = lowerHandleX + lowerHandleWidth;
      const maxX = sliderWidth + sliderX - upperHandleWidth;

      if (newX < minX) {
        newX = minX;
      }

      if (newX > maxX) {
        newX = maxX;
      }

      const sliderEnd = sliderX + sliderWidth;
      const offset = 0 - (sliderEnd - newX - upperHandleWidth);

      this.upperHandle.style.transform = `translate(${offset}px, -50%)`;
    }

    this.updateRangeInput();
    this.updateRangeBar();
  }

  slideLowerHandleTo(value) {
    value = Number(value);
    const { width: sliderWidth } = this.rangeSlider.getBoundingClientRect();
    const { width: upperHandleWidth } = this.upperHandle.getBoundingClientRect();
    const { width: lowerHandleWidth } = this.lowerHandle.getBoundingClientRect();

    const maxValue = Number(this.maxValue);
    const totalWidth = sliderWidth - upperHandleWidth - lowerHandleWidth;

    const offset = (value / maxValue) * totalWidth;
    this.lowerHandle.style.transform = `translate(${offset}px, -50%)`;
  }

  slideUpperHandleTo(value) {
    value = Number(value);
    const { width: sliderWidth } = this.rangeSlider.getBoundingClientRect();
    const { width: upperHandleWidth } = this.upperHandle.getBoundingClientRect();
    const { width: lowerHandleWidth } = this.lowerHandle.getBoundingClientRect();

    const maxValue = Number(this.maxValue);
    const totalWidth = sliderWidth - upperHandleWidth - lowerHandleWidth;

    const offset = 0 - ((maxValue - value) / maxValue) * totalWidth;
    this.upperHandle.style.transform = `translate(${offset}px, -50%)`;
  }

  updateRangeBar() {
    const { width: sliderWidth } = this.rangeSlider.getBoundingClientRect();
    const { width: upperHandleWidth } = this.upperHandle.getBoundingClientRect();
    const { width: lowerHandleWidth } = this.lowerHandle.getBoundingClientRect();

    const totalValue = Number(this.maxValue);
    const totalWidth = sliderWidth - upperHandleWidth - lowerHandleWidth;

    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    const minValue = minInput.value;
    const maxValue = maxInput.value;

    const width = ((maxValue - minValue) / totalValue) * totalWidth;
    const offsetX = (minValue / totalValue) * totalWidth + lowerHandleWidth;

    this.rangeBar.style.width = `${width}px`;
    this.rangeBar.style.transform = `translateX(${offsetX}px)`;
  }

  updateRangeInput() {
    const { width: sliderWidth, left: sliderX } = this.rangeSlider.getBoundingClientRect();
    const { width: upperHandleWidth, left: upperHandleX } = this.upperHandle.getBoundingClientRect();
    const { width: lowerHandleWidth, left: lowerHandleX } = this.lowerHandle.getBoundingClientRect();

    const maxValue = Number(this.maxValue);
    const totalWidth = sliderWidth - upperHandleWidth - lowerHandleWidth;
    let min = ((lowerHandleX - sliderX) / totalWidth) * maxValue;
    let max = ((upperHandleX - (sliderX + lowerHandleWidth)) / totalWidth) * maxValue;

    max = max > maxValue ? maxValue : max;
    min = min > max ? max : min;
    min = min < 0 ? 0 : min;

    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];

    minInput.value = min.toFixed(2);
    maxInput.value = max.toFixed(2);
  }
}

defineCustomElement('price-range', () => PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

defineCustomElement('facet-remove', () => FacetRemove);

function listenHeaderStickyFromFacets() {
  const pageHeader = document.querySelector('header-layout');
  const stickyElements = ['#main-collection-filters', '.facets-vertical-sort', '.facets-vertical .facets-container'];
  if (!pageHeader || !pageHeader.bindStickyCallback) return;
  pageHeader.bindStickyCallback((data) => {
    const { sticking, height, top } = data;
    stickyElements.forEach((selector) => {
      const ele = document.querySelector(selector);
      const eleEnabledSticky = ele?.classList.contains('facets-enabled-sticky');
      if (!eleEnabledSticky) return;
      if (sticking) {
        const myTop = top + height;
        ele.style.top = `${myTop}px`;
      } else {
        ele.style.top = `0`;
      }
    });
  });
}
listenHeaderStickyFromFacets();
