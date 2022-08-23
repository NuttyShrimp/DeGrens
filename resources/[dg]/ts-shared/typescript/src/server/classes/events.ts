import { TransactionContext } from '@sentry/types';
import Table from 'cli-table3';

import { Util } from '../../shared';
import { Export, ExportRegister } from '../../shared/decorators';
import { Sentry } from '../helpers/sentry';

import { sentryHandler } from './sentry';
import { Transaction } from '@sentry/types';

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
      const metadata = args.pop();
      metadata.receivedAt = new Date().getTime() / 1000;
      let transaction: Transaction | undefined;
      let span;
      if (!eventName.startsWith('__dg')) {
        transaction = Sentry.startTransaction({
          name: eventName,
          op: 'client.events.net',
          description: `Incoming network event ${eventName} on server`,
          data: {
            args,
            origin: src,
          },
        });
        Sentry.configureScope(scope => {
          scope.setSpan(transaction);
        });
        transaction
          .startChild({
            startTimestamp: new Date(metadata.createdAt).getTime() / 1000,
            endTimestamp: metadata.receivedAt,
            op: 'receive',
          })
          .finish();
        span = transaction.startChild({
          endTimestamp: new Date(metadata.createdAt).getTime() / 1000,
          op: 'handler',
        });
      }
      try {
        const handler = this.clientEventHandlers.get(eventName);
        if (handler) {
          handler(src, ...args);
        }
        if (span) {
          span.setStatus(handler ? 'ok' : 'not_found');
        }
      } catch (e) {
        Sentry.captureException(e);
        if (span) {
          span.setStatus('internal_error');
        }
      } finally {
        if (span) {
          span.finish();
        }
        if (transaction) {
          transaction.finish();
        }
      }
    });
    on('__dg_evt_s_s_emit', (data: { eventName: string; args: any[] }) => {
      if (!this.localEventHandlers.has(data.eventName)) return;
      if (data.eventName.startsWith('__dg_RPC_')) {
        this.localEventHandlers.get(data.eventName)!(...data.args);
        return;
      }
      const metadata = data.args.pop();
      metadata.receivedAt = new Date().getTime() / 1000;
      const transaction = Sentry.startTransaction({
        name: data.eventName,
        op: 'server.event.local',
        description: `Incoming local event ${data.eventName} on server`,
        data: {
          args: data.args,
        },
      });
      Sentry.configureScope(scope => {
        scope.setSpan(transaction);
      });
      transaction
        .startChild({
          startTimestamp: new Date(metadata.createdAt).getTime() / 1000,
          op: 'receive',
        })
        .finish(metadata.receivedAt);
      const span = transaction.startChild({
        endTimestamp: new Date(metadata.createdAt).getTime() / 1000,
        op: 'handler',
      });
      try {
        const handler = this.localEventHandlers.get(data.eventName);
        if (handler) handler(...data.args);
        span.setStatus(handler ? 'ok' : 'not_found');
      } catch (e) {
        Sentry.captureException(e);
        span.setStatus('internal_error');
      } finally {
        span.finish();
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
      onNet('__dg_evt_create_trace', this.createClientEvtTransaction);
    }
  }

  onNet(evtName: string, handler: IEvents.EventHandler) {
    this.localEventHandlers.set(evtName, handler);
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
        metadata: {
          receiver: {
            createdAt: new Date().toString(),
          },
          handler: {},
        },
      };
      if (!evtName.startsWith('__dg')) {
        const transactionContext: TransactionContext = {
          name: evtName,
          op: 'server.event.net',
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
        // 2 spans -> receiver + handler
        const transaction = sentryHandler.startTransaction(transactionContext, 20000, 2);
        evtData.traceId = transaction.traceId ?? null;
      }
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
    args.push({
      createdAt: new Date().toString(),
    });
    emit(`__dg_evt_s_s_emit`, {
      eventName: evtName,
      args,
    });
  }

  on(evtName: string, handler: LocalEventHandler) {
    this.localEventHandlers.set(evtName, handler);
  }

  createClientEvtTransaction(traceId: string, metadata: EventMetadata) {
    const src = source;
    const steamId = Player(src).state.steamId;
    if (!steamId) return;
    let spanId = sentryHandler.addSpan(steamId, traceId, {
      op: `receiver`,
      data: {
        origin: src,
        originSteamId: Player(src).state.steamId,
      },
      startTimestamp: new Date(metadata.receiver.createdAt).getTime() / 1000,
    });
    if (!spanId) return;
    sentryHandler.finishSpan(steamId, traceId, spanId, new Date(metadata.receiver.createdAt).getTime() / 1000);
    spanId = sentryHandler.addSpan(steamId, traceId, {
      op: `handler`,
      data: {
        origin: src,
        originSteamId: Player(src).state.steamId,
      },
      startTimestamp: new Date(metadata.handler.createdAt).getTime() / 1000,
    });
    if (!spanId) return;
    sentryHandler.finishSpan(steamId, traceId, spanId, new Date(metadata.handler.createdAt).getTime() / 1000);
    sentryHandler.finishTransaction(traceId);
  }
}

@ExportRegister()
class RPCManager {
  private readonly eventInstance: Events;
  private awaitingEvents: Map<string, Map<number, { res: Function }>> = new Map();

  constructor() {
    this.eventInstance = Events.getInstance();
    this.eventInstance.onNet('__dg_RPC_c_s_request', (src, data: RPC.EventData) => {
      if (!data.metadata) {
        data.metadata = {};
      }
      if (!data.metadata.handler) {
        data.metadata.handler = {};
      }
      data.metadata.handler.createdAt = new Date().toString();
      const transaction = sentryHandler.startTransaction(
        {
          op: 'client.rpc',
          name: data.name,
          description: `Incoming RPC on server`,
          data: {
            ...data,
            origin: Player(src).state.steamId,
          },
          tags: {
            origin: Player(src).state.steamId,
            handler: 'RPC',
          },
        },
        20000,
        2
      );
      try {
        this.handleIncomingRequest(src, data, transaction.traceId);
      } catch (e) {
        Sentry.captureException(e);
      }
    });
    // Emitter
    this.eventInstance.onNet(`__dg_RPC_s_c_response`, (src, data: RPC.ResolveData) =>
      this.handleIncomingResponse(src, data)
    );
    // Tracing
    this.eventInstance.onNet('__dg_RPC_c_s_trace', (src, traceId: string, data: Record<string, any>) => {
      this.finishClientRequest(src, traceId, data);
    });
  }

  private handleIncomingRequest(src: number, data: RPC.EventData, traceId: string | undefined) {
    // We make the RPC classes aware there is a potential RPC call for them,
    // They can send there response because emitting to client is not limited to
    // be originated from 1 resource
    this.eventInstance.emit('__dg_RPC_handleRequest', src, data, traceId);
  }

  private handleIncomingResponse(src: number, data: RPC.ResolveData) {
    if (!this.awaitingEvents.has(data.resource)) return;
    if (!this.awaitingEvents.get(data.resource)!.has(data.id)) return;
    this.awaitingEvents.get(data.resource)!.get(data.id)!.res(data);
    this.awaitingEvents.get(data.resource)!.delete(data.id);
  }

  private finishClientRequest = (src: number, traceId: string, data: Record<string, any>) => {
    const steamId = Player(src).state.steamId;
    if (!steamId || !data.createdAt || !data.finishedAt) return;
    const spanId = sentryHandler.addSpan(steamId, traceId, {
      op: 'request',
      startTimestamp: new Date(data.createdAt).getTime() / 1000,
    });
    if (!spanId) return;
    sentryHandler.finishSpan(steamId, traceId, spanId, new Date(data.finishedAt).getTime() / 1000);
  };

  @Export('doRPCClRequest')
  async doRPCClRequest<T>(target: number, data: RPC.EventData): Promise<RPC.ResolveData<T> | null> {
    if (!this.awaitingEvents.has(data.resource)) {
      this.awaitingEvents.set(data.resource, new Map());
    }
    const promise = new Promise<RPC.ResolveData<T> | null>(res => {
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
      const steamId = Player(src).state.steamId;
      const spanId = sentryHandler.addSpan(steamId, traceId, {
        op: 'handler',
        data: {
          processor: this.resourceName,
        },
        startTimestamp: new Date(data.metadata.handler.createdAt).getTime() / 1000,
      });
      try {
        const result = await this.registeredHandlers.get(data.name)!(src, ...data.args);
        this.eventInstance.emitNet('__dg_RPC_c_s_response', src, {
          id: data.id,
          result,
          resource: data.resource,
          traceId,
          metadata: data.metadata,
        });
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        if (spanId) {
          sentryHandler.finishSpan(steamId, traceId, spanId);
        }
      }
    }
  }

  async execute<T = any>(evtName: string, target: number, ...args: any[]): Promise<T | null> {
    const promId = this.getPromiseId();
    const transaction = Sentry.startTransaction({
      name: evtName,
      op: 'server.rpc',
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
    const span = transaction.startChild({
      op: 'request',
      status: 'ok',
    });
    let result: T | null;
    try {
      const data: RPC.ResolveData = await global.exports['ts-shared'].doRPCClRequest(target, {
        id: promId,
        name: evtName,
        args,
        resource: this.resourceName,
        traceId: transaction.traceId,
      });
      if (data !== null) {
        span.finish(data.metadata.handler.createdAt);
        transaction.startChild({
          op: 'handler',
          status: 'ok',
          startTimestamp: new Date(data.metadata.handler.createdAt).getTime() / 1000,
          endTimestamp: new Date(data.metadata.handler.finishedAt).getTime() / 1000,
        });
      }
      result = data.result;
    } catch (e) {
      result = null;
    } finally {
      if (!span.endTimestamp) {
        span.finish();
      }
      transaction.finish();
    }
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
