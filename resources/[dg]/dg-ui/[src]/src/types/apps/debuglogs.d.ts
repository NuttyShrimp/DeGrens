declare namespace DebugLogs {
  interface State extends State.Base {
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
