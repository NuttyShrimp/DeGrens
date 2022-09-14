import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Stack, Typography } from '@mui/material';

import { LaptopIcon } from '../components/LaptopIcon';
import { useActions } from '../hooks/useActions';

export const Background: FC = () => {
  const enabledApps = useSelector<RootState, Laptop.Config.Config[]>(state => state['laptop.config'].enabledApps);
  const { openApp } = useActions();

  const apps = useMemo(() => {
    const appCols: Laptop.Config.Config[][] = [];
    enabledApps.forEach(app => {
      if (!appCols[app.column]) {
        appCols[app.column] = [];
      }
      appCols[app.column].push(app);
      appCols[app.column].sort((a1, a2) => a1.row - a2.row);
    });
    return appCols;
  }, [enabledApps]);

  return (
    <div className={'laptop-background'}>
      {apps.map((appCol, i) => (
        <div key={i} className={'laptop-background-app-col'}>
          {appCol.map(app => (
            <Stack
              key={app.name}
              direction='column'
              justifyContent='center'
              alignItems='center'
              spacing={1}
              onClick={() => openApp(app.name)}
            >
              <LaptopIcon {...app.icon} dim={5} />
              <Typography variant={'body2'}>{app.label}</Typography>
            </Stack>
          ))}
        </div>
      ))}
    </div>
  );
};
