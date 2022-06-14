import React, { FC } from 'react';
import { Typography } from '@mui/material';

import { WeatherIcons } from '../../enum';

import { styles } from './topcontent.styles';

export const TopContent: FC<
  React.PropsWithChildren<{
    character: Character;
    game: Main.Game;
  }>
> = props => {
  const classes = styles();
  return (
    <div className={classes.root}>
      <div className={classes.left}>
        <div>{props.game.time}</div>
        <div>#{props.character.server_id}</div>
      </div>
      <div className={classes.right}>
        {props.character.hasVPN && (
          <Typography variant={'body2'}>
            <i className={`fas fa-shield-alt`} />
          </Typography>
        )}
        <Typography variant={'body2'}>
          <i className={`fas fa-${WeatherIcons[props.game.weather]}`} />
        </Typography>
      </div>
    </div>
  );
};
