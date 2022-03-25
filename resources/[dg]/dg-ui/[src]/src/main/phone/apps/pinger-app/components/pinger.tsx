import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Button } from '../../../../../components/button';
import { Input } from '../../../../../components/inputs';
import { nuiAction } from '../../../../../lib/nui-comms';

import { styles } from './pinger.styles';

export const Pinger = () => {
  const [target, setTarget] = useState('');
  const hasVpn = useSelector<RootState, boolean>(state => state.character.hasVPN);
  const classes = styles();

  const sendPingRequest = (isAnon = false) => {
    nuiAction('phone/pinger/request', { target: target.replace(/[^0-9]/g, ''), isAnon });
  };

  return (
    <div className={classes.root}>
      <Input.Number onChange={setTarget} value={target} min={1} label={'Speler id'} icon={'id-card-alt'} />
      <Button.Primary onClick={() => sendPingRequest()}>Ping</Button.Primary>
      {hasVpn && (
        <Button.Primary onClick={() => sendPingRequest(true)} startIcon={<i className={'fas fa-user-secret'} />}>
          Anon Ping
        </Button.Primary>
      )}
    </div>
  );
};
