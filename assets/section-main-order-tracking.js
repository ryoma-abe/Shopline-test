defineCustomElement(
  'order-tracking',
  () =>
    class OrderTracking extends HTMLElement {
      constructor() {
        super();
        this.form = document.querySelector('#order-tracking-form');
        this.email = this.querySelector('.field[data-type="email"]');
        this.mobile = this.querySelector('.field[data-type="mobile"]');
        this.orderNumber = this.querySelector('.field[data-type="order_number"]');
        this.accountMessage = this.form.querySelector('#account-error-message');
        this.orderMessage = this.form.querySelector('#order-error-message');
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.submitBtn = this.form.querySelector(`#find-order-btn`);
        this.loadSdk();
        this.focusHandler();
        this.handleTabSwitch();
      }

      loadSdk() {
        return new Promise((resolve) => {
          if (this.orderTracking) {
            resolve(this.orderTracking);
            return;
          }
          window.Shopline.loadFeatures(
            [
              {
                name: 'order-tracking-api',
                version: '0.1',
              },
            ],
            (error) => {
              if (error) {
                throw error;
              }
              this.orderTracking = new window.Shopline.OrderTracking(this.form);
              resolve(this.orderTracking);
            },
          );
        });
      }

      async onSubmitHandler(e) {
        e.preventDefault();
        if (this.submitBtn.classList.contains('loading')) {
          return;
        }
        this.submitBtn.classList.add('loading');
        const orderTracking = await this.loadSdk();
        orderTracking
          .submit()
          .then((result) => {
            if (result.data?.orderUrl) {
              window.location.href = result.data.orderUrl;
            }
            this.submitBtn.classList.remove('loading');
          })
          .catch((result) => {
            this.submitBtn.classList.remove('loading');
            this.handleSetErrorMsg(result);
          });
      }

      resetField() {
        this.accountMessage.innerHTML = '';
        this.email.classList.remove('field--error');
        this.mobile.classList.remove('field--error');
      }

      focusHandler() {
        this.email.querySelector('input').addEventListener('focus', this.resetField.bind(this));
        this.mobile.querySelector('input').addEventListener('focus', this.resetField.bind(this));
        this.orderNumber.querySelector('input').addEventListener('focus', () => {
          this.orderMessage.innerHTML = '';
          this.orderNumber.classList.remove('field--error');
        });
      }

      handleTabSwitch() {
        const emailTab = this.querySelector('a[data-type="email"]');
        const mobileTab = this.querySelector('a[data-type="mobile"]');
        this.querySelector('#order-tracking-tab').addEventListener('click', (e) => {
          if (!e.target.getAttribute('data-type')) return;
          e.target.classList.add('active');
          this.resetField();
          if (e.target.getAttribute('data-type') === 'email') {
            this.email.classList.remove('display-none');
            this.email.querySelector('input').removeAttribute('disabled');
            this.mobile.classList.add('display-none');
            this.mobile.querySelector('input').setAttribute('disabled', 'true');
            this.mobile.querySelector('select').setAttribute('disabled', 'true');
            mobileTab.classList.remove('active');
          } else {
            this.mobile.classList.remove('display-none');
            this.mobile.querySelector('input').removeAttribute('disabled');
            this.mobile.querySelector('select').removeAttribute('disabled');
            this.email.classList.add('display-none');
            this.email.querySelector('input').setAttribute('disabled', 'true');
            emailTab.classList.remove('active');
          }
        });
      }

      handleSetErrorMsg(res) {
        if (['order_tracking[email]', 'order_tracking[phone]'].includes(res.error_fields[0])) {
          this.accountMessage.innerHTML = res.msg;
          this.email.classList.add('field--error');
        } else {
          this.orderMessage.innerHTML = res.msg;
          if (res.error_fields[0] === 'order_tracking[order_number]') {
            this.orderNumber.classList.add('field--error');
          }
        }
      }
    },
);
