class Ui {
  private static instance: Ui;
  private registered: string[];
  private resourceStarted: boolean;

  constructor() {
    this.registered = [];
    this.resourceStarted = false;
    // eventHandlers
    on('__dg_ui:Ready', () => {
      this.registered.forEach(evt => {
        global.exports['dg-ui'].RegisterUIEvent(evt);
      });
    });

    on('onClientResourceStart', (resource: string) => {
      if (resource !== 'dg-ui') return;
      this.resourceStarted = true;
    });

    on('onClientResourceStop', (resource: string) => {
      if (resource !== 'dg-ui') return;
      this.resourceStarted = true;
    });
  }

  static getInstance(): Ui {
    if (!Ui.instance) {
      Ui.instance = new Ui();
    }
    return Ui.instance;
  }

  RegisterUICallback(name: string, callback: (data: any, cb: UICallback) => void) {
    if (this.registered.indexOf(name) === -1) {
      this.registered.push(name);
    }
    AddEventHandler(`__dg_ui:${name}`, callback);
    if (this.resourceStarted && GetResourceState('dg-ui') == 'started') {
      global.exports['dg-ui'].RegisterUIEvent(name);
    }
    this.registered.push(name);
  }

  SendUIMessage(data: any) {
    global.exports['dg-ui'].SendUIMessage(data);
  }

  SendAppEvent(name: string, data: any) {
    global.exports['dg-ui'].SendAppEvent(name, data);
  }

  SetUIFocus(hasFocus: boolean, hasCursor: boolean) {
    global.exports['dg-ui'].SetUIFocus(hasFocus, hasCursor);
  }

  SetUIFocusCustom(hasFocus: boolean, hasCursor: boolean) {
    global.exports['dg-ui'].SetUIFocusCustom(hasFocus, hasCursor);
  }

  openApplication(app: string, data?: any, preventFocus?: boolean) {
    global.exports['dg-ui'].openApplication(app, data, preventFocus);
  }

  closeApplication(app: string, data?: any) {
    global.exports['dg-ui'].closeApplication(app, data);
  }
}

export default { UI: Ui.getInstance() };
