import React, { FC, useCallback } from 'react';
import { Button } from '@mui/material';
import { nuiAction } from '@src/lib/nui-comms';
import { useActions } from '@src/main/laptop/hooks/useActions';

export const Home: FC<{ label: string; gangName: string; isOwner: boolean; fetchGangData: () => Promise<void> }> = ({
  label,
  gangName,
  isOwner,
  fetchGangData,
}) => {
  const { addNotification, openConfirm } = useActions();

  const handleLeave = useCallback(async () => {
    if (!isOwner) {
      addNotification('gang', 'Je kan dit niet als eigenaar');
      return;
    }
    openConfirm({
      label: 'Ben je zeker dat je de gang wil verlaten?',
      onAccept: async () => {
        await nuiAction('laptop/gang/leave', { gang: gangName });
        fetchGangData();
      },
    });
  }, [isOwner, gangName]);

  return (
    <div className='laptop-gang-home'>
      <div>
        <p>Huidige gang: {label}</p>
        <br />
        <h2>TBD...</h2>
      </div>
      <div>
        <Button variant='outlined' onClick={handleLeave} color={'secondary'} size='small'>
          leave
        </Button>
      </div>
    </div>
  );
};
