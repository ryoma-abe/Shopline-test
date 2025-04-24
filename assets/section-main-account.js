const tPc = (path, hash) => {
  return t(`customer.general.${path}`, hash);
};
const tMobile = (path, hash) => {
  return t(`customer.general.${path}`, hash);
};


const __constDatepickerLocale__ = {
  pc: {
    days: [
      tPc('sunday'),
      tPc('monday'),
      tPc('tuesday'),
      tPc('wednesday'),
      tPc('thursday'),
      tPc('friday'),
      tPc('saturday'),
    ],
    daysShort: [tPc('sun'), tPc('mon'), tPc('tue'), tPc('wed'), tPc('thu'), tPc('fri'), tPc('sat')],
    daysMin: [tPc('su'), tPc('mo'), tPc('tu'), tPc('we'), tPc('th'), tPc('fr'), tPc('sa')],
    months: [
      tPc('january'),
      tPc('february'),
      tPc('march'),
      tPc('april'),
      tPc('may'),
      tPc('june'),
      tPc('july'),
      tPc('august'),
      tPc('september'),
      tPc('october'),
      tPc('november'),
      tPc('december'),
    ],
    monthsShort: [
      tPc('jan'),
      tPc('feb'),
      tPc('mar'),
      tPc('apr'),
      tPc('may'),
      tPc('jun'),
      tPc('jul'),
      tPc('aug'),
      tPc('sep'),
      tPc('oct'),
      tPc('nov'),
      tPc('dec'),
    ],
    today: tPc('today'),
    clear: tPc('clear_button'),
    dateFormat: tPc('date_format'),
    timeFormat: tPc('time_format'),
    firstDay: parseInt(tPc('firstDay'), 10),
  },
  mobile: {
    title: tMobile('select_date'),
    cancel: tMobile('cancel'),
    confirm: tMobile('confirm_button'),
    year: '',
    month: '',
    day: '',
    hour: '',
    min: '',
    sec: '',
  },
};
;

(() => {
  const removeAddressHandle = (e) => {
    e.preventDefault();
    if (window.confirm(e.currentTarget.getAttribute('data-confirm-message'))) {
      const formId = e.currentTarget.getAttribute('data-form-id');
      document.getElementById(formId).submit();
    }
  };
  document.querySelectorAll('.address__btn--remove').forEach((item) => {
    item.addEventListener('click', removeAddressHandle);
  });
})();

class AccountPersonal {
  constructor() {
    const accountContainer = document.getElementById('account');
    this.account = {
      container: accountContainer,
      editEntry: document.getElementById('js-account-edit'),
      cancelBtn: accountContainer.querySelector('.cancel-edit'),
      firstNameInput: accountContainer.querySelector('input[name="customer[first_name]"]'),
      lastNameInput: accountContainer.querySelector('input[name="customer[last_name]"]'),
      changeEmailEntry:
        accountContainer.querySelector('.email .info-value__edit') ||
        accountContainer.querySelector('.email .bind-info'),
      changePhoneEntry:
        accountContainer.querySelector('.phone .info-value__edit') ||
        accountContainer.querySelector('.phone .bind-info'),
    };

    const personalContainer = document.getElementById('personal');
    this.personal = {
      container: personalContainer,
      editEntry: document.getElementById('js-personal-edit'),
      cancelBtn: personalContainer.querySelector('.cancel-edit'),
      birthdayInput: personalContainer.querySelector('input[name="customer[birthday]"]'),
      genderInput: personalContainer.querySelectorAll('input[name="customer[gender]"]'),
    };
    // account
    this.initUserName();
    this.initAccountEditState();
    // personal
    this.initDatepicker();
    this.initPersonalInfo();
    this.initPersonalEditState();
  }

  initUserName() {
    this.initFirstName = this.account.firstNameInput.value;
    this.initLastName = this.account.lastNameInput.value;
  }

  setUserName(firstName, lastName) {
    const { firstNameInput, lastNameInput } = this.account;
    firstNameInput.value = firstName;
    lastNameInput.value = lastName;
  }

  initAccountEditState() {
    const { container, editEntry, cancelBtn, changeEmailEntry, changePhoneEntry } = this.account;
    editEntry.addEventListener('click', () => {
      container.classList.add('editing');
      editEntry.style.display = 'none';
    });
    cancelBtn.addEventListener('click', () => {
      container.classList.remove('editing');
      editEntry.style.display = 'block';
      this.setUserName(this.initFirstName, this.initLastName);
    });
    changeEmailEntry.addEventListener('click', () => {
      const emailModalTemp = container.querySelector('#modify-email__modal');
      document.body.appendChild(emailModalTemp.content.firstElementChild.cloneNode(true));
      document.body.classList.add('overflow-hidden');
    });
    changePhoneEntry.addEventListener('click', () => {
      const phoneModalTemp = container.querySelector('#modify-phone__modal');
      document.body.appendChild(phoneModalTemp.content.firstElementChild.cloneNode(true));
      document.body.classList.add('overflow-hidden');
    });
  }

  initPersonalEditState() {
    const { container, editEntry, cancelBtn } = this.personal;
    editEntry.addEventListener('click', () => {
      container.classList.add('editing');
      editEntry.style.display = 'none';
    });
    cancelBtn.addEventListener('click', () => {
      container.classList.remove('editing');
      editEntry.style.display = 'block';
      this.setPersonalInfo(this.initBirthday, this.initGender);
    });
  }

  initPersonalInfo() {
    this.initBirthday = this.personal.birthdayInput.value;
    this.initGender = this.personal.container.querySelector('input[name="customer[gender]"]:checked')?.value;
  }

  setPersonalInfo(birthdayValue, genderValue) {
    const { genderInput } = this.personal;
    if (this.datepickerMobile) {
      this.datepickerMobile.value = birthdayValue;
    }
    if (this.datepickerPC) {
      this.datepickerPC.selectDate(birthdayValue);
    }
    const initGender = Array.from(genderInput).find((item) => item.value === genderValue);
    if (initGender) {
      initGender.checked = true;
    }
  }

  initDatepicker() {
    const input = document.querySelector('#editBirthday');
    const _this = this;
    if (input) {
      const initialValue = input.value;
      return detectingScreen(function change({ isMobileScreen }) {
        if (isMobileScreen) {
          
          const datepickerMobile = new Rolldate({
            el: `#editBirthday`,
            beginYear: '1900',
            value: initialValue || '',
            endYear: new Date().getFullYear(),
            init() {
              setTimeout(() => {
                
                document.querySelector('.rolldate-container').classList.add('notranslate');
              }, 0);
            },
            lang: __constDatepickerLocale__.mobile,
            trigger: 'click',
          });
          _this.datepickerMobile = datepickerMobile;
        }
        
        const datepicker = new AirDatepicker(`#editBirthday`, {
          dateFormat: 'yyyy-MM-dd',
          classes: 'notranslate',
          locale: __constDatepickerLocale__.pc,
          maxDate: new Date(),
          minDate: new Date('1900-01-01'),
          autoClose: true,
          onSelect: () => {},
        });
        if (initialValue) {
          datepicker.selectDate(initialValue);
        }
        _this.datepickerPC = datepicker;
      }, true);
    }
  }
}
new AccountPersonal();

class ModifyCustomerPhoneOrEmailModal extends HTMLElement {
  get modifyType() {
    return this.getAttribute('data-type');
  }

  constructor() {
    super();
    this.form =
      this.modifyType === 'phone'
        ? this.querySelector('#bind-customer-phone')
        : this.querySelector('#bind-customer-email');

    this.bindCustomerPhoneOrEmail =
      this.modifyType === 'phone'
        ? new window.Shopline.customerAccount.BindCustomerPhone(this.form)
        : new window.Shopline.customerAccount.BindCustomerEmail(this.form);
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));

    this.initPhoneCode();
    this.initHandleCancel();
    this.initFieldInputFocus();

    const checkTag = this.form.getAttribute('data-check');
    if (checkTag === 'true') {
      // need verifyCode
      // init step1 event
      this.formStep1 = this.form.querySelector('.modify-info__step1');
      // get verifyCode step1
      this.verifyCodeButtonStep1 = this.formStep1.querySelector('.modify-info__send-code');
      if (this.verifyCodeButtonStep1) {
        this.verifyCodeSuccessText = this.formStep1.querySelector('.modify-info__desc');
        this.verifyCodeStep1Timer = this.getVerifyCodeTimer(this.verifyCodeButtonStep1);
        // auto send
        this.onSendVerifyCodeHandlerStep1.call(this);
        this.verifyCodeButtonStep1.addEventListener('click', this.onSendVerifyCodeHandlerStep1.bind(this));
      }
      // next step
      this.nextStepButton = this.form.querySelector('.modify-info_next-button');
      this.nextStepButton.addEventListener('click', this.onNextStepHandler.bind(this));

      // init step2 event
      this.formStep2 = this.form.querySelector('.modify-info__step2');
      // get verifyCode step2
      this.verifyCodeButtonStep2 = this.formStep2.querySelector('.modify-info__send-code');
      if (this.verifyCodeButtonStep2) {
        this.verifyCodeStep2Timer = this.getVerifyCodeTimer(this.verifyCodeButtonStep2);
        this.verifyCodeButtonStep2.addEventListener('click', this.onSendVerifyCodeHandlerStep2.bind(this));
      }
    }
  }

  onSendVerifyCodeHandlerStep1(e) {
    // send verifyCode in step1
    e && e.preventDefault();
    if (!this.verifyCodeStep1Timer.done()) return;
    this.verifyCodeSuccessText.innerHTML = '';
    this.verifyCodeStep1Timer.start();
    this.bindCustomerPhoneOrEmail
      .sendVerifyCodeStep1()
      .then((response) => {
        const sendType = response.data.method; // sms_d or email_code_d
        const sendTarget = sendType === 'sms_d' ? `+${response.data.mobileMask}` : response.data.emailMask;
        this.verifyCodeSuccessText.innerHTML = t('customer.general.verification_code_success', {
          type: sendType === 'sms_d' ? t('customer.account.phone') : t('customer.account.email'),
          value: sendTarget,
        });
      })
      .catch((error) => {
        this.handleErrorMessage(error, this.formStep1);
        this.verifyCodeStep1Timer.stop();
      });
  }

  onNextStepHandler(e) {
    // go to next step
    e && e.preventDefault();
    if (this.nextStepButton.classList.contains('loading')) return;
    this.nextStepButton.classList.add('loading');
    this.bindCustomerPhoneOrEmail
      .nextStep()
      .then(() => {
        // show next step form when succeed
        this.formStep1.style.display = 'none';
        this.formStep2.style.display = 'block';
      })
      .catch((error) => {
        this.handleErrorMessage(error, this.formStep1);
      })
      .finally(() => {
        this.nextStepButton.classList.remove('loading');
      });
  }

  onSendVerifyCodeHandlerStep2(e) {
    // send verifyCode in step2
    e && e.preventDefault();

    if (!this.verifyCodeStep2Timer.done()) return;
    this.verifyCodeStep2Timer.start();

    this.bindCustomerPhoneOrEmail
      .sendVerifyCodeStep2()
      .then(() => {})
      .catch((error) => {
        this.handleErrorMessage(error, this.formStep2);
        this.verifyCodeStep2Timer.stop();
      });
  }

  onSubmitHandler(e) {
    // submit form
    e && e.preventDefault();
    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (submitBtn.classList.contains('loading')) return;
    submitBtn.classList.add('loading');
    this.bindCustomerPhoneOrEmail
      .submit()
      .then(() => {
        window.Shopline.utils.toast.open({
          content: t('general.handle_success'),
          duration: 1500,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((error) => {
        this.handleErrorMessage(error, this.formStep2 || this.form);
      })
      .finally(() => {
        submitBtn.classList.remove('loading');
      });
  }

  getVerifyCodeTimer(verifyCodeButton) {
    let count = 60;
    let timer;

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
        verifyCodeButton.removeAttribute('disabled');
        verifyCodeButton.innerText = count;
        verifyCodeButton.innerText = t('customer.general.send');
      },
      start() {
        if (timer) return;
        verifyCodeButton.innerText = `${t('customer.general.resend')} (${count})`;
        verifyCodeButton.setAttribute('disabled', true);
        timer = setInterval(() => {
          count--;
          verifyCodeButton.innerText = `${t('customer.general.resend')} (${count})`;
          if (this.done()) {
            this.stop();
          }
        }, 1000);
      },
    };
  }

  getHtml(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  insertElement({ newElement, targetElement, selector, type }) {
    const parent = targetElement.parentNode;
    // if exist remove
    if (parent.querySelector(selector)) {
      parent.querySelector(selector).remove();
    }
    if (type === 'insertBefore') {
      parent.insertBefore(newElement, targetElement);
    }
    if (type === 'insertAfter') {
      if (parent.lastChild === targetElement) {
        parent.appendChild(newElement);
      } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
      }
    }
  }

  handleErrorMessage(error, formContainer) {
    if (error.error_fields) {
      const input = this.form.querySelector(`input[name="${error.error_fields[0]}"]`);
      const errorClass = 'field-error-message';
      const errorDom = this.getHtml(`<div class="${errorClass} body6">${error.msg}</div>`, `.${errorClass}`);
      if (input) {
        const errorInput = input.parentNode;
        errorInput.classList.add('field-error');
        this.insertElement({
          newElement: errorDom,
          targetElement: errorInput,
          selector: `.${errorClass}`,
          type: 'insertAfter',
        });
      }
    } else if (error.msg) {
      const errorClass = 'common-error-message';
      const errorDom = this.getHtml(`<div class="${errorClass} body6">${error.msg}</div>`, `.${errorClass}`);
      this.insertElement({
        newElement: errorDom,
        targetElement: formContainer.querySelector('.modify-info__action-buttons'),
        selector: `.${errorClass}`,
        type: 'insertBefore',
      });
    }
  }

  initPhoneCode() {
    this.phoneCodeSelect = this.querySelector('select[name="customer[code]"]');
    if (this.phoneCodeSelect) {
      const codeValue = this.querySelector('.modify-code-select__value');
      this.phoneCodeSelect.addEventListener('change', (e) => {
        codeValue.innerText = `+${e.target.value}`;
      });
      const selectedPhoneCode = this.phoneCodeSelect.querySelector('option[selected="selected"]');
      if (selectedPhoneCode) {
        this.phoneCodeSelect.value = selectedPhoneCode.value;
        codeValue.innerText = `+${selectedPhoneCode.value}`;
      }
    }
  }

  initHandleCancel() {
    // handle cancel
    this.formCancelButtons = this.querySelectorAll('.js-modify-info__close_modal');
    this.formCancelButtons.forEach((item) => {
      item.addEventListener('click', this.handleCancelBtn.bind(this));
    });
  }

  initFieldInputFocus() {
    // handle input focus
    this.formInputs = this.form.querySelectorAll('input');
    this.formInputs.forEach((item) => {
      item.addEventListener('focus', function () {
        const input = this.parentNode;
        input.classList.remove('field-error');
        const errorDom = input.nextElementSibling;
        if (errorDom && errorDom.classList.contains('field-error-message')) {
          errorDom.remove();
        }
      });
    });
  }

  handleCancelBtn() {
    const modal = this.closest('details-modal');
    modal.close().then((modalDom) => {
      modalDom.parentNode.removeChild(modalDom);
    });
  }
}

class DeleteCustomer {
  constructor() {
    this.formContainer = document.querySelector('.customer__delete-container');
    if (!this.formContainer) return;
    this.form = document.querySelector('#delete-customer-form');
    if (!this.form) return;
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.verifyCodeButton = this.form.querySelector('.verifycode-button');

    if (this.verifyCodeButton) {
      this.verifyCodeTimer = this.getVerifyCodeTimer();
      this.verifyCodeButton.addEventListener('click', this.onSendVerifyCodeHandler.bind(this));
    }

    this.deleteCustomer = new window.Shopline.customerAccount.DeleteCustomer(this.form);
  }

  onSendVerifyCodeHandler(e) {
    e && e.preventDefault();

    if (!this.verifyCodeTimer.done()) return;
    this.verifyCodeTimer.start();
    this.deleteCustomer
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
      .catch(() => {
        this.verifyCodeTimer.stop();
      });
  }

  onSubmitHandler(e) {
    e && e.preventDefault();

    this.deleteCustomer
      .submit()
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        const errorContainer = this.form.querySelector('.field__info--error');
        errorContainer.classList.remove('display-none');
        errorContainer.querySelector('.text').innerText = err.msg;
      });
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
    {
      name: 'component-toast',
      version: '0.1',
    },
  ],
  function init(error) {
    if (error) {
      throw error;
    }
    new DeleteCustomer();
    defineCustomElement('modify-customer-modal', () => ModifyCustomerPhoneOrEmailModal);
  },
);

defineCustomElement(
  'unsubscribe-email-form',
  () =>
    class UnsubscribeEmailForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.submitButton = this.querySelector('button[type="submit"]');

        if (this.form && this.submitButton) {
          this.form.addEventListener('change', this.updateSubmitButtonStatus.bind(this));
        }
      }

      updateSubmitButtonStatus() {
        const formData = new FormData(this.form);
        if (formData.get('customer[unsubscribe_reason]')) {
          this.submitButton.disabled = false;
        }
      }
    },
);
