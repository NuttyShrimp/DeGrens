declare namespace RPC {
  interface EventData {
    id: number;
    name: string;
    args: any[];
    resource: string;
    traceId: string | null;
  }
  interface ResolveData {
    id: number;
    result: any;
    resource: string;
  }
}
