import utilClass from './util';
import { DGXAuth } from '../exports';
import events, { Events } from './events';

const util = utilClass.Util;

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
    this.events = events.Events;

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
  RPC: RPC.getInstance(),
};
