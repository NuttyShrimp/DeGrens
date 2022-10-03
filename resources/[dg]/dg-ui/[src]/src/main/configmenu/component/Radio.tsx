import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Slider, Typography } from '@mui/material';

import { Input } from '../../../components/inputs';
import { useConfigActions } from '../hooks/useConfigActions';

import { Section } from './Utils';

const VolumeSlider: FC<{ volType: 'volume' | 'balance'; device: 'radio' | 'phone' }> = ({ volType, device }) => {
  const state = useSelector<RootState, ConfigMenu.RadioConfig>(state => state.configmenu.radio);
  const { updateConfig } = useConfigActions();

  const updateVolumeConfig = (volume: number | number[]) => {
    if (typeof volume !== 'number') return;
    updateConfig('radio', {
      ...state,
      [volType]: {
        ...state[volType],
        [device]: volume,
      },
    });
  };
  return (
    <>
      <Typography id='input-slider' gutterBottom>
        {device} {volType}
      </Typography>
      <Slider
        size='small'
        min={10}
        max={100}
        step={10}
        value={state[volType][device]}
        onChange={(_, value) => {
          updateVolumeConfig(value);
        }}
        aria-label='Small'
        valueLabelDisplay='auto'
        color={'secondary'}
      />
    </>
  );
};

export const Radio = () => {
  const state = useSelector<RootState, ConfigMenu.RadioConfig>(state => state.configmenu.radio);
  const { updateConfig } = useConfigActions();

  const updateClickConfig = (who: 'me' | 'someElse', way: 'incoming' | 'outgoing', toggle: boolean) => {
    updateConfig('radio', {
      ...state,
      clicks: {
        ...state.clicks,
        [who]: {
          ...state.clicks[who],
          [way]: toggle,
        },
      },
    });
  };

  return (
    <div>
      <Section title={'Radio click'}>
        <Input.Checkbox
          label={'Enabled'}
          checked={state.clicks.enabled}
          name={'radioClicksEnabled'}
          onChange={e =>
            updateConfig('radio', {
              ...state,
              clicks: {
                ...state.clicks,
                enabled: e.currentTarget.checked,
              },
            })
          }
        />
        <Input.Checkbox
          label={'Play a click when you start broadcasting'}
          checked={state.clicks.me.incoming}
          name={'radioMeIncClick'}
          onChange={e => updateClickConfig('me', 'incoming', e.currentTarget.checked)}
          disabled={!state.clicks.enabled}
        />
        <Input.Checkbox
          label={'Play a click when you stop broadcasting'}
          checked={state.clicks.me.outgoing}
          name={'radioMeIncClick'}
          onChange={e => updateClickConfig('me', 'outgoing', e.currentTarget.checked)}
          disabled={!state.clicks.enabled}
        />
        <Input.Checkbox
          label={'Play a click when some else start broadcasting'}
          checked={state.clicks.someElse.incoming}
          name={'radioMeIncClick'}
          onChange={e => updateClickConfig('someElse', 'incoming', e.currentTarget.checked)}
          disabled={!state.clicks.enabled}
        />
        <Input.Checkbox
          label={'Play a click when some else stop broadcasting'}
          checked={state.clicks.someElse.outgoing}
          name={'radioMeIncClick'}
          onChange={e => updateClickConfig('someElse', 'outgoing', e.currentTarget.checked)}
          disabled={!state.clicks.enabled}
        />
      </Section>
      <Section title={'Volume'}>
        <VolumeSlider volType={'volume'} device={'radio'} />
        <VolumeSlider volType={'volume'} device={'phone'} />
        {/* TODO: implement with voice script (after moved away from PMA)*/}
        {/*<VolumeSlider volType={'balance'} device={'radio'} />*/}
        {/*<VolumeSlider volType={'balance'} device={'phone'} />*/}
      </Section>
    </div>
  );
};
