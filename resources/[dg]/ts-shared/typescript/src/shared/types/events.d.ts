declare namespace DGXEvents {
  type ServerEventHandler<T = void> = (src: number, ...args: any[]) => T | Promise<T>;
  type LocalEventHandler<T = void> = (...args: any[]) => T | Promise<T>;

  interface ServerNetEvtData {
    token: string;
    /**
     * The resource that sent the event
     */
    origin: string;
    eventId: string;
    metadata: Record<string, any>;
    args: any[];
  }

  interface ServerLocalEvtData {
    eventName: string;
    args: any[];
    metadata: Record<string, number>;
  }

  interface ClientNetEvtData {
    eventName: string;
    args: any[];
    traceId: string | null;
    metadata: EventMetadata;
  }

  interface EventMetadata {
    receiver: Record<string, any>;
    handler: Record<string, any>;
  }
}

declare namespace DGXRPC {
  // S -> C emit request data
  interface ServerRequestData {
    id: number;
    name: string;
    args: any[];
    resource: string;
    originToken: string;
  }

  // C -> S response request data
  interface ClientResponseData<T = any> {
    result: T;
    resource: string;
    originToken: string;
    token: string;
    metadata: {
      handler: Record<string, string>;
      response: Record<string, string>;
    };
  }

  interface ClientRequestMetadata {
    request: Record<string, string>;
    handler: Record<string, string>;
    response: Record<string, string>;
  }

  interface ClientRequestData {
    id: number;
    name: string;
    args: any[];
    token: string;
    resource: string;
    metadata: ClientRequestMetadata;
  }

  interface ServerResponseData<T = any> {
    id: number;
    result: T;
    token: string;
    traceId: string | undefined;
    metadata: ClientRequestMetadata;
  }
}
