import { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { NotificationList } from './components/list';
import { useNotifications } from './hooks/useNotification';
import config from './_config';

import './styles/notifications.scss';

const Component: AppFunction = props => {
  const { addNotification, removeNotification } = useNotifications();

  const handleShow = useCallback(() => props.showApp(), [props.showApp]);
  const handleHide = useCallback(() => props.hideApp(), [props.hideApp]);

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
    <AppWrapper
      appName={config.name}
      onShow={handleShow}
      onHide={handleHide}
      onEvent={eventHandler}
      center
      unSelectable
    >
      <NotificationList />
    </AppWrapper>
  );
};

export default Component;
