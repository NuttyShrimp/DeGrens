// import * as crypto from 'crypto';

class Events {
  // private events: Map<string, Function> = new Map();
  // private serverKeys: Map<string, string> = new Map();
  // private clientKeys: Map<string, string> = new Map();
  //
  // constructor() {}
  //
  // onNet(evtName: string, handler: Function) {
  //   // Generate a unique key for this event
  //   const clientKey = crypto.createHash('sha512').update(evtName).digest('hex');
  //   const serverKey = crypto
  //     .createHash('sha512')
  //     .update(evtName + handler.toString())
  //     .digest('hex');
  //   this.clientKeys.set(clientKey, serverKey);
  //   this.serverKeys.set(serverKey, evtName);
  //   this.events.set(evtName, handler);
  //   onNet(evtName, () => {
  //     // ban the client
  //   })
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
      const src = source;
      let result = null;
      if (this.registerdHandlers.has(name)) {
        const handler = this.registerdHandlers.get(name);
        result = await handler(src, ...args);
      }
      emitNet('__dg_shared:rpc:resolve', src, { id, result, resource });
    });
  }

  async execute<T = any>(src: number, evtName: string, ...args: any[]): Promise<T | null> {
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
    emitNet('__dg_shared:rpc:execute', src, {
      id: promId,
      name: evtName,
      args,
      resource: this.resourceName,
    });
    return promise;
  }

  register(name: string, handler: Function) {
    console.log(this);
    this.registerdHandlers.set(name, handler);
  }
}

export default {
  Events: new Events(),
  RPC: new RPC(),
};
