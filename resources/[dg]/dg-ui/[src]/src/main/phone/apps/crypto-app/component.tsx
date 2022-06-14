import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Crypto } from './components/crypto';

const Component: AppFunction<Phone.Crypto.State> = props => {
  const loadCoins = async () => {
    props.updateState({
      list: [],
    });
    const coins: Phone.Crypto.Coin[] = await nuiAction('phone/crypto/get', {}, devData.crypto);
    props.updateState({
      list: coins,
    });
  };

  useEffect(() => {
    loadCoins();
  }, []);

  useEffect(() => {
    if (props.shouldRenew) {
      loadCoins();
      props.updateState({
        shouldRenew: false,
      });
    }
  }, [props.shouldRenew]);

  return (
    <AppContainer emptyList={props.list.length === 0}>
      <Crypto {...props} />
    </AppContainer>
  );
};

export default Component;
