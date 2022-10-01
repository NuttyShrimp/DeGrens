import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { Scenes } from './components/scenes';
import store from './store';

import './styles/scenes.scss';

const Component: AppFunction<Scenes.State> = props => {
  const handleVisibility = (isVis: boolean) => {
    props.updateState({
      visible: isVis,
    });
  };
  const handleShow = useCallback(() => handleVisibility(true), []);
  const handleHide = useCallback(() => handleVisibility(false), []);

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} hideOnEscape full center>
      <Scenes {...props} />
    </AppWrapper>
  );
};
export default Component;
