import { useCallback } from 'react';
import { sanitizeText } from '@src/lib/util';

import { useNotificationStore } from '../stores/useNotificationStore';

export const useNotifications = () => {
  const [lastId, addStoreNoti, removeStoreNoti] = useNotificationStore(s => [
    s.lastId,
    s.addNotification,
    s.removeNotification,
  ]);

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
      addStoreNoti(notification);
      if (notification.persistent) {
        return nId;
      }
      setTimeout(() => {
        removeStoreNoti(nId);
      }, notification.timeout);
    },
    [addStoreNoti, removeStoreNoti, lastId]
  );

  return { addNotification, removeNotification: removeStoreNoti };
};
