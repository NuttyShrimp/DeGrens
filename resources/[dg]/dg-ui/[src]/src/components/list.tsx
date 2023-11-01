import { FC } from 'react';
import * as React from 'react';

import { styles } from '../styles/components/list.styles';

import { Icon } from './icon';

export const List: FC<React.PropsWithChildren<{ items: ListItem[]; textSize?: number | string }>> = props => {
  const classes = styles();
  return (
    <div className={classes.list}>
      {props.items.map(e => (
        <div
          key={e.label + (e?.icon ?? '')}
          className={classes.entry}
          onClick={
            e.onClick
              ? () => {
                  e.onClick!(e.data);
                }
              : undefined
          }
        >
          {e.icon && (
            <div className={'icon'}>
              <Icon name={e.icon} size={e.size ?? '1rem'} />
            </div>
          )}
          <div className={'text'} style={{ fontSize: props?.textSize }}>
            {e.label}
          </div>
        </div>
      ))}
    </div>
  );
};
