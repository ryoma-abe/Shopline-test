class CustomerLogin {
  constructor() {
    this.form = document.querySelector('#login-customer-form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.verifyCodeButton = this.form.querySelector('.verifycode-button');

    if (this.verifyCodeButton) {
      this.verifyCodeTimer = this.getVerifyCodeTimer();
      this.verifyCodeButton.addEventListener('click', this.onSendVerifyCodeHandler.bind(this));
    }

    this.handleTabSwitch();
    this.handleTogglePwdInput();

    const thirdLoginContainer = this.form.querySelector('#third-login-container');
    const loginOptions = thirdLoginContainer
      ? {
          thirdLogin: {
            container: thirdLoginContainer,
            handleSuccess: () => {
              window.location.href = window.routes.account_url;
            },
            handleError: (err) => {
              if (err.code === 'needActivate') {
                this.handleSetErrorMsg(null);
                this.handleToggleActivateStep(err.data);
                this.verifyCodeButton.click();
              } else {
                console.log(err);
              }
            },
          },
        }
      : {};

    this.login = new window.Shopline.customerAccount.Login(this.form, {
      ...loginOptions,
      activate: {
        verifyCodeBtn: 'customer-login-activate-send-btn',
      },
    });
  }

  onSendVerifyCodeHandler(e) {
    e.preventDefault();

    if (!this.verifyCodeTimer.done()) return;
    this.verifyCodeTimer.start();

    this.login
      .sendVerifyCode()
      .then((response) => {
        if (response.errorMessage) {
          this.verifyCodeError = true;
        }
      })
      .finally(() => {
        if (this.verifyCodeError) {
          this.verifyCodeTimer.stop();
        }
      })
      .catch((err) => {
        this.verifyCodeTimer.stop();
        this.handleSetErrorMsg(err);
      });
  }

  onSubmitHandler(e) {
    e.preventDefault();
    if (this.submitBtn.classList.contains('loading')) {
      return;
    }

    this.submitBtn.classList.add('loading');

    this.login
      .submit()
      .then(() => {
        this.handleSetErrorMsg(null);
        window.location.href = window.routes.account_url;
      })
      .catch((err) => {
        if (err.code === 'needActivate') {
          this.handleSetErrorMsg(null);
          this.handleToggleActivateStep();
          this.verifyCodeButton.click();
        } else {
          this.handleSetErrorMsg(err);
        }
      })
      .finally(() => {
        this.submitBtn.classList.remove('loading');
      });
  }

  handleToggleActivateStep(initialValues = null) {
    const title = this.form.querySelector('#customer-login-title');
    const hint = this.form.querySelector('#customer-activation-hint');

    if (hint) {
      hint.innerText = t('customer.general.sign_in_activate', { account: '' });
    }

    if (title) {
      title.innerText = t('customer.general.sign_in_activate_title');
    }

    const verifyCodeInput = this.form.querySelector('.field[data-type="verifycode"] input');
    verifyCodeInput.toggleAttribute('required', true);
    verifyCodeInput.removeAttribute('disabled');

    const normalElements = this.form.querySelectorAll('[data-show="normal"]');
    const activateElements = this.form.querySelectorAll('[data-show="activation"]');
    Array.from(normalElements).forEach((element) => element.classList.add('display-none'));
    Array.from(activateElements).forEach((element) => element.classList.remove('display-none'));

    if (initialValues) {
      const emailDom = this.form.querySelector('.field[data-type="email"] input');
      const mobileDom = this.form.querySelector('.field[data-type="mobile"] input');
      if (initialValues.email && emailDom) {
        emailDom.value = initialValues.email;
      }
      if (initialValues.countryCode && initialValues.nationNumber && mobileDom) {
        mobileDom.value = initialValues.nationNumber;
        const select = this.form.querySelector('.field[data-type="mobile"] select');
        const selectLabel = this.form.querySelector('.field[data-type="mobile"] [data-id="country-select-label"]');
        select.value = initialValues.countryCode;
        selectLabel.innerHTML = `+${initialValues.countryCode}`;
      }
    }
  }

  handleTabSwitch() {
    const tab = document.querySelector('#login-customer-tab');
    const email = document.querySelector('.field[data-type="email"]');
    const mobile = document.querySelector('.field[data-type="mobile"]');
    const emailTab = tab && tab.querySelector('a[data-type="email"]');
    const mobileTab = tab && tab.querySelector('a[data-type="mobile"]');

    const map = {
      email,
      mobile,
    };
    const tabMap = {
      email: emailTab,
      mobile: mobileTab,
    };

    function omitFormItem() {
      [email, mobile].forEach((field) => {
        const input = field.querySelector('input');
        if (!input.getAttribute('_name')) {
          input.setAttribute('_name', input.getAttribute('name'));
        }
        if (field.classList.contains('display-none')) {
          input.setAttribute('name', '_');
          input.removeAttribute('required');
          input.setAttribute('disabled', true);
        } else {
          input.setAttribute('name', input.getAttribute('_name'));
          input.setAttribute('required', true);
          input.removeAttribute('disabled');
        }
      });
    }

    if (tab) {
      mobile.classList.add('display-none');
      omitFormItem();

      tab.querySelectorAll('a[data-type]').forEach((el) => {
        el.addEventListener('click', (e) => {
          const type = e.currentTarget.getAttribute('data-type');
          if (map[type]) {
            Object.keys(map).forEach((t) => {
              if (t === type) {
                map[t].classList.remove('display-none');
                tabMap[t].classList.add('active');
              } else {
                map[t].classList.add('display-none');
                tabMap[t].classList.remove('active');
              }
            });
            omitFormItem();
          }
        });
      });
    }
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

  getVerifyCodeTimer() {
    let count = 60;
    let timer;
    const self = this;

    return {
      count,
      done() {
        return count <= 0 || count === 60;
      },
      stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        count = 60;
        self.verifyCodeButton.removeAttribute('disabled');
        self.verifyCodeButton.innerText = count;
        self.verifyCodeButton.innerText = t('customer.general.send');
      },
      start() {
        if (timer) return;
        self.verifyCodeButton.innerText = `${t('customer.general.resend')} (${count})`;
        self.verifyCodeButton.setAttribute('disabled', true);
        timer = setInterval(() => {
          count--;
          self.verifyCodeButton.innerText = `${t('customer.general.resend')} (${count})`;
          if (this.done()) {
            this.stop();
          }
        }, 1000);
      },
    };
  }
}

window.Shopline.loadFeatures(
  [
    {
      name: 'customer-account-api',
      version: '0.3',
    },
  ],
  function callback(error) {
    if (error) {
      throw error;
    }

    new CustomerLogin();
  },
);
