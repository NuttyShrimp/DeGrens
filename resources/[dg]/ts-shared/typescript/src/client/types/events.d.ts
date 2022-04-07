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
