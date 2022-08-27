import React from 'react';
import { animated, easings, Transition } from 'react-spring';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

export const NotificationList: AppFunction<Notifications.State> = props => {
  return (
    <div className={'notification__list'}>
      <Transition
        items={props.notifications}
        config={{
          duration: 300,
          easing: easings.easeInOutQuart,
        }}
        from={{ opacity: 0 }}
        enter={{ opacity: 1 }}
        leave={{ opacity: 0 }}
      >
        {(style, item) => (
          <animated.div style={style}>
            <div className='notification__outer'>
              <div className={`notification ${item.type}`}>
                {item.type === 'info' && <InfoIcon />}
                {item.type === 'error' && <ErrorIcon />}
                {item.type === 'success' && <CheckCircleIcon />}
                <p>{item.message}</p>
              </div>
            </div>
          </animated.div>
        )}
      </Transition>
    </div>
  );
};
