import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { animated, useSpring } from 'react-spring';
import shell from '@assets/phone/shell.png';
import { useVhToPixel } from '@lib/hooks/useVhToPixel';

import { ConfigObject } from '../../config';
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
  const rootAnimStyle = useSpring({
    // notification w actions has height of ~7.5vh
    // notification w/o actions has height of ~4.3vh
    // 47vh is proper bottom for notification w actions
    // spacing is ~2.75vh
    bottom: props.animating ? '0px' : props.hasNotifications ? `-${bottomOffset}px` : `-${closedVh}px`,
  });

  useEffect(() => {
    let offset = 0;
    const notiWithActions = notificationState.list.filter(n => n.onAccept || n.onDecline);
    offset += notiWithActions.length * 7.5;
    offset += (notificationState.list.length - notiWithActions.length) * 4.3;
    setBottomOffset(basedOffset - offset);
  }, [notificationState, basedOffset]);

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
