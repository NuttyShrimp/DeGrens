import React, { FC, useEffect, useState } from 'react';
import CircularProgress, { circularProgressClasses, CircularProgressProps } from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

import { CircleCy, CircleMargin, CircleViewbox } from '../../enum';
import { styles, stylesBaseProps } from '../hud.styles';

const generateInnerCircle = (circleType: Hud.HudCircleType) =>
  styled(CircularProgress)({
    [`& .${circularProgressClasses.svg}`]: {
      marginTop: CircleMargin[circleType] ?? CircleMargin[circleType.replace(/-(top|bottom)/, '')],
    },
  });

export const HudCircle: FC<
  CircularProgressProps & {
    type: Hud.HudCircleType;
    size: number;
    indent?: number;
  }
> = props => {
  const classes = styles(stylesBaseProps);
  const [style, setStyle] = useState({});
  const InnerCircle = generateInnerCircle(props.type);

  useEffect(() => {
    if (props.type.includes('top')) {
      setStyle({
        width: `${props.size / 2}px`,
        marginBottom: `${props.size / 2}px`,
      });
    }
    if (props.type.includes('bottom')) {
      setStyle({
        width: `${props.size / 2}px`,
        marginTop: `${props.size / 2}px`,
      });
    }
  }, []);

  return (
    <div
      className={classes.hudInnerCircle}
      style={{
        marginBottom: props.indent !== undefined ? `${props.indent * 0.1}rem` : 0,
      }}
    >
      <InnerCircle
        {...props}
        variant={'determinate'}
        sx={{
          ...props.sx,
          ...(props.type.includes('right') ? { paddingTop: `${props.size / 2}px` } : {}),
        }}
        color='inherit'
        thickness={1.5}
        style={style}
        value={props.value ?? 100}
        viewBox={
          (props.indent !== undefined
            ? CircleViewbox[`${props.indent}-${props.type}`] ?? CircleViewbox[props.type]
            : CircleViewbox[props.type]) ?? CircleViewbox[props.type.replace(/-(top|bottom)/, '')]
        }
        cy={
          (props.indent !== undefined
            ? CircleCy[`${props.indent}-${props.type}`] ?? CircleCy[props.type]
            : CircleCy[props.type]) ?? CircleCy[props.type.replace(/-(top|bottom)/, '')]
        }
      />
    </div>
  );
};
