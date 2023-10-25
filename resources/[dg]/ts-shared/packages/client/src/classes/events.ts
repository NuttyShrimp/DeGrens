import { enc } from 'crypto-js';
import {
  awaitKeys,
  decryptAESPayload,
  decryptClientPayload,
  decryptServerPayload,
  encryptClientPayload,
  getEventHash,
  setKeys,
} from '@dgx/shared/src/classes/encrypt';
import utilClass from './util';
import { DGXAuth } from '../exports';

const util = utilClass.Util;

class Events extends util.Singleton<Events>() {
  constructor() {
    super();

    setImmediate(() => {
      const resName = GetCurrentResourceName();
      emitNet('__dgx_auth_init', resName);
      onNet(`__dgx_auth:${resName}`, (token: string, secret: string) => {
        onNet(`__dgx_auth_res:${token}`, (encKeys: string) => {
          const keys = enc.Utf8.stringify(enc.Base64.parse(encKeys));
          if (!keys) {
            throw new Error('Failed to retreive encryption keys');
          }
          const decKeys = keys.split(':').map(k => decryptAESPayload(k, secret));
          setKeys({
            event: decKeys[0] ?? '',
            decode: decKeys[1] ?? '',
            encrypt: decKeys[2] ?? '',
          });
        });

        emitNet(`__dgx_auth_req:${token}`, resName);
      });
    });
  }

  on = async (event: string, handler: DGXEvents.LocalEventHandler) => {
    await awaitKeys();
    global.on(getEventHash(event), async (dataStr: string, ...args: any[]) => {
      const data: DGXEvents.NetEvtData = decryptClientPayload(dataStr);
      if (!data.metadata) data.metadata = {};
      if (!data.metadata.sender) data.metadata.sender = {};
      if (!data.metadata.handler) data.metadata.handler = {};
      const now = new Date().toString();
      data.metadata.sender.end = now;
      data.metadata.handler.start = now;

      DGXAuth.logEvent({
        send: 'client',
        recv: 'client',
        event,
        target: 0,
        data: JSON.stringify(args),
      });

      let err: any | null = null;
      try {
        await handler(...args);
      } catch (e: any) {
        err = e;
        console.error(e);
      } finally {
        data.metadata.handler.end = new Date().toString();
      }
    });
  };

  onNet = async (event: string, handler: DGXEvents.LocalEventHandler, passData = false) => {
    await awaitKeys();
    global.onNet(getEventHash(event), async (dataStr: string, ...args: any[]) => {
      const data: DGXEvents.NetEvtData = decryptServerPayload(dataStr);
      if (!data.metadata) data.metadata = {};
      if (!data.metadata.sender) data.metadata.sender = {};
      if (!data.metadata.handler) data.metadata.handler = {};
      const now = new Date().toString();
      data.metadata.sender.end = now;
      data.metadata.handler.start = now;

      if (!data.skipLog) {
        DGXAuth.logEvent({
          send: 'server',
          recv: 'client',
          event,
          target: 0,
          data: JSON.stringify(args),
        });
      }

      let err: any | null = null;
      try {
        if (passData) {
          await handler(data, ...args);
        } else {
          await handler(...args);
        }
      } catch (e: any) {
        err = e;
        console.error(e);
      } finally {
        data.metadata.handler.end = new Date().toString();
        if (data.skipSentry || !data.traceId) return;
        emitNet(`__dgx_sentry:${GetCurrentResourceName()}:finishTrace`, data.traceId, data.metadata, err !== null, err);
      }
    });
  };

  emit = async (event: string, ...args: any[]) => {
    const data = {
      metadata: {
        sender: {
          start: new Date().toString(),
        },
      },
    };
    await awaitKeys();
    const encData = encryptClientPayload(data);
    if (!encData) {
      throw new Error(`Failed to encrypt event payload | ${event}`);
    }
    global.emit(getEventHash(event), encData, ...args);
  };

  emitNet = async (event: string | { event: string; data: DeepPartial<DGXEvents.NetEvtData> }, ...args: any[]) => {
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
    const encData = encryptClientPayload(data);
    args.unshift(encData);
    const packedData = (global as any).msgpack_pack(args);
    const evtHash = getEventHash(typeof event === 'string' ? event : event.event);
    if (!data.skipLog) {
      DGXAuth.logEvent({
        send: 'client',
        recv: 'server',
        event,
        target: 0,
        data: JSON.stringify(args),
      });
    }
    if (packedData.length < 16000) {
      global.TriggerServerEventInternal(evtHash, packedData, packedData.length);
    } else {
      global.TriggerLatentServerEventInternal(evtHash, packedData, packedData.length, 1280000);
    }
  };

  awaitSession = async () => {
    await awaitKeys();
  };
}

class RPC extends util.Singleton<RPC>() {
  private readonly resourceName: string;
  private id: number;
  private pendingCalls: Map<
    number,
    {
      resolve: (data: any) => void;
      reject: (reason?: any) => void;
      timeout: NodeJS.Timeout;
      args: any[];
      evtName: string;
    }
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
      (payload: DGXRPC.RequestData, success: boolean, result: any) => {
        if (!payload.id) return;
        const pendingRPC = this.pendingCalls.get(payload.id);
        if (pendingRPC === undefined) return;
        if (!payload.metadata.response) payload.metadata.response = {};
        payload.metadata.response.end = new Date().toString();

        clearTimeout(pendingRPC.timeout);
        if (success) {
          pendingRPC.resolve(result);
        } else {
          pendingRPC.reject(result);
        }

        DGXAuth.logEvent({
          send: 'client',
          recv: 'server',
          event: pendingRPC.evtName,
          target: 0,
          data: JSON.stringify(pendingRPC.args),
          rpc: true,
          response: JSON.stringify(result),
        });
      },
      true
    );
  }

  register = <T = any>(event: string, handler: DGXEvents.LocalEventHandler<T>) => {
    this.events.onNet(
      `__dgx_req:${event}`,
      async (payload: DGXRPC.RequestData & DGXEvents.NetEvtData, ...args: any[]) => {
        let result: any;
        let success = false;
        try {
          if (!payload.metadata.sender) payload.metadata.sender = {};
          payload.metadata.sender.end = new Date().toString();
          if (!payload.metadata.handler) payload.metadata.handler = { start: '', end: '' };
          payload.metadata.handler.start = new Date().toString();
          result = await handler(...args);
          success = true;
        } catch (e) {
          result = e;
          console.error(e);
        } finally {
          if (!payload.metadata.handler) payload.metadata.handler = {};
          payload.metadata.handler.end = new Date().toString();
          if (!payload.metadata.response) payload.metadata.response = { start: '', end: '' };
          payload.metadata.response.start = new Date().toString();
          payload.skipLog = true;

          DGXAuth.logEvent({
            send: 'server',
            recv: 'client',
            event: event,
            target: 0,
            data: JSON.stringify(args),
            rpc: true,
            response: JSON.stringify(result),
          });

          this.events.emitNet(
            {
              event: `__dgx_res:${payload.origin}`,
              data: payload,
            },
            success,
            result
          );
        }
      },
      true
    );
  };

  async execute<T = any>(evtName: string, ...args: any[]): Promise<T | null> {
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
        args,
        evtName,
      };

      this.pendingCalls.set(data.id, promData);
    });

    this.events.emitNet(
      {
        event: `__dgx_req:${evtName}`,
        data: {
          ...data,
          skipLog: true,
          metadata: {
            sender: {
              start: new Date().toString(),
            },
          },
        },
      },
      ...args
    );

    prom.finally(() => this.pendingCalls.delete(data.id));

    return prom;
  }
}

export default {
  Events: Events.getInstance(),
  RPC: RPC.getInstance(),
};
