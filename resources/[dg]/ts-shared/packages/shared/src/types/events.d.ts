declare namespace DGXEvents {
  type ServerEventHandler<T = void> = (src: number, ...args: any[]) => T | Promise<T>;
  type LocalEventHandler<T = void> = (...args: any[]) => T | Promise<T>;

  interface ServerLocalEvtData {
    metadata: EventMetadata;
  }

  // event payload
  interface NetEvtData {
    metadata: EventMetadata;
    skipSentry?: boolean;
    skipLog?: boolean;
    traceId?: string;
  }
  type EventMetadata = Partial<Record<'sender' | 'handler' | 'response', Partial<Record<'start' | 'end', string>>>>;
}

declare namespace DGXRPC {
  interface RequestData {
    id: number;
    origin: string;
    metadata: DGXEvents.EventMetadata;
  }
}
