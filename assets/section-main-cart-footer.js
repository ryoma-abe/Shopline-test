(() => {
  const footerContainer = document.querySelector('#main-cart-footer');
  const container = footerContainer.querySelector('.cart-fixed-checkout');
  const checkoutButton = footerContainer.querySelector('.cart__checkout .cart__checkout-button');
  const fixedCheckout = footerContainer.querySelector('.cart-footer__fixed-checkout');

  footerContainer.addEventListener('click', (event) => {
    const { target } = event;

    if (
      target.matches('.cart-fixed-checkout__dropdown-button') ||
      target.closest('.cart-fixed-checkout__dropdown-button')
    ) {
      container.classList.toggle('collapsed');
    }

    if (target.matches('.cart-drawer__dropdown-toggle') || target.closest('.cart-drawer__dropdown-toggle')) {
      container.classList.toggle('collapsed');
    }
  });

  
  observeElementVisible(checkoutButton, (isVisibled) => {
    fixedCheckout.classList.toggle('invisible', isVisibled, {
      root: footerContainer,
    });
  });
})();
