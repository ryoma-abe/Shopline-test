const MAX_COUNT_DOWN_COUNT = 60;
const EMAILTIP = t('customer.general.email_tip');
const PHONETIP = t('customer.general.phone_tip');
class CustomerPasswordNew {
  constructor() {
    this.form = document.querySelector('#reset_create-customer-form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.handleTabSwitch();
    this.handleTogglePwdInput();
    this.handleTip();

    this.verifyCodeButton = this.form.querySelector('.verifycode-button');
    if (this.verifyCodeButton) {
      this.verifyCodeTimer = this.getVerifyCodeTimer();
      this.verifyCodeButton.addEventListener('click', this.onSendVerifyCodeHandler.bind(this));
    }
    this.passwordNew = new window.Shopline.customerAccount.PasswordNew(this.form);
  }

  onSendVerifyCodeHandler(e) {
    e.preventDefault();

    if (!this.verifyCodeTimer.done()) return;
    this.verifyCodeTimer.start();

    this.passwordNew
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

    this.passwordNew
      .submit()
      .then(() => {
        this.handleSetErrorMsg(null);
        window.location.href = window.routes.account_login_url;
      })
      .catch((err) => {
        this.handleSetErrorMsg(err);
      })
      .finally(() => {
        this.submitBtn.classList.remove('loading');
      });
  }

  handleTip() {
    let tipText = EMAILTIP;
    const tip = document.querySelector('#reset-customer-password-tip');
    const supportTypeDom = document.querySelector('#reset-customer-password-support-type');
    const supportType = supportTypeDom.getAttribute('data-support-type-list');
    if (supportType.includes('email')) {
      tipText = EMAILTIP;
    }
    if (supportType.includes('mobile')) {
      tipText = PHONETIP;
    }
    if (supportType.includes('email') && supportType.includes('mobile')) {
      tipText = EMAILTIP;
    }
    tip.innerText = tipText;
  }

  handleTabSwitch() {
    const tab = document.querySelector('#create-customer-tab');
    const email = document.querySelector('.field[data-type="email"]');
    const mobile = document.querySelector('.field[data-type="mobile"]');
    const emailTab = tab && tab.querySelector('a[data-type="email"]');
    const mobileTab = tab && tab.querySelector('a[data-type="mobile"]');
    const tip = document.querySelector('#reset-customer-password-tip');

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
          if (e.currentTarget.className.indexOf('active') === -1) {
            this.verifyCodeTimer && this.verifyCodeTimer.stop();
          }
          if (type === 'email') {
            tip.innerText = EMAILTIP;
          } else {
            tip.innerText = PHONETIP;
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
    const toggleBtn = this.form.querySelector('#toggle-password');
    const toggleBtn2 = this.form.querySelector('#re-toggle-password');
    const passwordDom = this.form.querySelector('#password');
    const confPasswordDom = this.form.querySelector('#passwordConfirm');
    if (toggleBtn || toggleBtn2) {
      const showBtn1 = toggleBtn.querySelector('.pwd--show');
      const hidenBtn1 = toggleBtn.querySelector('.pwd--hiden');
      const showBtn2 = toggleBtn2.querySelector('#re-pwd--show');
      const hidenBtn2 = toggleBtn2.querySelector('#re-pwd--hiden');

      toggleBtn.addEventListener('click', () => {
        if (passwordDom.type === 'password') {
          passwordDom.type = 'text';
          showBtn1.classList.add('display-none');
          hidenBtn1.classList.remove('display-none');
        } else {
          passwordDom.type = 'password';
          hidenBtn1.classList.add('display-none');
          showBtn1.classList.remove('display-none');
        }
      });

      toggleBtn2.addEventListener('click', () => {
        if (confPasswordDom.type === 'password') {
          confPasswordDom.type = 'text';
          showBtn2.classList.add('display-none');
          hidenBtn2.classList.remove('display-none');
        } else {
          confPasswordDom.type = 'password';
          hidenBtn2.classList.add('display-none');
          showBtn2.classList.remove('display-none');
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
    const _self = this;

    return {
      count,
      done() {
        return count <= 0 || count === MAX_COUNT_DOWN_COUNT;
      },
      stop() {
        timer && clearInterval(timer);
        timer = null;
        count = MAX_COUNT_DOWN_COUNT;
        _self.verifyCodeButton.removeAttribute('disabled');
        _self.verifyCodeButton.innerText = count;
        _self.verifyCodeButton.innerText = t('customer.general.send');
      },
      start() {
        if (timer) return;
        _self.verifyCodeButton.innerText = `${t('customer.general.resend')} (${count})`;
        _self.verifyCodeButton.setAttribute('disabled', true);
        timer = setInterval(() => {
          count--;
          _self.verifyCodeButton.innerText = `${t('customer.general.resend')} (${count})`;
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
  (error) => {
    if (error) {
      throw error;
    }

    new CustomerPasswordNew();
  },
);
