import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@components/icon';
import { Stack } from '@mui/material';

import { LaptopIcon } from '../components/LaptopIcon';
import { useActions } from '../hooks/useActions';

export const TaskBar: FC<{ activeApps: string[] }> = ({ activeApps }) => {
  const appConfig = useSelector<RootState, Laptop.Config.Config[]>(state => state['laptop.config'].config);
  const { focusApp } = useActions();

  const activeAppsConfig = useMemo(() => {
    const enabledApps = appConfig.filter(a => activeApps.includes(a.name));
    enabledApps.sort((a1, a2) => a1.column + a1.row - (a2.column + a2.row));
    return enabledApps;
  }, [activeApps, appConfig]);

  return (
    <div className={'laptop-taskbar-wrapper'}>
      <Stack className='laptop-taskbar-bar' direction='row' justifyContent='center' alignItems='center' spacing={1}>
        <div className={'laptop-taskbar-icon'}>
          <Icon name='grid' lib='fat' />
        </div>
        {activeAppsConfig.map(a => (
          <div key={a.name} className={'laptop-taskbar-icon'} onClick={() => focusApp(a.name)}>
            <LaptopIcon {...a.icon} dim={3} />
          </div>
        ))}
      </Stack>
    </div>
  );
};
