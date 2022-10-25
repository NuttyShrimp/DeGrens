import React, { useCallback } from 'react';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import AppWrapper from '../../components/appwrapper';

import { Bars } from './components/Bars';
import { Menu } from './components/menus/Menu';
import store from './store';

const Component: AppFunction<Bennys.State> = props => {
  const onShow = useCallback(async (data: { repairCost?: number }) => {
    const currentCost = data?.repairCost ?? 0;
    const currentMenu = currentCost > 0 ? 'repair' : 'main';

    let prices: Record<string, number> = {};
    if (currentMenu === 'main') {
      prices = await nuiAction('bennys:getPrices', {}, devData.bennysPrices);
    }

    props.updateState({
      ...store.initialState,
      visible: true,
      currentCost,
      currentMenu,
      prices,
    });
  }, []);

  const onHide = useCallback(() => {
    props.updateState(store.initialState);
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={onShow} onHide={onHide}>
      <Menu {...props} />
      <Bars {...props.bars} />
    </AppWrapper>
  );
};
export default Component;
