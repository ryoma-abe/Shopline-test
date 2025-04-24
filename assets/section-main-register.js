const MAX_COUNT_DOWN_COUNT = 60;

class CustomerRegister {
  constructor() {
    this.form = document.querySelector('#create-customer-form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.handleTabSwitch();
    this.handleTogglePwdInput();

    this.verifyCodeButton = this.form.querySelector('.verifycode-button');
    if (this.verifyCodeButton) {
      this.verifyCodeTimer = this.getVerifyCodeTimer();
      this.verifyCodeButton.addEventListener('click', this.onSendVerifyCodeHandler.bind(this));
    }
    this.requireTooltipHandler();
    this.register = new window.Shopline.customerAccount.Register(this.form);
  }

  onSendVerifyCodeHandler(e) {
    e.preventDefault();

    if (!this.verifyCodeTimer.done()) return;
    this.verifyCodeTimer.start();

    this.register
      .sendVerifyCode()
      .then((response) => {
        if (response && response.errorMessage) {
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

    this.register
      .submit()
      .then(() => {
        this.handleSetErrorMsg(null);
        window.location.href = window.routes.account_url;
      })
      .catch((err) => {
        this.handleSetErrorMsg(err);
      })
      .finally(() => {
        this.submitBtn.classList.remove('loading');
      });
  }

  handleTabSwitch() {
    const tab = document.querySelector('#create-customer-tab');
    const email = document.querySelector('.field[data-type="email"]');
    const mobile = document.querySelector('.field[data-type="mobile"]');
    const emailMarketing = document.querySelector('div[data-type="email-marketing"]');
    const emailMarketingCheckBox =
      emailMarketing && emailMarketing.querySelector('[name="customer[accepts_marketing]"]');
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

    emailMarketingCheckBox && emailMarketingCheckBox.setAttribute('_name', emailMarketingCheckBox.getAttribute('name'));

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
          if (field === email && emailMarketing) {
            emailMarketing.classList.add('display-none');
            emailMarketingCheckBox.setAttribute('name', '_');
            emailMarketingCheckBox.setAttribute('disabled', true);
          }
        } else {
          input.setAttribute('name', input.getAttribute('_name'));
          input.setAttribute('required', true);
          input.removeAttribute('disabled');
          if (field === email && emailMarketing) {
            emailMarketing.classList.remove('display-none');
            emailMarketing.removeAttribute('disabled');
            emailMarketingCheckBox.setAttribute('name', emailMarketingCheckBox.getAttribute('_name'));
            emailMarketingCheckBox.removeAttribute('disabled');
          }
        }
      });
    }

    if (tab) {
      mobile.classList.add('display-none');
      omitFormItem();

      const self = this;

      tab.querySelectorAll('a[data-type]').forEach((el) => {
        el.addEventListener('click', (e) => {
          const type = e.currentTarget.getAttribute('data-type');
          if (e.currentTarget.classList.contains('active') && self.verifyCodeTimer) {
            self.verifyCodeTimer.stop();
          }
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
    let count = MAX_COUNT_DOWN_COUNT;
    let timer;
    const self = this;

    return {
      count,
      done() {
        return count <= 0 || count === MAX_COUNT_DOWN_COUNT;
      },
      stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        count = MAX_COUNT_DOWN_COUNT;
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
  function callback(error) {
    if (error) {
      throw error;
    }

    new CustomerRegister();
  },
);
