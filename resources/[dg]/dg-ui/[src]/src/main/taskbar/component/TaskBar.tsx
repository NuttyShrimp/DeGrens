import React, { FC, useEffect } from 'react';
import { animated, easings, useSpring } from 'react-spring';
import useMeasure from 'react-use-measure';

import { useVhToPixel } from '../../../lib/hooks/useVhToPixel';
import { nuiAction } from '../../../lib/nui-comms';

export const TaskBar: FC<React.PropsWithChildren<TaskBar.Props>> = props => {
  const targetHeight = useVhToPixel(7);
  const [ref, { width }] = useMeasure();
  const [animProps, api] = useSpring(() => ({
    from: {
      marginTop: targetHeight,
      top: -1 * targetHeight,
      height: 0,
    },
    to: {
      marginTop: 0,
      top: 0,
      height: targetHeight,
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
        marginTop: targetHeight,
        top: -1 * targetHeight,
        height: 0,
      },
      to: {
        marginTop: 0,
        top: 0,
        height: targetHeight,
      },
      config: {
        duration: props.duration,
      },
    });
  }, [props]);
  return (
    <div className={'taskbar__wrapper'}>
      <div className={'taskbar__innerwrapper'}>
        <div className={'taskbar__icon'}>
          <div ref={ref} className={'taskbar__icon_overlay'}>
            <i className={`fas fa-${props.icon}`} />
          </div>
          <animated.div
            className={'taskbar__icon_filler'}
            style={{
              marginTop: animProps.marginTop,
              height: animProps.height,
              width,
            }}
          >
            <animated.i className={`fas fa-${props.icon}`} style={{ top: animProps.top }} />
          </animated.div>
        </div>
        <div>
          <div className={'taskbar__label'}>{props.label}</div>
        </div>
      </div>
    </div>
  );
};
