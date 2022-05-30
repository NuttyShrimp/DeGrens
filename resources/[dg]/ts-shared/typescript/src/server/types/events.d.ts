declare namespace Auth {
  interface PlyData {
    timeStamp: number;
    source: number;
    steamId: string;
  }
}

declare namespace IEvents {
  type EventHandler = (src: number, ...args: any[]) => void;
  interface NetEventData {
    token: string;
    /**
     * The resource that sent the event
     */
    origin: string;
    /**
     * The resource that should handle the event
     */
    target: string;
    eventId: string;
    args: any[];
  }
}

declare namespace RPC {
  interface EventData {
    id: number;
    name: string;
    args: any[];
    resource: string;
  }
  interface ResolveData {
    id: number;
    result: any;
    resource: string;
  }
}

declare namespace IAPI {
  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
  type Responser = (code: number, data: any, headers?: Record<string, string>) => void;
}
