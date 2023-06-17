import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { animated, config, useTransition } from 'react-spring';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { modulo } from '@src/lib/util';

import { useKeyEvents } from '../hooks/useKeyEvents';

import '../styles/categorySlider.scss';

export const CategorySlider: FC<PropsWithChildren<Bennys.CategorySlider.Props>> = props => {
  const [value, setValue] = useState<number>(0);
  const { useEventRegister } = useKeyEvents();

  const transition = useTransition(value, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.default,
  });

  const shiftCategory = useCallback(
    (modifier: number) => {
      const newIdx = modulo(value + modifier, props.options.length);
      setValue(newIdx);
      if (props.onChange) {
        props.onChange(newIdx);
      }
    },
    [value, props.onChange]
  );

  const shiftRight = useCallback(() => {
    shiftCategory(1);
  }, [shiftCategory]);

  const shiftLeft = useCallback(() => {
    shiftCategory(-1);
  }, [shiftCategory]);

  useEventRegister('q', shiftLeft);
  useEventRegister('e', shiftRight);

  useEffect(() => {
    if (value === props.value) return;
    setValue(props.value);
  }, [props.value]);

  return (
    <div className='bennys-category-wrapper'>
      <div className='bennys-category-header'>
        <Box className='bennys-category-header-title'>
          {transition((styles, item) => (
            <animated.div style={styles}>
              <Typography variant='subtitle1' fontWeight={600}>
                {props.options[item]?.toUpperCase()}
              </Typography>
            </animated.div>
          ))}
        </Box>
        <div className={'bennys-category-blocks'}>
          {props.options.map((_, idx) => (
            <div key={idx} className={`bennys-category-block ${idx === value ? 'selected' : ''}`} />
          ))}
        </div>
      </div>
      {props.children}
    </div>
  );
};
