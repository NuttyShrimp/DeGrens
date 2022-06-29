import { Util } from '../../shared';
import { Export, ExportRegister } from '../../shared/decorators';
import { Sentry } from '../helpers/logger';
import Table from 'cli-table3';

const awaitAuthStart = async () => {
  while (GetResourceState('dg-auth') !== 'started') {
    await Util.Delay(100);
  }
};

const doAuthExport = async (name: string, ...args: any[]) => {
  await awaitAuthStart();
  return global.exports['dg-auth'][name](...args);
};

class Events extends Util.Singleton<Events>() {
  private readonly resName: string;
  private clientEventHandlers: Map<string, IEvents.EventHandler> = new Map();
  private localEventHandlers: Map<string, LocalEventHandler> = new Map();

  constructor() {
    super();
    this.resName = GetCurrentResourceName();
    // Tell auth we are a resources that has events
    doAuthExport('registerEventResource', this.resName);
    doAuthExport('registerHandler', this.resName, (eventName: string, src: number, args: any[]) => {
      const transaction = Sentry.startTransaction({
        name: `netEvent`,
        op: 'Events.netEventHandler',
        description: `Incoming network event ${eventName} on server`,
        data: {
          eventName,
          args,
          origin: src,
        },
      });
      Sentry.configureScope(scope => {
        scope.setSpan(transaction);
      });
      try {
        this.clientEventHandlers.has(eventName) && this.clientEventHandlers.get(eventName)(src, ...args);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        transaction.finish();
      }
    });
    on('__dg_evt_s_s_emit', (data: { eventName: string; args: any[] }) => {
      this.localEventHandlers.has(data.eventName) && this.localEventHandlers.get(data.eventName)(...data.args);
    });
    on('dgx:events:showEventsTable', (target: string) => {
      if (target !== this.resName) return;
      const eventTable = new Table({
        head: ['type', 'event', 'handler'],
      });
      [...this.localEventHandlers.entries()].forEach(([evt, handler]) => {
        if (evt.match(/^__dg_/)) return;
        eventTable.push(['local', evt, handler.toString()]);
      });
      [...this.clientEventHandlers.entries()].forEach(([evt, handler]) => {
        eventTable.push(['net', evt, handler.toString()]);
      });

      console.log(eventTable.toString());
    });
  }

  // TODO: add sentry transactions to this functions
  onNet(evtName: string, handler: IEvents.EventHandler) {
    this.clientEventHandlers.set(evtName, handler);
    doAuthExport('registerEvent', this.resName, evtName);
  }

  emitNet(evtName: string, target: number, ...args: any[]) {
    const evtData: ClientHandlingEvent = {
      eventName: evtName,
      args,
      token: '',
    };
    try {
      setImmediate(async () => {
        if (target === -1) {
          evtData.token = 'all';
        } else {
          evtData.token = await doAuthExport('getPlayerToken', target);
        }
        emitNet('__dg_evt_s_c_emitNet', Number(target), evtData);
      });
    } catch (e) {
      Sentry.captureException(e);
      console.error('[DGX] Error emitting net event', evtName, target, e);
    }
  }

  emit(evtName: string, ...args: any[]) {
    emit(`__dg_evt_s_s_emit`, {
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
  private awaitingEvents: Map<string, Map<number, { res: Function }>> = new Map();

  constructor() {
    this.eventInstance = Events.getInstance();
    this.eventInstance.onNet('__dg_RPC_c_s_request', (src, data: RPC.EventData) =>
      this.handleIncomingRequest(src, data)
    );
    // Emitter
    this.eventInstance.onNet(`__dg_RPC_s_c_response`, (src, data: RPC.ResolveData) =>
      this.handleIncomingResponse(src, data)
    );
  }

  private handleIncomingRequest(src: number, data: RPC.EventData) {
    // We make the RPC classes aware there is a potential RPC call for them,
    // They can send there response because emitting to client is not limited to
    // be originated from 1 resource
    this.eventInstance.emit('__dg_RPC_handleRequest', src, data);
  }

  private handleIncomingResponse(src: number, data: RPC.ResolveData) {
    if (!this.awaitingEvents.has(data.resource)) return;
    if (!this.awaitingEvents.get(data.resource).has(data.id)) return;
    this.awaitingEvents.get(data.resource).get(data.id).res(data.result);
    this.awaitingEvents.get(data.resource).delete(data.id);
  }

  @Export('doRPCClRequest')
  async doRPCClRequest<T>(target: number, data: RPC.EventData): Promise<T | null> {
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
    this.eventInstance.emitNet('__dg_RPC_s_c_request', target, data);
    return promise;
  }
}

class RPC {
  private readonly eventInstance: Events;
  // Receiver
  private registeredHandlers: Map<string, IEvents.EventHandler> = new Map();
  // Executor
  private readonly resourceName: string;
  private idsInUse: Set<number> = new Set();

  constructor() {
    this.eventInstance = Events.getInstance();
    // Executor
    this.resourceName = GetCurrentResourceName();
    // Receiver
    this.eventInstance.on('__dg_RPC_handleRequest', (src, data: RPC.EventData) => this.handleRequest(src, data));
    on('dgx:events:showRPCTable', (target: string) => {
      if (target !== this.resourceName) return;
      const eventTable = new Table({
        head: ['RPC', 'handler'],
      });
      [...this.registeredHandlers.entries()].forEach(([evt, handler]) => {
        eventTable.push([evt, handler.toString()]);
      });
      console.log(eventTable.toString());
    });
  }

  private getPromiseId(): number {
    const id = Util.getRndInteger(100000, 999999);
    if (this.idsInUse.has(id)) {
      return this.getPromiseId();
    }
    this.idsInUse.add(id);
    return id;
  }

  private async handleRequest(src: number, data: RPC.EventData) {
    if (this.registeredHandlers.has(data.name)) {
      const result = await this.registeredHandlers.get(data.name)(src, ...data.args);
      this.eventInstance.emitNet('__dg_RPC_c_s_response', src, {
        id: data.id,
        result,
        resource: data.resource,
      });
    }
  }

  async execute<T = any>(evtName: string, target: number, ...args: any[]): Promise<T | null> {
    const promId = this.getPromiseId();
    return global.exports['ts-shared'].doRPCClRequest(target, {
      id: promId,
      name: evtName,
      args,
      resource: this.resourceName,
    });
  }

  register(name: string, handler: IEvents.EventHandler) {
    this.registeredHandlers.set(name, handler);
  }
}

class SQL {
  async query<T = any>(query: string, params: any[] = [], cb?: (result: T) => void): Promise<T> {
    return global.exports['dg-sql'].query(query, params, cb);
  }

  async scalar<T = any>(query: string, params: any[] = [], cb?: (result: T) => void): Promise<T> {
    return global.exports['dg-sql'].scalar(query, params, cb);
  }

  async insert(query: string, params: any[] = [], cb?: (result: any) => void) {
    return global.exports['dg-sql'].insert(query, params, cb);
  }

  async insertValues(table: string, values: { [k: string]: any }[] = [], cb?: (result: any) => void) {
    return global.exports['dg-sql'].insertValues(table, values, cb);
  }
}

class API {
  registerRoute(method: IAPI.Method, path: string, handler: (request: any, res: IAPI.Responser) => void) {
    global.exports['dg-api'].registerRoute(method, path, handler);
  }
}

const instances: {
  Events: Events;
  RPC: RPC;
  SQL: SQL;
  RPCManager?: RPCManager;
  API: API;
} = {
  Events: Events.getInstance(),
  RPC: new RPC(),
  SQL: new SQL(),
  API: new API(),
};

if (GetCurrentResourceName() === 'ts-shared') {
  instances.RPCManager = new RPCManager();
}

export default instances;
