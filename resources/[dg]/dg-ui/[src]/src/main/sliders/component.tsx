import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { Sliders } from './components/sliders';
import store from './store';

import './styles/sliders.scss';

const Component: AppFunction<Sliders.State> = props => {
  const onShow = useCallback((data: { power: number[]; amount: number[] }) => {
    props.updateState({
      visible: true,
      power: data.power,
      amount: data.amount,
    });
  }, []);

  const onHide = useCallback(() => {
    props.updateState({
      visible: false,
    });
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={onShow} onHide={onHide} hideOnEscape full center>
      <Sliders {...props} />
    </AppWrapper>
  );
};

export default Component;
