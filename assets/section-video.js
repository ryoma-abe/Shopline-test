defineCustomElement(
  'video-section',
  () =>
    class VideoSection extends HTMLElement {
      connectedCallback() {
        const handleIntersection = (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          observer.unobserve(this);
          const isOpenAutoPlay = this.getAttribute('data-auto-play') === 'true';
          if (isOpenAutoPlay) {
            this.handleVideoAutoPlay();
          }
        };

        new IntersectionObserver(handleIntersection.bind(this), {
          rootMargin: '0px 0px 0px 0px',
        }).observe(this);
      }

      handleVideoAutoPlay() {
        const deferredMedia = this.querySelector('deferred-media');
        if (deferredMedia) {
          deferredMedia.loadContent(false);
        }
      }
    },
);
