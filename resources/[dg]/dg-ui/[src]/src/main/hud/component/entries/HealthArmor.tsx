import React, { FC } from 'react';
import { FillableIcon } from '@src/components/icon';
import { useConfigmenuStore } from '@src/main/configmenu/stores/useConfigmenuStore';

export const HealthArmor: FC<{
  health: number;
  armor: number;
}> = props => {
  const hudSize = useConfigmenuStore(s => s.hud.size);
  return (
    <div className={'hud-doubles hud-health-armor'}>
      <FillableIcon
        height={4.5 * hudSize}
        value={props.health}
        name={'heart'}
        duration={250}
        color={props.health <= 30 ? '#CB4E4E' : '#4ECB71'}
      />
      <FillableIcon
        height={4.5 * hudSize}
        value={props.armor}
        name={'shield'}
        duration={250}
        color={props.armor <= 15 ? '#CB4E4E' : '#699BF7'}
      />
    </div>
  );
};
