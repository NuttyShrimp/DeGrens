class Taskbar {
  async create(src: number, id: string, label: string, duration: number, settings: TaskBar.TaskBarSettings) {
    const prom = new Promise<[boolean, number]>(res=>{
      onNet(`dg-misc:taskbar:finished`, (evtId: string, wasCompleted: boolean, percCompleted: number) => {
        if (id === evtId) {
          res([wasCompleted, percCompleted]);
        }
      });
    })
    emitNet('dg-misc:taskbar:new', src, id, label, duration, settings)
    return prom
  }
}

export default {
  Taskbar: new Taskbar(),
};