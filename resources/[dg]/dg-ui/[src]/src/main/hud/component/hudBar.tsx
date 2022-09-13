import React, { FC } from 'react';
import { FillableIcon } from '@src/components/icon';

import { HealthArmor } from './entries/HealthArmor';
import { Needs } from './entries/Needs';
import { Voice } from './entries/Voice';

export const HudBar: FC<{ voice: Hud.State['voice']; values: Record<string, number>; entries: Hud.Entry[] }> = ({
  voice,
  values,
  entries,
}) => {
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
              height={5}
              value={Math.ceil(100 / entry.steps) * values[entry.name] ?? 0}
              duration={250}
            />
          )
      )}
    </div>
  );
};
