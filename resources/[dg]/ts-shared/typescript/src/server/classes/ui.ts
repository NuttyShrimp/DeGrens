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
  async create(
    src: number,
    id: string,
    icon: string,
    label: string,
    duration: number,
    settings: TaskBar.TaskBarSettings
  ) {
    const prom = new Promise<[boolean, number]>(res => {
      Events.onNet(
        `misc:taskbar:finished`,
        (src: number, evtId: string, wasCanceled: boolean, atPercentage: number) => {
          if (id === evtId) {
            res([wasCanceled, atPercentage]);
          }
        }
      );
    });
    Events.emitNet('misc:taskbar:new', src, id, icon, label, duration, settings);
    return prom;
  }
}

class Notifications {
  add(
    source: number,
    text: string,
    type: 'info' | 'error' | 'success' = 'info',
    durationInMs = 5000,
    persistent?: boolean
  ) {
    return RPC.execute<string>('dg-ui:client:addNotification', source, text, type, durationInMs, persistent);
  }

  remove(source: number, id: string) {
    Events.emitNet('dg-ui:client:removeNotification', source, id);
  }
}

export default {
  UI: new UI(),
  Taskbar: new Taskbar(),
  Notifications: new Notifications(),
};
