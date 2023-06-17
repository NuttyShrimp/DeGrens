import { FC } from 'react';
import { Slider, Typography } from '@mui/material';

import { useConfigmenuStore } from '../stores/useConfigmenuStore';

import { Section } from './Utils';

const VolumeSlider: FC<{ title: string; type: keyof ConfigMenu.SoundsConfig }> = ({ title, type }) => {
  const [state, updateConfig] = useConfigmenuStore(s => [s.sounds, s.updateConfig]);

  const updateVolumeConfig = (volume: number | number[]) => {
    if (typeof volume !== 'number') return;
    updateConfig('sounds', { [type]: volume });
  };

  return (
    <>
      <Typography id='input-slider' gutterBottom>
        {title}
      </Typography>
      <Slider
        size='small'
        min={0}
        max={100}
        step={10}
        value={state[type]}
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

export const Sounds = () => {
  return (
    <div>
      <Section title={'Volume'}>
        <VolumeSlider title='Interaction Sounds' type='interactionSoundVolume' />
      </Section>
    </div>
  );
};
