declare interface ClientHandlingEvent {
  token: string;
  eventName: string;
  args: any[];
  traceId: string | null;
}
declare type LocalEventHandler = (...args: any[]) => void;
