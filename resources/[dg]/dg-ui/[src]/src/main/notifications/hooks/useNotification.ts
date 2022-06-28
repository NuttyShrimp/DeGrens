import { store, useUpdateState } from '@src/lib/redux';
import { sanitizeText } from '@src/lib/util';

export const useNotifications = () => {
  const updateState = useUpdateState('notifications');
  const removeNotification = (id: string | number) => {
    const state: Notifications.State = store.getState()['notifications'];
    updateState({ notifications: state.notifications.filter(n => n.id !== id) });
  };
  const addNotification = (data: Notifications.Notification) => {
    const state: Notifications.State = store.getState()['notifications'];
    const nId = data.id ?? state.lastId + 1;
    const notification: Notifications.Notification = {
      id: nId,
      message: sanitizeText(data.message),
      type: data.type ?? 'info',
      timeout: data.timeout ?? 5000,
      persistent: data.persistent ?? false,
    };
    updateState({
      notifications: [...state.notifications, notification],
      lastId: state.lastId + 1,
    });
    if (notification.persistent) return nId;
    setTimeout(() => {
      removeNotification(nId);
    }, notification.timeout);
  };
  return { addNotification, removeNotification };
};
