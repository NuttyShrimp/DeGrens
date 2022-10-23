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

  const backgroundIcons = useMemo(() => {
    const icons: Laptop.BackgroundIcon[] = [];

    const groupedApps = Object.entries(
      enabledApps.reduce<Record<number, Laptop.Config.Config[]>>((acc, app) => {
        if (!app.iconPosition) return acc;
        acc[app.iconPosition.column] = [...(acc[app.iconPosition.column] ?? []), app].sort((a1, a2) =>
          (a1.iconPosition?.row ?? 0) > (a2.iconPosition?.row ?? 0) ? 1 : -1
        );
        return acc;
      }, [])
    )
      .sort(([a1], [a2]) => (Number(a1) > Number(a2) ? 1 : -1))
      .map(([_, value]) => value);

    groupedApps.forEach((column, x) => {
      column.forEach((app, y) => {
        icons.push({ name: app.name, label: app.label, icon: app.icon, x, y });
      });
    });

    return icons;
  }, [enabledApps]);

  return (
    <div className={'laptop-background'}>
      {backgroundIcons.map(bgIcon => (
        <div
          className='icon'
          key={`laptop-background-icon-${bgIcon.name}`}
          onClick={() => openApp(bgIcon.name)}
          style={getIconPosition(bgIcon.x, bgIcon.y)}
        >
          <LaptopIcon {...bgIcon.icon} dim={5} />
          <Typography variant={'body2'}>{bgIcon.label}</Typography>
        </div>
      ))}
    </div>
  );
};
