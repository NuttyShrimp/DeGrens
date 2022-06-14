import React from 'react';
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
  return (
    <AppWrapper appName={store.key} onShow={() => handleVisibility(true)} onHide={() => handleVisibility(false)}>
      <LogList {...props} />
    </AppWrapper>
  );
};

export default Component;
