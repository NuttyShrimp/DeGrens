declare interface ClientHandlingEvent {
  token: string;
  eventName: string;
  args: any[];
  traceId: string;
}
declare type LocalEventHandler = (...args: any[]) => void;
