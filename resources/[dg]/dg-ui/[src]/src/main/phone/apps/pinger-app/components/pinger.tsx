import { useState } from 'react';
import { useMainStore } from '@src/lib/stores/useMainStore';
import { AppContainer } from '@src/main/phone/os/appcontainer/appcontainer';

import { Button } from '../../../../../components/button';
import { Input } from '../../../../../components/inputs';
import { nuiAction } from '../../../../../lib/nui-comms';

import { styles } from './pinger.styles';

export const Pinger = () => {
  const [target, setTarget] = useState('');
  const hasVpn = useMainStore(s => s.character.hasVPN);
  const classes = styles();

  const sendPingRequest = (isAnon = false) => {
    nuiAction('phone/pinger/request', { target: target.replace(/[^0-9]/g, ''), isAnon });
  };

  return (
    <AppContainer>
      <div className={classes.root}>
        <Input.Number onChange={setTarget} value={target} min={1} label={'Speler id'} icon={'id-card-alt'} />
        <Button.Primary onClick={() => sendPingRequest()}>Ping</Button.Primary>
        {hasVpn && (
          <Button.Primary onClick={() => sendPingRequest(true)} startIcon={<i className={'fas fa-user-secret'} />}>
            Anon Ping
          </Button.Primary>
        )}
      </div>
    </AppContainer>
  );
};
