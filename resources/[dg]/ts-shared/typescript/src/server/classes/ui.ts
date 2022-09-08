import { RPC, Events } from './index';

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
      Events.onNet(`misc:taskbar:finished`, (evtId: string, wasCanceled: boolean, atPercentage: number) => {
        if (id === evtId) {
          res([wasCanceled, atPercentage]);
        }
      });
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
    RPC.execute('dg-ui:client:removeNotification', source, id);
  }
}

export default {
  Taskbar: new Taskbar(),
  Notifications: new Notifications(),
};
