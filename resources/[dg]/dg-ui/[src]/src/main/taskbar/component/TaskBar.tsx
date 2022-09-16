import React, { FC } from 'react';
import { FillableIcon } from '@src/components/icon';

export const TaskBar: FC<TaskBar.State> = props => {
  return (
    <div className={'taskbar__wrapper'}>
      <div className={'taskbar__innerwrapper'}>
        <div className='taskbar__icon'>
          <FillableIcon height={7} name={props.icon} duration={props.duration} value={100} />
        </div>
        <div>
          <div className={'taskbar__label'}>{props.label}</div>
        </div>
      </div>
    </div>
  );
};
