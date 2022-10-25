class UI {
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
      this.resourceStarted = false;
    });
  }

  RegisterUICallback(name: string, callback: (data: any, cb: UICallback) => void) {
    if (!this.registered.includes(name)) {
      this.registered.push(name);
    }
    AddEventHandler(`__dg_ui:${name}`, callback);
    if (this.resourceStarted && GetResourceState('dg-ui') == 'started') {
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

  openApplication(app: string, data?: any, preventFocus?: boolean) {
    global.exports['dg-ui'].openApplication(app, data, preventFocus);
  }

  closeApplication(app: string, data?: any) {
    global.exports['dg-ui'].closeApplication(app, data);
  }

  openInput = async (data: UI.Input.Data): Promise<{ accepted: boolean; values: Record<string, string> }> => {
    const result = await global.exports['dg-ui'].openInput(data);
    return { accepted: result.accepted, values: result.values };
  };

  showInteraction(text: string, type: UI.InteractionType = 'info') {
    global.exports['dg-ui'].showInteraction(text, type);
  }
  hideInteraction() {
    global.exports['dg-ui'].hideInteraction();
  }
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
  add(text: string, type: 'info' | 'error' | 'success' = 'info', durationInMs = 5000, persistent?: boolean): string {
    return global.exports['dg-ui'].addNotification(text, type, durationInMs, persistent);
  }

  remove(id: string) {
    return global.exports['dg-ui'].removeNotification(id);
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
