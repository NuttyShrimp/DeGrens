import React, { CSSProperties, FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';

import { LaptopIcon } from '../components/LaptopIcon';
import { useActions } from '../hooks/useActions';

const getIconPosition = (column: number, row: number): CSSProperties => {
  return {
    transform: `translate(${column * 10}vh, ${row * 10}vh)`,
  };
};

export const Background: FC = () => {
  const enabledApps = useSelector<RootState, Laptop.Config.Config[]>(state => state['laptop.config'].enabledApps);
  const { openApp } = useActions();

  const apps = useMemo(() => {
    const appCols: Laptop.Config.Config[] = [];
    enabledApps.forEach(app => {
      if (!app.iconPosition) return;
      appCols.push(app);
    });
    return appCols;
  }, [enabledApps]);

  return (
    <div className={'laptop-background'}>
      {apps.map(app => (
        <div
          className='icon'
          key={`laptop-background-icon-${app.name}`}
          onClick={() => openApp(app.name)}
          style={getIconPosition(app.iconPosition?.column ?? 0, app.iconPosition?.row ?? 0)}
        >
          <LaptopIcon {...app.icon} dim={5} />
          <Typography variant={'body2'}>{app.label}</Typography>
        </div>
      ))}
    </div>
  );
};
