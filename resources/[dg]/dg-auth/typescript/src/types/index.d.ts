type EventHandler = (evtName: string, src: number, args: any[]) => any

interface PlyData {
  timeStamp: number;
  source: number;
  steamId: string;
}

interface EventData {
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