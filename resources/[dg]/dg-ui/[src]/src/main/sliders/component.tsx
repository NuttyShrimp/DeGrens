import React from 'react';
import AppWrapper from '@components/appwrapper';

import { Sliders } from './components/sliders';
import store from './store';

import './styles/sliders.scss';

const Component: AppFunction<Sliders.State> = props => {
  const onShow = (data: { power: number[]; amount: number[] }) => {
    props.updateState({
      visible: true,
      power: data.power,
      amount: data.amount,
    });
  };

  const onHide = () => {
    props.updateState({
      visible: false,
    });
  };

  return (
    <AppWrapper appName={store.key} onShow={onShow} onHide={onHide} onEscape={onHide} full center>
      <Sliders {...props} />
    </AppWrapper>
  );
};

export default Component;
