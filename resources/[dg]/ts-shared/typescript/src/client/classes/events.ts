class Events {
  // async emitNet(event: string, ...args: any[]): Promise<void> {
  //   classes.RPC.execute('__dg_shared:events:prepareEvent', event);
  //   emitNet('__dg_shared:emit', {
  //     event,
  //     args,
  //   });
  // }
}

class RPC {
  // Executor
  private resourceName: string;
  private awaitingEvents: Map<number, { res: Function }> = new Map();
  // Receiver
  private registerdHandlers: Map<string, Function> = new Map();

  constructor() {
    // Executor
    this.resourceName = GetCurrentResourceName();
    onNet('__dg_shared:rpc:resolve', ({ id, result, resource }: RPC.ResolveData) => {
      if (this.resourceName !== resource) {
        return;
      }
      const awaiting = this.awaitingEvents.get(id);
      if (awaiting) {
        awaiting.res(result);
        this.awaitingEvents.delete(id);
      }
    });
    // Receiver
    onNet('__dg_shared:rpc:execute', async ({ id, name, args, resource }: RPC.EventData) => {
      let result = null;
      if (this.registerdHandlers.has(name)) {
        const handler = this.registerdHandlers.get(name);
        result = await handler(...args);
      }
      emitNet('__dg_shared:rpc:resolve', { id, result, resource });
    });
  }

  async execute<T = any>(evtName: string, ...args: any[]): Promise<T | null> {
    const promId = this.awaitingEvents.size;
    const promise = new Promise<T>(res => {
      this.awaitingEvents.set(promId, { res });
      setTimeout(() => {
        if (this.awaitingEvents.has(promId)) {
          res(null);
          this.awaitingEvents.delete(promId);
        }
      }, 10000);
    });
    emitNet('__dg_shared:rpc:execute', {
      id: promId,
      name: evtName,
      args,
      resource: this.resourceName,
    });
    return promise;
  }

  register(name: string, handler: Function) {
    this.registerdHandlers.set(name, handler);
  }
}

export default { Events: new Events(), RPC: new RPC() };
