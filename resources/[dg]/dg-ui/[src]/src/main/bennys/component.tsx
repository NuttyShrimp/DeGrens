import { useCallback } from 'react';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import AppWrapper from '../../components/appwrapper';

import { Bars } from './components/Bars';
import { Menu } from './components/menus/Menu';
import { useBennyStore } from './stores/useBennyStore';
import config from './_config';

const Component: AppFunction = props => {
  const [setCost, setMenu, setPrices, resetStore] = useBennyStore(s => [
    s.setCost,
    s.setMenu,
    s.setPrices,
    s.resetStore,
  ]);
  const onShow = useCallback(async (data: { repairCost?: number }) => {
    const currentCost = data?.repairCost ?? 0;
    const currentMenu = currentCost > 0 ? 'repair' : 'main';

    let prices: Record<string, number> = {};
    if (currentMenu === 'main') {
      prices = await nuiAction('bennys:getPrices', {}, devData.bennysPrices);
    }

    props.showApp();
    setCost(currentCost);
    setMenu(currentMenu);
    setPrices(prices);
  }, []);

  const onHide = useCallback(() => {
    props.hideApp();
    resetStore();
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={onShow} onHide={onHide}>
      <Menu />
      <Bars />
    </AppWrapper>
  );
};
export default Component;
