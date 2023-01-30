import React from 'react';
import { FillableIcon } from '@src/components/icon';
import { useConfigmenuStore } from '@src/main/configmenu/stores/useConfigmenuStore';

import { useHudStore } from '../stores/useHudStore';

import { HealthArmor } from './entries/HealthArmor';
import { Needs } from './entries/Needs';
import { Voice } from './entries/Voice';

export const HudBar = () => {
  const [voice, values, entries] = useHudStore(s => [s.voice, s.values, s.entries]);
  const hudSize = useConfigmenuStore(s => s.hud.size);
  return (
    <div className='hud-entries'>
      <Voice {...voice} />
      <HealthArmor health={values.health} armor={values.armor} />
      <Needs thirst={values.thirst} hunger={values.hunger} />
      {entries.map(
        entry =>
          entry.enabled && (
            <FillableIcon
              key={entry.name}
              name={entry.ui.name}
              color={entry.ui.color}
              height={4.5 * hudSize}
              value={Math.ceil(100 / (entry?.steps ?? 100)) * (values[entry.name] ?? 0)}
              duration={250}
            />
          )
      )}
    </div>
  );
};
