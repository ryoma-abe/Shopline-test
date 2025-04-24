defineCustomElement('select-component', () => {
  return class SelectComponent extends BaseElement {
    constructor() {
      super();

      const select = this.querySelector('select');

      if (!select) {
        throw new Error('[select-component]: child structure exception, missing select tag.');
      }

      this._selectElement = select;
      this._disabledNativeSelect();
      this._updateView();
      this._updatePlaceholder();

      this._onClickHandler = this._clickHandler.bind(this);
      this._onResizeHandler = window.throttle(() => {
        this._updatePlaceholder();
      }, 300);
      this.addEventListener('focusout', () => this.close());
      this.addEventListener('keyup', this._keyupHandler.bind(this));
    }

    connectedCallback() {
      document.body.addEventListener('click', this._onClickHandler);
      window.addEventListener('resize', this._onResizeHandler);
    }

    disconnectedCallback() {
      document.body.removeEventListener('click', this._onClickHandler);
      window.removeEventListener('resize', this._onResizeHandler);
    }

    get disabled() {
      return this.getAttribute('disabled') === 'true';
    }

    set disabled(force) {
      if (force) {
        this.setAttribute('disabled', 'true');
      } else {
        this.removeAttribute('disabled');
      }
    }

    get name() {
      return this._selectElement.name;
    }

    set name(str) {
      this._selectElement.name = str;
    }

    get value() {
      return this._selectElement.value;
    }

    set value(val) {
      if (val === this.value) {
        return;
      }

      this._selectElement.value = val;
      this._selectElement.dispatchEvent(new Event('change', { bubbles: true }));

      Array.from(this.getElementsByClassName('select-component__option')).forEach((option) => {
        if (option.getAttribute('value') === val) {
          option.setAttribute('selected', 'true');
        } else {
          option.removeAttribute('selected');
        }
      });
    }

    get options() {
      return Array.from(this._selectElement.options)
        .filter((option) => option.value !== '')
        .map((option) => {
          return {
            label: option.label,
            labelTemplate: option.querySelector('template')?.innerHTML,
            value: option.value,
            selected: option.selected,
            disabled: option.disabled,
            hidden: option.hidden,
            attributes: option.attributes,
          };
        });
    }

    set options(options) {
      const selectElement = this._selectElement;

      // Clear all old options
      Array.from(selectElement.options).forEach((option) => {
        if (option.value) option.parentElement.removeChild(option);
      });

      options.forEach((option) => {
        const optionElement = document.createElement('option');

        optionElement.innerHTML = `
            ${option.label}
            ${option.labelTemplate ? `<template>${option.labelTemplate}</template>` : ''}
          `;

        optionElement.value = option.value;
        optionElement.disabled = option.disabled;
        optionElement.hidden = option.hidden;
        option.selected && optionElement.setAttribute('selected', 'true');

        if (option.attributes) {
          Array.from(option.attributes).forEach((attr) => {
            optionElement.attributes.setNamedItem(attr);
          });
        }

        selectElement.options.add(optionElement);
      });

      this._updateView();
    }

    get isOpen() {
      return this.hasAttribute('open');
    }

    set isOpen(force) {
      if (force) {
        this.setAttribute('open', 'true');
      } else {
        this.removeAttribute('open');
      }
    }

    get loading() {
      return this.classList.contains('loading');
    }

    set loading(force) {
      this.classList.toggle('loading', force);
    }

    get _lockScroll() {
      return window.isMobileScreen();
    }

    async toggle() {
      if (this.isOpen) {
        return this.close();
      }

      return this.open();
    }

    async open() {
      if (this.disabled || this.isOpen) {
        return;
      }

      this.isOpen = true;

      if (this._lockScroll) {
        document.body.classList.add('overflow-hidden');
      } else if (this.dataset.position) {
        this.dataset.adaptationPosition = this.dataset.position;
      } else {
        this._adaptationPosition();
      }

      await this._doAnimate();
    }

    async close() {
      if (this.disabled || !this.isOpen) {
        return;
      }

      await this._doAnimate(true);

      if (this._lockScroll) {
        document.body.classList.remove('overflow-hidden');
      }

      this.isOpen = false;
    }

    _updateView() {
      if (this._mockOptionListElement) {
        this.removeChild(this._mockOptionListElement);
      }
      this._mockOptionListElement = this.appendChild(this._createMockOptionList());
    }

    _disabledNativeSelect() {
      const select = this._selectElement;
      select.style.pointerEvents = 'none';
      select.tabIndex = -1;
      this.tabIndex = 0;
    }

    _updatePlaceholder() {
      const option = Array.from(this._selectElement.options).find((opt) => opt.value === '');

      if (!option) return;

      option.label = window.isMobileScreen()
        ? option.dataset.mobileLabel || option.textContent
        : option.dataset.desktopLabel || option.textContent;
    }

    _createMockOptionList() {
      const mainElement = window.createDom(`
          <div class="select-component__main">
            <div class="select-component__content">
              <div class="select-component__head">
                ${
                  this._selectElement.title
                    ? `<span class="select-component__title">${this._selectElement.title}</span>`
                    : ''
                }
                <button class="select-component__close-button" name="close" type="button">
                  <svg class="icon icon-close" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M1 1L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <div class="select-component__list"></div>
              <div class="select-component__empty-data">${t('general.general.no_data')}</div>
            </div>
          </div>
        `);
      const listElement = mainElement.querySelector('.select-component__list');

      this.options.forEach((option) => {
        if (!option.value) return;

        const mockOption = window.createDom(`
            <div class="select-component__option"></div>
          `);

        Array.from(option.attributes).forEach((attr) => {
          if (attr.name === 'class') {
            return;
          }

          mockOption.attributes.setNamedItem(attr.cloneNode(true));
        });

        mockOption.classList.add('select-component__option');

        if (option.optionTemplate) {
          mockOption.innerHTML = option.labelTemplate;
        } else {
          const content = document.createElement('span');
          content.textContent = option.label;
          mockOption.appendChild(content);
        }

        listElement.appendChild(mockOption);
      });

      return mainElement;
    }

    _clickHandler(event) {
      const clickElement = event.target;
      const isClickTrigger = clickElement === this;

      if (!this.contains(clickElement)) {
        return this.close();
      }

      if (isClickTrigger) {
        return this.toggle();
      }

      const clickOption = clickElement.closest('.select-component__option');

      if (clickOption) {
        return this._selectOption(clickOption);
      }

      const clickMask = clickElement.classList.contains('select-component__main');
      const clickButton = clickElement.closest('button');
      const clickCloseButton = clickButton && clickButton.getAttribute('name') === 'close';

      if (clickMask || clickCloseButton) {
        return this.close();
      }

      return false;
    }

    _keyupHandler(event) {
      
      switch (event.code) {
        case 'Escape': {
          this.close();
          break;
        }
      }
    }

    _selectOption(option) {
      const isDisabled = option.hasAttribute('disabled');

      if (isDisabled) {
        return;
      }

      const value = option.getAttribute('value');

      if (value) {
        this.value = value;
      }

      this.close();
    }

    _doAnimate(isClose = false) {
      const contentElement = this._mockOptionListElement.querySelector('.select-component__content');

      if (!contentElement) {
        return Promise.resolve();
      }

      let timer;

      return new Promise((resolve) => {
        const onAnimationend = (event) => {
          if (event && event.target !== contentElement) {
            return;
          }

          contentElement.style.animationDirection = '';
          contentElement.style.animationName = '';

          clearTimeout(timer);
          resolve(this);
        };

        requestAnimationFrame(() => {
          if (isClose) {
            contentElement.style.animationDirection = 'reverse';
          }

          contentElement.style.animationName = `var(--select-animation-name, animation-fade-in-center)`;
          contentElement.addEventListener('animationend', onAnimationend, { once: true });

          timer = setTimeout(onAnimationend, 200);
        });
      });
    }

    _getViewportSize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      return {
        width,
        height,
        left: 0,
        right: width,
        top: 0,
        bottom: height,
      };
    }

    _adaptationPosition() {
      const contentElement = this._mockOptionListElement;
      const triggerRect = this.getBoundingClientRect();
      const viewport = this._getViewportSize();

      const MIN_GAP = 10;
      const contentRect = contentElement.getBoundingClientRect();

      const usableSpace = {
        top: triggerRect.top - MIN_GAP,
        bottom: viewport.height - triggerRect.bottom - MIN_GAP,
      };

      const enoughSpace = {
        bottom: usableSpace.bottom >= contentRect.height,
        top: usableSpace.top >= contentRect.height,
      };

      const position = Object.entries(enoughSpace).find(([, isEnoughSpace]) => isEnoughSpace)?.[0] || 'bottom';

      this.dataset.adaptationPosition = position;
    }
  };
});
