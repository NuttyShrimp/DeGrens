import { Export, ExportRegister } from '../../shared/decorators';

import { Util } from './index';

class TokenStorage {
  private static instance: TokenStorage;

  static getInstance() {
    if (!this.instance) {
      this.instance = new TokenStorage();
    }
    return this.instance;
  }

  private token: string;

  constructor() {
    emitNet('__dg_auth_register', GetCurrentResourceName());
    onNet('__dg_auth_authenticated', (target: number | string, token: string) => {
      if (target === -1 || target === GetCurrentResourceName()) {
        this.token = token;
      }
    });
  }

  public getToken() {
    return this.token;
  }

  public isClientAuthenticated() {
    return !!this.token;
  }

  public async awaitPlayerAuthentication() {
    while (!this.isClientAuthenticated()) {
      await Util.Delay(1);
    }
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
  private resourceEventsMap: Map<string, Map<string, string>> = new Map();
  private tokenStorage: TokenStorage;
  private serverEventHandlers: Map<string, LocalEventHandler> = new Map();
  private localEventHandlers: Map<string, LocalEventHandler> = new Map();

  constructor() {
    this.tokenStorage = TokenStorage.getInstance();
    this.resName = GetCurrentResourceName();
    onNet('__dg_shared_events', (target: string, origin: string, eventIdObject: Record<string, string>) => {
      if (target !== this.resName) return;
      const eventIdMap = new Map<string, string>();
      // Object to map
      for (const key in eventIdObject) {
        eventIdMap.set(key, eventIdObject[key]);
      }
      this.resourceEventsMap.set(origin, eventIdMap);
    });
    onNet('__dg_evt_s_c_emitNet', async (data: ClientHandlingEvent) => {
      if (!this.serverEventHandlers.has(data.eventName)) return;
      if (data.token !== 'all' && this.tokenStorage.getToken() !== data.token) return;
      emitNet('__dg_evt_trace_start', data.traceId);
      const handler = this.serverEventHandlers.get(data.eventName);
      if (handler.constructor.name === 'AsyncFunction') {
        await handler(...data.args);
      } else {
        handler(...data.args);
      }
      emitNet('__dg_evt_trace_finish', data.traceId);
    });
    on('__dg_evt_c_c_emit', (data: { eventName: string; args: any[] }) => {
      this.localEventHandlers.has(data.eventName) && this.localEventHandlers.get(data.eventName)(...data.args);
    });
  }

  private getTargetResourceForId(eventName: string) {
    for (const [resource, eventIdMap] of this.resourceEventsMap) {
      if (eventIdMap.has(eventName)) {
        return [resource, eventIdMap.get(eventName)];
      }
    }
    return null;
  }

  emitNet(event: string, ...args: any[]) {
    setImmediate(async () => {
      await this.tokenStorage.awaitPlayerAuthentication();
      if (!this.getTargetResourceForId(event)) {
        emitNet('__dg_evt_c_s_emitNet', {
          token: this.tokenStorage.getToken(),
          origin: this.resName,
          eventId: 'error',
          errorId: Util.uuidv4(),
        });
        console.log(`[DG] Event ${event} not found in any resource.`);
        return;
      }
      const [target, eventId] = this.getTargetResourceForId(event);
      if (Util.isDevEnv()) {
        console.log(`[DGX] [${this.resName}] Event: ${event} | ID: ${eventId}`);
      }
      emitNet('__dg_evt_c_s_emitNet', {
        token: this.tokenStorage.getToken(),
        origin: this.resName,
        target,
        eventId,
        args,
      });
    });
  }

  onNet(evtName: string, handler: LocalEventHandler) {
    this.serverEventHandlers.set(evtName, handler);
  }

  emit(evtName: string, ...args: any[]) {
    emit(`__dg_evt_c_c_emit`, {
      eventName: evtName,
      args,
    });
  }

  on(evtName: string, handler: LocalEventHandler) {
    this.localEventHandlers.set(evtName, handler);
  }
}

@ExportRegister()
class RPCManager {
  private readonly eventInstance: Events;
  // Map of resourceNames onto PromiseIds
  private awaitingEvents: Map<string, Map<number, { res: Function }>> = new Map();

  constructor() {
    this.eventInstance = Events.getInstance();
    // Receiver
    this.eventInstance.onNet('__dg_RPC_s_c_request', (data: RPC.EventData) => {
      this.handleIncomingRequest(data);
    });
    // Emitter
    this.eventInstance.onNet(`__dg_RPC_c_s_response`, (data: RPC.ResolveData) => this.handleIncomingResponse(data));
  }

  private handleIncomingRequest(data: RPC.EventData) {
    this.eventInstance.emit('__dg_RPC_handleRequest', data);
  }

  private handleIncomingResponse(data: RPC.ResolveData) {
    if (!this.awaitingEvents.has(data.resource)) return;
    if (!this.awaitingEvents.get(data.resource).has(data.id)) return;
    this.awaitingEvents.get(data.resource).get(data.id).res(data.result);
    this.awaitingEvents.get(data.resource).delete(data.id);
  }

  @Export('doRPCSrvRequest')
  async doRPCSrvRequest<T>(data: RPC.EventData, skipTrace = false): Promise<T | null> {
    if (!this.awaitingEvents.has(data.resource)) {
      this.awaitingEvents.set(data.resource, new Map());
    }
    if (!skipTrace) {
      data.traceId = await RPC.getInstance().execute<string>(
        { event: '__dg_RPC_trace_start', skipTrace: true },
        data.name,
        data.resource
      );
    }
    const promise = new Promise<T>(resolve => {
      const res = (result: T) => {
        resolve(result);
        if (!skipTrace && data.traceId) {
          emitNet('__dg_RPC_trace_finish', data.traceId);
        }
      };
      this.awaitingEvents.get(data.resource).set(data.id, { res });
      setTimeout(() => {
        if (this.awaitingEvents.get(data.resource).has(data.id)) {
          res(null);
          this.awaitingEvents.get(data.resource).delete(data.id);
        }
      }, 10000);
    });
    this.eventInstance.emitNet('__dg_RPC_c_s_request', data);
    return promise;
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
  private readonly eventInstance: Events;
  // Executor
  private readonly resourceName: string;
  private idsInUse: Set<number> = new Set();
  // Receiver
  private registeredHandlers: Map<string, LocalEventHandler> = new Map();

  constructor() {
    this.eventInstance = Events.getInstance();
    // Executor
    this.resourceName = GetCurrentResourceName();
    // Receiver
    this.eventInstance.on('__dg_RPC_handleRequest', (data: RPC.EventData) => this.handleRequest(data));
  }

  private getPromiseId(): number {
    const id = Util.getRndInteger(100000, 999999);
    if (this.idsInUse.has(id)) {
      return this.getPromiseId();
    }
    this.idsInUse.add(id);
    return id;
  }

  private async handleRequest(data: RPC.EventData) {
    if (this.registeredHandlers.has(data.name)) {
      emitNet('__dg_RPC_start_handle_trace', data);
      const result = await this.registeredHandlers.get(data.name)(...data.args);
      this.eventInstance.emitNet('__dg_RPC_s_c_response', {
        id: data.id,
        result,
        resource: data.resource,
        traceId: data.traceId,
      });
    }
  }

  async execute<T = any>(metadata: string | { event: string; skipTrace: boolean }, ...args: any[]): Promise<T | null> {
    const promId = this.getPromiseId();
    return global.exports['ts-shared'].doRPCSrvRequest(
      {
        id: promId,
        name: typeof metadata === 'string' ? metadata : metadata.event,
        args,
        resource: this.resourceName,
      },
      typeof metadata === 'object' ? metadata.skipTrace : false
    );
  }

  register(name: string, handler: LocalEventHandler) {
    this.registeredHandlers.set(name, handler);
  }
}

export const registerDGXEvent = (evtName: string, handler: LocalEventHandler) => {
  if (GetCurrentResourceName() === 'ts-shared') {
    Events.getInstance().on(evtName, handler);
  }
};

export const registerDGXEventNet = (evtName: string, handler: LocalEventHandler) => {
  if (GetCurrentResourceName() === 'ts-shared') {
    Events.getInstance().onNet(evtName, handler);
  }
};

export const registerDGXRPC = (evtName: string, handler: LocalEventHandler) => {
  if (GetCurrentResourceName() === 'ts-shared') {
    RPC.getInstance().register(evtName, handler);
  }
};

const instances: {
  Events: Events;
  RPC: RPC;
  RPCManager?: RPCManager;
} = { Events: Events.getInstance(), RPC: RPC.getInstance() };

if (GetCurrentResourceName() === 'ts-shared') {
  instances.RPCManager = new RPCManager();
}

export default instances;
