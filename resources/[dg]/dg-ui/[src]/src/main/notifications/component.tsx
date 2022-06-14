import React, { useState } from 'react';
import AppWrapper from '@components/appwrapper';

import { sanitizeText } from '../../lib/util';

import { NotificationList } from './components/list';
import store from './store';

import './styles/notifications.scss';

const types = ['success', 'info', 'error', 'primary'];

const Component: AppFunction<Notifications.State> = props => {
  const [id, setId] = useState(0);

  const handleVisibility = (visible: boolean) => {
    props.updateState({ visible });
  };

  const eventHandler = (data: any) => {
    switch (data.action) {
      case 'add': {
        if (!validateType(data.notification?.type || 'info')) {
          console.error('Invalid notification type', data.notification);
          return;
        }

        // Backwards compatibility
        if (data.notification?.type === 'primary') {
          data.notification.type = 'info';
        }

        const nId = data.notification?.id ?? id;
        setId(id + 1);
        const notification: Notifications.Notification = {
          id: nId,
          message: sanitizeText(data.notification.message),
          type: data.notification?.type ?? 'info',
          timeout: data.notification?.timeout ?? 5000,
          persistent: data.notification.persistent ?? false,
        };
        props.updateState({
          notifications: [...props.notifications, notification],
        });
        if (notification.persistent) return nId;
        setTimeout(() => {
          props.updateState({
            notifications: props.notifications.filter(n => n.id !== nId),
          });
        }, notification.timeout);
        break;
      }
      case 'remove': {
        props.updateState({
          notifications: props.notifications.filter(n => n.id !== data.id),
        });
        break;
      }
      default: {
        throw new Error(`Unknown event for notification: ${data.action} | data: ${JSON.stringify(data)}`);
      }
    }
  };

  const validateType = (notiType: string) => {
    return types.includes(notiType);
  };

  return (
    <AppWrapper
      appName={store.key}
      onShow={() => handleVisibility(true)}
      onHide={() => handleVisibility(false)}
      onEvent={eventHandler}
      center
      unSelectable
    >
      <NotificationList {...props} />
    </AppWrapper>
  );
};

export default Component;
