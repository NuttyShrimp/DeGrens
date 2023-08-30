class UI {
  private registered: string[];
  private resourceStarted: boolean;

  constructor() {
    this.registered = [];
    // eventHandlers
    this.resourceStarted = GetResourceState('dg-ui') === 'started' && !!global?.exports?.['dg-ui']?.RegisterUIEvent;
    on('__dg_ui:Ready', () => {
      this.resourceStarted = true;
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
      this.resourceStarted = false;
    });
  }

  RegisterUICallback<T = any>(name: string, callback: (data: T, cb: UICallback) => void) {
    if (!this.registered.includes(name)) {
      this.registered.push(name);
    }
    AddEventHandler(`__dg_ui:${name}`, callback);
    if (this.resourceStarted) {
      global.exports['dg-ui'].RegisterUIEvent(name);
    }
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

  doesUIHaveFocus(): boolean {
    return global.exports['dg-ui'].doesUIHaveFocus();
  }

  openApplication(app: string, data?: any, preventFocus?: boolean) {
    global.exports['dg-ui'].openApplication(app, data, preventFocus);
  }

  closeApplication(app: string, data?: any) {
    global.exports['dg-ui'].closeApplication(app, data);
  }

  openInput = async <T extends Record<string, string> = Record<string, string>>(
    data: UI.Input.Data
  ): Promise<UI.Input.Result<T>> => {
    const result = await global.exports['dg-ui'].openInput(data);
    return { accepted: result.accepted, values: result.values };
  };

  showInteraction(text: string, type: UI.InteractionType = 'info') {
    global.exports['dg-ui'].showInteraction(text, type);
  }
  hideInteraction() {
    global.exports['dg-ui'].hideInteraction();
  }

  public onApplicationClose = (handler: (closedApp: string) => void, appName?: string) => {
    on('dg-ui:application-closed', (closedApp: string) => {
      if (appName === undefined || closedApp === appName) {
        handler(closedApp);
      }
    });
  };

  public onUIReload = (handler: () => void) => {
    on('dg-ui:reload', handler);
  };

  public onLoad = (handler: () => void) => {
    on('dg-ui:loadData', handler);
  };

  public addToClipboard = (text: string) => {
    this.SendAppEvent('copy', text);
  };
}

class Taskbar {
  /**
   * Creates a taskbar and returns if it was cancelled and how much percent was done
   */
  async create(
    icon: string,
    label: string,
    duration: number,
    settings: TaskBar.TaskBarSettings
  ): Promise<[boolean, number]> {
    return global.exports['dg-misc'].Taskbar(icon, label, duration, settings);
  }
}

class Notifications {
  add(
    text: string,
    type: 'info' | 'error' | 'success' = 'info',
    durationInMs = 5000,
    persistent = false,
    overrideId?: string
  ) {
    global.exports['dg-ui'].addNotification(text, type, durationInMs, persistent, overrideId);
  }

  remove(notificationId: string) {
    global.exports['dg-ui'].removeNotification(notificationId);
  }
}

class HUD {
  addEntry(
    name: string,
    iconName: string,
    color: string,
    getter: (ped: number, id: number) => number,
    order: number,
    steps?: number,
    enabled = true
  ) {
    global.exports['dg-ui'].registerHudEntry(name, iconName, color, getter, order, steps, enabled);
  }
  removeEntry(name: string) {
    global.exports['dg-ui'].removeHudEntry(name);
  }
  toggleEntry(name: string, isEnabled: boolean) {
    global.exports['dg-ui'].toggleHudEntry(name, isEnabled);
  }
}

export default {
  UI: new UI(),
  Taskbar: new Taskbar(),
  Notifications: new Notifications(),
  HUD: new HUD(),
};
