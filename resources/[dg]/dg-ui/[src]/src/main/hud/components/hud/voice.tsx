import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';

import { useVhToPixel } from '../../../../lib/hooks/useVhToPixel';
import { voiceActiveColors } from '../../enum';
import { styles, stylesBaseProps } from '../hud.styles';

export const HudVoice: FC<{ baseSize: number; indentAm: number }> = props => {
  const classes = styles(stylesBaseProps);
  const offset = useVhToPixel(1.5);
  const voiceState = useSelector<RootState, Hud.Voice>(state => state.hud.voice);

  const [thickness, setThickness] = React.useState(1.5);
  const [isGrowing, setIsGrowing] = React.useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGrowing(isGrowing ? thickness < 2.5 : thickness < 1.5);
      setThickness(thickness + (isGrowing ? 1 : -1) * 0.1);
    }, 50);
    return () => clearInterval(interval);
  });

  if (voiceState.normal || voiceState.onRadio) {
    return (
      <div className={classes.hudVoice}>
        <CircularProgress
          disableShrink
          sx={{
            color: voiceState.onRadio ? voiceActiveColors.onRadio : voiceActiveColors.normal,
          }}
          variant={'determinate'}
          value={100}
          size={props.baseSize + offset * 1.55 * props.indentAm + offset * 0.75 * thickness}
          thickness={thickness}
          color={'inherit'}
        />
      </div>
    );
  }
  return null;
};
