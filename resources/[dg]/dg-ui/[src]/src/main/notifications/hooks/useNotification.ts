import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useUpdateState } from '@src/lib/redux';
import { sanitizeText } from '@src/lib/util';

export const useNotifications = () => {
  const state = useSelector<RootState, Notifications.State>(state => state.notifications);
  const stateRef = useRef(state);
  const updateState = useUpdateState('notifications');

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const removeNotification = useCallback(
    (id: string | number) => {
      updateState({ notifications: state.notifications.filter(n => n.id !== id) });
    },
    [updateState, state]
  );

  const addNotification = useCallback(
    (data: Notifications.Notification) => {
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
      if (notification.persistent) {
        return nId;
      }
      setTimeout(() => {
        updateState({ notifications: stateRef.current.notifications.filter(n => n.id !== nId) });
      }, notification.timeout);
    },
    [updateState, state]
  );

  return { addNotification, removeNotification };
};
