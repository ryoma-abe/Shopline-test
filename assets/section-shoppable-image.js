defineCustomElement(
  'shoppable-image',
  () =>
    class ShoppableImage extends HTMLElement {
      constructor() {
        super();
        this.container = this;
        this.selectors = {
          hotspot: 'shoppable-image__hotspot',
          hotspotTooltip: 'hotspot__tooltip-wrapper',
        };
        this.modifier = {
          hotspotActived: 'shoppable-image__hotspot--active',
        };
        this.initHotspotEvent();
      }

      initHotspotEvent() {
        const enterHandler = (event) => {
          const target = event.currentTarget;
          window.clearTimeout(target.__timer__);
          this.adapteTooltipPosition(target);
          target.classList.add(this.modifier.hotspotActived);
        };
        const leaveHandler = (event) => {
          const target = event.currentTarget;
          target.__timer__ = window.setTimeout(() => {
            target.classList.remove(this.modifier.hotspotActived);
          }, 200);
        };
        [...this.container.getElementsByClassName(this.selectors.hotspot)].forEach((el) => {
          el.addEventListener('mouseenter', enterHandler.bind(this));
          el.addEventListener('mouseleave', leaveHandler.bind(this));
        });
      }

      /**
       * @params target {Element}
       */
      adapteTooltipPosition(target) {
        const TOOLTIP_TOP_DISTANCE = 15; // space
        const $tooltip = target.getElementsByClassName(this.selectors.hotspotTooltip)[0];

        const viewport = this.getViewportSize();
        const hotspotRect = target.getBoundingClientRect();
        const tooltipRect = $tooltip.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        // view range
        const spatialRange = {
          top: Math.max(0, containerRect.top) + TOOLTIP_TOP_DISTANCE,
          bottom: Math.min(viewport.height, containerRect.bottom) - TOOLTIP_TOP_DISTANCE,
          left: Math.max(0, containerRect.left) + TOOLTIP_TOP_DISTANCE,
          right: Math.min(viewport.width, containerRect.right) - TOOLTIP_TOP_DISTANCE,
        };
        // view position
        const positions = {
          top: hotspotRect.bottom + TOOLTIP_TOP_DISTANCE,
          bottom: hotspotRect.bottom + TOOLTIP_TOP_DISTANCE + tooltipRect.height,
          left: hotspotRect.left + hotspotRect.width / 2 - tooltipRect.width / 2,
          right: hotspotRect.left + hotspotRect.width / 2 + tooltipRect.width / 2,
        };

        positions.top = Math.max(spatialRange.top, positions.top);
        positions.bottom = Math.min(spatialRange.bottom, positions.bottom);
        positions.left = Math.max(spatialRange.left, positions.left);
        positions.right = Math.min(spatialRange.right, positions.right);
        // Boundary judgment top and bottom
        if (positions.bottom - positions.top < tooltipRect.height) {
          if (positions.bottom >= spatialRange.bottom && positions.top > spatialRange.top) {
            const ptop = hotspotRect.top - TOOLTIP_TOP_DISTANCE - tooltipRect.height;
            if (ptop >= spatialRange.top) {
              positions.top = ptop;
              positions.bottom = positions.top + tooltipRect.height;
            } else {
              positions.top = positions.bottom - tooltipRect.height;
            }
          } else {
            positions.bottom = positions.top + tooltipRect.height;
          }
        }

        //  Boundary judgment left and right
        if (positions.right - positions.left < tooltipRect.width) {
          if (positions.right === spatialRange.right && positions.left > spatialRange.left) {
            positions.left = positions.right - tooltipRect.width;
          } else {
            positions.right = positions.left + tooltipRect.width;
          }
        }
        $tooltip.style.top = `${positions.top - hotspotRect.top}px`;
        $tooltip.style.left = `${positions.left - hotspotRect.left}px`;
      }

      /**
       * Get the size of the visible range of the current document
       */
      getViewportSize() {
        return {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }
    },
);
