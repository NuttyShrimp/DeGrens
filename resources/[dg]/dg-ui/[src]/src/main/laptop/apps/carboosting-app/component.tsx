import { FC, useEffect } from 'react';
import { Button, Divider, LinearProgress, Tooltip } from '@mui/material';
import { nuiAction } from '@src/lib/nui-comms';

import { useActions } from '../../hooks/useActions';
import { AppWindow } from '../../os/windows/AppWindow';

import { ContractList } from './components/contractlist';
import { useCarboostingAppStore } from './stores/useCarboostingAppStore';
import config from './config';

import './styles/carboosting.scss';

export const Component: FC = () => {
  const { signedUp, reputation, updateStore, fetchData } = useCarboostingAppStore();
  const { addNotification } = useActions();

  const toggleSignedUp = async () => {
    const toggle = !signedUp;
    const success = await nuiAction<boolean>('laptop/carboosting/toggleSignedUp', { toggle }, true);
    if (!success) {
      addNotification('carboosting', 'Kon actie niet voltooien, probeer later opnieuw');
      fetchData();
      return;
    }
    updateStore({ signedUp: toggle });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppWindow width={110} height={60} name={config.name} title={config.label}>
      <div className='laptop-carboosting'>
        <div className='header'>
          <Button variant='outlined' onClick={toggleSignedUp} color={'secondary'} size='small'>
            {signedUp ? 'sign off' : 'sign up'}
          </Button>
          <div className='progressbar'>
            <p>{reputation.currentClass}</p>
            <LinearProgress variant='determinate' value={reputation.percentage} color='secondary' />
            <p>{reputation.nextClass ?? ''}</p>
          </div>
          <div className='refresh' onClick={fetchData}>
            <Tooltip title='Refresh'>
              <i className={'fas fa-arrows-rotate'} />
            </Tooltip>
          </div>
        </div>
        <Divider />
        <div className='content'>
          <ContractList />
        </div>
      </div>
    </AppWindow>
  );
};
