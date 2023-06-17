import { animated, easings, Transition } from 'react-spring';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

import { useNotificationStore } from '../stores/useNotificationStore';

export const NotificationList = () => {
  const notifications = useNotificationStore(s => s.notifications);
  return (
    <div className={'notification__list'}>
      <Transition
        items={notifications}
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
