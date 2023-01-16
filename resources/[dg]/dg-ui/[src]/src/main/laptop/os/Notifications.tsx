import React, { FC } from 'react';
import { animated, Transition } from 'react-spring';

import { LaptopIcon } from '../components/LaptopIcon';
import { useLaptopConfigStore } from '../stores/useLaptopConfigStore';
import { useLaptopStore } from '../stores/useLaptopStore';

const NotificationEntry: FC<{ notification: Laptop.Notification }> = ({ notification }) => {
  const appInfo = useLaptopConfigStore(s => s.config.find(a => a.name === notification.app));
  return (
    <div className={'laptop-notifications-entry'}>
      <div className={'center'}>
        <LaptopIcon {...appInfo.icon} dim={4} />
      </div>
      <div>
        <p>{appInfo.label}</p>
        <p>{notification.message}</p>
      </div>
    </div>
  );
};

export const Notifications = () => {
  const notifications = useLaptopStore(s => s.notifications);
  return (
    <div className={'laptop-notifications'}>
      <Transition items={notifications} from={{ opacity: 0 }} enter={{ opacity: 1 }} leave={{ opacity: 0 }}>
        {(styles, item) => (
          <animated.div style={styles}>
            <NotificationEntry notification={item} />
          </animated.div>
        )}
      </Transition>
    </div>
  );
};
