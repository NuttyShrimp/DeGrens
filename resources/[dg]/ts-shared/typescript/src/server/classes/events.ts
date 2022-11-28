import { TransactionContext } from '@sentry/types';
import { Transaction } from '@sentry/types';

import { Sentry } from '../helpers/sentry';

import { Util } from './index';
import { sentryHandler } from './sentry';

// Idea for extra layer of security:
class Events {
  private static instance: Events;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Events();
    }
    return this.instance;
  }

  private readonly resName: string;
  private netEventHandlers: Map<string, DGXEvents.ServerEventHandler[]> = new Map();
  private localEventHandlers: Map<string, DGXEvents.LocalEventHandler[]> = new Map();

  constructor() {
    this.resName = GetCurrentResourceName();
    onNet('__dgx_event:ServerNetEvent', (data: DGXEvents.ServerNetEvtData) => this.netEventHandler(source, data));
    on('__dgx_event:ServerLocalEvent', async (data: DGXEvents.ServerLocalEvtData) => this.localEventHandler(data));
    if (this.resName === 'ts-shared') {
      onNet('__dgx_event:createTrace', this.createClientEvtTransaction);
    }
  }

  private async netEventHandler(src: number, data: DGXEvents.ServerNetEvtData) {
    // Check if resource token is valid
    if (!global.exports['dg-auth'].validateToken(src, data.origin, data.token)) return;
    const eventName = atob(data.eventId);
    if (!this.netEventHandlers.has(eventName)) return;
    data.metadata.finishedAt = new Date().getTime() / 1000;
    const transaction = Sentry.startTransaction({
      name: eventName,
      op: 'client.events.net',
      description: `Incoming network event ${eventName} on server`,
      data: {
        args: data.args,
        origin: Player(src).state.steamId,
        originResource: data.origin,
      },
      startTimestamp: new Date(data.metadata.createdAt).getTime() / 1000,
    });
    Sentry.configureScope(scope => {
      scope.setSpan(transaction);
    });
    transaction
      .startChild({
        startTimestamp: new Date(data.metadata.createdAt).getTime() / 1000,
        endTimestamp: data.metadata.finishedAt,
        op: 'receive',
      })
      .finish();
    const span = transaction.startChild({
      endTimestamp: new Date(data.metadata.createdAt).getTime() / 1000,
      op: 'handler',
    });
    if (Util.isDevEnv()) {
      console.log(
        `[EVENTS] [C -> S] event: ${eventName} | trigger: ${data.origin} | ply: ${Util.getName(src)}(${src})`
      );
    }
    try {
      const handlers = this.netEventHandlers.get(eventName);
      if (handlers) {
        await Promise.all(handlers.map(handler => handler(src, ...data.args)));
      }
      if (span) {
        span.setStatus(handlers ? 'ok' : 'not_found');
      }
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
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
  }

  private async localEventHandler(data: DGXEvents.ServerLocalEvtData) {
    if (!this.localEventHandlers.has(data.eventName)) return;
    data.metadata.finishedAt = new Date().getTime() / 1000;
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
        startTimestamp: data.metadata.createdAt,
        op: 'receive',
      })
      .finish(data.metadata.finishedAt);
    const span = transaction.startChild({
      endTimestamp: data.metadata.createdAt,
      op: 'handler',
    });
    try {
      const handlers = this.localEventHandlers.get(data.eventName);
      if (handlers) {
        await Promise.all(handlers.map(handler => handler(...data.args)));
      }
      if (Util.isDevEnv()) {
        console.log(`[EVENTS] [S -> S] event: ${data.eventName} | trigger: ${GetInvokingResource()}`);
      }
      span.setStatus(handlers ? 'ok' : 'not_found');
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
      span.setStatus('internal_error');
    } finally {
      span.finish();
      transaction.finish();
    }
  }

  emitNet(evtName: string, target: number, ...args: any[]) {
    setImmediate(async () => {
      if (target === -1) {
        if (!GetNumPlayerIndices()) {
          return;
        }
      } else {
        if (!GetPlayerName(String(target))) {
          if (Util.isDevEnv()) {
            console.error(`Tried sending ${evtName} to ${target} who is not online`);
          }
          return;
        }
      }
      const evtData: DGXEvents.ClientNetEvtData = {
        eventName: evtName,
        args,
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
            target: target !== -1 ? Player(target).state.steamId : target,
          },
          tags: {
            handler: 'Events',
            target: 'Client',
          },
        };
        // 2 spans -> receiver + handler
        const transaction = sentryHandler.startTransaction(transactionContext, 20000, 2);
        evtData.traceId = transaction.traceId ?? null;
        if (Util.isDevEnv()) {
          console.log(
            `[EVENTS] [S -> C] event: ${evtName} | trigger: ${GetInvokingResource()} | ply: ${
              target === -1 ? 'All' : Util.getName(target)
            }(${target})`
          );
        }
      }
      try {
        emitNet('__dgx_event:ClientNetEvent', Number(target), evtData);
      } catch (e) {
        Sentry.captureException(e);
        console.error('[DGX] Error emitting net event', evtName, target, e);
      }
    });
  }

  emit(evtName: string, ...args: any[]) {
    setImmediate(() => {
      const metadata = {
        createdAt: new Date().getTime() / 1000,
      };
      emit(`__dgx_event:ServerLocalEvent`, {
        eventName: evtName,
        metadata,
        args,
      });
    });
  }

  onNet(evtName: string, handler: DGXEvents.LocalEventHandler) {
    let netHandlers = this.netEventHandlers.get(evtName);
    if (!netHandlers) {
      netHandlers = [];
    }
    netHandlers.push(handler);
    this.netEventHandlers.set(evtName, netHandlers);
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

  createClientEvtTransaction(traceId: string, metadata: DGXEvents.EventMetadata) {
    const src = source;
    const steamId = Player(src).state.steamId;
    if (!steamId) return;
    (['receiver', 'handler'] as (keyof DGXEvents.EventMetadata)[]).forEach(type => {
      const spanId = sentryHandler.addSpan(steamId, traceId, {
        op: type,
        data: {
          origin: src,
          originSteamId: Player(src).state.steamId,
        },
        startTimestamp: new Date(metadata[type].createdAt).getTime() / 1000,
      });
      if (!spanId) return;
      sentryHandler.finishSpan(steamId, traceId, spanId, new Date(metadata[type].finishedAt).getTime() / 1000);
    });
    sentryHandler.finishTransaction(traceId);
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

  private readonly resourceName: string;
  private token: string;
  // Ids of RPC, of this current resource awaiting response
  private idsInUse: Set<number> = new Set();
  private registeredHandlers: Map<string, DGXEvents.ServerEventHandler> = new Map();

  constructor() {
    this.resourceName = GetCurrentResourceName();
    this.token = '';
    this.generateToken();

    onNet('__dgx_rpc:emitServer', (data: DGXRPC.ClientRequestData) => this.handleIncomingRequest(source, data));
    onNet('__dgx_rpc:traceServer', (traceId: string, metadata: DGXRPC.ClientRequestMetadata) =>
      this.finishClientRequestTrace(source, traceId, metadata)
    );
  }

  private async generateToken() {
    while (GetResourceState('dg-auth') !== 'started') {
      await new Promise(res => setTimeout(res, 10));
    }
    this.token = global.exports['dg-auth'].createResourceToken();
  }

  private async handleIncomingRequest(src: number, data: DGXRPC.ClientRequestData) {
    const handler = this.registeredHandlers.get(data.name);
    if (!handler) return;
    if (!global.exports['dg-auth'].validateToken(source, data.resource, data.token)) return;
    data.metadata.request.finishedAt = new Date().toString();
    data.metadata.handler.createdAt = new Date().toString();
    const { traceId } = sentryHandler.startTransaction(
      {
        op: 'client.rpc',
        name: data.name,
        description: `Incoming RPC on server`,
        data: {
          origin: Player(src).state.steamId,
          name: data.name,
          args: data.args,
        },
        tags: {
          origin: Player(src).state.steamId,
          handler: 'RPC',
        },
      },
      20000,
      3
    );
    const steamId = Player(src).state.steamId;
    let spanId;
    if (traceId) {
      spanId = sentryHandler.addSpan(steamId, traceId, {
        op: 'request',
        data: {
          processor: this.resourceName,
        },
        startTimestamp: new Date(data.metadata.request.createdAt).getTime() / 1000,
      });
      if (spanId) {
        sentryHandler.finishSpan(steamId, traceId, spanId, new Date(data.metadata.request.finishedAt).getTime() / 1000);
      }
      spanId = sentryHandler.addSpan(steamId, traceId, {
        op: 'handler',
        data: {
          processor: this.resourceName,
        },
        startTimestamp: new Date(data.metadata.handler.createdAt).getTime() / 1000,
      });
    }
    try {
      const result = await handler(src, ...data.args);
      const responseData: DGXRPC.ServerResponseData = {
        id: data.id,
        result,
        token: data.token,
        traceId,
        metadata: data.metadata,
      };
      emitNet(`__dgx_rpc:responseServer:${data.id}`, src, responseData);
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
    } finally {
      if (spanId && traceId) {
        sentryHandler.finishSpan(steamId, traceId, spanId);
      }
    }
  }

  private async finishClientRequestTrace(src: number, traceId: string, data: DGXRPC.ClientRequestMetadata) {
    const steamId = Player(src).state.steamId;
    if (!steamId || !data.response.createdAt || !data.response.finishedAt) return;
    const spanId = sentryHandler.addSpan(steamId, traceId, {
      op: 'response',
      startTimestamp: new Date(data.response.createdAt).getTime() / 1000,
    });
    if (!spanId) return;
    sentryHandler.finishSpan(steamId, traceId, spanId, new Date(data.response.finishedAt).getTime() / 1000);
  }

  private getPromiseId(): number {
    const id = Util.getRndInteger(100000, 999999);
    if (this.idsInUse.has(id)) {
      return this.getPromiseId();
    }
    this.idsInUse.add(id);
    return id;
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
      let evtHandler: ((src: number, data: DGXRPC.ClientResponseData<T>) => void) | null = null;
      result = await new Promise(res => {
        evtHandler = (source: number, data: DGXRPC.ClientResponseData<T>) => {
          if (!this.idsInUse.has(promId)) return;
          // Check if response is for us
          if (data.originToken !== this.token) return;
          this.idsInUse.delete(promId);
          if (!global.exports['dg-auth'].validateToken(source, data.resource, data.token)) return;

          if (data) {
            data.metadata.response.finishedAt = new Date().toString();
            span.finish(new Date(data.metadata.handler.createdAt).getTime() / 1000);
            transaction.startChild({
              op: 'handler',
              status: 'ok',
              startTimestamp: new Date(data.metadata.handler.createdAt).getTime() / 1000,
              endTimestamp: new Date(data.metadata.handler.finishedAt).getTime() / 1000,
            });
            transaction.startChild({
              op: 'response',
              status: 'ok',
              startTimestamp: new Date(data.metadata.response.createdAt).getTime() / 1000,
              endTimestamp: new Date(data.metadata.response.finishedAt).getTime() / 1000,
            });
          }
          res(data.result);
        };
        onNet(`__dgx_rpc:responseClient:${promId}`, (data: DGXRPC.ClientResponseData<T>) => {
          if (evtHandler) {
            evtHandler(source, data);
          }
        });
        const requestData: DGXRPC.ServerRequestData = {
          id: promId,
          name: evtName,
          args,
          originToken: this.token,
        };
        emitNet('__dgx_rpc:emitClient', target, requestData);

        setTimeout(() => {
          if (!this.idsInUse.has(promId)) return;
          this.idsInUse.delete(promId);
          res(null);
        }, 20000);
      });
      if (evtHandler) {
        removeEventListener(`__dgx_rpc:responseClient:${promId}`, evtHandler);
      }
      if (Util.isDevEnv()) {
        console.log(`[DGX] [S -> C -> S] RPC: ${evtName} | target: ${target}`);
      }
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

  register(name: string, handler: DGXEvents.ServerEventHandler<any>) {
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

class Auth {
  private resourceName;
  private startHooks: Set<(src: number) => void>;

  constructor() {
    this.resourceName = GetCurrentResourceName();
    this.startHooks = new Set();
    onNet('dg-auth:token:resourceRegistered', (src: number, resource: string) => {
      if (resource !== this.resourceName) return;
      this.startHooks.forEach(hook => hook(src));
    });
  }

  onAuth(cb: (src: number) => void) {
    this.startHooks.add(cb);
  }
}

export default {
  Events: Events.getInstance(),
  RPC: RPC.getInstance(),
  SQL: new SQL(),
  API: new API(),
  Auth: new Auth(),
};
