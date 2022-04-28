declare interface ClientHandlingEvent {
  token: string;
  eventName: string;
  args: any[];
}
declare type LocalEventHandler = (...args: any[]) => void;
