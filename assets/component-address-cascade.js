defineCustomElement(
  'address-cascade',
  () =>
    class AddressCascade extends HTMLElement {
      constructor() {
        super();
        this.countryEl = this.querySelector('#AddressCountry');

        this.provinceSelectEl = this.querySelector('#AddressProvinceSelect');
        this.provinceInputEl = this.querySelector('#AddressProvinceInput');
        this.provinceGroup = this.querySelector('#AddressProvinceGroup');

        this.citySelectEl = this.querySelector('#AddressCitySelect');
        this.cityInputEl = this.querySelector('#AddressCityInput');
        this.cityGroup = this.querySelector('#AddressCityGroup');

        this.districtSelectEl = this.querySelector('#AddressDistrictSelect');
        this.districtInputEl = this.querySelector('#AddressDistrictInput');
        this.districtGroup = this.querySelector('#AddressDistrictGroup');

        this.provinceSelectContainer = this.querySelector('#AddressProvinceSelectContainer');
        this.provinceInputContainer = this.querySelector('#AddressProvinceInputContainer');

        this.citySelectContainer = this.querySelector('#AddressCitySelectContainer');
        this.cityInputContainer = this.querySelector('#AddressCityInputContainer');

        this.districtSelectContainer = this.querySelector('#AddressDistrictSelectContainer');
        this.districtInputContainer = this.querySelector('#AddressDistrictInputContainer');

        this.localization = JSON.parse(this.getAttribute('localization') || '{}');

        this.config = {
          country: { display: true, type: 'select' },
          province: { display: false, type: 'select' },
          city: { display: false, type: 'input' },
          district: { display: false, type: 'input' },
        };

        this.init();
        this.bindEvent();
      }

      async init() {
        await this.initCountry();
        await this.fetchAddressTemplate();
        await this.initProvince();
        await this.initCity();
        await this.initDistrict();
      }

      getFieldType(type) {
        const mapping = {
          1: 'select',
          2: 'input',
        };

        return mapping[type];
      }

      bindEvent() {
        window.Shopline.addListener(this.countryEl, 'change', window.Shopline.bind(this.countryHandler, this));
        window.Shopline.addListener(this.provinceSelectEl, 'change', window.Shopline.bind(this.provinceHandler, this));
        window.Shopline.addListener(this.citySelectEl, 'change', window.Shopline.bind(this.cityHandler, this));
        window.Shopline.addListener(this.districtSelectEl, 'change', window.Shopline.bind(this.districtHandler, this));
      }

      async fetchAddressTemplate() {
        const country = this.countryEl.value;
        const query = {
          country,
          language: window.Shopline.locale,
        };

        const response = await fetch(
          `${window.routes.address_country_template_url}?${new URLSearchParams(query)}`,
        ).then((res) => res.json());

        const { props } = response.data;

        const countryTemplate = props.find((item) => item.propKey === 'country');
        const provinceTemplate = props.find((item) => item.propKey === 'province');
        const cityTemplate = props.find((item) => item.propKey === 'city');
        const districtTemplate = props.find((item) => item.propKey === 'district');

        this.config = {
          country: {
            display: countryTemplate?.display,
            type: this.getFieldType(countryTemplate?.interactionType),
            targetLevel: 0,
          },
          province: {
            display: provinceTemplate?.display,
            type: this.getFieldType(provinceTemplate?.interactionType),
            targetLevel: 1,
          },
          city: {
            display: cityTemplate?.display,
            type: this.getFieldType(cityTemplate?.interactionType),
            targetLevel: 2,
          },
          district: {
            display: districtTemplate?.display,
            type: this.getFieldType(districtTemplate?.interactionType),
            targetLevel: 3,
          },
        };

        this.renderTemplate();
      }

      renderTemplate() {
        const { province, city, district } = this.config;

        if (province.type === 'select') {
          this.provinceSelectContainer.style.display = '';
          this.provinceInputContainer.style.display = 'none';
        } else {
          this.provinceSelectContainer.style.display = 'none';
          this.provinceInputContainer.style.display = '';
        }

        if (city.type === 'select') {
          this.citySelectContainer.style.display = '';
          this.cityInputContainer.style.display = 'none';
        } else {
          this.citySelectContainer.style.display = 'none';
          this.cityInputContainer.style.display = '';
        }

        if (district.type === 'select') {
          this.districtSelectContainer.style.display = '';
          this.districtInputContainer.style.display = 'none';
        } else {
          this.districtSelectContainer.style.display = 'none';
          this.districtInputContainer.style.display = '';
        }

        this.provinceGroup.style.display = province.display ? '' : 'none';
        this.cityGroup.style.display = city.display ? '' : 'none';
        this.districtGroup.style.display = district.display ? '' : 'none';
      }

      async createCountryOptions() {
        const query = {
          language: window.Shopline.locale,
        };

        const response = await fetch(`${window.routes.address_countries_url}?${new URLSearchParams(query)}`).then(
          (res) => res.json(),
        );

        const { countries } = response.data;

        const countriesOptions = countries.map((country) => {
          return `<option value="${country.countryCode}">${country.name}</option>`;
        });

        this.countryEl.innerHTML = countriesOptions.join('');

        const currentCountry = countries.find((v) => v.countryCode === this.localization.country.iso_code);

        if (currentCountry) {
          this.countryEl.value = currentCountry.countryCode;
        }
      }

      // Obtain the next level addresses information and create options according to the country, province and city
      async createNextLevelOptions({ currentSelectEl, currentLevel }) {
        const currentLevelConfig = this.config[currentLevel];
        const parentCode = this.getParent(currentLevel).value;
        const countryCode = this.countryEl.value;

        currentSelectEl.value = '';

        if (!parentCode || !currentLevelConfig.display || currentLevelConfig.type === 'input') {
          return;
        }

        const query = {
          parentCode,
          countryCode,
          language: window.Shopline.locale,
          targetLevel: currentLevelConfig.targetLevel,
        };

        const response = await fetch(`${window.routes.address_next_url}?${new URLSearchParams(query)}`).then((res) =>
          res.json(),
        );

        const { addressInfoList } = response.data;

        const options = addressInfoList.map((current) => {
          return `<option value="${current.code}">${current.name}</option>`;
        });

        currentSelectEl.innerHTML = options.join('');
      }

      async initCountry() {
        await this.createCountryOptions();
        this.backfillDefault(this.countryEl);
      }

      getParent(currentLevel) {
        const levels = [
          { name: 'district', el: this.districtSelectEl },
          { name: 'city', el: this.citySelectEl },
          { name: 'province', el: this.provinceSelectEl },
          { name: 'country', el: this.countryEl },
        ];
        const index = levels.findIndex((level) => level.name === currentLevel);
        const partnerList = levels.slice(index + 1);
        const foundParent = partnerList.find((level) => {
          return this.config[level.name].display;
        });

        return foundParent.el;
      }

      async initProvince(reset = false) {
        await this.createNextLevelOptions({
          currentSelectEl: this.provinceSelectEl,
          currentLevel: 'province',
        });

        if (reset) {
          this.provinceInputContainer.querySelector('input').value = '';
        } else {
          this.backfillDefault(this.provinceSelectEl);
        }
      }

      async initCity(reset = false) {
        await this.createNextLevelOptions({
          currentSelectEl: this.citySelectEl,
          currentLevel: 'city',
        });

        if (reset) {
          this.cityInputContainer.querySelector('input').value = '';
        } else {
          this.backfillDefault(this.citySelectEl);
        }
      }

      async initDistrict(reset = false) {
        await this.createNextLevelOptions({
          currentSelectEl: this.districtSelectEl,
          currentLevel: 'district',
        });

        if (reset) {
          this.districtInputContainer.querySelector('input').value = '';
        } else {
          this.backfillDefault(this.districtSelectEl);
        }
      }

      async districtHandler() {
        this.districtInputContainer.querySelector('input').value = '';
      }

      async cityHandler() {
        this.cityInputContainer.querySelector('input').value = '';
        await this.initDistrict(true);
      }

      async provinceHandler() {
        this.provinceInputContainer.querySelector('input').value = '';
        await this.initCity(true);
        await this.initDistrict(true);
      }

      async countryHandler() {
        await this.fetchAddressTemplate();
        await this.initProvince(true);
        await this.initCity(true);
        await this.initDistrict(true);
      }

      // backfill default value
      backfillDefault(selectElement) {
        const value = selectElement.getAttribute('data-default');
        if (value && selectElement.options.length > 0) {
          selectElement.value = value;
        }
      }
    },
);
