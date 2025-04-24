defineCustomElement(
  'announcement-bar-sticky-top',
  () =>
    class AnnouncementBarStickyTop extends HTMLElement {
      connectedCallback() {
        this.AnnouncementBar = document.querySelector('#shopline-section-announcement-bar');
        this.onScrollHandler = this.onScroll.bind(this);
        window.addEventListener('scroll', this.onScrollHandler.bind(this), false);
        this.AnnouncementBar.classList.add(`sticky-${this.stickyMode}`);
      }

      onScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 250) {
          requestAnimationFrame(this.addStickyClass.bind(this));
        } else {
          requestAnimationFrame(this.removeStickyClass.bind(this));
        }
      }

      addStickyClass() {
        this.AnnouncementBar.classList.add('shopline-section-announcement-bar-sticky');
      }

      removeStickyClass() {
        this.AnnouncementBar.classList.remove('shopline-section-announcement-bar-sticky');
      }

      static isAnnouncementBarSticky() {
        return document.querySelector('announcement-bar-sticky-top');
      }

      disconnectedCallback() {
        window.addEventListener('scroll', this.onScrollHandler, false);
      }

      get stickyMode() {
        return this.dataset.stickyMode;
      }
    },
);
