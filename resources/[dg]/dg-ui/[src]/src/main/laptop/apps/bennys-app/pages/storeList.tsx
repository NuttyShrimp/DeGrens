import { FC } from 'react';

import { StoreItem } from '../components/StoreItem';
import { useBennyAppStore } from '../stores/useBennyAppStore';

export const StoreList: FC<{ category: Laptop.Bennys.Category }> = ({ category }) => {
  const storeItems = useBennyAppStore(s => s.items.filter(i => i.category === category));
  return (
    <div className={'laptop-bennys-store-page'}>
      {storeItems.map(item => (
        <StoreItem key={item.item} item={item} />
      ))}
    </div>
  );
};
