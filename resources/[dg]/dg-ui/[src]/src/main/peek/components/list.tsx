import React, { FC } from 'react';

import { Icon } from '../../../components/icon';
import { nuiAction } from '../../../lib/nui-comms';

export const List: FC<{ entries: Peek.Entry[]; show: boolean }> = ({ entries, show }) => {
  const handleClick = (id: string) => {
    nuiAction('peek:select', { id });
  };
  if (!show) return null;
  return (
    <div className={'peek-list'}>
      {(entries ?? []).map(entry => (
        <div className={'peek-list-entry'} key={entry.id} onClick={() => handleClick(entry.id)}>
          <Icon name={entry.icon} size={'1.4vh'} />
          <div className={'peek-list-entry-title'}>{entry.label}</div>
        </div>
      ))}
    </div>
  );
};
