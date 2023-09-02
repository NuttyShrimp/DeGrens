import { FC } from 'react';
import PinDropIcon from '@mui/icons-material/PinDrop';
import { Button } from '@mui/material';
import { nuiAction } from '@src/lib/nui-comms';

import { useActions } from '../../hooks/useActions';
import { AppWindow } from '../../os/windows/AppWindow';

import config from './config';

import './styles/criminaldoctor.scss';

export const Component: FC = () => {
  const { openConfirm, addNotification } = useActions();

  const handleRequestClick = () => {
    openConfirm({
      label: `Ben je zeker dat je een locatie wil aanvragen?`,
      onAccept: async () => {
        const result = await nuiAction<string>('laptop/criminaldocter/request', {}, 'Successvol');
        addNotification('criminaldoctor', result);
      },
    });
  };

  return (
    <AppWindow width={30} height={20} name={config.name} title={config.label}>
      <div className='laptop-criminal-doctor'>
        <Button variant='outlined' onClick={handleRequestClick} color={'secondary'} startIcon={<PinDropIcon />}>
          request
        </Button>
      </div>
    </AppWindow>
  );
};
