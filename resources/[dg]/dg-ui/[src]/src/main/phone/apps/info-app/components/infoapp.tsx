import React, { FC } from 'react';
import { Typography } from '@mui/material';

import { styles } from './infoapp.styles';

export const InfoApp: FC<{ entries: Phone.Info.InfoAppEntry[] }> = props => {
  const classes = styles();
  return (
    <div className={classes.wrapper}>
      {props.entries.map(e => (
        <div key={e.name} className={classes.entry}>
          <div className={'info-icon'}>
            <i className={`fas fa-${e.icon ?? 'info'}`} style={{ color: e.color ?? 'white' }} />
          </div>
          <Typography variant={'body2'}>
            {e.prefix ?? ''}
            {e.value}
          </Typography>
        </div>
      ))}
    </div>
  );
};
