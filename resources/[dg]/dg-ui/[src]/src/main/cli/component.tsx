import React, { useCallback } from 'react';
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
  const handleShow = useCallback(() => handleVisibility(true), []);
  const handleHide = useCallback(() => handleVisibility(false), []);
  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} center>
      <Bar />
    </AppWrapper>
  );
};

export default Component;
