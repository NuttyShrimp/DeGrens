import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Crypto } from './components/crypto';
import { useCryptoAppStore } from './stores/useCryptoAppStore';

const Component = () => {
  const [list, shouldRenew, setList, setRenew] = useCryptoAppStore(s => [s.list, s.shouldRenew, s.setList, s.setRenew]);
  const loadCoins = async () => {
    flushSync(() => setList([]));
    const coins: Phone.Crypto.Coin[] = await nuiAction('phone/crypto/get', {}, devData.crypto);
    setList(coins);
  };

  useEffect(() => {
    loadCoins();
  }, []);

  useEffect(() => {
    if (shouldRenew) {
      loadCoins();
      setRenew(false);
    }
  }, [shouldRenew]);

  return (
    <AppContainer emptyList={list.length === 0}>
      <Crypto />
    </AppContainer>
  );
};

export default Component;
