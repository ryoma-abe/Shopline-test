defineCustomElement(
  'featured-collection-tabs',
  () =>
    class FeaturedCollectionTabs extends HTMLElement {
      constructor() {
        super();

        this.tabWrap = this.querySelector('.featured-collection__tabs');
        this.tabs = this.querySelectorAll('.featured-collection__tabs-item');

        this.tabs.forEach((tab) => {
          tab.addEventListener('click', (event) => this.switchTo(event.target.dataset.id));
        });

        // Overflow scroll
        detectingScreen(({ isMobileScreen }) => {
          if (isMobileScreen) {
            if (this.tabWrap.scrollWidth > this.tabWrap.clientWidth) {
              this.tabWrap.classList.add('flex-start');
            } else {
              this.tabWrap.classList.remove('flex-start');
            }
          }
        }, true);
      }

      get loading() {
        return this.dataset.loading === 'true';
      }

      set loading(force) {
        this.dataset.loading = String(force);
      }

      async loadContent(blockId, awaitTime) {
        let content = null;
        this.loading = true;

        if (awaitTime) {
          await new Promise((resolve) => {
            setTimeout(resolve, awaitTime);
          });
        }

        try {
          const queryPath = new URL(window.location);
          const { searchParams } = queryPath;

          searchParams.append('section_id', this.dataset.sectionId);
          searchParams.append(
            'attributes',
            JSON.stringify({
              block_id: blockId,
            }),
          );

          const response = await fetch(queryPath.toString());
          const responseText = await response.text();
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          const blockSelector = `.slider-block--${blockId}`;
          content = responseHTML.querySelector(blockSelector);

          if (content) {
            const oldContent = this.querySelector(blockSelector);
            if (oldContent) {
              this.replaceChild(content, oldContent);
            } else {
              this.appendChild(content);
            }
            window.initVisibleAnimation();
          }
        } finally {
          this.loading = false;
        }

        return content;
      }

      switchTo(blockId, awaitTime) {
        if (!blockId) return;

        this.tabs.forEach(async (tab) => {
          const currentId = tab.dataset.id;
          let isActive = currentId === blockId;

          const pagination = this.querySelector(`.slider-block-pagination--${currentId}`);
          pagination && pagination.classList.toggle('display-none', !isActive);

          tab.classList.toggle('featured-collection__tabs-item--active', isActive);
          isActive && this.tabWrap.scrollTo({ left: tab.offsetLeft - tab.clientWidth - 10, behavior: 'smooth' });

          let content = this.querySelector(`.slider-block--${currentId}`);
          if (isActive && !content) {
            content = await this.loadContent(currentId, awaitTime);
            // reset active status
            isActive = tab.classList.contains('featured-collection__tabs-item--active');
            pagination && pagination.init();
          }
          content && content.classList.toggle('display-none', !isActive);
        });
      }

      switchTab(index) {
        const targetTab = this.querySelector(
          `.featured-collection__tabs .featured-collection__tabs-item:nth-of-type(${index})`,
        );

        this.switchTo(targetTab.dataset.id, 1000);
      }
    },
);
