import { useCallback } from 'react';
import { sanitizeText } from '@src/lib/util';

import { useNotificationStore } from '../stores/useNotificationStore';

export const useNotifications = () => {
  const [lastId, notifications, addStoreNoti, removeStoreNoti, updateStoreNoti] = useNotificationStore(s => [
    s.lastId,
    s.notifications,
    s.addNotification,
    s.removeNotification,
    s.updateNotification,
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
      if (notifications.find(n => n.id === nId)) {
        updateStoreNoti(nId, notification);
      } else {
        addStoreNoti(notification);
      }
      if (notification.persistent) {
        return nId;
      }
      setTimeout(() => {
        removeStoreNoti(nId);
      }, notification.timeout);
    },
    [addStoreNoti, removeStoreNoti, lastId, notifications]
  );

  return { addNotification, removeNotification: removeStoreNoti };
};
