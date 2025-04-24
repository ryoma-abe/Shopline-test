defineCustomElement('media-gallery', () => {
  return class MediaGallery extends HTMLElement {
    constructor() {
      super();
      this.elements = {
        viewer: this.querySelector('[id^="GalleryViewer"]'),
        thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
      };
      this.mql = window.matchMedia('(min-width: 750px)');
      this.mediaVideoAutoPlay = this.getAttribute('data-video-autoplay') === 'true';
      this.paginationType = this.getAttribute('data-pagination-type');
      this.handleVideoAutoPlay();
      this.initMultiStylesPagination();

      this.elements.viewer.addEventListener('slideChanged', window.debounce(this.onSlideChanged.bind(this), 300));

      if (!this.elements.thumbnails) return;
      this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
        mediaToSwitch
          .querySelector('button')
          .addEventListener('click', this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false));
      });
    }

    connectedCallback() {
      document.addEventListener('animationstart', (event) => {
        if (event.animationName === 'galleryLoaded') {
          this.elements.viewer.resetSlides();
        }
      });
    }

    onSlideChanged(event) {
      const { currentElement, currentPage } = event.detail;
      // Execute when thumbnail exists
      this.setActiveThumbnail(currentElement.dataset.mediaId);
      // Execute when customize pagination exists
      this.setActiveMultiStylesPagination(currentPage);
    }

    setActiveMultiStylesPagination(currentPage = 1) {
      const mobileQl = window.matchMedia('(max-width: 959px)');

      const PROGRESS = 'progress';
      const DOT = 'dot';
      const SLIDER_BAR = 'slider-bar';
      const extraPaginationType = [PROGRESS, DOT, SLIDER_BAR];
      if (!mobileQl.matches || !extraPaginationType.includes(this.paginationType)) return;

      const totalPage = this.elements.viewer._getTotalPage();

      if (!totalPage || !currentPage) return;

      if (this.paginationType === PROGRESS) {
        const progressElement = this.querySelector('.product-pagination__progress');
        const widthPercent = ((currentPage / totalPage) * 100).toFixed(3);

        progressElement.style.setProperty('--progress-percent', `${widthPercent}%`);
      } else if (this.paginationType === DOT || SLIDER_BAR) {
        const dotElements = this.querySelectorAll('.product-pagination__dot-slider .tap-area');

        dotElements.forEach((element, index) => {
          element.removeAttribute('data-current');
          element.classList.remove('display-block', 'display-none');
          if (index < totalPage) {
            element.classList.add('display-block');
          } else {
            element.classList.add('display-none');
          }
          if (index === currentPage - 1) {
            element.setAttribute('data-current', true);
          }
        });
      }
    }

    initMultiStylesPagination() {
      window.setTimeout(() => {
        const { currentPage } = this.elements.viewer;
        this.setActiveMultiStylesPagination(currentPage);
      });
    }

    handleRemoveNotSelectedVariantStatus() {
      const INIT_CLASS = 'js-init-not-selected-variant';
      const { sectionId } = this.dataset;
      const productModal = document.querySelector(`#ProductModal-${sectionId}`);
      if (this.classList.contains(INIT_CLASS)) {
        this.classList.remove(INIT_CLASS);
        window.setTimeout(() => {
          this.setActiveMultiStylesPagination();
        });
      }
      if (productModal && productModal.classList.contains(INIT_CLASS)) {
        productModal.classList.remove(INIT_CLASS);
      }
    }

    setActiveMedia(mediaId, prepend) {
      const activeMedia = this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`);
      const activeMediaIndex = Array.from(activeMedia.parentElement.children).indexOf(activeMedia);
      const isMobile = window.isMobileScreen();

      const pcStyle = this.getAttribute('data-desktop-layout');
      const hideVariants = this.getAttribute('data-hide-variants') === 'true';
      const pcIsSlider = pcStyle === 'thumbnail_flatten' || pcStyle === 'carousel';
      if (pcIsSlider && activeMediaIndex > -1) {
        this.elements.viewer.querySelectorAll('[id^="Slide-"]').forEach((slide, idx) => {
          slide.classList[idx === activeMediaIndex ? 'add' : 'remove']('is-active');
        });
        this.elements.viewer.resetSlides();
      }

      if (prepend && (hideVariants || (!isMobile && !pcIsSlider))) {
        activeMedia.parentElement.prepend(activeMedia);
        this.handleRemoveNotSelectedVariantStatus();
        if (this.elements.thumbnails) {
          const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
          activeThumbnail.parentElement.prepend(activeThumbnail);
          this.elements.thumbnails.resetSlides();
        }
        if (this.elements.viewer.slider) {
          this.elements.viewer.resetSlides();
          this.elements.viewer.slideTo(1);
        }
      }

      window.setTimeout(() => {
        // thumbnails control mobile gallery scroll
        activeMedia.parentElement.scrollTo({
          left: activeMedia.offsetLeft,
        });

        // control activeMedia scroll when no thumbnail exists
        const needAutoScrollDesktopLayout = ['flatten', 'columns', 'stacked'];
        if (
          !isMobile &&
          !this.closest('.quick-add-modal__content') &&
          !this.closest('[load-feature-modal]') &&
          (!this.elements.thumbnails || needAutoScrollDesktopLayout.includes(this.dataset.desktopLayout))
        ) {
          const headerLayout = document.body.querySelector('header-layout');
          window.scrollTo({
            top:
              window.scrollY +
              activeMedia.getBoundingClientRect().top -
              (headerLayout.isSticky ? headerLayout.headerLayout.clientHeight : 0),
            behavior: 'smooth',
          });
        }
      });
      this.playActiveMedia(activeMedia);
      // control thumbnails activeMedia scroll
      this.setActiveThumbnail(mediaId);
    }

    setActiveThumbnail(activeThumbnailMediaId) {
      if (!this.elements.thumbnails || !activeThumbnailMediaId) return;
      const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${activeThumbnailMediaId}"]`);

      this.elements.thumbnails.querySelectorAll('button').forEach((element) => element.removeAttribute('data-current'));
      activeThumbnail.querySelector('button').setAttribute('data-current', true);
      if (this.elements.thumbnails.isSlideVisible(activeThumbnail)) return;

      this.elements.thumbnails.slider.scrollTo(
        this.elements.thumbnails.direction === 'vertical'
          ? { top: activeThumbnail.offsetTop }
          : { left: activeThumbnail.offsetLeft },
      );
    }

    playActiveMedia(activeItem) {
      window.pauseAllMedia();
      if (!this.mediaVideoAutoPlay) return;
      const deferredMedia = activeItem.querySelector('.deferred-media');
      if (deferredMedia) {
        deferredMedia.loadContent(false);
        deferredMedia.playVideo(false);
      }
    }

    handleVideoAutoPlay() {
      const container = document.querySelector(this.getAttribute('data-parent-container'));

      const isInViewPort = (element) => {
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const { top, left, right, width, height } = element.getBoundingClientRect();

        return width > 0 && height > 0 && top >= 0 && left >= 0 && right <= viewWidth && top <= viewHeight;
      };

      const checkDeferredMedia = () => {
        if (this.mediaVideoAutoPlay) {
          const medias = this.elements.viewer.querySelectorAll('.deferred-media');
          medias.forEach((el) => {
            if (isInViewPort(el)) {
              el.loadContent(false);
              el.playVideo();
            }
          });
        }
      };

      setTimeout(() => {
        checkDeferredMedia();
      }, 200);
      (container || window).addEventListener('scroll', checkDeferredMedia);
      this.elements.viewer.addEventListener('slideChanged', () => {
        // wait slide finished
        setTimeout(() => {
          checkDeferredMedia();
        }, 200);
      });
    }
  };
});
