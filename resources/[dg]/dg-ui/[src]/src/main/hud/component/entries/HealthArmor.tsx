import React, { FC } from 'react';
import { FillableIcon } from '@src/components/icon';

export const HealthArmor: FC<{
  health: number;
  armor: number;
}> = props => {
  return (
    <div className={'hud-health-armor hud-doubles'}>
      <FillableIcon
        height={5}
        value={props.health}
        name={'heart'}
        duration={250}
        color={props.health <= 30 ? '#CB4E4E' : '#4ECB71'}
      />
      <FillableIcon
        height={5}
        value={props.armor}
        name={'shield'}
        duration={250}
        color={props.armor <= 15 ? '#CB4E4E' : '#699BF7'}
      />
    </div>
  );
};
