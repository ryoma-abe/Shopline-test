defineCustomElement(
  'show-more-button',
  () =>
    class ShowMoreButton extends HTMLElement {
      constructor() {
        super();
        const showMoreButton = this.querySelector('[id^="Show-More-"]');
        this.expandText = this.querySelector('.show-more-expand');
        this.foldText = this.querySelector('.show-more-fold');
        this.expand = false;
        showMoreButton.addEventListener('click', (event) => {
          this.expandShowMore(event);
        });
      }

      expandShowMore(event) {
        const { target } = event;
        const volumePricingList = target.closest('[id^="Show-More-"]').closest('volume-pricing');
        volumePricingList.querySelectorAll('.show-more-item').forEach((item) => item.classList.toggle('display-none'));
        this.expandText.classList.toggle('display-none');
        this.foldText.classList.toggle('display-none');
      }
    },
);
