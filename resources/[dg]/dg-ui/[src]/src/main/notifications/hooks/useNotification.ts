import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useUpdateState } from '@src/lib/redux';
import { sanitizeText } from '@src/lib/util';

export const useNotifications = () => {
  const lastId = useSelector<RootState, Notifications.State['lastId']>(state => state.notifications.lastId);
  const updateState = useUpdateState('notifications');

  const removeNotification = useCallback(
    (id: string | number) => {
      updateState(s => ({ notifications: s.notifications.notifications.filter(n => n.id !== id) }));
    },
    [updateState]
  );

  const addNotification = useCallback(
    (data: Notifications.Notification) => {
      const nId = data.id ?? lastId + 1;
      const notification: Notifications.Notification = {
        id: nId,
        message: sanitizeText(data.message),
        type: data.type ?? 'info',
        timeout: data.timeout ?? 5000,
        persistent: data.persistent ?? false,
      };
      updateState(s => ({
        notifications: [...s.notifications.notifications, notification],
        lastId: s.notifications.lastId + 1,
      }));
      if (notification.persistent) {
        return nId;
      }
      setTimeout(() => {
        updateState(s => ({ notifications: s.notifications.notifications.filter(n => n.id !== nId) }));
      }, notification.timeout);
    },
    [updateState, lastId]
  );

  return { addNotification, removeNotification };
};
