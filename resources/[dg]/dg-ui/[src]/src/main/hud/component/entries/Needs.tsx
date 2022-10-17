import React, { FC } from 'react';
import { FillableIcon } from '@src/components/icon';

export const Needs: FC<{
  hunger: number;
  thirst: number;
}> = props => (
  <div className={'hud-doubles hud-needs'}>
    <FillableIcon
      height={4.5}
      value={props.thirst}
      name={'glass'}
      duration={250}
      color={props.thirst <= 15 ? '#CB4E4E' : '#3769E9'}
    />
    <FillableIcon
      height={3.5}
      value={props.hunger}
      name={'burger'}
      duration={250}
      color={props.hunger <= 15 ? '#CB4E4E' : '#FF8038'}
    />
  </div>
);
