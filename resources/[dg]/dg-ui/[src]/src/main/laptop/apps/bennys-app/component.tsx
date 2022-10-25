import React, { FC, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { useUpdateState } from '../../../../lib/redux';
import { AppWindow } from '../../os/windows/AppWindow';

import { Header } from './components/header';
import { Cart } from './pages/cart';
import { StoreList } from './pages/storeList';

import '../../styles/bennys.scss';

export const Component: FC = () => {
  const state = useSelector<RootState, Laptop.Bennys.State>(state => state['laptop.bennys']);
  const updateState = useUpdateState('laptop.bennys');

  const loadItems = async () => {
    if (state.items.length > 0) return;
    const newItems = await nuiAction<Laptop.Bennys.Item[]>('laptop/bennys/getItems', {}, devData.bennyLaptopItems);
    updateState({ items: newItems });
  };

  const storePage = useMemo(() => {
    switch (state.activeTab) {
      case 'cosmetic':
        return <StoreList category={'cosmetic'} />;
      case 'illegal':
        return <StoreList category={'illegal'} />;
      case 'cart':
        return <Cart />;
      default:
        return <div>Unknown Page</div>;
    }
  }, [state.activeTab]);

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <AppWindow width={130} height={60} name='bennys' title={'Bennys Motorwork Online Shop'}>
      <div className={'laptop-bennys-store'}>
        <Header />
        {storePage}
      </div>
    </AppWindow>
  );
};
