import React, { FC } from 'react';

import { styles } from '../styles/components/list.styles';

import { Icon } from './icon';

export const List: FC<{ items: ListItem[] }> = props => {
  const classes = styles();
  return (
    <div className={classes.list}>
      {props.items.map(e => (
        <div key={e.label + e.icon} className={classes.entry}>
          {e.icon && (
            <div className={'icon'}>
              <Icon name={e.icon} size={e.size ?? '1rem'} />
            </div>
          )}
          <div className={'text'}>{e.label}</div>
        </div>
      ))}
    </div>
  );
};
