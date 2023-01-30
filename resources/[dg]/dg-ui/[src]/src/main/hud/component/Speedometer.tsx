import React, { FC } from 'react';
import { animated, useSpring } from 'react-spring';
import { Stack } from '@mui/material';
import { Icon } from '@src/components/icon';
import { useVhToPixel } from '@src/lib/hooks/useVhToPixel';
import { useConfigmenuStore } from '@src/main/configmenu/stores/useConfigmenuStore';

import { useHudStore } from '../stores/useHudStore';

export const SpeedoMeter: FC<{}> = () => {
  const car = useHudStore(s => s.car);
  const hudSize = useConfigmenuStore(s => s.hud.size);
  const speedoSize = useVhToPixel(25 * hudSize);
  const speedoBottom = useVhToPixel(5 * hudSize);

  const fuelStyle = useSpring({
    strokeDashoffset: 135 - car.fuel * 1.35,
    config: {
      duration: 200,
    },
  });

  const gaugeStyle = useSpring({
    width: speedoSize,
    config: {
      duration: 200,
    },
  });

  const gaugebgStyle = useSpring({
    strokeDashoffset: 345 - car.speed,
    config: {
      duration: 200,
    },
  });

  const infoStyle = useSpring({
    width: speedoSize,
    bottom: speedoBottom,
    fontSize: `calc(2.2rem * ${hudSize})`,
    config: {
      duration: 200,
    },
  });

  return (
    <div className={`hud-speedometer`}>
      <animated.svg className='hud-speedometer-gauge' style={gaugeStyle} viewBox='0 0 160 140'>
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
          style={gaugebgStyle}
        />
      </animated.svg>
      <animated.div className={'hud-speedometer-info'} style={infoStyle}>
        <div className='hud-speedometer-indicator left'>
          {car.indicator.engine ? <Icon name='oil-can' color='#FFA726' size={`calc(1.4rem * ${hudSize})`} /> : <div />}
          {car.indicator.service ? (
            <Icon name='engine-warning' color='#EF5350' size={`calc(1.4rem * ${hudSize})`} />
          ) : (
            <div />
          )}
        </div>
        <Stack>
          <p>{car.speed}</p>
          <p className={'hud-speedometer-info-small'}>KMH</p>
        </Stack>
        <div className='hud-speedometer-indicator right'>
          {car.indicator.belt && <Icon name='user-slash' color='#EF5350' size={`calc(1.2rem * ${hudSize})`} />}
        </div>
      </animated.div>
    </div>
  );
};
