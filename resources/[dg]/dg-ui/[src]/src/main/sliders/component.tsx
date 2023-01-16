import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { Sliders } from './components/sliders';
import { useSlidersStore } from './stores/useSlidersStore';
import config from './_config';

import './styles/sliders.scss';

const Component: AppFunction = props => {
  const updateStore = useSlidersStore(s => s.updateStore);
  const onShow = useCallback((data: { power: number[]; amount: number[] }) => {
    props.showApp();
    updateStore({
      power: data.power,
      amount: data.amount,
    });
  }, []);

  const onHide = useCallback(() => {
    props.hideApp();
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={onShow} onHide={onHide} hideOnEscape full center>
      <Sliders />
    </AppWrapper>
  );
};

export default Component;
