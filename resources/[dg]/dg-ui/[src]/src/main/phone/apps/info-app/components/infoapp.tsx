import React, { FC } from 'react';
import { Typography } from '@mui/material';

import { styles } from './infoapp.styles';

export const InfoApp: FC<React.PropsWithChildren<{ entries: Phone.Info.InfoAppEntry[] }>> = ({ entries }) => {
  const classes = styles();
  return (
    <div className={classes.wrapper}>
      {entries.map(e => (
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
