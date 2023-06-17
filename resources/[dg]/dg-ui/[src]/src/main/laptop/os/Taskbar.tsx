import { FC, useMemo } from 'react';
import { Icon } from '@components/icon';
import { Stack } from '@mui/material';

import { LaptopIcon } from '../components/LaptopIcon';
import { useActions } from '../hooks/useActions';
import { useLaptopConfigStore } from '../stores/useLaptopConfigStore';

export const TaskBar: FC<{ activeApps: string[] }> = ({ activeApps }) => {
  const appConfig = useLaptopConfigStore(s => s.config);
  const { focusApp } = useActions();

  const activeAppsConfig = useMemo(() => appConfig.filter(a => activeApps.includes(a.name)), [activeApps, appConfig]);

  return (
    <div className={'laptop-taskbar-wrapper'}>
      <Stack className='laptop-taskbar-bar' direction='row' justifyContent='center' alignItems='center' spacing={1}>
        <div className={'laptop-taskbar-icon'}>
          <Icon name='grid' lib='fat' />
        </div>
        {activeAppsConfig.map(a => (
          <div key={`laptop-taskbar-${a.name}`} className={'laptop-taskbar-icon'} onClick={() => focusApp(a.name)}>
            <LaptopIcon {...a.icon} dim={3} />
          </div>
        ))}
      </Stack>
    </div>
  );
};
