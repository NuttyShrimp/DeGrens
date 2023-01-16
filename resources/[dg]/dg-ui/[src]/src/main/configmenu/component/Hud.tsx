import React from 'react';

import { Input } from '../../../components/inputs';
import { useConfigmenuStore } from '../stores/useConfigmenuStore';

import { Section } from './Utils';

export const Hud = () => {
  const [state, updateConfig] = useConfigmenuStore(s => [s.hud, s.updateConfig]);
  return (
    <div>
      <Section title={'Input'}>
        <Input.AutoComplete
          name={'kbdlayout'}
          value={state?.keyboard || 'qwerty'}
          onChange={e =>
            updateConfig('hud', {
              keyboard: (e || 'qwerty') as 'azerty' | 'qwerty',
            })
          }
          label={'Keyboard Layout'}
          options={[
            { label: 'Qwerty', value: 'qwerty' },
            { label: 'Azerty', value: 'azerty' },
          ]}
        />
      </Section>
      <Section title={'Compass'}>
        <Input.Checkbox
          label={'Toon in voertuig'}
          checked={state.compass.show}
          name={'showCompass'}
          onChange={e =>
            updateConfig('hud', {
              compass: {
                ...state.compass,
                show: e.currentTarget.checked,
              },
            })
          }
        />
        <Input.Number
          label={'FPS (disclaimer: bij waarde >30 kan je UI lag verwachten)'}
          value={state.compass.fps}
          min={1}
          max={60}
          onChange={val =>
            updateConfig('hud', {
              compass: {
                ...state.compass,
                fps: Number(val),
              },
            })
          }
        />
      </Section>
    </div>
  );
};
