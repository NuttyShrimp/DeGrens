declare namespace Notifications {
  type Type = 'error' | 'success' | 'info';
  interface Notification {
    type: Type;
    message: string;
    timeout?: number;
    persistent?: boolean;
    id?: string | number;
  }

  interface State extends Base.State {
    notifications: Notification[];
    lastId: number;
  }
}
