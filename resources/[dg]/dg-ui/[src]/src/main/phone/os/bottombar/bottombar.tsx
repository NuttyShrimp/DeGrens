import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { nuiAction } from '@lib/nui-comms';
import { Typography } from '@mui/material';

import { baseStyle } from '../../../../base.styles';
import { addNotification, changeApp, genericAction } from '../../lib';

import { styles } from './bottombar.styles';

export const BottomBar: FC<React.PropsWithChildren<unknown>> = () => {
  const classes = styles();
  const phoneState = useSelector<RootState, Phone.State>(state => state.phone);
  const [isHovering, setHovering] = React.useState(false);

  const toggleSilence = () => {
    nuiAction('phone/silence', {
      silenced: !phoneState.isSilent,
    });
    genericAction('phone', {
      isSilent: !phoneState.isSilent,
    });
    addNotification({
      id: 'bottomBar.silence',
      description: phoneState.isSilent ? 'Meldingen aangezet' : 'Meldingen uitgezet',
      title: 'Settings',
      icon: {
        name: 'cog',
        color: '#fff',
        background: baseStyle.gray.dark,
      },
    });
  };

  const goHome = () => {
    if (phoneState.activeApp == 'home-screen') return;
    changeApp('home-screen');
  };

  const openCamera = () => {
    genericAction('phone', {
      inCamera: true,
    });
    nuiAction('phone/camera/open');
  };

  return (
    <div className={classes.root}>
      <Typography variant='body2' onClick={toggleSilence}>
        <i className={`fas fa-${phoneState.isSilent ? 'bell-slash' : 'bell'}`} />
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
