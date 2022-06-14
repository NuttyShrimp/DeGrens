declare namespace DebugLogs {
  interface State extends Base.State {
    logs: Log[];
  }

  interface log {
    id: number;
    name: string;
    body: any;
    response?: any;
    isOk?: boolean;
  }
}
