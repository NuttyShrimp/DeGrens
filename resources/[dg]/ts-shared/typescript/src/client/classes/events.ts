import { Util } from '../../shared';
import { Export, ExportRegister } from '../../shared/decorators';

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

class Events extends Util.Singleton<Events>() {
  private readonly resName: string;
  private resourceEventsMap: Map<string, Map<string, string>> = new Map();
  private tokenStorage: TokenStorage;
  private serverEventHandlers: Map<string, LocalEventHandler> = new Map();
  private localEventHandlers: Map<string, LocalEventHandler> = new Map();

  constructor() {
    super();
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
    onNet('__dg_evt_s_c_emitNet', (data: ClientHandlingEvent) => {
      if (!this.serverEventHandlers.has(data.eventName)) return;
      if (data.token !== 'all' && this.tokenStorage.getToken() !== data.token) return;
      this.serverEventHandlers.get(data.eventName)(...data.args);
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

  async emitNet(event: string, ...args: any[]) {
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
    this.eventInstance.onNet('__dg_RPC_s_c_request', (data: RPC.EventData) => this.handleIncomingRequest(data));
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
  async doRPCSrvRequest<T>(data: RPC.EventData): Promise<T | null> {
    if (!this.awaitingEvents.has(data.resource)) {
      this.awaitingEvents.set(data.resource, new Map());
    }
    const promise = new Promise<T>(res => {
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
      const result = await this.registeredHandlers.get(data.name)(...data.args);
      this.eventInstance.emitNet('__dg_RPC_s_c_response', {
        id: data.id,
        result,
        resource: data.resource,
      });
    }
  }

  async execute<T = any>(evtName: string, ...args: any[]): Promise<T | null> {
    const promId = this.getPromiseId();
    return global.exports['ts-shared'].doRPCSrvRequest({
      id: promId,
      name: evtName,
      args,
      resource: this.resourceName,
    });
  }

  register(name: string, handler: LocalEventHandler) {
    this.registeredHandlers.set(name, handler);
  }
}

const instances: {
  Events: Events;
  RPC: RPC;
  RPCManager?: RPCManager;
} = { Events: Events.getInstance(), RPC: new RPC() };

if (GetCurrentResourceName() === 'ts-shared') {
  instances.RPCManager = new RPCManager();
}

export default instances;
