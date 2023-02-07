import { Events, RPC, Util } from './index';

class UI {
  private readonly inputResolveFunctions: Map<string, (result: UI.Input.Result<Record<string, string>>) => void>;

  constructor() {
    this.inputResolveFunctions = new Map();
    // Dont use DGX because probably not instantiated yet as this gets registered in constructor
    onNet('dgx:server:ui:inputResult', (id: string, result: UI.Input.Result<Record<string, string>>) => {
      const res = this.inputResolveFunctions.get(id);
      if (!res) return;
      res(result);
      this.inputResolveFunctions.delete(id);
    });
  }

  public async openInput<T extends Record<string, string> = Record<string, string>>(
    target: number,
    data: UI.Input.Data
  ): Promise<UI.Input.Result<T>> {
    const id = Util.uuidv4();
    const prom = new Promise<any>(res => {
      this.inputResolveFunctions.set(id, res);
    });
    emitNet('dgx:client:ui:openInput', target, id, data);
    const result: UI.Input.Result<T> = await prom;
    return result;
  }

  openContextMenu(target: number, menu: ContextMenu.Entry[]) {
    Events.emitNet('dgx:client:ui:openContextmenu', target, menu);
  }
}

class Taskbar {
  private readonly resolveFunctions: Map<string, (data: [boolean, number]) => void>;

  constructor() {
    this.resolveFunctions = new Map();
    // Dont use DGX because this will get handled in every resource which causes lots of overhead
    onNet('misc:taskbar:finished', (promId: string, canceled: boolean, atPercentage: number) => {
      const res = this.resolveFunctions.get(promId);
      if (!res) return;
      res([canceled, atPercentage]);
      this.resolveFunctions.delete(promId);
    });
  }

  async create(
    src: number,
    icon: string,
    label: string,
    duration: number,
    settings: TaskBar.TaskBarSettings
  ): Promise<[boolean, number]> {
    const promId = Util.uuidv4();
    const prom = new Promise<[boolean, number]>(res => {
      this.resolveFunctions.set(promId, res);
    });
    Events.emitNet('misc:taskbar:new', src, promId, icon, label, duration, settings);
    const result = await prom;
    return result;
  }
}

class Notifications {
  add(
    source: number,
    text: string,
    type: 'info' | 'error' | 'success' = 'info',
    durationInMs = 5000,
    persistent = false,
    overrideId?: string
  ) {
    emitNet('dg-ui:client:addNotification', source, text, type, durationInMs, persistent, overrideId);
  }

  remove(plyId: number, notificationId: string) {
    emitNet('dg-ui:client:removeNotification', plyId, notificationId);
  }
}

export default {
  UI: new UI(),
  Taskbar: new Taskbar(),
  Notifications: new Notifications(),
};
