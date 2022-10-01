import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { NotificationList } from './components/list';
import { useNotifications } from './hooks/useNotification';
import store from './store';

import './styles/notifications.scss';

const Component: AppFunction<Notifications.State> = props => {
  const { addNotification, removeNotification } = useNotifications();

  const handleVisibility = (visible: boolean) => {
    props.updateState({ visible });
  };
  const handleShow = useCallback(() => handleVisibility(true), []);
  const handleHide = useCallback(() => handleVisibility(false), []);

  const eventHandler = useCallback(
    (data: any) => {
      switch (data.action) {
        case 'add': {
          addNotification(data.notification as Notifications.Notification);
          break;
        }
        case 'remove': {
          removeNotification(data.id);
          break;
        }
        default: {
          throw new Error(`Unknown event for notification: ${data.action} | data: ${JSON.stringify(data)}`);
        }
      }
    },
    [removeNotification, addNotification]
  );

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} onEvent={eventHandler} center unSelectable>
      <NotificationList {...props} />
    </AppWrapper>
  );
};

export default Component;
