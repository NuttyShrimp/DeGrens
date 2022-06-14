import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { animated, useSpring } from 'react-spring';
import shell from '@assets/phone/shell.png';
import { useVhToPixel } from '@lib/hooks/useVhToPixel';
import { AppContainer } from '@src/components/appcontainer';

import { ConfigObject } from '../../config';
import { BottomBar } from '../bottombar/bottombar';
import { Form } from '../form/form';
import { NotificationWrapper } from '../notifications/notifications';
import { TopContent } from '../top-content/topcontent';

import { styles } from './phone.styles';

export const Phone: FC<React.PropsWithChildren<Phone.Props & { config: ConfigObject[] }>> = props => {
  const classes = styles();
  const closedVh = useVhToPixel(60);
  const basedOffset = useVhToPixel(60 - 5.5);
  const notificationState = useSelector<RootState, Phone.Notifications.State>(state => state['phone.notifications']);
  const [bottomOffset, setBottomOffset] = useState(basedOffset);
  const [activeAppCfg, setActiveAppCfg] = useState<ConfigObject | undefined>(undefined);
  const [rootAnimStyle, api] = useSpring(() => ({
    // notification w actions has height of ~7.5vh
    // notification w/o actions has height of ~4.3vh
    // 47vh is proper bottom for notification w actions
    // spacing is ~2.75vh
    // from: {
    //   bottom: !props.visible && props.hasNotifications ? `-${bottomOffset}px` : `-${closedVh}px`,
    // },
    // to: {
    //   bottom: props.hasNotifications && !props.visible ? `-${bottomOffset}px` : '0px',
    // },
  }));

  useEffect(() => {
    let offset = 0;
    const notiWithActions = notificationState.list.filter(n => n.onAccept || n.onDecline);
    offset += notiWithActions.length * 7.5;
    offset += (notificationState.list.length - notiWithActions.length) * 4.3;
    setBottomOffset(basedOffset - offset);
  }, [notificationState, basedOffset]);

  useEffect(() => {
    let target = '0px';
    switch (props.animating) {
      case 'closed': {
        target = `-${closedVh}px`;
        break;
      }
      case 'peek': {
        target = `-${bottomOffset}px`;
        break;
      }
      case 'open': {
        target = '0px';
        break;
      }
    }
    api.start({
      bottom: target,
    });
    console.log(`visible: ${props.visible} animating: ${props.animating} hasNoti: ${props.hasNotifications}`);
  }, [props.visible, props.animating, props.hasNotifications, api]);

  useEffect(() => {
    setActiveAppCfg(props.config.find(c => c.name === props.activeApp));
  }, [props.activeApp]);

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
          {(activeAppCfg && (
            <AppContainer config={{ ...activeAppCfg, name: `phone.apps.${activeAppCfg.name}` as keyof RootState }} />
          )) ??
            `${props.activeApp} is not registered`}
        </div>
        <BottomBar />
      </div>
      <Form />
    </animated.div>
  );
};
