import React, { FC, useCallback } from 'react';

import { useKeyEvents } from '../../hooks/useKeyEvents';

export const Slider: FC<Bennys.RGBSliders.SliderProps> = props => {
  const { useEventRegister } = useKeyEvents();
  const handleChange = useCallback(
    (modifier: number) => {
      if (!props.active) return;
      props.onChange(modifier);
    },
    [props.left, props.active]
  );
  const handleLeft = useCallback(() => handleChange(-0.01), [handleChange]);
  const handleRight = useCallback(() => handleChange(0.01), [handleChange]);

  useEventRegister('ArrowLeft', handleLeft);
  useEventRegister('ArrowRight', handleRight);

  return (
    <div className={'bennys-rgb-slider-container'}>
      <div className={'bennys-rgb-slider-interactive'}>
        <div className={'bennys-rgb-slider-current'} style={{ left: props.left * 100 + '%' }}>
          <div
            className={'bennys-rgb-slider-current-inner'}
            style={{
              backgroundColor: props.currentColor,
            }}
          />
        </div>
      </div>
      <div
        className={`bennys-rgb-slider ${props.active ? 'bennys-rgb-slider-active' : ''}`}
        style={{
          background: props.sliderColor,
        }}
      />
    </div>
  );
};
