if (typeof window.Shopline === 'undefined') {
  window.Shopline = {};
}

// pubsub event


const PUB_SUB_EVENTS = {
  quantityUpdate: 'quantity-update',
  variantChange: 'variant-change',
};

const subscribers = {};

function subscribe(eventName, callback) {
  if (subscribers[eventName] === undefined) {
    subscribers[eventName] = [];
  }

  subscribers[eventName] = [...subscribers[eventName], callback];

  return function unsubscribe() {
    subscribers[eventName] = subscribers[eventName].filter((cb) => {
      return cb !== callback;
    });
  };
}

function publish(eventName, data) {
  if (subscribers[eventName]) {
    subscribers[eventName].forEach((callback) => {
      callback(data);
    });
  }
}
;

// Translation util
window.t = function t(path, hash) {
  function parsePathToArray(p) {
    if (typeof p !== 'string') {
      throw new TypeError('path must be string');
    }
    return p.replace(/\]/, '').split(/[.[]/);
  }
  const keys = parsePathToArray(path);
  const value = keys.reduce((prev, current) => {
    if (!prev) return undefined;
    return prev[current];
    
  }, window.__I18N__);

  const regExp = /\{\{([^{}]+)\}\}/g;
  if (!value) return path;

  // No hash, no substitution
  if (!hash) return value;

  return value.replace(regExp, (...args) => {
    if (args[1] !== null && args[1] !== undefined) {
      return hash[args[1]];
    }
    if (args[0] !== null && args[0] !== undefined) {
      return hash[args[0]];
    }
  });
};
;

// Common util


/**
 * @global
 */
function throttle(fn, wait) {
  let timer = null;
  return (...args) => {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, wait);
  };
}

/**
 * @global
 */
function debounce(fn, wait) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * @global
 */
function jsonParse(val, normalValue) {
  try {
    const res = JSON.parse(val);
    return res;
  } catch {
    return normalValue;
  }
}

/**
 * @global
 */
function changeURLArg(urlStr, args) {
  const url = new URL(urlStr);

  Object.keys(args).forEach((arg) => {
    const val = args[arg];
    if (val) {
      url.searchParams.set(arg, val);
    } else {
      url.searchParams.delete(arg);
    }
  });
  return url;
}

/**
 * @global
 */
function sanitizeInput(input) {
  const element = document.createElement('div');
  element.innerText = input;
  return element.innerHTML;
}

/**
 * @global
 */
function removeURLArg(urlStr, argArr) {
  const url = new URL(urlStr);

  argArr.forEach((arg) => {
    url.searchParams.delete(arg);
  });
  return url;
}

/**
 * @global
 */
function observeElementVisible(elm, fn, options) {
  const visibleObserver = new IntersectionObserver(
    (entrys) => {
      const isVisibled = entrys[0].isIntersecting;

      fn(isVisibled, visibleObserver);
    },
    {
      rootMargin: '0px',
      ...options,
    },
  );

  visibleObserver.observe(elm);

  return () => {
    visibleObserver.disconnect();
  };
}

function createDom(html) {
  const doms = new DOMParser().parseFromString(html, 'text/html');
  return doms.body.firstElementChild;
}

function triggerResizeByOverflow() {
  const obse = new MutationObserver((mutationsList) => {
    const classMutation = mutationsList.find(
      (mutation) => mutation.type === 'attributes' && mutation.attributeName === 'class',
    );
    const oldClass = classMutation.oldValue || '';
    const newClass = classMutation.target.classList;
    const isAddClass = !oldClass.includes('overflow-hidden') && newClass.contains('overflow-hidden');
    const isRemoveClass = oldClass.includes('overflow-hidden') && !newClass.contains('overflow-hidden');
    if (isAddClass || isRemoveClass) {
      window.dispatchEvent(new Event('resize'));
    }
  });
  obse.observe(document.body, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class'],
  });
}

triggerResizeByOverflow();

window.Shopline.bind = function (fn, scope) {
  return function (...arg) {
    return fn.apply(scope, arg);
  };
};

window.Shopline.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent(`on${eventName}`, callback);
};
;
class Parallax {
  constructor() {
    this.parallaxContainers = document.querySelectorAll('.global-parallax-container');
    this.parallaxListener = false;

    this.bindEvent();
  }

  init() {
    this.parallaxContainers = document.querySelectorAll('.global-parallax-container');
    if (!this.parallaxListener) {
      window.addEventListener('scroll', () => this.onScroll());
      this.parallaxListener = true;
    }
    this.scrollHandler();
  }

  bindEvent() {
    window.document.addEventListener('shopline:section:load', () => {
      this.init();
    });

    window.document.addEventListener('shopline:section:reorder', () => {
      this.init();
    });

    window.addEventListener('DOMContentLoaded', () => {
      if (this.parallaxContainers.length > 0) {
        this.scrollHandler();
        window.addEventListener('scroll', () => this.onScroll());
      }
    });
  }

  scrollHandler() {
    const viewPortHeight = window.innerHeight;

    this.parallaxContainers.forEach((el) => {
      const parallaxImage = el.querySelectorAll('.global-parallax');
      const hasClass = el.classList.contains('global-parallax-container--loaded');

      if (parallaxImage.length === 0) {
        return;
      }

      const { top, height } = el.getBoundingClientRect();
      if (top > viewPortHeight || top <= -height) return;

      const speed = 2;
      const range = 30;
      const movableDistance = viewPortHeight + height;
      const currentDistance = viewPortHeight - top;
      const percent = ((currentDistance / movableDistance) * speed * range).toFixed(2);
      const num = range - Number(percent);
      parallaxImage.forEach((image) => {
        image.style.transform = `translate3d(0 , ${-num}% , 0)`;
      });
      if (!hasClass) {
        el.classList.add('global-parallax-container--loaded');
      }
    });
  }

  onScroll() {
    requestAnimationFrame(this.scrollHandler.bind(this));
  }
}

window.parallaxInstance = new Parallax();
;

// Global util


/**
 * @global
 * @param {String} name
 * @param {() => CustomElementConstructor} constructorCreator element constructor creator
 */
const defineCustomElement = (name, constructorCreator) => {
  if (!customElements.get(name)) {
    const constructor = constructorCreator();
    customElements.define(name, constructor);
    window[constructor.name] = constructor;
  }
};
;


/**
 * @global
 */
class BaseElement extends HTMLElement {
  constructor() {
    super();

    this.createVisibleObserver();
  }

  createVisibleObserver() {
    this.isVisibled = false;
    this.visibleObserver = new IntersectionObserver(
      (entrys) => {
        this.isVisibled = entrys[0].isIntertrue;
        this.dispatchEvent(
          new CustomEvent('visible', {
            detail: true,
          }),
        );
        this.visibleObserver.disconnect();
      },
      {
        rootMargin: '100px',
      },
    );
    this.visibleObserver.observe(this);
  }
}

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener('click', this.close.bind(this, false));
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.close();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('click', (event) => {
        if (!event.target.closest('deferred-media, product-model')) {
          this.close();
        }
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.close();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  open(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    window.pauseAllMedia();
  }

  close() {
    window.pauseAllMedia();
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
  }
}
customElements.define('modal-dialog', ModalDialog);
;
function isMobileScreen() {
  return window.matchMedia('(max-width: 959px)').matches;
}

/**
 * Detect screen size
 * @param {({ isMobileScreen: boolean, event: Event | null, first: boolean }) => Function | void} onResize Called when the screen size changes, when there is a return function, the last time will be cleaned up when changing
 * @param {boolean} immediate Whether to call onResize for the first time
 * @returns {{isMobileScreen: boolean,destroy: Function}} Return detection results, cleaning function
 */

function detectingScreen(onResize, immediate) {
  // last screen
  let isMb = isMobileScreen();
  let cleanUp;

  function handleResize(event, first) {
    if (typeof onResize === 'function') {
      const _ = isMobileScreen();
      if (isMb !== _ || first) {
        // When the screen changes and `onResize` returns a cleanup function, the last cleanup function is called
        if (typeof cleanUp === 'function') {
          try {
            cleanUp({ isMobileScreen: isMb, event });
          } catch (err) {
            
            console.log('cleanUp call error', err);
          }
        }
        isMb = _;
        cleanUp = onResize({ isMobileScreen: _, event, first: !!first });
      }
    }
  }

  if (typeof onResize === 'function') {
    window.addEventListener('resize', handleResize);
  }

  if (immediate) {
    handleResize(null, true);
  }

  return {
    isMobileScreen: isMb,
    destroy() {
      if (typeof onResize === 'function') {
        window.removeEventListener('resize', handleResize);
      }
    },
  };
}
;


function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: `application/${type}`,
    },
  };
}
;
function initWhenVisible(options) {
  const threshold = options.threshold ? options.threshold : 0;

  const observer = new IntersectionObserver(
    (entries, _observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (typeof options.callback === 'function') {
            options.callback();
            _observer.unobserve(entry.target);
          }
        }
      });
    },
    { rootMargin: `0px 0px ${threshold}px 0px` },
  );

  observer.observe(options.element);
}

window.initVisibleAnimation = () => {
  document.querySelectorAll('.animation-delay-show-container').forEach((element) => {
    if (element.__visibleAnimationObserved__) return;

    initWhenVisible({
      element,
      callback: () => {
        element.classList && element.classList.add('come-into-view');
      },
      threshold: -20,
    });

    element.__visibleAnimationObserved__ = true;
  });
};

window.initVisibleAnimation();

window.document.addEventListener('shopline:section:load', () => {
  window.initVisibleAnimation();
});
window.document.addEventListener('shopline:section:reorder', () => {
  window.initVisibleAnimation();
});
;

// Global component
/**
 * @global
 */
class DetailsModal extends BaseElement {
  constructor() {
    super();

    this.detailsContainer = this.querySelector('details');
    this.summaryToggle = this.querySelector('summary');
    this.contentElement = this.detailsContainer.querySelector('.modal__content');
    if (this.summaryToggle) {
      this.summaryToggle.addEventListener('click', this.onSummaryClick.bind(this));
      this.summaryToggle.setAttribute('role', 'button');
    }
  }

  connectedCallback() {
    this.bodyContainer = this.createBodyContainer();
    this.bodyContainer.__modal__ = this;
    this.bodyContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
    const closeBtns = this.bodyContainer.querySelectorAll('button[name="close"]');
    if (closeBtns.length) {
      closeBtns.forEach((btn) =>
        btn.addEventListener('click', (event) => {
          event.preventDefault();
          this.close();
        }),
      );
    }
  }

  disconnectedCallback() {
    const { bodyContainer, detailsContainer } = this;
    if (bodyContainer !== detailsContainer) {
      bodyContainer.parentNode.removeChild(this.bodyContainer);
    }
  }

  get container() {
    const selector = this.getAttribute('container');
    return selector ? document.querySelector(selector) : undefined;
  }

  get isOpen() {
    return this.detailsContainer.hasAttribute('open');
  }

  get disabledBodyClickClose() {
    return this.detailsContainer.hasAttribute('disabled-body-click-close');
  }

  onSummaryClick(event) {
    event.preventDefault();
    if (this.summaryToggle.hasAttribute('disabled')) return;
    this.isOpen ? this.close() : this.open(event);
  }

  onBodyClick(event) {
    if (event.target.classList.contains('modal__overlay')) {
      this.close(event);
    }
  }

  doAnimate(isClose = false) {
    let timer;

    return new Promise((resolve) => {
      const onAnimationend = (event) => {
        if (event && event.target !== this.contentElement) return;
        this.contentElement.removeAttribute('style');
        this.contentElement.removeEventListener('animationend', onAnimationend);
        resolve(this);
        clearTimeout(timer);
      };

      requestAnimationFrame(() => {
        if (isClose) {
          this.contentElement.style.animationDirection = 'reverse';
        }

        this.contentElement.style.animationName = 'var(--modal-animation-name, fadeIn)';
        this.contentElement.addEventListener('animationend', onAnimationend);
        timer = setTimeout(onAnimationend, 300);
      });
    });
  }

  createBodyContainer() {
    const { container, detailsContainer, summaryToggle } = this;

    if (!container) return detailsContainer;

    const bodyContainer = detailsContainer.cloneNode(false);
    const summary = document.createElement('summary');
    bodyContainer.appendChild(summary);
    Array.from(detailsContainer.children).forEach((node) => {
      if (node !== summaryToggle) {
        detailsContainer.removeChild(node);
        bodyContainer.appendChild(node);
      }
    });
    bodyContainer.setAttribute('data-clone', true);
    container.appendChild(bodyContainer);

    return bodyContainer;
  }

  open() {
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
    this.detailsContainer.setAttribute('open', true);
    this.bodyContainer.setAttribute('open', true);
    if (!this.disabledBodyClickClose) {
      this.bodyContainer.addEventListener('click', this.onBodyClickEvent);
    }
    // add filter modal sticky entry high z-index
    const filterStickyEntry = this.closest('#main-collection-filters');
    if (filterStickyEntry) {
      filterStickyEntry.classList.add('improve-sticky-index');
    }
    document.body.classList.add('overflow-hidden');

    const focusTarget = this.bodyContainer.querySelector('input[autofocus]:not([type="hidden"])');
    if (focusTarget) focusTarget.focus();

    return this.doAnimate();
  }

  close() {
    if (!this.isOpen) return Promise.resolve();

    return this.doAnimate(true).then((res) => {
      this.detailsContainer.removeAttribute('open');
      this.bodyContainer.removeAttribute('open');
      if (!this.disabledBodyClickClose) {
        this.bodyContainer.removeEventListener('click', this.onBodyClickEvent);
      }
      document.body.classList.remove('overflow-hidden');
      // remove filter modal sticky entry high z-index
      const filterStickyEntry = this.closest('#main-collection-filters');
      if (filterStickyEntry) {
        filterStickyEntry.classList.remove('improve-sticky-index');
      }
      (this.focusToggle || false) && this.summaryToggle.focus();
      return res;
    });
  }
}

defineCustomElement('details-modal', () => DetailsModal);
;
/**
 * @global
 */
class AccordionComponent extends HTMLElement {
  constructor() {
    super();

    this.summaryToggles = this.querySelectorAll('summary');
    this.summaryToggles.forEach((summary) => {
      summary.addEventListener('click', this.onSummaryClick.bind(this));
    });
  }

  onSummaryClick(event) {
    if (event.target.tagName.toLocaleUpperCase() === 'A' || event.target.closest('a')) return;
    event.preventDefault();
    const summary = event.currentTarget;
    const detailsContainer = summary.closest('details');
    detailsContainer.hasAttribute('open') ? this.close(detailsContainer) : this.open(detailsContainer);
  }

  doAnimate(contentElement, isClose = false) {
    const animation = [
      { height: 0, opacity: 0 },
      {
        height: `${contentElement.getBoundingClientRect().height}px`,
        opacity: 1,
      },
    ];

    isClose && animation.reverse();

    return contentElement.animate(animation, {
      iterations: 1,
      duration: 200,
      easing: 'ease',
    });
  }

  open(detailsContainer) {
    if (detailsContainer.parentNode.tagName === 'LI') {
      const detailList = detailsContainer.parentNode.parentNode.querySelectorAll('li');
      detailList.forEach((node) => {
        node.querySelector('details')?.removeAttribute('open');
      });
    }

    const template = detailsContainer.querySelector('template');
    if (template) {
      detailsContainer.appendChild(template.content);
      detailsContainer.removeChild(template);
    }

    detailsContainer.setAttribute('open', true);
    this.doAnimate(detailsContainer.querySelector('summary').nextElementSibling);
  }

  close(detailsContainer) {
    this.doAnimate(detailsContainer.querySelector('summary').nextElementSibling, true).addEventListener(
      'finish',
      () => {
        detailsContainer.removeAttribute('open');
      },
    );
  }
}

customElements.define('accordion-component', AccordionComponent);
;
defineCustomElement('expand-component', () => {
  return class ExpandComponent extends HTMLElement {
    constructor() {
      super();
      this.maxHeight = this.getAttribute('max-height') || 150;
    }

    connectedCallback() {
      this.init();
    }

    init() {
      const expandWrapper = this.querySelector('.expand-wrapper');
      const needExpandEle = expandWrapper.firstElementChild;
      const viewMoreBox = expandWrapper.nextElementSibling;
      if (!needExpandEle || !viewMoreBox) return;
      const needExpandEleHeight = needExpandEle.offsetHeight;
      const viewMoreBtn = viewMoreBox.querySelector('.expand-view-more-button');
      const viewLessBtn = viewMoreBox.querySelector('.expand-view-less-button');
      viewMoreBtn.addEventListener('click', () => {
        viewMoreBox.setAttribute('open', true);
        this.classList.remove('expand-limit-height');
      });
      viewLessBtn.addEventListener('click', () => {
        viewMoreBox.removeAttribute('open');
        this.classList.add('expand-limit-height');
      });
      if (needExpandEleHeight > this.maxHeight) {
        viewMoreBox.style.display = 'block';
      } else {
        this.classList.remove('expand-limit-height');
      }
    }
  };
});
;
// deferred load media (eg: video)
defineCustomElement(
  'deferred-media',
  () =>
    class DeferredMedia extends HTMLElement {
      constructor() {
        super();
        const poster = this.querySelector('[id^="Deferred-Poster-"]');
        if (!poster) return;
        poster.addEventListener('click', this.loadContent.bind(this));
      }

      loadContent(focus = true) {
        if (!this.getAttribute('loaded')) {
          window.pauseAllMedia();
          const content = document.createElement('div');
          content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

          this.setAttribute('loaded', true);
          const deferredElement = this.appendChild(content.querySelector('video, iframe'));
          if (focus) deferredElement.focus();

          const { tagName } = deferredElement;
          if (tagName === 'VIDEO') {
            deferredElement.addEventListener('loadeddata', this.playVideo.bind(this), { once: true });
          } else if (tagName === 'IFRAME') {
            deferredElement.addEventListener('load', this.playVideo.bind(this), { once: true });
          }
        }
      }

      playVideo() {
        const deferredElement = this.querySelector('video, iframe');
        const { tagName } = deferredElement;
        if (tagName === 'VIDEO') {
          deferredElement.play();
        } else if (tagName === 'IFRAME') {
          // Autoplay video
          // Require links to be carried enablejsapi=1
          if (deferredElement.classList.contains('js-youtube')) {
            deferredElement.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } else if (deferredElement.classList.contains('js-vimeo')) {
            deferredElement.contentWindow.postMessage('{"method":"play"}', '*');
          }
        }
      }
    },
);
;
defineCustomElement('modal-opener', () => {
  return class ModalOpener extends HTMLElement {
    constructor() {
      super();

      const button = this.querySelector('button');

      if (!button) return;
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const modalId = this.getAttribute('data-modal').slice(1);
        const modals = document.querySelectorAll(`[id="${modalId}"]`);
        const targetModal = modals[modals.length - 1];
        if (targetModal) targetModal.open(button);
      });
    }
  };
});
;
class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
    this.getVariantStrings();
    this.updateOptions();
    this.updateMasterId();
    const defaultSelectedVariant = this.getAttribute('data-default-selected-variant');
    if (defaultSelectedVariant !== 'false') {
      this.setAvailability();
    }
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.removeErrorMessage();
    if (!this.currentVariant) {
      this.toggleMainAddButton(true, '');
      this.toggleFloatAddButton(true, '');
      if (this.isAllSelectedOptions()) {
        this.setUnavailable();
        this.setAvailability();
      }
    } else {
      this.updateMedia();
      this.renderProductInfo();
      this.setAvailability();
      this.updateSku();
    }

    this.updateURL();
    this.updateVariantInput();
  }

  updateSku() {
    if (document.getElementById(`variant_sku_no_${this.dataset.section}`)) {
      document.getElementById(`variant_sku_no_${this.dataset.section}`).textContent = this.currentVariant.sku
        ? this.currentVariant.sku
        : '';
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  isAllSelectedOptions() {
    // If each option is selected, the array will have a value.
    return this.options.every((item) => item);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
    mediaGalleries.forEach((mediaGallery) =>
      mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true),
    );

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
    const photoSwipe = document.querySelector(`[id^="ProductPhotoSwipe-${this.dataset.section}"]`);
    photoSwipe?.prepend();
  }

  updateURL() {
    if (this.dataset.updateUrl === 'false') return;
    window.history.replaceState(
      {},
      document.title,
      changeURLArg(window.location.href, {
        sku: this.currentVariant?.id,
      }),
    );
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant?.id || '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const sku = this.currentVariant.id;
    const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;
    const { sectionTemplate } = this.dataset;
    fetch(
      `${this.dataset.url}?sku=${sku}&section_id=${sectionId}${
        sectionTemplate && `&section_template=${sectionTemplate}`
      }`,
    )
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${sectionId}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');

        this.updateProductInfo(
          document.getElementById(`inventory-${this.dataset.section}`),
          html.getElementById(`inventory-${sectionId}`),
        );

        // moq
        const volumePricingDestination = document.getElementById(`Volume-${this.dataset.section}`);
        const volumePricingSource = html.getElementById(`Volume-${sectionId}`);
        const pricePerItemDestination = document.getElementById(`Price-Per-Item-${this.dataset.section}`);
        const pricePerItemSource = html.getElementById(`Price-Per-Item-${sectionId}`);
        if (volumePricingSource && volumePricingDestination) {
          volumePricingDestination.innerHTML = volumePricingSource.innerHTML;
        }

        if (pricePerItemSource && pricePerItemDestination) {
          pricePerItemDestination.innerHTML = pricePerItemSource.innerHTML;
        }

        this.toggleMainAddButton(!this.currentVariant.available, this.variantStrings.soldOut);
        this.toggleFloatAddButton(!this.currentVariant.available, this.variantStrings.soldOut);

        publish(PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId,
            html,
            variant: this.currentVariant,
          },
        });
      });
  }

  updateProductInfo(destination, source) {
    if (destination && source) destination.innerHTML = source.innerHTML;
    if (destination) destination.classList.toggle('visibility-hidden', source.innerText === '');
  }

  handleAddButton(productForm, disable, text) {
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      if (!this.isAllSelectedOptions()) return;
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButton.classList.remove('disabled');
      addButtonText.textContent = this.variantStrings.addToCart;
    }
  }

  toggleMainAddButton(disable, text) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    this.handleAddButton(productForm, disable, text);
  }

  toggleFloatAddButton(disable, text) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}-float`);
    this.handleAddButton(productForm, disable, text);
  }

  handleAddButtonUnavailable(mainProductForm) {
    if (mainProductForm) {
      const addButton = mainProductForm.querySelector('[name="add"]');
      const addButtonText = mainProductForm.querySelector('[name="add"] > span');
      if (addButton) {
        addButtonText.textContent = this.variantStrings.unavailable;
      }
    }
  }

  setUnavailable() {
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (price) price.classList.add('visibility-hidden');

    const mainProductForm = document.getElementById(`product-form-${this.dataset.section}`);
    this.handleAddButtonUnavailable(mainProductForm);

    const floatProductForm = document.getElementById(`product-form-${this.dataset.section}-float`);
    this.handleAddButtonUnavailable(floatProductForm);
  }

  setAvailability() {
    this.querySelectorAll('.variant-input-wrapper').forEach((group) => {
      this.disableVariantGroup(group);
    });

    const currentlySelectedValues = this.options.map((value, index) => {
      return { value, index: `option${index + 1}` };
    });
    const initialOptions = this.createAvailableOptionsTree(this.variantData, currentlySelectedValues);
    console.log('createAvailableOptionsTree_result', initialOptions);

    Object.entries(initialOptions).forEach(([option, values]) => {
      this.manageOptionState(option, values);
    });
  }

  disableVariantGroup(group) {
    group.querySelectorAll('option').forEach((option) => {
      option.classList.add('disabled');
    });
  }

  createAvailableOptionsTree(variants, currentlySelectedValues) {
    // Reduce variant array into option availability tree
    return variants.reduce(
      (options, variant) => {
        // Check each option group (e.g. option1, option2, option3, option4, option5) of the variant
        Object.keys(options).forEach((index) => {
          if (variant[index] === null) return;
          let entry = options[index].find((option) => option.value === variant[index]);
          if (typeof entry === 'undefined') {
            // If option has yet to be added to the options tree, add it
            entry = { value: variant[index], soldOut: true };
            options[index].push(entry);
          }

          const currentOption1 = currentlySelectedValues.find((selectedValue) => {
            return selectedValue.index === 'option1';
          });
          const currentOption2 = currentlySelectedValues.find((selectedValue) => {
            return selectedValue.index === 'option2';
          });
          const currentOption3 = currentlySelectedValues.find((selectedValue) => {
            return selectedValue.index === 'option3';
          });
          const currentOption4 = currentlySelectedValues.find((selectedValue) => {
            return selectedValue.index === 'option4';
          });

          switch (index) {
            case 'option1':
              // Option1 inputs should always remain enabled based on all available variants
              entry.soldOut = entry.soldOut && variant.available ? false : entry.soldOut;
              break;
            case 'option2':
              // Option2 inputs should remain enabled based on available variants that match first option group
              if (currentOption1 && variant.option1 === currentOption1.value) {
                entry.soldOut = entry.soldOut && variant.available ? false : entry.soldOut;
              }
              break;
            case 'option3':
              // Option 3 inputs should remain enabled based on available variants that match first and second option group
              if (
                currentOption1 &&
                variant.option1 === currentOption1.value &&
                currentOption2 &&
                variant.option2 === currentOption2.value
              ) {
                entry.soldOut = entry.soldOut && variant.available ? false : entry.soldOut;
              }
              break;
            case 'option4':
              // Option 4 inputs should remain enabled based on available variants that match first and second and third option group
              if (
                currentOption1 &&
                variant.option1 === currentOption1.value &&
                currentOption2 &&
                variant.option2 === currentOption2.value &&
                currentOption3 &&
                variant.option3 === currentOption3.value
              ) {
                entry.soldOut = entry.soldOut && variant.available ? false : entry.soldOut;
              }
              break;
            case 'option5':
              // Option 5 inputs should remain enabled based on available variants that match first and second and third and fourth option group
              if (
                currentOption1 &&
                variant.option1 === currentOption1.value &&
                currentOption2 &&
                variant.option2 === currentOption2.value &&
                currentOption3 &&
                variant.option3 === currentOption3.value &&
                currentOption4 &&
                variant.option4 === currentOption4.value
              ) {
                entry.soldOut = entry.soldOut && variant.available ? false : entry.soldOut;
              }
              break;
            default:
          }
        });

        return options;
      },
      { option1: [], option2: [], option3: [], option4: [], option5: [] },
    );
  }

  enableVariantOption(group, obj) {
    
    const value = obj.value.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
    const option = group.querySelector(`option[value="${value}"]`);
    option.classList.remove('disabled');

    if (obj.soldOut) {
      option.classList.add('disabled');
    }
  }

  manageOptionState(option, values) {
    const group = this.querySelector(`.variant-input-wrapper[data-option-index="${option}"]`);
    // Loop through each option value
    values.forEach((obj) => {
      this.enableVariantOption(group, obj);
    });
  }

  getVariantData() {
    const jsonStr = this.querySelector('.variant-data[type="application/json"]')?.textContent.trim() || '[]';
    this.variantData = this.variantData || JSON.parse(jsonStr);
    return this.variantData;
  }

  getVariantStrings() {
    this.variantStrings =
      this.variantStrings || JSON.parse(this.querySelector('.variant-strings[type="application/json"]').textContent);
  }
}

class VariantRadios extends VariantSelects {
  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      const variantInputs = Array.from(fieldset.querySelectorAll('input'));
      const checkedVariantInput = variantInputs.find((radio) => radio.checked);
      return checkedVariantInput ? checkedVariantInput.value : '';
    });
  }

  enableVariantOption(group, obj) {
    
    const value = obj.value.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
    const input = group.querySelector(`input[data-option-value="${value}"]`);
    // Variant exists - enable & show variant
    input.classList.remove('disabled');
    // Variant sold out - cross out option (remains selectable)
    if (obj.soldOut) {
      input.classList.add('disabled');
    }
  }

  disableVariantGroup(group) {
    group.querySelectorAll('input').forEach((input) => {
      input.classList.add('disabled');
    });
  }
}

defineCustomElement('variant-selects', () => VariantSelects);

defineCustomElement('variant-radios', () => VariantRadios);
;

// Global function

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
}
;
if (window.Shopline.uri.alias !== 'ProductsDetail' && window.Shopline.uri.alias !== 'Products') {
  sessionStorage.removeItem('breadcrumb');
}
;
