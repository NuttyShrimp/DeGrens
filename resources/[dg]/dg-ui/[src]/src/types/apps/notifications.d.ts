declare namespace Notifications {
  type Type = 'error' | 'success' | 'info';
  interface Notification {
    type: Type;
    message: string;
    timeout?: number;
    persistent?: boolean;
    id?: string | number;
  }

  interface State {
    notifications: Notification[];
    lastId: number;
  }

  interface StateActions {
    addNotification: (noti: Notification) => void;
    removeNotification: (id: string | number) => void;
    updateNotification: (id: string | number, noti: Partial<Notification>) => void;
  }
}
