import React from 'react';
import { animated, easings, Transition } from 'react-spring';
import { useVhToPixel } from '@lib/hooks/useVhToPixel';

import { Notification } from './notification';

export const NotificationList: React.FC<React.PropsWithChildren<Notifications.Props>> = props => {
  const hiddenMargin = useVhToPixel(-37);
  const showMargin = useVhToPixel(1);
  return (
    <div className={'notification__list'}>
      <Transition
        items={props.notifications}
        config={{
          duration: 500,
          easing: easings.easeInOutQuart,
        }}
        from={{ marginRight: hiddenMargin }}
        enter={{ marginRight: showMargin }}
        leave={{ marginRight: hiddenMargin }}
      >
        {(style, item) => (
          <animated.div style={style}>
            <Notification {...item} />
          </animated.div>
        )}
      </Transition>
    </div>
  );
};
