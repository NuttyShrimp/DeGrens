import React, { FC } from 'react';
import { FillableIcon } from '@src/components/icon';
import { useConfigmenuStore } from '@src/main/configmenu/stores/useConfigmenuStore';

export const Needs: FC<{
  hunger: number;
  thirst: number;
}> = props => {
  const hudSize = useConfigmenuStore(s => s.hud.size);
  return (
    <div className={'hud-doubles hud-needs'}>
      <FillableIcon
        height={4.5 * hudSize}
        value={props.thirst}
        name={'glass'}
        duration={250}
        color={props.thirst <= 15 ? '#CB4E4E' : '#3769E9'}
      />
      <FillableIcon
        height={3.5 * hudSize}
        value={props.hunger}
        name={'burger'}
        duration={250}
        color={props.hunger <= 15 ? '#CB4E4E' : '#FF8038'}
      />
    </div>
  );
};
