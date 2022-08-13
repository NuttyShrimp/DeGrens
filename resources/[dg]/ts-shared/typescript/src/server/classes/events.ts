import { TransactionContext } from '@sentry/types';
import Table from 'cli-table3';

import { Util } from '../../shared';
import { Export, ExportRegister } from '../../shared/decorators';
import { Sentry } from '../helpers/sentry';

import { sentryHandler } from './sentry';

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
    // Handler for C->S events
    doAuthExport('registerHandler', this.resName, (eventName: string, src: number, args: any[]) => {
      if (!this.clientEventHandlers.has(eventName)) return;
      const transaction = Sentry.startTransaction({
        name: 'ServerEvents.net.handler',
        op: eventName,
        description: `Incoming network event ${eventName} on server`,
        data: {
          args,
          origin: src,
        },
      });
      Sentry.configureScope(scope => {
        scope.setSpan(transaction);
      });
      try {
        this.clientEventHandlers.get(eventName)!(src, ...args);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        transaction.finish();
      }
    });
    on('__dg_evt_s_s_emit', (data: { eventName: string; args: any[] }) => {
      if (!this.localEventHandlers.has(data.eventName)) return;
      if (data.eventName.startsWith('__dg_RPC_')) {
        this.localEventHandlers.get(data.eventName)!(...data.args);
        return;
      }
      const transaction = Sentry.startTransaction({
        name: 'ServerEvents.local.handler',
        op: data.eventName,
        description: `Incoming local event ${data.eventName} on server`,
        data: {
          args: data.args,
        },
      });
      Sentry.configureScope(scope => {
        scope.setSpan(transaction);
      });
      try {
        this.localEventHandlers.get(data.eventName)!(...data.args);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        transaction.finish();
      }
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
    if (this.resName === 'ts-shared') {
      onNet('__dg_evt_trace_start', this.startSpan);
      onNet('__dg_evt_trace_finish', this.finishSpan);
    }
  }

  onNet(evtName: string, handler: IEvents.EventHandler) {
    this.clientEventHandlers.set(evtName, handler);
    doAuthExport('registerEvent', this.resName, evtName);
  }

  emitNet(evtName: string, target: number | IEvents.Metadata, ...args: any[]) {
    setImmediate(async () => {
      const evtData: ClientHandlingEvent = {
        eventName: evtName,
        args,
        token: '',
        traceId: '',
      };
      const transactionContext: TransactionContext = {
        name: 'ServerEvents.net.emit',
        op: evtName,
        description: `Outgoing network event ${evtName} on server`,
        data: {
          args,
        },
        tags: {
          handler: 'Events',
          target: 'Client',
        },
      };
      if (typeof target === 'object') {
        transactionContext.data!.target = target.source !== -1 ? target.source !== -1 : target.source;
        transactionContext.traceId = target.traceId;
      } else {
        transactionContext.data!.target = target !== -1 ? Player(target).state.steamId : target;
      }
      const transaction = sentryHandler.startTransaction(transactionContext, 20000, 1);
      evtData.traceId = transaction.traceId ?? null;
      try {
        if (target === -1) {
          evtData.token = 'all';
        } else {
          evtData.token = await doAuthExport('getPlayerToken', target);
        }
        emitNet('__dg_evt_s_c_emitNet', Number(target), evtData);
      } catch (e) {
        Sentry.captureException(e);
        console.error('[DGX] Error emitting net event', evtName, target, e);
      }
    });
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

  startSpan(traceId: string) {
    const src = source;
    const steamId = Player(src).state.steamId;
    if (!steamId) return;
    sentryHandler.addSpan(steamId, traceId, {
      op: `ClientEvents.net.handler`,
      data: {
        origin: src,
        originSteamId: Player(src).state.steamId,
      },
    });
  }

  finishSpan(traceId: string) {
    const src = source;
    const steamId = Player(src).state.steamId;
    if (!steamId) return;
    sentryHandler.finishSpan(steamId, traceId);
  }
}

@ExportRegister()
class RPCManager {
  private readonly eventInstance: Events;
  private awaitingEvents: Map<string, Map<number, { res: Function }>> = new Map();

  constructor() {
    this.eventInstance = Events.getInstance();
    this.eventInstance.onNet('__dg_RPC_c_s_request', (src, data: RPC.EventData) => {
      const transaction = Sentry.startTransaction({
        name: 'ServerRPC.collector',
        op: data.name,
        description: `Incoming RPC on server`,
        data: {
          ...data,
          origin: Player(src).state.steamId,
        },
        tags: {
          origin: Player(src).state.steamId,
          handler: 'RPC',
        },
        traceId: data.traceId,
      });
      Sentry.configureScope(scope => {
        scope.setSpan(transaction);
      });
      try {
        this.handleIncomingRequest(src, data, transaction.traceId);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        transaction.finish();
      }
    });
    // Emitter
    this.eventInstance.onNet(`__dg_RPC_s_c_response`, (src, data: RPC.ResolveData) =>
      this.handleIncomingResponse(src, data)
    );
    // Sentry
    registerDGXRPC('__dg_RPC_trace_start', (src, RPCName: string, originResource: string) =>
      this.traceStart(src, RPCName, originResource)
    );
    onNet('__dg_RPC_trace_finish', this.traceFinish);
    onNet('__dg_RPC_start_handle_trace', (data: RPC.EventData) => this.traceHandlerStart(source, data));
  }

  private handleIncomingRequest(src: number, data: RPC.EventData, traceId: string) {
    // We make the RPC classes aware there is a potential RPC call for them,
    // They can send there response because emitting to client is not limited to
    // be originated from 1 resource
    this.eventInstance.emit('__dg_RPC_handleRequest', src, data, traceId);
  }

  private handleIncomingResponse(src: number, data: RPC.ResolveData) {
    if (!this.awaitingEvents.has(data.resource)) return;
    if (!this.awaitingEvents.get(data.resource)!.has(data.id)) return;
    if (data.traceId) sentryHandler.finishTransaction(data.traceId);
    this.awaitingEvents.get(data.resource)!.get(data.id)!.res(data.result);
    this.awaitingEvents.get(data.resource)!.delete(data.id);
  }

  @Export('doRPCClRequest')
  async doRPCClRequest<T>(target: number, data: RPC.EventData): Promise<T | null> {
    if (!this.awaitingEvents.has(data.resource)) {
      this.awaitingEvents.set(data.resource, new Map());
    }
    const promise = new Promise<T | null>(res => {
      this.awaitingEvents.get(data.resource)!.set(data.id, { res });
      setTimeout(() => {
        if (this.awaitingEvents.get(data.resource)!.has(data.id)) {
          res(null);
          this.awaitingEvents.get(data.resource)!.delete(data.id);
        }
      }, 10000);
    });
    this.eventInstance.emitNet('__dg_RPC_s_c_request', target, data);
    return promise;
  }

  traceStart(src: number, RPCName: string, originResource: string) {
    return sentryHandler.startTransaction(
      {
        op: RPCName,
        name: 'ClientRPC.emit',
        description: `Outgoing RPC request to ${RPCName} coming from client(${originResource})`,
        data: {
          origin: Player(src).state.steamId,
        },
        tags: {
          handler: 'RPC',
          target: 'Server',
          resource: originResource,
        },
      },
      10000,
      1
    ).traceId;
  }

  traceFinish(traceId: string) {
    sentryHandler.finishTransaction(traceId);
  }

  traceHandlerStart(src: number, data: RPC.EventData) {
    sentryHandler.startTransaction(
      {
        name: 'ClientRPC.handler',
        op: data.name,
        description: `Handling a incoming RPC on client`,
        data: {
          ...data,
          target: Player(src).state.steamId,
        },
        tags: {
          orgin: Player(src).state.steamId,
          handler: 'RPC',
          target: 'Client',
        },
        traceId: data.traceId,
      },
      20000,
      1
    );
  }
}

class RPC extends Util.Singleton<RPC>() {
  private readonly eventInstance: Events;
  // Receiver
  private registeredHandlers: Map<string, IEvents.EventHandler> = new Map();
  // Executor
  private readonly resourceName: string;
  private idsInUse: Set<number> = new Set();

  constructor() {
    super();
    this.eventInstance = Events.getInstance();
    // Executor
    this.resourceName = GetCurrentResourceName();
    // Receiver
    this.eventInstance.on('__dg_RPC_handleRequest', (src, data: RPC.EventData, traceId: string) =>
      this.handleRequest(src, data, traceId)
    );
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

  private async handleRequest(src: number, data: RPC.EventData, traceId: string) {
    if (this.registeredHandlers.has(data.name)) {
      const transaction = Sentry.startTransaction({
        name: 'ServerRPC.handler',
        op: data.name,
        description: `Handling a incoming RPC on server`,
        data: {
          ...data,
          origin: Player(src).state.steamId,
        },
        tags: {
          origin: Player(src).state.steamId,
          handler: 'RPC',
          target: 'Server',
        },
        traceId: traceId,
      });
      try {
        const result = await this.registeredHandlers.get(data.name)!(src, ...data.args);
        this.eventInstance.emitNet('__dg_RPC_c_s_response', src, {
          id: data.id,
          result,
          resource: data.resource,
        });
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        transaction.finish();
      }
    }
  }

  async execute<T = any>(evtName: string, target: number, ...args: any[]): Promise<T | null> {
    const promId = this.getPromiseId();
    const transaction = Sentry.startTransaction({
      op: evtName,
      name: 'ServerRPC.emit',
      description: `Outgoing RPC request to ${evtName} to ${target}`,
      data: {
        target: target > 0 ? Player(target).state.steamId : target,
      },
      tags: {
        handler: 'RPC',
        target: 'Client',
        resource: this.resourceName,
      },
    });
    Sentry.configureScope(scope => {
      scope.setSpan(transaction);
    });
    const result = await global.exports['ts-shared'].doRPCClRequest(target, {
      id: promId,
      name: evtName,
      args,
      resource: this.resourceName,
      traceId: transaction.traceId,
    });
    transaction.finish();
    return result;
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

export const registerDGXRPC = (evtName: string, handler: LocalEventHandler) => {
  if (GetCurrentResourceName() === 'ts-shared') {
    RPC.getInstance().register(evtName, handler);
  }
};

const instances: {
  Events: Events;
  RPC: RPC;
  SQL: SQL;
  RPCManager?: RPCManager;
  API: API;
} = {
  Events: Events.getInstance(),
  RPC: RPC.getInstance(),
  SQL: new SQL(),
  API: new API(),
};

if (GetCurrentResourceName() === 'ts-shared') {
  instances.RPCManager = new RPCManager();
}

export default instances;
