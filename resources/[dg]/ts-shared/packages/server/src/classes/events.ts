import {
  awaitKeys,
  decryptClientPayload,
  encryptServerPayload,
  getEventHash,
  setKeys,
} from '@dgx/shared/src/classes/encrypt';
import * as Sentry from '@sentry/node';

import utilClass from './util';
import { DGXAuth } from '../exports';

const util = utilClass.Util;

class Events extends util.Singleton<Events>() {
  private pendingTransaction: Map<string, Sentry.Transaction> = new Map();
  constructor() {
    super();
    setImmediate(() => {
      const keys: Auth.SecretKeys = exports['dg-auth'].getKeysForServer();
      setKeys(keys);
    });

    onNet(
      `__dgx_sentry:${GetCurrentResourceName()}:finishTrace`,
      (src: number, traceId: string, metadata: DGXEvents.EventMetadata, hasError: boolean, err?: any) => {
        const transaction = this.pendingTransaction.get(traceId);
        if (!transaction) return;
        if (transaction.data.target == -1) {
          // Debounce to catch all handlers
          // TODO: implement debounce
        }

        const steamId = Player(src).state.steamId;
        if (!steamId) return;
        (['sender', 'handler', 'receiver'] as (keyof DGXEvents.EventMetadata)[]).forEach(type => {
          const rawData = metadata[type];
          if (!rawData || (!rawData.end && !rawData.start)) return;
          const parsed = {
            start: (rawData.start ? new Date(rawData.start).getTime() : Date.now()) / 1000,
            end: (rawData.end ? new Date(rawData.end).getTime() : Date.now()) / 1000,
          };
          const span = transaction.startChild({
            op: type,
            data: {
              origin: src,
              originSteamId: steamId,
            },
            startTimestamp: parsed.start,
          });
          span.finish(parsed.end);
          // this error happend in client during the handler process
          if (hasError && type == 'handler') {
            Sentry.captureException(err, transaction);
          }
        });
        transaction.finish();
      }
    );
  }

  on = (event: string, handler: DGXEvents.LocalEventHandler) => {
    setImmediate(async () => {
      await awaitKeys();
      global.on(getEventHash(event), async (_: DGXEvents.ServerLocalEvtData, ...args: any[]) => {
        DGXAuth.logEvent({
          send: 'server',
          recv: 'server',
          event,
          target: 0,
          data: args,
        });

        try {
          await handler(...args);
        } catch (e) {
          console.error(e);
        }
      });
    });
  };

  onNet = (event: string, handler: DGXEvents.ServerEventHandler, passData = false) => {
    setImmediate(async () => {
      await awaitKeys();
      global.onNet(getEventHash(event), async (encData: string, ...args: any[]) => {
        const src = +source;
        const data: DGXEvents.NetEvtData = decryptClientPayload(encData);
        if (data === undefined) {
          throw new Error('Failed to decode event payload');
        }
        if (!data.metadata.sender) data.metadata.sender = {};
        data.metadata.sender.end = new Date().toString();

        if (!data.skipLog) {
          DGXAuth.logEvent({
            send: 'client',
            recv: 'server',
            event,
            target: src,
            data: args,
          });
        }

        let span: Sentry.Span | null = null;
        let transaction: Sentry.Transaction | null = null;
        if (!data.skipSentry) {
          transaction = Sentry.startTransaction({
            name: event,
            op: 'client.events.net',
            description: `Incoming network event ${event} on server`,
            tags: {
              user: Player(src).state.steamId,
            },
            data: {
              args: args,
              origin: Player(src).state.steamId,
            },
            startTimestamp: data.metadata?.sender?.start
              ? new Date(data.metadata.sender.start).getTime() / 1000
              : Date.now(),
          });
          Sentry.configureScope(scope => {
            scope.setSpan(transaction!);
          });
          transaction
            .startChild({
              startTimestamp: data.metadata.sender?.start
                ? new Date(data.metadata.sender?.start).getTime() / 1000
                : Date.now(),
              endTimestamp: data.metadata.sender?.end
                ? new Date(data.metadata.sender?.end).getTime() / 1000
                : Date.now(),
              op: 'receive',
            })
            .finish();
          span = transaction.startChild({
            op: 'handler',
          });
        }

        try {
          if (passData) {
            await handler(+src, data, ...args);
          } else {
            await handler(+src, ...args);
          }
          if (span) {
            span.setStatus('ok');
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
      });
    });
  };

  emit = (event: string | { event: string; data: DeepPartial<DGXEvents.ServerLocalEvtData> }, ...args: any[]) => {
    setImmediate(async () => {
      await awaitKeys();
      const extData: DeepPartial<DGXEvents.ServerLocalEvtData> = typeof event === 'string' ? {} : event.data;
      global.emit(
        getEventHash(typeof event === 'string' ? event : event.event),
        {
          metadata: {
            sender: {
              start: new Date(),
              ...(extData.metadata?.sender ?? {}),
            },
            ...(extData.metadata ?? {}),
          },
          ...(extData ?? {}),
        },
        ...args
      );
    });
  };

  emitNet = (
    event: string | { event: string; data: DeepPartial<DGXEvents.NetEvtData> },
    target: number,
    ...args: any[]
  ) => {
    setImmediate(async () => {
      await awaitKeys();
      const extData: DeepPartial<DGXEvents.NetEvtData> = typeof event === 'string' ? {} : event.data;
      const data = {
        metadata: {
          sender: {
            start: new Date().toString(),
            ...(extData.metadata?.sender ?? {}),
          },
          ...(extData.metadata ?? {}),
        },
        ...(extData ?? {}),
      };

      const evtName = typeof event === 'string' ? event : event.event;
      if (!data.skipSentry) {
        const transaction = Sentry.startTransaction({
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
            user: target !== -1 ? Player(target).state.steamId : 'everyone',
          },
        });
        this.pendingTransaction.set(transaction.traceId, transaction);
      }

      const encData = encryptServerPayload(data);
      args.unshift(encData);
      const packedData = (global as any).msgpack_pack(args);
      const evtHash = getEventHash(evtName);
      if (packedData.length < 16000) {
        global.TriggerClientEventInternal(evtHash, String(target), packedData, packedData.length);
      } else {
        global.TriggerLatentClientEventInternal(evtHash, String(target), packedData, packedData.length, 1280000);
      }
    });
  };
}

class RPC extends util.Singleton<RPC>() {
  private readonly resourceName: string;
  private id: number;
  private pendingCalls: Map<
    number,
    { resolve: (data: any) => void; reject: (reason?: any) => void; timeout: NodeJS.Timeout; name: string; args: any[] }
  >;
  private events: Events;

  constructor() {
    super();

    this.resourceName = GetCurrentResourceName();
    this.pendingCalls = new Map();
    this.id = 0;
    this.events = Events.getInstance();

    this.events.onNet(
      `__dgx_res:${this.resourceName}`,
      (src, payload: DGXRPC.RequestData, success: boolean, result: any) => {
        if (!payload.id) return;
        const pendingRPC = this.pendingCalls.get(payload.id);
        if (pendingRPC === undefined) return;

        if (!payload.metadata.response) return;
        payload.metadata.response.end = new Date().toString();

        clearTimeout(pendingRPC.timeout);
        if (success) {
          pendingRPC.resolve(result);
        } else {
          pendingRPC.reject(result);
        }

        const data: Auth.EventLog = {
          send: 'server',
          recv: 'client',
          rpc: true,
          event: pendingRPC.name,
          target: 0,
          data: pendingRPC.args,
          response: result,
        };
        try {
          DGXAuth.logEvent(data);
        } catch (e) {
          // ignore
        }

        const steamId = Player(src).state.steamId;
        const transaction = Sentry.startTransaction({
          name: pendingRPC.name,
          op: 'server.rpc',
          description: `Outgoing RPC request to ${pendingRPC.name} to ${src}`,
          data: {
            target: steamId,
          },
          tags: {
            handler: 'RPC',
            target: 'Client',
            resource: this.resourceName,
            user: steamId,
          },
        });
        Sentry.configureScope(scope => {
          scope.setSpan(transaction);
        });
        (Object.keys(payload.metadata) as (keyof DGXEvents.EventMetadata)[]).forEach(type => {
          const rawData = payload.metadata[type];
          if (!rawData || (!rawData.end && !rawData.start)) return;
          const parsed = {
            start: (rawData.start ? new Date(rawData.start).getTime() : Date.now()) / 1000,
            end: (rawData.end ? new Date(rawData.end).getTime() : Date.now()) / 1000,
          };
          const span = transaction.startChild({
            op: 'sender',
            status: 'ok',
            startTimestamp: parsed.start,
          });
          span.finish(parsed.end);
        });
      },
      true
    );
  }

  async execute<T = any>(evtName: string, target: number, ...args: any[]): Promise<T | null> {
    const data = { id: ++this.id, origin: this.resourceName };

    const prom = new Promise<T>((res, rej) => {
      const timeout = setTimeout(() => {
        rej(`RPC timed-out | name: ${evtName}`);
      }, 60000);
      const promData = {
        resolve: (v: T) => {
          res(v);
        },
        reject: rej,
        timeout,
        name: evtName,
        args,
      };

      this.pendingCalls.set(data.id, promData);
    });

    this.events.emitNet(
      {
        event: `__dgx_req:${evtName}`,
        data: {
          ...data,
          skipSentry: true,
          skipLog: true,
          metadata: {
            sender: {
              start: new Date().toString(),
            },
          },
        },
      },
      target,
      ...args
    );

    prom.finally(() => this.pendingCalls.delete(data.id));

    return prom;
  }

  register = <T = any>(event: string, handler: DGXEvents.ServerEventHandler<T>) => {
    this.events.onNet(
      `__dgx_req:${event}`,
      async (src, payload: DGXRPC.RequestData, ...args: any[]) => {
        let result: any;
        let success = false;
        try {
          if (!payload.metadata.sender) payload.metadata.sender = {};
          payload.metadata.sender.end = new Date().toString();
          if (!payload.metadata.handler) payload.metadata.handler = {};
          payload.metadata.handler.start = new Date().toString();
          result = await handler(src, ...args);
          success = true;
        } catch (e) {
          result = e;
          console.error(e);
        } finally {
          if (!payload.metadata.handler) payload.metadata.handler = {};
          payload.metadata.handler.end = new Date().toString();
          if (!payload.metadata.response) payload.metadata.response = { start: '', end: '' };
          payload.metadata.response.start = new Date().toString();

          this.events.emitNet(
            {
              event: `__dgx_res:${payload.origin}`,
              data: payload,
            },
            src,
            success,
            result
          );
        }
      },
      true
    );
  };
}

class SQL {
  async query<T = any>(query: string, params: any[] = [], cb?: (result: T) => void): Promise<T> {
    return global.exports['dg-sql'].query(query, params, cb);
  }

  async scalar<T = any>(query: string, params: any[] = [], cb?: (result: T) => void): Promise<T> {
    return global.exports['dg-sql'].scalar(query, params, cb);
  }

  async insert(query: string, params: any[] = [], cb?: (result: any) => void): Promise<number | undefined> {
    return global.exports['dg-sql'].insert(query, params, cb);
  }

  async insertValues(
    table: string,
    values: { [k: string]: any }[] = [],
    cb?: (result: any) => void,
    ignoreDuplicates?: boolean
  ) {
    return global.exports['dg-sql'].insertValues(table, values, cb, ignoreDuplicates);
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

  public toggleAllowedMod = (plyId: number, mod: string, allowed: boolean): Promise<void> => {
    return global.exports['dg-auth'].toggleAllowedMod(plyId, mod, allowed);
  };
}

export default {
  Events: Events.getInstance(),
  RPC: RPC.getInstance(),
  SQL: new SQL(),
  API: new API(),
  Auth: new Auth(),
};
