import { TransactionContext } from '@sentry/types';

import { Sentry } from '../helpers/sentry';

import { Admin, Util } from './index';
import { sentryHandler } from './sentry';

// Idea for extra layer of security:
class Distributor {
  public static init = () => {
    const distributor = new Distributor();
    distributor.isLoaded = true;
  };

  public isLoaded = false;

  // Event name to resources
  private readonly netEventToResources: Map<string, Set<string>>;
  private readonly localEventToResources: Map<string, Set<string>>;
  private readonly rpcToResource: Map<string, string>;

  // Resource name to handler
  // This acts the same as 5m exports but get cached at resource start instead of first call
  private readonly netEventHandlers: Record<string, Function>;
  private readonly localEventHandlers: Record<string, Function>;
  private readonly rpcHandlers: Record<string, Function>;

  constructor() {
    this.netEventToResources = new Map();
    this.localEventToResources = new Map();
    this.rpcToResource = new Map();

    this.netEventHandlers = {};
    this.localEventHandlers = {};
    this.rpcHandlers = {};

    onNet('__dgx_event:ServerNetEvent', (data: DGXEvents.ServerNetEvtData) => {
      this.distributeNetEvent(source, data);
    });
    on('__dgx_event:ServerLocalEvent', (data: DGXEvents.ServerLocalEvtData) => {
      this.distributeLocalEvent(data);
    });
    onNet('__dgx_rpc:emitServer', (data: DGXRPC.ClientRequestData) => {
      this.distributeRPC(source, data);
    });

    global.exports('registerNetEvent', this.registerNetEvent);
    global.exports('registerLocalEvent', this.registerLocalEvent);
    global.exports('registerRPC', this.registerRPC);

    global.exports('isDistributorLoaded', () => this.isLoaded);

    // Get handlers when a resource starts using makeshift exports
    on('onServerResourceStart', (resource: string) => {
      emit(`__dgx:${resource}:getServerNetEventHandler`, (handler: Function) => {
        this.netEventHandlers[resource] = handler;
      });
      emit(`__dgx:${resource}:getServerLocalEventHandler`, (handler: Function) => {
        this.localEventHandlers[resource] = handler;
      });
      emit(`__dgx:${resource}:getRPCHandler`, (handler: Function) => {
        this.rpcHandlers[resource] = handler;
      });
    });
  }

  private distributeNetEvent = (src: number, data: DGXEvents.ServerNetEvtData) => {
    // Check if resource token is valid
    if (!global.exports['dg-auth'].validateToken(src, data.origin, data.token)) return;

    const eventName = atob(data.eventId);
    const resources = this.netEventToResources.get(eventName);
    if (!resources) return;

    for (const resource of resources) {
      this.netEventHandlers[resource](src, eventName, data);
    }
  };

  private distributeLocalEvent = (data: DGXEvents.ServerLocalEvtData) => {
    const resources = this.localEventToResources.get(data.eventName);
    if (!resources) return;

    for (const resource of resources) {
      this.localEventHandlers[resource](data);
    }
  };

  private distributeRPC = (src: number, data: DGXRPC.ClientRequestData) => {
    // Check if resource token is valid
    if (!global.exports['dg-auth'].validateToken(src, data.resource, data.token)) return;

    const resource = this.rpcToResource.get(data.name);
    if (!resource) return;
    this.rpcHandlers[resource](src, data);
  };

  private registerNetEvent = (evtName: string, resource: string) => {
    let resources = this.netEventToResources.get(evtName);
    if (!resources) {
      resources = new Set();
      onNet(evtName, () => {
        Admin.ACBan(source, 'emitted DGX event', {
          evtName,
        });
      });
    }
    resources.add(resource);
    this.netEventToResources.set(evtName, resources);
  };

  private registerLocalEvent = (evtName: string, resource: string) => {
    let resources = this.localEventToResources.get(evtName);
    (resources ??= new Set()).add(resource);
    this.localEventToResources.set(evtName, resources);
  };

  private registerRPC = (evtName: string, resource: string) => {
    this.rpcToResource.set(evtName, resource);
    if (this.rpcToResource.has(evtName)) {
      onNet(evtName, () => {
        Admin.ACBan(source, 'emitted RPC event', {
          evtName,
        });
      });
    }
  };

  public static awaitLoad = () => {
    return new Promise<void>(res => {
      const thread = setInterval(() => {
        if (
          GetResourceState('ts-shared') === 'started' &&
          !!global.exports['ts-shared'] &&
          global.exports['ts-shared'].isDistributorLoaded()
        ) {
          clearInterval(thread);
          res();
        }
      }, 5);
    });
  };
}

if (GetCurrentResourceName() === 'ts-shared') {
  Distributor.init();
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
  private netEventHandlers: Map<string, DGXEvents.ServerEventHandler[]> = new Map();
  private localEventHandlers: Map<string, DGXEvents.LocalEventHandler[]> = new Map();

  constructor() {
    this.resName = GetCurrentResourceName();

    on(`__dgx:${this.resName}:getServerNetEventHandler`, (setCB: (func: typeof this.netEventHandler) => void) => {
      setCB(this.netEventHandler);
    });
    on(`__dgx:${this.resName}:getServerLocalEventHandler`, (setCB: (func: typeof this.localEventHandler) => void) => {
      setCB(this.localEventHandler);
    });

    if (this.resName === 'ts-shared') {
      onNet('__dgx_event:traceServer', (traceId: string, metadata: DGXEvents.EventMetadata) => {
        this.createClientEvtTransaction(source, traceId, metadata);
      });
    }
  }

  // Arrow func to retain 'this' context when passing to export in constructor
  private netEventHandler = async (src: number, eventName: string, data: DGXEvents.ServerNetEvtData) => {
    const handlers = this.netEventHandlers.get(eventName);
    if (!handlers) return;

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
      await Promise.all(handlers.map(handler => handler(src, ...data.args)));
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
  };

  // Arrow func to retain 'this' context when passing to export in constructor
  private localEventHandler = async (data: DGXEvents.ServerLocalEvtData) => {
    const handlers = this.localEventHandlers.get(data.eventName);
    if (!handlers) return;

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

    if (Util.isDevEnv()) {
      console.log(`[EVENTS] [S -> S] event: ${data.eventName} | trigger: ${GetInvokingResource()}`);
    }

    try {
      await Promise.all(handlers.map(handler => handler(...data.args)));
      span.setStatus(handlers ? 'ok' : 'not_found');
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
      span.setStatus('internal_error');
    } finally {
      span.finish();
      transaction.finish();
    }
  };

  public emitNet(evtName: string, target: number, ...args: any[]) {
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
  }

  public emit(evtName: string, ...args: any[]) {
    const metadata = {
      createdAt: new Date().getTime() / 1000,
    };
    emit(`__dgx_event:ServerLocalEvent`, {
      eventName: evtName,
      metadata,
      args,
    });
  }

  public onNet(evtName: string, handler: DGXEvents.ServerEventHandler) {
    let netHandlers = this.netEventHandlers.get(evtName);
    if (!netHandlers) {
      netHandlers = [];
    }
    netHandlers.push(handler);
    this.netEventHandlers.set(evtName, netHandlers);
    this.on(evtName, handler);

    Distributor.awaitLoad().then(() => {
      global.exports['ts-shared'].registerNetEvent(evtName, this.resName);
    });
  }

  public on(evtName: string, handler: DGXEvents.LocalEventHandler) {
    let clientHandlers = this.localEventHandlers.get(evtName);
    if (!clientHandlers) {
      clientHandlers = [];
    }
    clientHandlers.push(handler);
    this.localEventHandlers.set(evtName, clientHandlers);

    Distributor.awaitLoad().then(() => {
      global.exports['ts-shared'].registerNetEvent(evtName, this.resName);
    });
  }

  private createClientEvtTransaction = (src: number, traceId: string, metadata: DGXEvents.EventMetadata) => {
    const steamId = Player(src).state.steamId;
    if (!steamId) return;
    (['receiver', 'handler'] as (keyof DGXEvents.EventMetadata)[]).forEach(type => {
      const spanId = sentryHandler.addSpan(steamId, traceId, {
        op: type,
        data: {
          origin: src,
          originSteamId: steamId,
        },
        startTimestamp: new Date(metadata[type].createdAt).getTime() / 1000,
      });
      if (!spanId) return;
      sentryHandler.finishSpan(steamId, traceId, spanId, new Date(metadata[type].finishedAt).getTime() / 1000);
    });
    sentryHandler.finishTransaction(traceId);
  };
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
  private registeredHandlers: Map<string, DGXEvents.ServerEventHandler<unknown>> = new Map();

  constructor() {
    this.resourceName = GetCurrentResourceName();
    this.token = '';
    this.generateToken();

    on(`__dgx:${this.resourceName}:getRPCHandler`, (setCB: (func: typeof this.handleIncomingRequest) => void) => {
      setCB(this.handleIncomingRequest);
    });

    if (this.resourceName === 'ts-shared') {
      onNet('__dgx_rpc:traceServer', (traceId: string, metadata: DGXRPC.ClientRequestMetadata) =>
        this.finishClientRequestTrace(source, traceId, metadata)
      );
    }
  }

  private async generateToken() {
    while (GetResourceState('dg-auth') !== 'started') {
      await new Promise(res => setTimeout(res, 10));
    }
    this.token = global.exports['dg-auth'].createResourceToken();
  }

  // Arrow func to retain 'this' context when passing to export in constructor
  private handleIncomingRequest = async (src: number, data: DGXRPC.ClientRequestData) => {
    const handler = this.registeredHandlers.get(data.name);
    if (!handler) return;

    data.metadata.request.finishedAt = new Date().toString();
    data.metadata.handler.createdAt = new Date().toString();
    const steamId = Player(src).state.steamId;
    const { traceId } = sentryHandler.startTransaction(
      {
        op: 'client.rpc',
        name: data.name,
        description: `Incoming RPC on server`,
        data: {
          origin: steamId,
          name: data.name,
          args: data.args,
        },
        tags: {
          origin: steamId,
          handler: 'RPC',
        },
      },
      20000,
      3
    );

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
      if (Util.isDevEnv()) {
        console.log(`[DGX] [C -> S -> C] RPC: ${data.name} | origin: ${src}`);
      }

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
  };

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

    Distributor.awaitLoad().then(() => {
      global.exports['ts-shared'].registerRPC(name, this.resourceName);
    });
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
    on('dg-auth:token:resourceRegistered', (src: number, resource: string) => {
      if (resource !== this.resourceName) return;
      this.startHooks.forEach(hook => hook(src));
    });
  }

  onAuth(cb: (src: number) => void) {
    this.startHooks.add(cb);
  }

  public toggleAllowedMod = (plyId: number, mod: string, allowed: boolean) => {
    global.exports['dg-auth'].toggleAllowedMod(plyId, mod, allowed);
  };
}

export default {
  Events: Events.getInstance(),
  RPC: RPC.getInstance(),
  SQL: new SQL(),
  API: new API(),
  Auth: new Auth(),
};
