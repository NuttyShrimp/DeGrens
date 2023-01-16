import React, { FC } from 'react';
import { animated, useSpring } from 'react-spring';
import { Stack } from '@mui/material';
import { Icon } from '@src/components/icon';

import { useHudStore } from '../stores/useHudStore';

export const SpeedoMeter: FC<{}> = () => {
  const car = useHudStore(s => s.car);

  const fuelStyle = useSpring({
    strokeDashoffset: 135 - car.fuel * 1.35,
    config: {
      duration: 200,
    },
  });

  const gaugeStyle = useSpring({
    strokeDashoffset: 345 - car.speed,
    config: {
      duration: 200,
    },
  });

  return (
    <div className={`hud-speedometer`}>
      <svg className='hud-speedometer-gauge' viewBox='0 0 160 140'>
        <path className='hud-speedometer-gauge-fuel-bg' fill='transparent' d='M 20 132 C -14 90 4 37 39 16' />
        <animated.path
          className='hud-speedometer-gauge-fuel'
          fill='transparent'
          d='M 20 132 C -14 90 4 37 39 16'
          style={fuelStyle}
        />
        <path className='hud-speedometer-gauge-bg' fill='transparent' d='M 30 132 A 70 70 0 1 1 130 132' />
        <animated.path
          className='hud-speedometer-gauge-fill'
          fill='transparent'
          d='M 30 132 A 70 70 0 1 1 130 132'
          style={gaugeStyle}
        />
      </svg>
      <div className={'hud-speedometer-info'}>
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
