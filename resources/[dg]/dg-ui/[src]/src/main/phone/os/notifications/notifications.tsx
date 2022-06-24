import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import { Icon } from '../../../../components/icon';
import { formatTime } from '../../../../lib/util';
import { acceptNotification, declineNotification } from '../../lib';

import { styles } from './notification.styles';

const NotificationButton = styled(Button)({
  borderRadius: '10vh',
  fontSize: '.7em',
  color: 'white',
  borderColor: 'white',
  padding: '.25vh .75vh',
});

export const Notification: FC<React.PropsWithChildren<{ notification: Phone.Notifications.Notification }>> = ({
  notification,
}) => {
  const classes = styles();
  const [timer, setTimer] = useState<undefined | number>(notification.timer);

  useEffect(() => {
    if (notification.timer === undefined) return;
    if (notification.timer > 0) {
      // count down

      let internalTimer = notification.timer;
      const interval = setInterval(() => {
        setTimer(internalTimer--);
      }, 1000);
      setTimer(notification.timer);
      return () => clearInterval(interval);
    } else {
      // count up
      let internalTimer = 1;
      const interval = setInterval(() => {
        setTimer(internalTimer++);
      }, 1000);
      setTimer(notification.timer);
      return () => clearInterval(interval);
    }
  }, [notification.timer]);

  const handleAccept = (evt: MouseEvent) => {
    evt.stopPropagation();
    acceptNotification(notification.id);
  };

  const handleDecline = (evt: MouseEvent) => {
    evt.stopPropagation();
    declineNotification(notification.id);
  };

  return (
    <div className={classes.box} onClick={handleDecline}>
      <div>
        <div className={classes.info}>
          <div
            className={classes.icon}
            style={{
              background: notification.icon.background,
              color: notification.icon.color,
            }}
          >
            <Icon
              lib={notification.icon.lib}
              name={notification.icon.name}
              size={notification.icon.lib === 'svg' ? '1.2rem' : '.9rem'}
            />
          </div>
          <div className={classes.textWrapper}>
            <div className={[classes.text, classes.title].join(' ')}>{notification.title.toUpperCase()}</div>
            {notification.description && (
              <div className={[classes.text, classes.description].join(' ')}>
                {timer !== undefined ? `${formatTime(timer)} - ${notification.description}` : notification.description}
              </div>
            )}
          </div>
        </div>
        <div className={classes.btns}>
          {notification.onAccept && (
            <div>
              <NotificationButton variant={'outlined'} onClick={handleAccept}>
                Accept
              </NotificationButton>
            </div>
          )}
          {notification.onAccept && notification.onDecline && <div>|</div>}
          {notification.onDecline && (
            <div>
              <NotificationButton variant={'outlined'} onClick={handleDecline}>
                Decline
              </NotificationButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotificationWrapper: FC<React.PropsWithChildren<unknown>> = () => {
  const classes = styles();
  const notifications = useSelector<RootState, Phone.Notifications.State>(state => state['phone.notifications']);

  return (
    <div className={classes.list}>
      <div className={classes.innerList}>
        {notifications.list.map(notification => (
          <Notification notification={notification} key={notification.id} />
        ))}
      </div>
    </div>
  );
};
