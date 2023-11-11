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

export class Events extends util.Singleton<Events>() {
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

const events = new Events();

export default {
  Events: events,
};
