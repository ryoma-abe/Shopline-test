class CustomerActivateAccount {
  constructor() {
    this.form = document.querySelector('#activate-account-form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.handleTogglePwdInput();
    this.requireTooltipHandler();

    this.activate = new window.Shopline.customerAccount.Activate(this.form);
  }

  onSubmitHandler(e) {
    e.preventDefault();
    if (this.submitBtn.classList.contains('loading')) {
      return;
    }

    this.submitBtn.classList.add('loading');

    this.activate
      .submit()
      .then((response) => {
        this.handleSetErrorMsg(null);
        console.log('success', response);
        window.location.href = window.routes.account_url;
      })
      .catch((err) => {
        console.log('error', err);
        this.handleSetErrorMsg(err);
      })
      .finally(() => {
        this.submitBtn.classList.remove('loading');
      });
  }

  handleTogglePwdInput() {
    const ctrl = this.form.querySelector('#toggle-password');
    const pwdInput = this.form.querySelector('#Password');
    if (ctrl) {
      const showBtn = ctrl.querySelector('#pwd--show');
      const hidenBtn = ctrl.querySelector('#pwd--hiden');
      ctrl.addEventListener('click', () => {
        if (pwdInput.type === 'password') {
          pwdInput.type = 'text';
          showBtn.classList.add('display-none');
          hidenBtn.classList.remove('display-none');
        } else {
          pwdInput.type = 'password';
          hidenBtn.classList.add('display-none');
          showBtn.classList.remove('display-none');
        }
      });
    }
  }

  handleSetErrorMsg(error) {
    if (!error) {
      this.form.querySelector('#customer-error-message').innerHTML = '';
      this.form.querySelector('#customer-error-message').removeAttribute('data-code');
      return;
    }
    if ('msg' in error) {
      this.form.querySelector('#customer-error-message').innerHTML = error.msg;
      return;
    }
    this.form.querySelector('#customer-error-message').innerHTML = error;
  }

  requireTooltipHandler() {
    this.agreeCheckBox = this.form.querySelector('input[name="agree"]');
    if (this.agreeCheckBox) {
      this.agreeCheckBox.addEventListener('invalid', (e) => {
        e.preventDefault();
        this.agreeCheckBox.parentNode.querySelector('tool-tip').open();
      });
      this.agreeCheckBox.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.agreeCheckBox.parentNode.querySelector('tool-tip').close();
        }
      });
    }
  }
}

window.Shopline.loadFeatures(
  [
    {
      name: 'customer-account-api',
      version: '0.3',
    },
  ],
  function (error) {
    if (error) {
      throw error;
    }

    new CustomerActivateAccount();
  },
);
