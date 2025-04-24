defineCustomElement(
  'share-card',
  () =>
    class ShareCard extends HTMLElement {
      constructor() {
        super();
        this.init();
      }

      init() {
        const activeClass = 'third-party-more-active';
        const currentClass = 'third-party-more';
        const id = this.getAttribute('data-id');
        const moreId = `share_card_${id}`;
        const moreDom = this.querySelector(`.${currentClass}`);
        if (!moreDom) return;
        document.body.addEventListener('click', (e) => {
          const pathList = e.composedPath();
          const ctrDom = pathList.find(function (item) {
            const str = item.getAttribute && item.getAttribute('class');
            if (str && str.includes(currentClass) && item.id === moreId) {
              return true;
            }
            return false;
          });
          if (ctrDom) {
            if (ctrDom.className.includes(activeClass)) {
              moreDom.className = currentClass;
            } else {
              moreDom.className = `${currentClass} ${activeClass}`;
            }
          } else {
            moreDom.className = currentClass;
          }
        });
      }
    },
);
