import React, { FC } from 'react';
import { Chip, Typography } from '@mui/material';
import { Icon } from '@src/components/icon';
import { nuiAction } from '@src/lib/nui-comms';
import { formatRelativeTime } from '@src/lib/util';

export const Call: FC<{ call: Dispatch.Call; isNew: boolean }> = ({ call, isNew }) => {
  const setLocation = () => {
    nuiAction('dispatch/setLocation', { id: call.id });
  };

  return (
    <div
      className={`dispatch-call ${
        call.important
          ? isNew
            ? 'dispatch-call-new-important'
            : 'dispatch-call-important'
          : isNew
          ? 'animate__animated animate__zoomInRight'
          : ''
      }`}
    >
      <div className='dispatch-call-content'>
        <div className='dispatch-call-header'>
          {call.callsign && <Chip color={'primary'} label={call.callsign} />}
          {call.tag && <Chip color={'secondary'} label={call.tag} />}
          <Typography variant='body1' fontWeight={'bold'} style={{ fontSize: '1.5vh' }}>
            {call.title}
          </Typography>
        </div>
        <div className='dispatch-call-entries'>
          {call.description && (
            <div>
              <div />
              <Typography variant='body1' style={{ fontSize: '1.4vh' }}>
                {call.description}
              </Typography>
            </div>
          )}
          <div>
            <Icon name={'clock'} size='1rem' />
            <Typography variant='body1' style={{ fontSize: '1.4vh' }}>
              {formatRelativeTime(call.timestamp)}
            </Typography>
          </div>
          {call.entries &&
            Object.entries(call.entries).map(([icon, entry], idx) => (
              <div key={`call-${call.id}-${idx}`}>
                <Icon name={icon} size='1rem' />
                <Typography variant='body1' style={{ fontSize: '1.4vh' }}>
                  {entry}
                </Typography>
              </div>
            ))}
        </div>
      </div>
      {call.coords && (
        <div className='dispatch-call-location' onClick={setLocation}>
          <Icon name='location-dot' size='2rem' />
        </div>
      )}
    </div>
  );
};
