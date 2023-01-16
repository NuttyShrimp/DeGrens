import React, { FC } from 'react';
import { Button } from '@components/button';
import { Divider, Paper, Stack } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { nuiAction } from '@src/lib/nui-comms';

import { useSlidersStore } from '../stores/useSlidersStore';

import Slider from './slider';

export const Sliders: FC<{}> = () => {
  const [power, amount, updateStore] = useSlidersStore(s => [s.power, s.amount, s.updateStore]);

  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    nuiAction('sliders:close', {
      power: power,
      amount: amount,
    });
  };

  return (
    <Paper
      sx={{
        background: baseStyle.primaryDarker.darker,
      }}
      className='menu-box'
    >
      <Stack spacing={1} divider={<Divider orientation='horizontal' flexItem />} sx={{ width: '100%' }}>
        <Slider value={power} onChange={v => updateStore({ power: v })} minRange={10} />
        <Slider value={amount} onChange={v => updateStore({ amount: v })} minRange={10} />
        <Button.Secondary onClick={handleClose}>sluit</Button.Secondary>
      </Stack>
    </Paper>
  );
};
