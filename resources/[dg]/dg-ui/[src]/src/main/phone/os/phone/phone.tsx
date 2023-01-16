import React, { FC, useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import shell from '@assets/phone/shell.png';
import { useVhToPixel } from '@lib/hooks/useVhToPixel';
import { AppContainer } from '@src/components/appcontainer';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

import { ConfigObject } from '../../config';
import { usePhoneNotiStore } from '../../stores/usePhoneNotiStore';
import { usePhoneStore } from '../../stores/usePhoneStore';
import { BottomBar } from '../bottombar/bottombar';
import { Form } from '../form/form';
import { NotificationWrapper } from '../notifications/notifications';
import { TopContent } from '../top-content/topcontent';

import { styles } from './phone.styles';

export const Phone: FC<React.PropsWithChildren<Phone.Props & { config: ConfigObject[] }>> = props => {
  const classes = styles();
  const closedVh = useVhToPixel(60);
  const basedOffset = useVhToPixel(60 - 8.7);
  const notifications = usePhoneNotiStore(s => s.list);
  const [animating, hasNotifications, activeApp, bigPhoto, background] = usePhoneStore(s => [
    s.animating,
    s.hasNotifications,
    s.activeApp,
    s.bigPhoto,
    s.background,
  ]);
  const visible = useVisibleStore(s => s.visibleApps.includes('phone'));
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
    const notiWithActions = notifications.filter(n => n.onAccept || n.onDecline);
    offset += notiWithActions.length * 7.5;
    offset += (notifications.length - notiWithActions.length) * 4.3;
    setBottomOffset(basedOffset - offset);
  }, [notifications, basedOffset]);

  useEffect(() => {
    let target = '0px';
    switch (animating) {
      case 'closed': {
        target = `-${closedVh}px`;
        break;
      }
      case 'peek': {
        target = `-${bottomOffset}px`;
        break;
      }
      case 'open': {
        break;
      }
    }
    api.start({
      bottom: target,
      config: {
        duration: 300,
      },
    });
  }, [visible, animating, hasNotifications, api, closedVh, bottomOffset]);

  useEffect(() => {
    setActiveAppCfg(props.config.find(c => c.name === activeApp));
  }, [activeApp]);

  return (
    <animated.div className={classes.root} style={rootAnimStyle}>
      {bigPhoto && (
        <div className={classes.bigPhoto}>
          <div>
            <img src={bigPhoto} alt='big photo' />
          </div>
        </div>
      )}
      <div className={classes.shell}>
        <img src={shell} alt={'phone shell'} />
      </div>
      <div className={classes.notifications} />
      <div className={classes.appWrapper} style={background}>
        <TopContent character={props.character} game={props.game} />
        <div className={classes.activeApp}>
          <NotificationWrapper />
          {(activeAppCfg && (
            <AppContainer config={{ ...activeAppCfg, name: `phone.apps.${activeAppCfg.name}` as keyof RootState }} />
          )) ??
            `${activeApp} is not registered`}
        </div>
        <BottomBar />
      </div>
      <Form />
    </animated.div>
  );
};
