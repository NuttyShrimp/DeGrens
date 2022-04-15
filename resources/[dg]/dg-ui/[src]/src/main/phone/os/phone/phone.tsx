import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { animated, useSpring } from 'react-spring';
import shell from '@assets/phone/shell.png';
import { useVhToPixel } from '@lib/hooks/useVhToPixel';

import { ConfigObject } from '../../config';
import { hidePhone } from '../../lib';
import { BottomBar } from '../bottombar/bottombar';
import { Form } from '../form/form';
import { NotificationWrapper } from '../notifications/notifications';
import { TopContent } from '../top-content/topcontent';

import { styles } from './phone.styles';

export const Phone: FC<Phone.Props & { config: ConfigObject[] }> = props => {
  const classes = styles();
  const closedVh = useVhToPixel(60);
  const basedOffset = useVhToPixel(60 - 5.5);
  const notificationState = useSelector<RootState, Phone.Notifications.State>(state => state['phone.notifications']);
  const [bottomOffset, setBottomOffset] = useState(basedOffset);
  const [isOpen, setIsOpen] = useState(false);
  const [isInTransition, setIsInTransition] = useState(false);
  const [rootAnimStyle, api] = useSpring(() => ({
    // notification w actions has height of ~7.5vh
    // notification w/o actions has height of ~4.3vh
    // 47vh is proper bottom for notification w actions
    // spacing is ~2.75vh
    from: {
      bottom: `-${closedVh}px`,
    },
    to: {
      bottom: props.hasNotifications ? `-${bottomOffset}px` : '0px',
    },
  }));

  useEffect(() => {
    let offset = 0;
    const notiWithActions = notificationState.list.filter(n => n.onAccept || n.onDecline);
    offset += notiWithActions.length * 7.5;
    offset += (notificationState.list.length - notiWithActions.length) * 4.3;
    setBottomOffset(basedOffset - offset);
  }, [notificationState, basedOffset]);

  useEffect(() => {
    if (!props.visible && !props.animating) {
      return;
    }
    if (isInTransition) {
      setIsInTransition(false);
      return;
    }
    if (!props.animating && isOpen) {
      api.start({
        reverse: true,
      });
      setIsOpen(false);
      setIsInTransition(true);
      return;
    }
    if ((props.visible || props.hasNotifications) && props.animating && !isOpen) {
      api.start({
        from: {
          bottom: props.visible ? `-${bottomOffset}px` : `-${closedVh}px`,
        },
        to: {
          bottom: props.visible ? '0px' : `-${bottomOffset}px`,
        },
        reverse: false,
      });
      setIsOpen(true);
      setIsInTransition(true);
      return;
    }
    if (props.visible && !(props.animating && props.hasNotifications && isOpen)) {
      hidePhone();
      return;
    }
  }, [props.visible, props.animating, props.hasNotifications, isOpen, bottomOffset, api]);

  return (
    <animated.div className={classes.root} style={rootAnimStyle}>
      {props.bigPhoto && (
        <div className={classes.bigPhoto}>
          <div>
            <img src={props.bigPhoto} alt='big photo' />
          </div>
        </div>
      )}
      <div className={classes.shell}>
        <img src={shell} alt={'phone shell'} />
      </div>
      <div className={classes.notifications} />
      <div className={classes.appWrapper} style={props.background}>
        <TopContent character={props.character} game={props.game} />
        <div className={classes.activeApp}>
          <NotificationWrapper />
          {props.config.find(c => c.name === props.activeApp)?.render?.({}) ?? `${props.activeApp} is not registered`}
        </div>
        <BottomBar />
      </div>
      <Form />
    </animated.div>
  );
};
