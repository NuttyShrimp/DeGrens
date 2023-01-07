import { Util } from './index';
import 'core-js';

class TokenStorage {
  private static instance: TokenStorage;

  static getInstance() {
    if (!this.instance) {
      this.instance = new TokenStorage();
    }
    return this.instance;
  }

  private token: string | null;
  private readonly resourceName: string;

  constructor() {
    this.token = null;
    this.resourceName = GetCurrentResourceName();
    onNet('dg-auth:token:reset', () => {
      this.getResourceToken();
    });
    onNet('dg-auth:token:set', (target: string, token: string) => {
      if (target === this.resourceName) {
        this.token = token;
      }
    });
    this.getResourceToken();
  }

  private getResourceToken() {
    emitNet('dg-auth:token:requestResource', this.resourceName);
  }

  getToken() {
    return new Promise<string>(res => {
      if (this.token !== null) {
        res(this.token);
        return;
      }

      const thread = setInterval(() => {
        if (this.token === null) return;
        clearInterval(thread);
        res(this.token);
      }, 100);
    });
  }
}

class Events {
  private static instance: Events;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Events();
    }
    return this.instance;
  }

  private readonly resName: string;
  private readonly tokenStorage: TokenStorage;

  private serverEventHandlers: Map<string, DGXEvents.LocalEventHandler[]> = new Map();
  private localEventHandlers: Map<string, DGXEvents.LocalEventHandler[]> = new Map();

  constructor() {
    this.tokenStorage = TokenStorage.getInstance();
    this.resName = GetCurrentResourceName();
    onNet('__dgx_event:ClientNetEvent', (data: DGXEvents.ClientNetEvtData) => {
      this.netEventHandler(data);
    });
    on('__dgx_event:ClientLocalEvent', (data: { eventName: string; args: any[] }) => {
      this.localEventHandler(data);
    });
  }

  private async localEventHandler(data: { eventName: string; args: any[] }) {
    const handlers = this.localEventHandlers.get(data.eventName);
    if (!handlers) return;
    handlers.forEach(handler => {
      handler(...data.args);
    });
    if (Util.isDevEnv()) {
      console.log(`[DGX] [C -> C] Event: ${data.eventName}`);
    }
  }

  // onNet collector
  private async netEventHandler(data: DGXEvents.ClientNetEvtData) {
    data.metadata.receiver.finishedAt = new Date().toString();
    data.metadata.handler.createdAt = new Date().toString();
    if (!this.serverEventHandlers.has(data.eventName)) return;
    if (Util.isDevEnv()) {
      console.log(`[DGX] [S -> C] Event: ${data.eventName}`);
    }
    const handlers = this.serverEventHandlers.get(data.eventName)!;
    await Promise.all(handlers.map(handler => handler(...data.args)));
    data.metadata.handler.finishedAt = new Date().toString();
    if (data.traceId && data.traceId.trim() !== '') {
      emitNet('__dgx_event:createTrace', data.traceId, data.metadata);
    }
  }

  async awaitSession(): Promise<void> {
    await this.tokenStorage.getToken();
  }

  async emitNet(event: string, ...args: any[]) {
    const metadata = {
      createdAt: new Date().toString(),
    };
    const token = await this.tokenStorage.getToken();
    // Just base64 but enough for stupid people
    const eventHash = btoa(event);
    if (Util.isDevEnv()) {
      console.log(`[DGX] [C -> S] Event: ${event}`);
    }
    const evtData: DGXEvents.ServerNetEvtData = {
      token,
      origin: this.resName,
      eventId: eventHash,
      metadata,
      args,
    };
    emitNet('__dgx_event:ServerNetEvent', evtData);
  }

  emit(evtName: string, ...args: any[]) {
    emit(`__dgx_event:ClientLocalEvent`, {
      eventName: evtName,
      args,
    });
  }

  onNet(evtName: string, handler: DGXEvents.LocalEventHandler) {
    let srvHandlers = this.serverEventHandlers.get(evtName);
    if (!srvHandlers) {
      srvHandlers = [];
    }
    srvHandlers.push(handler);
    this.serverEventHandlers.set(evtName, srvHandlers);
    this.on(evtName, handler);
  }

  on(evtName: string, handler: DGXEvents.LocalEventHandler) {
    let clientHandlers = this.localEventHandlers.get(evtName);
    if (!clientHandlers) {
      clientHandlers = [];
    }
    clientHandlers.push(handler);
    this.localEventHandlers.set(evtName, clientHandlers);
  }

  // TODO: test if can be deleted by function, otherwise turn set into map
  removeEventHandler(evtName: string, handler: DGXEvents.LocalEventHandler) {
    let srvHandlers = this.serverEventHandlers.get(evtName);
    if (srvHandlers) {
      this.serverEventHandlers.set(
        evtName,
        srvHandlers.filter(h => h !== handler)
      );
    }
    let clientHandlers = this.localEventHandlers.get(evtName);
    if (clientHandlers) {
      this.localEventHandlers.set(
        evtName,
        clientHandlers.filter(h => h !== handler)
      );
    }
  }
}

class RPC {
  private static instance: RPC;

  static getInstance() {
    if (!this.instance) {
      this.instance = new RPC();
    }
    return this.instance;
  }

  private tokenStorage: TokenStorage;

  private registeredHandlers: Map<string, DGXEvents.LocalEventHandler> = new Map();
  private idsInUse: Set<number>;
  private readonly resourceName: string;

  constructor() {
    this.tokenStorage = TokenStorage.getInstance();
    this.resourceName = GetCurrentResourceName();
    this.idsInUse = new Set();

    onNet('__dgx_rpc:emitClient', (data: DGXRPC.ServerRequestData) => this.handleIncomingRequest(data));
  }

  private async handleIncomingRequest(data: DGXRPC.ServerRequestData) {
    const handler = this.registeredHandlers.get(data.name);
    if (!handler) return;
    const metadata = {
      createdAt: new Date().toString(),
      finishedAt: new Date().toString(),
    };
    if (Util.isDevEnv()) {
      console.log(`[DGX] [S -> C -> S] RPC: ${data.name}`);
    }
    const result = await handler(...data.args);
    const token = await this.tokenStorage.getToken();
    metadata.finishedAt = new Date().toString();
    const responseData: DGXRPC.ClientResponseData = {
      result,
      resource: this.resourceName,
      originToken: data.originToken,
      token,
      metadata: {
        handler: metadata,
        response: {
          createdAt: new Date().toString(),
        },
      },
    };
    emitNet(`__dgx_rpc:responseClient:${data.id}`, responseData);
  }

  private getPromiseId(): number {
    const id = Util.getRndInteger(100000, 999999);
    if (this.idsInUse.has(id)) {
      return this.getPromiseId();
    }
    this.idsInUse.add(id);
    return id;
  }

  async execute<T = any>(evtName: string, ...args: any[]): Promise<T | null> {
    const promId = this.getPromiseId();
    const token = await this.tokenStorage.getToken();
    const data: DGXRPC.ClientRequestData = {
      id: promId,
      name: evtName,
      args,
      token,
      resource: this.resourceName,
      metadata: {
        request: {
          createdAt: new Date().toString(),
        },
        handler: {},
        response: {},
      },
    };
    let evtHandler: ((data: DGXRPC.ServerResponseData<T>) => void) | null = null;
    const result = await new Promise<T | null>(res => {
      evtHandler = (data: DGXRPC.ServerResponseData<T>) => {
        if (!this.idsInUse.has(data.id)) if (data.token !== token) return;
        this.idsInUse.delete(data.id);

        data.metadata.response.finishedAt = new Date().toString();
        res(data.result);
        if (data.traceId) {
          emitNet('__dgx_rpc:traceServer', data.traceId, data.metadata);
        }
      };
      onNet(`__dgx_rpc:responseServer:${promId}`, (data: DGXRPC.ServerResponseData<T>) => {
        if (evtHandler) {
          evtHandler(data);
        }
      });
      emitNet('__dgx_rpc:emitServer', data);

      setTimeout(() => {
        if (!this.idsInUse.has(promId)) return;
        this.idsInUse.delete(promId);
        res(null);
      }, 20000);
    });
    if (evtHandler) {
      removeEventListener(`__dgx_rpc:responseServer:${promId}`, evtHandler);
    }
    if (Util.isDevEnv()) {
      console.log(`[DGX] [C -> S -> C] RPC: ${evtName} | Timed-out: ${result === null}`);
    }
    return result;
  }

  register(name: string, handler: DGXEvents.LocalEventHandler<any>) {
    this.registeredHandlers.set(name, handler);
  }
}

export default {
  Events: Events.getInstance(),
  RPC: RPC.getInstance(),
};
