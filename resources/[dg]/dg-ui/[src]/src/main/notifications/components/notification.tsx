import React from 'react';

export const Notification: React.FC<React.PropsWithChildren<Notifications.Notification>> = props => {
  return (
    <div className={'notification__outer'}>
      <div className={`notification ${props.type}`}>
        <p>{props.message}</p>
      </div>
      <div className={`notification__filter ${props.type}Bg`} />
    </div>
  );
};
