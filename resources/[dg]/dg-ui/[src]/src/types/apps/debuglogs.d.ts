declare namespace DebugLogs {
  interface State {
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
