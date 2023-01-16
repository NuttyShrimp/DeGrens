import React, { FC } from 'react';
import Typography from '@mui/material/Typography';
import { IconButton } from '@src/components/button';
import { Icon } from '@src/components/icon';
import { nuiAction } from '@src/lib/nui-comms';

import { useDispatchStore } from '../stores/useDispatchStore';

const Cam: FC<{ cam: Dispatch.Cam }> = ({ cam }) => {
  const openCamera = () => {
    nuiAction('dispatch/openCamera', {
      id: cam.id,
    });
  };

  return (
    <div className='dispatch-cam'>
      <Icon name='camera-cctv' size='2rem' />
      <div className='dispatch-cam-info'>
        <Typography variant='body1'>Camera #{cam.id}</Typography>
        <Typography variant='body2'>{cam.label}</Typography>
      </div>
      <div>
        <IconButton.Primary onClick={openCamera}>
          <Icon name='eye' />
        </IconButton.Primary>
      </div>
    </div>
  );
};

export const CamList = () => {
  const camList = useDispatchStore(s => s.cams);
  return (
    <div className='dispatch-list dispatch-cam-list'>
      {camList.map(cam => (
        <Cam key={`dispatch-cam-${cam.id}`} cam={cam} />
      ))}
    </div>
  );
};
