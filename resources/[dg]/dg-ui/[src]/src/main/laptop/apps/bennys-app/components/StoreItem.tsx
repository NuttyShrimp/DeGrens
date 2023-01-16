import React, { FC } from 'react';
import { getImg } from '@lib/util';

import { useBennyAppStore } from '../stores/useBennyAppStore';

import { Button } from './Button';

export const StoreItem: FC<{ item: Laptop.Bennys.Item }> = props => {
  const [setCart, cart] = useBennyAppStore(s => [s.setCart, s.cart]);

  const addToCart = () => {
    const nCart = { ...cart };
    if (!nCart[props.item.item]) {
      nCart[props.item.item] = 0;
    }
    nCart[props.item.item]++;
    setCart(nCart);
  };
  return (
    <div className={'laptop-bennys-store-item'}>
      <div className={'image'}>
        <img
          src={getImg(props.item.image)}
          onError={() => console.log(`No image found with filename '${props.item.image}'`)}
        />
      </div>
      <p className={'label'}>{props.item.label}</p>
      <p className={'price'}>{props.item.price} Suliro</p>
      <Button label={'Add to Cart'} onClick={addToCart} />
    </div>
  );
};
