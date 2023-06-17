import { FC, useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { animated, useTransition } from 'react-spring';
import useMeasure from 'react-use-measure';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { grey } from '@mui/material/colors';

import { modulo } from '../../../lib/util';
import { useKeyEvents } from '../hooks/useKeyEvents';

import '../styles/idSelector.scss';

const iconProps = {
  sx: {
    color: grey[400],
    fontSize: '3rem',
  },
};

export const IdSelector: FC<Bennys.IdSelector.Props> = props => {
  const [id, setId] = useState(props.value ?? 1);
  // 1 = to left, -1 = to right
  const [slideMotion, setSlideMotion] = useState(1);
  const { useEventRegister } = useKeyEvents();
  const [measureRef, { width: textWidth }] = useMeasure();

  const textTransition = useTransition(id, {
    from: {
      transform: `translateX(${(textWidth / 2) * slideMotion}px)`,
      opacity: 0,
    },
    enter: {
      transform: 'translateX(0%)',
      opacity: 1,
    },
    leave: {
      transform: `translateX(${(textWidth / 2) * -1 * slideMotion}px)`,
      opacity: 0,
    },
  });

  useEffect(() => {
    if (props.onChange) {
      props.onChange(id);
    }
  }, [id]);

  useEffect(() => {
    if (props.value !== id) {
      setId(props.value ?? 1);
    }
  }, [props.value]);

  const slideLeft = useCallback(() => {
    flushSync(() => {
      setSlideMotion(1);
    });
    setId(id => modulo(id - 2, props.max) + 1);
  }, [props.max]);

  const slideRight = useCallback(() => {
    flushSync(() => {
      setSlideMotion(-1);
    });
    setId(id => modulo(id, props.max) + 1);
  }, [props.max]);

  const select = useCallback(() => {
    props.onSelect(id);
  }, [props.onSelect, id]);

  useEventRegister('ArrowLeft', slideLeft);
  useEventRegister('ArrowRight', slideRight);
  useEventRegister('Enter', select);

  return (
    <div className='bennys-id-selector-container'>
      {textTransition((textStyles, item) => (
        <animated.div className='bennys-id-selector'>
          <animated.div
            className={'bennys-id-selector-arrow'}
            style={{ transform: textStyles.transform, opacity: textStyles.opacity }}
          >
            <ChevronLeftIcon
              sx={{
                ...iconProps.sx,
                marginLeft: '.75vh',
              }}
            />
          </animated.div>
          <animated.div className='bennys-id-selector-text current' style={textStyles} ref={measureRef}>
            {item}
          </animated.div>
          <div className='bennys-id-selector-text middle'>/</div>
          <div className='bennys-id-selector-text'>{props.max}</div>
          <animated.div
            className={'bennys-id-selector-arrow'}
            style={{ transform: textStyles.transform, opacity: textStyles.opacity }}
          >
            <ChevronRightIcon
              sx={{
                ...iconProps.sx,
                marginRight: '.75vh',
              }}
            />
          </animated.div>
        </animated.div>
      ))}
    </div>
  );
};
