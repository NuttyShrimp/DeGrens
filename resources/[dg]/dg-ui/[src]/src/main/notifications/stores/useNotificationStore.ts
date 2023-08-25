import { create } from '@src/lib/store';

export const useNotificationStore = create<Notifications.State & Notifications.StateActions>('notifications')(set => ({
  notifications: [],
  lastId: 0,
  addNotification: n => set(s => ({ notifications: [...s.notifications, n], lastId: s.lastId + 1 })),
  removeNotification: id => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  updateNotification: (id, noti) =>
    set(s => ({ notifications: s.notifications.map(n => (n.id === id ? { ...n, ...noti } : n)) })),
}));
