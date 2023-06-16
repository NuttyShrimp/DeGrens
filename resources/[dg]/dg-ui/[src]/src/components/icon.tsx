import { FC, MouseEventHandler, useEffect, useState } from 'react';
import * as React from 'react';
import { animated, easings, useSpring } from 'react-spring';
import useMeasure from 'react-use-measure';
import MUIIcon from '@mui/material/Icon';
import { SxProps } from '@mui/system';
import { useVhToPixel } from '@src/lib/hooks/useVhToPixel';

import '@styles/components/icons.scss';

declare interface IconProps {
  name: string;
  lib?: string;
  size?: string;
  color?: string;
  style?: SxProps;
  onClick?: MouseEventHandler<HTMLElement>;
}

export const Icon: FC<React.PropsWithChildren<IconProps>> = props => {
  if (props.lib == 'img') {
    return (
      <div style={{ width: props.size }}>
        <img
          src={props.name}
          alt={'Icon img'}
          style={{ width: '100%', cursor: props.onClick ? 'poiner' : 'auto' }}
          onClick={props.onClick}
        />
      </div>
    );
  }

  if (props.lib == 'svg') {
    return (
      <MUIIcon
        sx={{
          textAlign: 'center',
          height: props.size,
          cursor: props.onClick ? 'poiner' : 'auto',
        }}
        onClick={props.onClick}
      >
        <img
          src={props.name}
          alt={'svgIcon'}
          style={{
            height: '100%',
          }}
        />
      </MUIIcon>
    );
  }

  if (props.lib == 'mdi' || props.name.startsWith('mdi-')) {
    return (
      <MUIIcon
        baseClassName={'mdi'}
        className={props.name.startsWith('mdi-') ? props.name : `mdi-${props.name}`}
        sx={{
          ...(props?.style ?? {}),
          color: props.color ?? 'inherit',
          fontSize: props.size ?? '1.5rem',
          cursor: props.onClick ? 'poiner' : 'auto',
        }}
        onClick={props.onClick}
      />
    );
  }

  if ((props.lib && ['mi', 'material-icons'].includes(props.lib)) || props.name.startsWith('mi-')) {
    return (
      <MUIIcon
        sx={{
          ...(props?.style ?? {}),
          color: props.color ?? 'inherit',
          fontSize: props.size ?? '1.5rem',
          cursor: props.onClick ? 'poiner' : 'auto',
        }}
        onClick={props.onClick}
      >
        {props.name.startsWith('mi-') ? props.name.replace(/^mi-/, '') : props.name}
      </MUIIcon>
    );
  }

  return (
    <MUIIcon
      baseClassName={props?.lib ?? 'fas'}
      className={`fa-${props.name}`}
      sx={{
        ...(props?.style ?? {}),
        color: props.color ?? 'inherit',
        fontSize: props.size ?? '1.5rem',
        cursor: props.onClick ? 'poiner' : 'auto',
        '--fa-display': 'inline-flex',
      }}
      onClick={props.onClick}
    />
  );
};

declare interface FillableIconProps {
  name: string;
  // Percentage the icon is filled
  value: number;
  height: number;
  // Default to primary Light
  color?: string;
  // Time it takes to change from old to new value
  duration?: number;
  onFinish?: () => void;
}

export const FillableIcon: FC<FillableIconProps> = props => {
  const [prevVal, setPrevVal] = useState(0);
  const targetHeight = useVhToPixel(props.height * ((100 - (props.value ?? 0)) / 100));
  const previousHeight = useVhToPixel(props.height * ((100 - (prevVal ?? 0)) / 100));
  const margin = useVhToPixel(0.7);
  const [ref, { width, height }] = useMeasure();
  // TODO, move to transition to make it usable to go from old values
  const [animProps, api] = useSpring(() => ({
    from: {
      top: previousHeight,
    },
    to: {
      top: targetHeight,
    },
    immediate: false,
    config: {
      duration: props.duration,
      easing: easings.easeInOutCubic,
    },
    onRest: () => {
      props?.onFinish?.();
    },
  }));
  useEffect(() => {
    api.start({
      from: {
        top: previousHeight,
      },
      to: {
        top: targetHeight,
      },
      reset: false,
      config: {
        duration: props.duration,
      },
    });
  }, [targetHeight]);

  useEffect(() => {
    setPrevVal(props.value);
  }, [props.value]);

  return (
    <div
      className={'fillable-icon__wrapper'}
      style={{
        height: height + margin,
        width: width + margin,
      }}
    >
      <div className={'fillable-icon__icon'}>
        <div className={'fillable-icon__icon_border'}>
          <i
            className={`fas fa-${props.name}`}
            ref={ref}
            style={{
              fontSize: `${props.height}vh`,
            }}
          />
        </div>
        <div className={'fillable-icon__icon_overlay'}>
          <i
            className={`fas fa-${props.name}`}
            ref={ref}
            style={{
              fontSize: `${props.height}vh`,
            }}
          />
        </div>
        <animated.div
          className={'fillable-icon__icon_filler'}
          style={{
            width,
            color: props.color,
            top: animProps.top,
          }}
        >
          <animated.i
            className={`fas fa-${props.name}`}
            style={{ top: animProps.top.to(x => x * -1), fontSize: `${props.height}vh` }}
          />
        </animated.div>
      </div>
    </div>
  );
};
