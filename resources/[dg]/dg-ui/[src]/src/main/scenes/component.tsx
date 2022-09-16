import React from 'react';
import AppWrapper from '@components/appwrapper';

import { Scenes } from './components/scenes';
import store from './store';

import './styles/scenes.scss';

const Component: AppFunction<Scenes.State> = props => {
  const onShow = () => {
    props.updateState({
      visible: true,
    });
  };

  const onHide = () => {
    props.updateState({
      visible: false,
    });
  };

  return (
    <AppWrapper appName={store.key} onShow={onShow} onHide={onHide} hideOnEscape full center>
      <Scenes {...props} />
    </AppWrapper>
  );
};
export default Component;
