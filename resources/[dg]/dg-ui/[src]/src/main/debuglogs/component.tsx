import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { LogList } from './components/Log';
import store from './store';

import './styles/debuglogs.scss';

const Component: AppFunction<DebugLogs.State> = props => {
  const handleVisibility = (isVis: boolean) => {
    props.updateState({
      visible: isVis,
    });
  };
  const handleShow = useCallback(() => handleVisibility(true), []);
  const handleHide = useCallback(() => handleVisibility(false), []);
  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide}>
      <LogList {...props} />
    </AppWrapper>
  );
};

export default Component;
