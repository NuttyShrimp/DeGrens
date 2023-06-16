import { FC, useCallback } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';

import { useActions } from '../../hooks/useActions';
import { AppWindow } from '../../os/windows/AppWindow';
import { useLaptopConfirmStore } from '../../stores/useLaptopConfirmStore';

import config from './config';

export const Component: FC = () => {
  const [modalData, setData] = useLaptopConfirmStore(s => [s.data, s.setData]);
  const { closeApp } = useActions();

  const handleDecline = useCallback(() => {
    if (modalData === null) return;
    if (modalData.onDecline) {
      modalData.onDecline();
    }
    setData(null);
    closeApp(config.name);
  }, [modalData]);

  const handleAccept = useCallback(() => {
    if (modalData === null) return;
    modalData.onAccept();
    setData(null);
    closeApp(config.name);
  }, [modalData]);

  return (
    <AppWindow width={30} title={config.label} name={config.name} onClose={handleDecline}>
      <div className='laptop-confirmmodal'>
        <p>{modalData?.label ?? 'Undefined'}</p>
        <div className='buttons'>
          <Button variant='outlined' onClick={handleAccept} color={'secondary'} size='small' startIcon={<CheckIcon />}>
            Accept
          </Button>
          <Button variant='outlined' onClick={handleDecline} color={'secondary'} size='small' startIcon={<CloseIcon />}>
            Decline
          </Button>
        </div>
      </div>
    </AppWindow>
  );
};
