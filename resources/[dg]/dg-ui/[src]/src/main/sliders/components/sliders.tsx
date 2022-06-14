import React, { FC, useState } from 'react';
import { Button } from '@components/button';
import { Divider, Paper, Stack } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { nuiAction } from '@src/lib/nui-comms';

import Slider from './slider';

export const Sliders: FC<React.PropsWithChildren<Sliders.State>> = props => {
  const [power, setPower] = useState<number[]>(props.power);
  const [amount, setAmount] = useState<number[]>(props.amount);

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
        <Slider value={power} onChange={setPower} minRange={10} />
        <Slider value={amount} onChange={setAmount} minRange={10} />
        <Button.Secondary onClick={handleClose}>sluit</Button.Secondary>
      </Stack>
    </Paper>
  );
};
