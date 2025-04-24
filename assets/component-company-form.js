class CompanyForm extends HTMLElement {
  constructor() {
    super();
    this.companyForm = this.querySelector('form');

    if (!this.companyForm) return;

    this.companyBillForm = this.querySelector('#CompanyBillForm');

    const submitButton = this.companyForm.querySelector('button[type="submit"]');
    submitButton.addEventListener('click', this.onFormSubmit.bind(this));

    const checkbox = this.companyForm.querySelector('#CompanyBillSameAsShipping');
    checkbox.addEventListener('change', this.onCheckboxChange.bind(this));
  }

  onFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    this.handleSubmit();
  }

  onCheckboxChange(event) {
    const { checked } = event.target;

    this.companyBillForm.classList.toggle('display-none', checked);
  }

  handleSubmit() {
    const valid = this.companyForm.checkValidity();

    if (valid) {
      const formData = new FormData(this.companyForm);
      const checkbox = this.companyForm.querySelector('#CompanyBillSameAsShipping');

      if (checkbox.checked) {
        this.fillSameAsShippingAddress(formData);
      }

      this.companyForm.submit();
    } else {
      this.companyForm.reportValidity();
    }
  }

  fillSameAsShippingAddress(formData) {
    const mobilePhone = formData.get('company[shipping_address][mobile_phone]');
    const countryCode = formData.get('company[shipping_address][country_code]');
    const provinceCode = formData.get('company[shipping_address][province_code]');
    const province = formData.get('company[shipping_address][province]');
    const cityCode = formData.get('company[shipping_address][city_code]');
    const city = formData.get('company[shipping_address][city]');
    const districtCode = formData.get('company[shipping_address][district_code]');
    const district = formData.get('company[shipping_address][district]');
    const zipCode = formData.get('company[shipping_address][zip_code]');
    const address = formData.get('company[shipping_address][addr]');
    const address2 = formData.get('company[shipping_address][addr_two]');

    this.companyBillForm.querySelector('[name="company[billing_address][mobile_phone]"]').value = mobilePhone;
    this.companyBillForm.querySelector('[name="company[billing_address][country_code]"]').value = countryCode;

    const provinceSelect = this.companyBillForm.querySelector('[name="company[billing_address][province_code]"]');
    provinceSelect.innerHTML = this.companyForm.querySelector(
      '[name="company[shipping_address][province_code]"]',
    ).innerHTML;

    this.companyBillForm.querySelector('[name="company[billing_address][province_code]"]').value = provinceCode;
    this.companyBillForm.querySelector('[name="company[billing_address][province]"]').value = province;

    const citySelect = this.companyBillForm.querySelector('[name="company[billing_address][city_code]"]');
    citySelect.innerHTML = this.companyForm.querySelector('[name="company[shipping_address][city_code]"]').innerHTML;

    this.companyBillForm.querySelector('[name="company[billing_address][city_code]"]').value = cityCode;
    this.companyBillForm.querySelector('[name="company[billing_address][city]"]').value = city;

    const districtSelect = this.companyBillForm.querySelector('[name="company[billing_address][district_code]"]');
    districtSelect.innerHTML = this.companyForm.querySelector(
      '[name="company[shipping_address][district_code]"]',
    ).innerHTML;

    this.companyBillForm.querySelector('[name="company[billing_address][district_code]"]').value = districtCode;
    this.companyBillForm.querySelector('[name="company[billing_address][district]"]').value = district;
    this.companyBillForm.querySelector('[name="company[billing_address][zip_code]"]').value = zipCode;
    this.companyBillForm.querySelector('[name="company[billing_address][addr]"]').value = address;
    this.companyBillForm.querySelector('[name="company[billing_address][addr_two]"]').value = address2;
  }
}

defineCustomElement('company-form', () => CompanyForm);
