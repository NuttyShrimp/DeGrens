import React, { FC, useEffect } from 'react';
import { animated, easings, useSpring } from 'react-spring';

import { useVhToPixel } from '../../../lib/hooks/useVhToPixel';
import { nuiAction } from '../../../lib/nui-comms';

export const TaskBar: FC<React.PropsWithChildren<TaskBar.Props>> = props => {
  const targetWidth = useVhToPixel(35);
  const [animProps, api] = useSpring(() => ({
    from: {
      width: 0,
    },
    to: {
      width: targetWidth,
    },
    immediate: false,
    reset: true,
    config: {
      duration: props.duration,
      easing: easings.easeInOutCubic,
    },
    onRest: () => {
      nuiAction('taskbar/finished', {
        id: props.id,
      });
    },
  }));
  useEffect(() => {
    api.start({
      from: {
        width: 0,
      },
      to: {
        width: targetWidth,
      },
      config: {
        duration: props.duration,
      },
    });
  }, [props]);
  return (
    <div className={'taskbar__wrapper'}>
      <div className={'taskbar__innerwrapper'}>
        <animated.div style={animProps} className={'taskbar__filler'}></animated.div>
        <div className={'taskbar__label'}>{props.label}</div>
      </div>
    </div>
  );
};
