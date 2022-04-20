import { RPC } from './index';

class Taskbar {
  async create(src: number, id: string, label: string, duration: number, settings: TaskBar.TaskBarSettings) {
    const prom = new Promise<[boolean, number]>(res => {
      onNet(`dg-misc:taskbar:finished`, (evtId: string, wasCompleted: boolean, percCompleted: number) => {
        if (id === evtId) {
          res([wasCompleted, percCompleted]);
        }
      });
    });
    emitNet('dg-misc:taskbar:new', src, id, label, duration, settings);
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
    return RPC.execute<string>(source, 'dg-ui:client:addNotification', text, type, durationInMs, persistent);
  }

  remove(source: number, id: string) {
    RPC.execute(source, 'dg-ui:client:removeNotification', id);
  }
}

export default {
  Taskbar: new Taskbar(),
  Notifications: new Notifications(),
};
