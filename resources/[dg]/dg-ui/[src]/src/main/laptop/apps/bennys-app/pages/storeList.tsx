import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { StoreItem } from '../components/StoreItem';

export const StoreList: FC<{ category: Laptop.Bennys.Category }> = ({ category }) => {
  const storeItems = useSelector<RootState, Laptop.Bennys.Item[]>(state =>
    state['laptop.bennys'].items.filter(i => i.category === category)
  );
  return (
    <div className={'laptop-bennys-store-page'}>
      {storeItems.map(item => (
        <StoreItem key={item.item} item={item} />
      ))}
    </div>
  );
};
