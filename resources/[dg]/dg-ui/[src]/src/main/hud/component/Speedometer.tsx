import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import useMeasure from 'react-use-measure';
import { Stack } from '@mui/material';
import { Icon } from '@src/components/icon';

import { useVhToPixel } from '../../../lib/hooks/useVhToPixel';

export const SpeedoMeter: FC<{ car: Hud.Car }> = ({ car }) => {
  const [ref, { width }] = useMeasure();
  const phoneOffset = useVhToPixel(30);
  const normalOffset = useVhToPixel(1);
  const phoneOpen = useSelector<RootState, boolean>(state => state.phone.animating !== 'closed');

  return (
    <div
      className={'hud-speedometer'}
      style={{
        right: phoneOpen ? phoneOffset : normalOffset,
      }}
    >
      <svg ref={ref} className='hud-speedometer-gauge' viewBox='0 0 160 140'>
        <path className='hud-speedometer-gauge-fuel-bg' fill='transparent' d='M 20 132 C -14 90 4 37 39 16' />
        <path
          className='hud-speedometer-gauge-fuel'
          fill='transparent'
          d='M 20 132 C -14 90 4 37 39 16'
          style={{
            strokeDashoffset: 135 - car.fuel * 1.35,
          }}
        />
        <path className='hud-speedometer-gauge-bg' fill='transparent' d='M 30 132 A 70 70 0 1 1 130 132' />
        <path
          className='hud-speedometer-gauge-fill'
          fill='transparent'
          d='M 30 132 A 70 70 0 1 1 130 132'
          style={{
            strokeDashoffset: 345 - car.speed,
          }}
        />
      </svg>
      <div className={'hud-speedometer-info'} style={{ width }}>
        <div className='hud-speedometer-indicator left'>
          {car.indicator.engine ? <Icon name='oil-can' color='#FFA726' size='1.4rem' /> : <div />}
          {car.indicator.service ? <Icon name='engine-warning' color='#EF5350' size='1.4rem' /> : <div />}
        </div>
        <Stack>
          <p>{car.speed}</p>
          <p className={'hud-speedometer-info-small'}>KMH</p>
        </Stack>
        <div className='hud-speedometer-indicator right'>
          {car.indicator.belt && <Icon name='user-slash' color='#EF5350' size='1.2rem' />}
        </div>
      </div>
    </div>
  );
};
