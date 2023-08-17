import { FC } from 'react';
import { Button, Divider } from '@mui/material';
import { useCountdown } from '@src/lib/hooks/useCountdown';
import { nuiAction } from '@src/lib/nui-comms';
import { useActions } from '@src/main/laptop/hooks/useActions';

import { useCarboostingAppStore } from '../stores/useCarboostingAppStore';

const formatTime = (time: number) => {
  if (time <= 0) return '00:00';
  const seconds = Math.floor(time / 1000);
  const secondsRemaining = seconds % 60;
  const minutesRemaining = Math.floor(seconds / 60);
  return `${String(minutesRemaining).padStart(2, '0')}:${String(secondsRemaining).padStart(2, '0')}`;
};

const StyledButton: FC<{ onClick: () => void; disabled?: boolean; text: string }> = props => {
  return (
    <Button
      variant='outlined'
      onClick={props.onClick}
      color={'secondary'}
      size='small'
      fullWidth
      disabled={props.disabled}
    >
      {props.text}
    </Button>
  );
};

export const Contract: FC<Laptop.Carboosting.Contract> = props => {
  const { fetchData } = useCarboostingAppStore();
  const timeRemaining = useCountdown(props.expirationTime);
  const { openConfirm, addNotification } = useActions();

  const handleBoost = () => {
    openConfirm({
      label: `Ben je zeker dat je dit contract wil accepteren als boost? Prijs: ${props.price.boost} Suliro`,
      onAccept: async () => {
        try {
          await nuiAction('laptop/carboosting/accept', { id: props.id, type: 'boost' });
        } catch (e: any) {
          addNotification('carboosting', e.message);
        } finally {
          fetchData();
        }
      },
    });
  };

  const handleScratch = () => {
    openConfirm({
      label: `Ben je zeker dat je dit contract wil accepteren als vinscratch? Prijs: ${props.price.scratch} Suliro`,
      onAccept: async () => {
        try {
          await nuiAction('laptop/carboosting/accept', { id: props.id, type: 'scratch' });
        } catch (e: any) {
          addNotification('carboosting', e.message);
        } finally {
          fetchData();
        }
      },
    });
  };

  const handleDecline = () => {
    openConfirm({
      label: `Ben je zeker dat je dit contract wil verwijderen?`,
      onAccept: async () => {
        try {
          await nuiAction('laptop/carboosting/decline', { id: props.id });
        } catch (e: any) {
          addNotification('carboosting', e.message);
        } finally {
          fetchData();
        }
      },
    });
  };

  return (
    <div className='contract'>
      <div className='class'>
        <p>{props.class}</p>
      </div>
      <div className='label'>
        <p style={{ fontSize: '1.4vh' }}>{props.brand}</p>
        <p style={{ fontSize: '1.9vh' }}>{props.name}</p>
      </div>
      <div>
        <Divider className='divider' />
        <p style={{ fontSize: '1.1vh' }}>TIME REMAINING</p>
        <p style={{ fontSize: '2.5vh' }}>{formatTime(timeRemaining)}</p>
        <Divider className='divider' />
        <div className='buttons'>
          <StyledButton onClick={handleBoost} text='boost' disabled={props.disabledActions.boost} />
          <StyledButton onClick={handleScratch} text='scratch' disabled={props.disabledActions.scratch} />
          <StyledButton onClick={handleDecline} text='decline' disabled={props.disabledActions.decline} />
        </div>
      </div>
    </div>
  );
};
