import React, { FC } from 'react';
import { Button } from '@components/button';
import { Divider, Paper, Stack } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { closeApplication } from '@src/components/appwrapper';

import Slider from './slider';

export const Sliders: FC<{
  settings: Sliders.Settings;
  setSettings: React.Dispatch<React.SetStateAction<Sliders.Settings>>;
}> = ({ settings, setSettings }) => {
  const handleClose = () => {
    closeApplication('sliders');
  };

  return (
    <Paper
      sx={{
        background: baseStyle.primaryDarker.darker,
      }}
      className='menu-box'
    >
      <Stack spacing={1} divider={<Divider orientation='horizontal' flexItem />} sx={{ width: '100%' }}>
        <Slider
          value={settings.power}
          onChange={(v: [number, number]) =>
            setSettings(s => ({
              amount: [...s.amount],
              power: v,
            }))
          }
          minRange={10}
        />
        <Slider
          value={settings.amount}
          onChange={(v: [number, number]) =>
            setSettings(s => ({
              power: [...s.power],
              amount: v,
            }))
          }
          minRange={10}
        />
        <Button.Secondary onClick={handleClose}>sluit</Button.Secondary>
      </Stack>
    </Paper>
  );
};
