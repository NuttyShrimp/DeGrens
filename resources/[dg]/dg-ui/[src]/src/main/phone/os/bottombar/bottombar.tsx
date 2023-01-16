import React, { FC } from 'react';
import { nuiAction } from '@lib/nui-comms';
import { Typography } from '@mui/material';

import { baseStyle } from '../../../../base.styles';
import { addNotification, changeApp } from '../../lib';
import { usePhoneStore } from '../../stores/usePhoneStore';

import { styles } from './bottombar.styles';

export const BottomBar: FC<React.PropsWithChildren<unknown>> = () => {
  const classes = styles();
  const [isSilent, activeApp, updatePhoneStore] = usePhoneStore(s => [s.isSilent, s.activeApp, s.updateStore]);
  const [isHovering, setHovering] = React.useState(false);

  const toggleSilence = () => {
    nuiAction('phone/silence', {
      silenced: !isSilent,
    });
    updatePhoneStore({
      isSilent: !isSilent,
    });
    addNotification({
      id: 'bottomBar.silence',
      description: isSilent ? 'Meldingen aangezet' : 'Meldingen uitgezet',
      title: 'Settings',
      icon: {
        name: 'cog',
        color: '#fff',
        background: baseStyle.gray.dark,
      },
    });
  };

  const goHome = () => {
    if (activeApp == 'home-screen') return;
    changeApp('home-screen');
  };

  const openCamera = () => {
    updatePhoneStore({
      inCamera: true,
    });
    nuiAction('phone/camera/open');
  };

  return (
    <div className={classes.root}>
      <Typography variant='body2' onClick={toggleSilence}>
        <i className={`fas fa-${isSilent ? 'bell-slash' : 'bell'}`} />
      </Typography>
      <div>
        <Typography
          variant='body2'
          onClick={goHome}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <i className={`${isHovering ? 'fas' : 'far'} fa-circle`} />
        </Typography>
      </div>
      <div>
        <Typography variant='body2' onClick={openCamera}>
          <i className={`fas fa-camera`} />
        </Typography>
      </div>
    </div>
  );
};
