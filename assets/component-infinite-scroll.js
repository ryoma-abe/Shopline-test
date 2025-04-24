defineCustomElement(
  'infinite-scroll',
  () =>
    class InfiniteScroll extends HTMLElement {
      constructor() {
        super();
        this.page = 1;
        this.observer = null;
        this.loading = false;
        this.button = this.querySelector(this.dataset.buttonSelector);
        this.buttonWrapper = this.querySelector(this.dataset.buttonWrapperSelector);

        this.cachePageKey = 'SL_COLLECTION_CACHE';
        this.cacheLastClickKey = 'SL_COLLECTION_LAST_CLICKED_ID';
        this.cacheLastScrollKey = 'SL_COLLECTION_LAST_SCROLL';

        this.init();
      }

      init() {
        this.ensureUrlValid();
        this.checkHistory();
        this.bindProductClick();

        const useButton = Boolean(this.button);
        if (useButton) {
          this.bindButton();
          return;
        }

        const flag = this.insertFlag();
        const option = {
          threshold: 1,
        };

        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (this.isLastPageLoaded) {
              return;
            }

            if (entry.isIntersecting && !this.loading) {
              this.loadMore();
            }
          });
        }, option);

        this.observer.observe(flag);
      }

      bindProductClick() {
        this.addEventListener('click', (e) => {
          const card = e.target.closest('.product-card-wrapper');

          if (card) {
            const id = card.dataset.productId;
            this.cacheClickId(id);
          }
        });
      }

      checkHistory() {
        const cachePage = window.sessionStorage.getItem(this.cachePageKey);
        const cacheLastScroll = window.sessionStorage.getItem(this.cacheLastScrollKey);

        if (!cachePage || !cacheLastScroll) {
          return;
        }

        try {
          const cachePageData = JSON.parse(cachePage);

          if (cachePageData.currentPath !== window.location.pathname) {
            return;
          }

          const lastLoadPage = cachePageData.currentPage;

          const { contentWrapperSelector, loadingElementSelector, loadingBtnElementSelector } = this.dataset;
          const contentWrapper = this.querySelector(contentWrapperSelector);
          const loadingElement = this.querySelector(loadingElementSelector);
          const loadingBtnElement = this.querySelector(loadingBtnElementSelector);
          contentWrapper.innerHTML = lastLoadPage.html.list;
          if (loadingElement) {
            loadingElement.innerHTML = lastLoadPage.html.loading;
          }
          if (loadingBtnElement) {
            loadingBtnElement.innerHTML = lastLoadPage.html.loadingBtn;
          }

          this.page = lastLoadPage.page;

          this.handleLoadingButton(false);

          window.scrollTo({
            top: cacheLastScroll,
            behavior: 'smooth',
          });

          window.sessionStorage.removeItem(this.cacheLastScrollKey);
        } catch (error) {
          console.log('infinite scroll error: ', error);
        }
      }

      bindButton() {
        this.button.addEventListener('click', () => {
          if (this.isLastPageLoaded) {
            return;
          }

          if (!this.loading) {
            this.loadMore();
          }
        });
      }

      reset(params) {
        this.page = 1;
        this.dataset.total = params.total;
        this.dataset.pageSize = params.pageSize;
      }

      get isLastPageLoaded() {
        const { pageSize, total } = this.dataset;
        const currentNum = this.page * pageSize;

        return currentNum >= total;
      }

      insertFlag() {
        const flag = document.createElement('div');
        flag.classList.add('infinite-scroll-flag');
        this.appendChild(flag);
        return flag;
      }

      handleLoading(loading) {
        this.loading = loading;

        this.handleLoadingButton(loading);

        const { loadingElementSelector, loadingActiveClass } = this.dataset;
        const ele = this.querySelector(loadingElementSelector);
        if (!ele) {
          return;
        }

        if (loading) {
          ele.classList.add(loadingActiveClass);
        } else {
          ele.classList.remove(loadingActiveClass);
        }
      }

      handleLoadingButton(loading) {
        if (!this.button) {
          return;
        }

        const loadingDisabledClass = 'disabled';
        const loadingActiveClass = 'loading';

        if (loading) {
          this.button.classList.add(loadingDisabledClass);
          this.button.classList.add(loadingActiveClass);
        } else {
          this.button.classList.remove(loadingDisabledClass);
          this.button.classList.remove(loadingActiveClass);
        }

        if (this.isLastPageLoaded) {
          this.buttonWrapper.classList.add('hidden');
        }
      }

      ensureUrlValid() {
        const url = removeURLArg(window.location.href, ['page_num', 'page_size']);
        window.history.pushState({}, '', url);
      }

      loadMore() {
        const {
          pageSize,
          section: sectionId,
          contentWrapperSelector,
          loadingElementSelector,
          loadingBtnElementSelector,
        } = this.dataset;
        const url = changeURLArg(window.location.href, {
          page_num: this.page + 1,
          page_size: pageSize,
          section_id: sectionId,
        });

        this.handleLoading(true);
        fetch(url)
          .then((res) => res.text())
          .then((resText) => {
            const html = new DOMParser().parseFromString(resText, 'text/html');
            const source = html.querySelector(contentWrapperSelector);
            const destination = this.querySelector(contentWrapperSelector);

            if (!source || !destination) {
              return;
            }

            destination.innerHTML += source.innerHTML;

            // normal infinite tips
            const currentLoadingElement = this.querySelector(loadingElementSelector);
            const updateLoadingElement = html.querySelector(loadingElementSelector);
            if (currentLoadingElement && updateLoadingElement) {
              currentLoadingElement.innerHTML = updateLoadingElement.innerHTML;
            }
            // scroll button infinite tips
            const currentLoadingBtnElement = this.querySelector(loadingBtnElementSelector);
            const updateLoadingBtnElement = html.querySelector(loadingBtnElementSelector);
            if (currentLoadingBtnElement && updateLoadingBtnElement) {
              currentLoadingBtnElement.innerHTML = updateLoadingBtnElement.innerHTML;
            }

            this.page += 1;
            this.handleLoading(false);

            this.cachePage({
              page: this.page,
              html: {
                list: destination.innerHTML,
                loading: currentLoadingElement?.innerHTML || '',
                loadingBtn: currentLoadingBtnElement?.innerHTML || '',
              },
            });
          });
      }

      cacheClickId(id) {
        window.sessionStorage.setItem(this.cacheLastClickKey, id);
        window.sessionStorage.setItem(this.cacheLastScrollKey, window.scrollY);
      }

      cachePage(cacheItem) {
        const cacheKey = this.cachePageKey;
        const initialData = {
          currentPath: window.location.pathname,
          currentPage: {},
        };

        let cacheData = window.sessionStorage.getItem(cacheKey);

        if (!cacheData) {
          cacheData = initialData;
        } else {
          try {
            cacheData = JSON.parse(cacheData);

            if (cacheData.currentPath !== window.location.pathname) {
              cacheData = initialData;
            }
          } catch (error) {
            cacheData = initialData;
          }
        }

        cacheData.currentPage = cacheItem;

        window.sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
    },
);
