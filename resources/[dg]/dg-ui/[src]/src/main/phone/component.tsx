import React, { useCallback, useEffect, useMemo } from 'react';
import AppWrapper from '@components/appwrapper';
import { useMainStore } from '@src/lib/stores/useMainStore';

import { Phone } from './os/phone/phone';
import { usePhoneStore } from './stores/usePhoneStore';
import modConfig from './_config';
import { getPhoneApps, phoneEvents } from './config';
import { hidePhone, phoneInit, setBackground } from './lib';

const Component: AppFunction = props => {
  const config = useMemo(() => getPhoneApps(), []);
  const character = useMainStore(s => s.character);
  const game = useMainStore(s => s.game);
  const updateStore = usePhoneStore(s => s.updateStore);

  useEffect(() => {
    setBackground();
  }, []);

  const handleShow = useCallback((data: Omit<Phone.State, 'visible'>) => {
    props.showApp();
    updateStore({
      ...data,
      animating: 'open',
    });
  }, []);

  const handleHide = useCallback(() => {
    hidePhone();
  }, []);

  const handleEvent = useCallback((pData: any) => {
    if (pData.action === 'init') {
      phoneInit();
      return;
    }
    const { appName, action, data } = pData;
    if (!phoneEvents?.[appName]?.[action]) {
      throw new Error(`Unknown Phone event: ${appName}/${action}`);
    }
    phoneEvents[appName][action](data);
  }, []);

  return (
    <AppWrapper
      appName={modConfig.name}
      onShow={handleShow}
      onEvent={handleEvent}
      onHide={handleHide}
      hideOnEscape
      full
      hideOverflow
    >
      <Phone game={game} character={character} config={config} />
    </AppWrapper>
  );
};

export default Component;
