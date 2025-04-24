function themeEditorEntry() {
  if (window.__themeEditorInstance__) return;

  window.__themeEditorInstance__ = true;

  function getThemeEditorEventData(event) {
    const { index = null } = event.detail;
    const shoplineSection = event.target?.closest('[data-shopline-editor-section]');

    const sectionType = (() => {
      const sectionData = shoplineSection?.dataset?.shoplineEditorSection;

      if (sectionData) {
        try {
          const parsedData = JSON.parse(sectionData);
          return parsedData.type || '';
        } catch (err) {
          return '';
        }
      }

      return '';
    })();

    return {
      blockElement: event.target,
      sectionType,
      index,
    };
  }

  function handleBlockEvent(event) {
    const { index, blockElement, sectionType } = getThemeEditorEventData(event);

    if (sectionType === 'announcement-bar') {
      const announcementBarSlider = blockElement?.closest('announcement-bar-slider');

      return {
        blockSelect: () => {
          if (index !== null) {
            announcementBarSlider?.splideTo(index);
          }
        },
        blockDeselect: () => {
          announcementBarSlider?.play();
        },
      };
    }

    if (sectionType === 'collapsible-content') {
      const details = blockElement?.querySelector('details');

      return {
        blockSelect: () => {
          if (details) {
            details.toggleAttribute('open', true);
          }
        },
        blockDeselect: () => {
          if (details) {
            details.toggleAttribute('open', false);
          }
        },
      };
    }

    if (sectionType === 'collection-list-new' || sectionType === 'icon-list') {
      const slider = blockElement?.closest('slider-component');

      return {
        blockSelect: () => {
          if (index !== null) {
            slider?.slideTo(index + 1);
          }
        },
      };
    }

    if (sectionType === 'featured-collection') {
      const sliderTab = blockElement?.closest('featured-collection-tabs');

      return {
        blockSelect: () => {
          if (index !== null) {
            sliderTab?.switchTab(index + 1);
          }
        },
      };
    }

    if (sectionType === 'featured-slideshow') {
      const featuredSlideshowSection = blockElement?.closest('featured-slideshow-section');

      return {
        blockSelect: () => {
          if (index !== null && featuredSlideshowSection) {
            featuredSlideshowSection.splideTo(index);
          }
        },
        blockDeselect: () => {
          featuredSlideshowSection?.play();
        },
      };
    }

    if (sectionType === 'footer') {
      const footerMenu = blockElement?.closest('footer-menu');

      return {
        blockSelect: () => {
          footerMenu?.openMenu();
        },
        blockDeselect: () => {
          footerMenu?.closeMenu();
        },
      };
    }

    if (sectionType === 'picture-floating') {
      const pictureFloating = blockElement?.closest('picture-floating');

      return {
        blockSelect: () => {
          if (index !== null) {
            pictureFloating?.splideTo(index);
          }
        },
      };
    }

    if (sectionType === 'slideshow') {
      const slider = blockElement?.closest('slider-component');

      return {
        blockSelect: () => {
          if (index !== null) {
            if (slider?.getAttribute('autoplay') === 'true') {
              slider?.plugins.autoplay.pause();
            }
            slider?.slideTo(index + 1);
          }
        },
        blockDeselect: () => {
          if (slider?.getAttribute('autoplay') === 'true') {
            slider?.plugins.autoplay.play();
          }
        },
      };
    }

    if (sectionType === 'text-columns-with-image') {
      const textImageSlideSection = blockElement?.closest('text-image-slide-section');

      return {
        blockSelect: () => {
          if (index !== null && textImageSlideSection) {
            textImageSlideSection.splideTo(index + 1);
          }
        },
      };
    }
  }

  document.addEventListener('shopline:section:unload', (event) => {
    const { sectionId } = event.detail;

    const productModal = document.querySelector(`#ProductModal-${sectionId}`);

    if (productModal) {
      productModal.remove();
    }
  });

  document.addEventListener('shopline:block:select', (event) => {
    handleBlockEvent(event)?.blockSelect?.();
  });

  document.addEventListener('shopline:block:deselect', (event) => {
    handleBlockEvent(event)?.blockDeselect?.();
  });
}

themeEditorEntry();
