import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import AppWrapper from '@components/appwrapper';

import { Phone } from './os/phone/phone';
import { getPhoneApps, phoneEvents } from './config';
import { hidePhone, phoneInit, setBackground } from './lib';
import store from './store';

const Component: AppFunction<Phone.State> = props => {
  const config = useMemo(() => getPhoneApps(), []);
  const character = useSelector<RootState, Character>(state => state.character);
  const game = useSelector<RootState, Main.Game>(state => state.game);

  useEffect(() => {
    setBackground();
  }, []);

  const handleShow = useCallback((data: Omit<typeof store.initialState, 'visible'>) => {
    props.updateState({
      ...data,
      visible: true,
      animating: 'open',
    });
  }, []);

  const handleHide = useCallback(() => {
    hidePhone();
  }, [])

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
      appName={store.key}
      onShow={handleShow}
      onEvent={handleEvent}
      onHide={handleHide}
      hideOnEscape
      full
      hideOverflow
    >
      <Phone {...props} game={game} character={character} config={config} />
    </AppWrapper>
  );
};

export default Component;
