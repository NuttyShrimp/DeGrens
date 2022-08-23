declare interface ClientHandlingEvent {
  token: string;
  eventName: string;
  args: any[];
  traceId: string | null;
  metadata: EventMetadata;
}
declare interface EventMetadata {
  receiver: Record<string, any>;
  handler: Record<string, any>;
}

declare type LocalEventHandler = (...args: any[]) => void;
