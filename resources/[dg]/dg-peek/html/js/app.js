const Targeting = Vue.createApp({
  data() {
    return {
      Show: false,
      ChangeTextIconColor: false, // This is if you want to change the color of the icon next to the option text with the text color
      StandardEyeIcon: 'far fa-eye',
      SuccessColor: '#767fcf',
      StandardColor: '#D1D5DB',
      TargetHTML: '',
      TargetEyeStyleObject: {
        color: '#D1D5DB', // Keep same as standardcolor
      },
      Options: [],
    };
  },
  destroyed() {
    window.removeEventListener('message', this.messageListener);
    window.removeEventListener('mousedown', this.mouseListener);
    window.removeEventListener('keydown', this.keyListener);
  },
  mounted() {
    this.messageListener = window.addEventListener('message', event => {
      switch (event.data.response) {
        case 'openTarget':
          this.OpenTarget();
          break;
        case 'closeTarget':
          this.CloseTarget();
          break;
        case 'foundTarget':
          this.FoundTarget(event.data);
          break;
        case 'showOptions':
          this.showOptions(event.data);
          break;
        case 'leftTarget':
          this.LeftTarget();
          break;
      }
    });

    this.mouseListener = window.addEventListener('mousedown', event => {
      if (event.button == 2) {
        this.CloseTarget();
        $.post(`https://dg-peek/closeTarget`);
      }
    });
  },
  methods: {
    OpenTarget() {
      this.TargetHTML = '';
      this.Show = true;
      this.TargetEyeStyleObject.color = this.StandardColor;
    },

    CloseTarget() {
      this.TargetHTML = '';
      this.TargetEyeStyleObject.color = this.StandardColor;
      this.Show = false;
    },

    FoundTarget(item) {
      this.options = item.data;
      this.TargetEyeStyleObject.color = this.SuccessColor;
    },

    showOptions() {
      this.TargetHTML = '';
      let TargetLabel = this.TargetHTML;
      const FoundColor = this.SuccessColor;
      const ResetColor = this.StandardColor;
      const AlsoChangeTextIconColor = this.ChangeTextIconColor;
      this.options.forEach(item => {
        const id = `target-${item.id}`;
        const iconId = `target-icon-${item.id}`;
        if (AlsoChangeTextIconColor) {
          TargetLabel += `
						<div id="${id}" style="margin-bottom: 1vh;">
							<span id="${iconId}" style="color: ${ResetColor}">
							<i class="${item.icon}"></i>
							</span>&nbsp${item.label}
						</div>
					`;
        } else {
          TargetLabel += `
						<div id="${id}" style="margin-bottom: 1vh;">
							<span id="${iconId}" style="color: ${FoundColor}">
							<i class="${item.icon}"></i>
							</span>&nbsp${item.label}
						</div>
					`;
        }
        setTimeout(function () {
          const hoverelem = document.getElementById(id);

          hoverelem.addEventListener('mouseenter', function (event) {
            event.target.style.color = FoundColor;
            if (AlsoChangeTextIconColor) {
              document.getElementById(iconId).style.color = FoundColor;
            }
          });

          hoverelem.addEventListener('mouseleave', function (event) {
            event.target.style.color = ResetColor;
            if (AlsoChangeTextIconColor) {
              document.getElementById(iconId).style.color = ResetColor;
            }
          });

          hoverelem.addEventListener('mousedown', event => {
            let split = id.split('-');
            try {
              $.post(`https://dg-peek/selectTarget`, JSON.stringify({ id: item.id }));
              this.TargetHTML = '';
              this.Show = false;
            } finally {
              if (event.button === 2) {
                this.CloseTarget();
                $.post(`https://dg-peek/closeTarget`);
              }
            }
          });
        }, 10);
      });
      this.TargetHTML = TargetLabel;
    },

    LeftTarget() {
      this.TargetHTML = '';
      this.TargetEyeStyleObject.color = this.StandardColor;
    },
  },
});

Targeting.use(Quasar, {
  config: {
    loadingBar: { skipHijack: true },
  },
});

Targeting.mount('#target-wrapper');
