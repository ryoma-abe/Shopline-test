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

function initDatepicker() {
  const input = document.querySelector('#RegisterBirthday');

  if (input) {
    detectingScreen(function change({ isMobileScreen }) {
      if (isMobileScreen) {
        
        const datepickerMobile = new Rolldate({
          el: `#RegisterBirthday`,
          beginYear: '1900',
          endYear: new Date().getFullYear(),
          init() {
            setTimeout(() => {
              
              $('.rolldate-container').addClass('notranslate');
            }, 0);
          },
          lang: __constDatepickerLocale__.mobile,
          trigger: 'click',
        });
        return datepickerMobile.destroy;
      }
      
      const datepicker = new AirDatepicker(`#RegisterBirthday`, {
        dateFormat: 'yyyy-MM-dd',
        classes: 'notranslate',
        locale: __constDatepickerLocale__.pc,
        maxDate: new Date(),
        minDate: new Date('1900-01-01'),
        autoClose: true,
        onSelect: () => {},
      });
      return datepicker.destroy;
    }, true);
  }
}

initDatepicker();
