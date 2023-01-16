import React, { FC, useEffect, useMemo } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppWindow } from '../../os/windows/AppWindow';

import { Header } from './components/header';
import { Cart } from './pages/cart';
import { StoreList } from './pages/storeList';
import { useBennyAppStore } from './stores/useBennyAppStore';

import '../../styles/bennys.scss';

export const Component: FC = () => {
  const [activeTab, items, setItems] = useBennyAppStore(s => [s.activeTab, s.items, s.setItems]);

  const loadItems = async () => {
    if (items.length > 0) return;
    const newItems = await nuiAction<Laptop.Bennys.Item[]>('laptop/bennys/getItems', {}, devData.bennyLaptopItems);
    setItems(newItems);
  };

  const storePage = useMemo(() => {
    switch (activeTab) {
      case 'cosmetic':
        return <StoreList category={'cosmetic'} />;
      case 'illegal':
        return <StoreList category={'illegal'} />;
      case 'cart':
        return <Cart />;
      default:
        return <div>Unknown Page</div>;
    }
  }, [activeTab]);

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
