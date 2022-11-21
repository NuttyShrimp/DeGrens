import React from 'react';
import { useSelector } from 'react-redux';

import { Input } from '../../../components/inputs';
import { useConfigActions } from '../hooks/useConfigActions';

import { Section } from './Utils';

export const Hud = () => {
  const state = useSelector<RootState, ConfigMenu.HudConfig>(state => state.configmenu.hud);
  const { updateConfig } = useConfigActions();
  return (
    <div>
      <Section title={'Input'}>
        <Input.AutoComplete
          name={'kbdlayout'}
          value={state?.keyboard || 'qwerty'}
          onChange={e =>
            updateConfig('hud', {
              ...state,
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
              ...state,
              compass: {
                ...state.compass,
                show: e.currentTarget.checked,
              },
            })
          }
        />
        <Input.Number
          label={'FPS'}
          value={state.compass.fps}
          min={1}
          max={60}
          onChange={val =>
            updateConfig('hud', {
              ...state,
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
