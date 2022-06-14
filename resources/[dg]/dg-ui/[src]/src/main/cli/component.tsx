import React from 'react';
import AppWrapper from '@components/appwrapper';

import { Bar } from './components/bar';
import store from './store';

import './styles/cli.scss';

const Component: AppFunction = props => {
  const handleVisibility = (isVis: boolean) => {
    props.updateState({
      visible: isVis,
    });
  };
  return (
    <AppWrapper appName={store.key} onShow={() => handleVisibility(true)} onHide={() => handleVisibility(false)} center>
      <Bar />
    </AppWrapper>
  );
};

export default Component;
