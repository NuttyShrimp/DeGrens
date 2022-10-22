import React, { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import { useUpdateState } from '@src/lib/redux';

import { useActions } from '../../hooks/useActions';
import { AppWindow } from '../../os/windows/AppWindow';

import config from './config';

export const Component: FC = () => {
  const modalData = useSelector<RootState, Laptop.Confirm.State['data']>(state => state['laptop.confirm'].data);
  const updateState = useUpdateState('laptop.confirm');
  const { closeApp } = useActions();

  const handleDecline = useCallback(() => {
    if (modalData === null) return;
    if (modalData.onDecline) {
      modalData.onDecline();
    }
    updateState({ data: null });
    closeApp(config.name);
  }, [modalData]);

  const handleAccept = useCallback(() => {
    if (modalData === null) return;
    modalData.onAccept();
    updateState({ data: null });
    closeApp(config.name);
  }, [modalData]);

  return (
    <AppWindow width={30} title='Confirm' name='confirm' onClose={handleDecline}>
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
