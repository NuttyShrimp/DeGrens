import { Slider, Typography } from '@mui/material';

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
      <Section title='Icons'>
        <div>
          <Typography id='input-slider' gutterBottom>
            Hud size
          </Typography>
          <Slider
            size='small'
            min={50}
            max={120}
            step={5}
            value={Math.round(state.size * 100)}
            onChange={(_, value) => {
              if (Array.isArray(value)) return;
              updateConfig('hud', {
                size: Number((value / 100).toFixed(2)),
              });
            }}
            aria-label='Small'
            valueLabelDisplay='auto'
            color={'secondary'}
            getAriaValueText={v => `${v}%`}
            valueLabelFormat={v => `${v}%`}
          />
        </div>
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
      <Section title={'Crosshair'}>
        <Input.Checkbox
          onChange={e => {
            updateConfig('hud', { crosshair: e.currentTarget.checked });
          }}
          checked={state.crosshair}
          label={'Enable crosshair'}
          name={'toggleCrosshair'}
        />
      </Section>
    </div>
  );
};
