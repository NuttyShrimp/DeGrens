import React, { FC, forwardRef, MouseEvent, useMemo } from 'react';
import { animated, easings, useTransition } from 'react-spring';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useVhToPixel } from '@src/lib/hooks/useVhToPixel';

import { Icon } from '../../../../components/icon';
import { formatTime } from '../../../../lib/util';
import { acceptNotification, declineNotification } from '../../lib';
import { usePhoneNotiStore } from '../../stores/usePhoneNotiStore';

import { styles } from './notification.styles';

const NotificationButton = styled(Button)({
  borderRadius: '10vh',
  fontSize: '.7em',
  color: 'white',
  borderColor: 'white',
  padding: '.25vh .75vh',
});

export const Notification = forwardRef<HTMLDivElement, { notification: Phone.Notifications.Notification; style?: any }>(
  ({ notification, style }, ref) => {
    const classes = styles();
    const timer = usePhoneNotiStore(s => s.timers?.[notification.id]);

    const handleAccept = (evt: MouseEvent) => {
      evt.stopPropagation();
      acceptNotification(notification.id);
    };

    const handleDecline = (evt: MouseEvent) => {
      evt.stopPropagation();
      declineNotification(notification.id);
    };

    return (
      <animated.div className={classes.box} onClick={handleDecline} style={style} ref={ref}>
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
                  {timer !== undefined
                    ? `${formatTime(timer)} - ${notification.description}`
                    : notification.description}
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
      </animated.div>
    );
  }
);

export const NotificationWrapper: FC<React.PropsWithChildren<unknown>> = () => {
  const classes = styles();
  const list = usePhoneNotiStore(s => s.list);
  const hiddenNoti = useVhToPixel(-10);
  const bottomMargin = useVhToPixel(0.5);
  const refMap = useMemo(() => new Map<string, HTMLDivElement>(), []);

  const transitions = useTransition(list, {
    from: (_, i) => ({
      position: 'absolute',
      top: hiddenNoti * (i + 1),
    }),
    enter: (_, i) => ({
      position: 'absolute',
      top: [...refMap.values()].slice(0, i + 1).reduce((c, v) => c + v.offsetHeight + bottomMargin, 0),
    }),
    leave: n => async next => {
      await next({
        top: hiddenNoti,
      });
      const nRef = refMap.get(n.id);
      if (nRef) {
        refMap.forEach((ref, id) => {
          if (id === n.id || nRef?.offsetTop > ref.offsetTop) return;
          ref.style.top = `${ref.offsetTop - nRef.offsetHeight - bottomMargin}px`;
        });
      }
      refMap.delete(n.id);
    },
    config: { duration: 400, easing: easings.easeOutQuad },
    // keys: n => n.id,
  });

  return (
    <div className={classes.list}>
      <div className={classes.innerList}>
        {transitions((style, notification) => (
          <Notification
            notification={notification}
            key={notification.id}
            style={style}
            ref={ref => ref && refMap.set(notification.id, ref)}
          />
        ))}
      </div>
    </div>
  );
};
