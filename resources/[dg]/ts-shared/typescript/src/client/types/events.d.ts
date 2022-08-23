declare namespace RPC {
  interface EventData {
    id: number;
    name: string;
    args: any[];
    resource: string;
    metadata: Record<string, any>;
  }
  interface ResolveData {
    id: number;
    result: any;
    resource: string;
    traceId?: string;
    metadata?: string;
  }
}
