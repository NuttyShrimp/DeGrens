import React, { FC } from 'react';
import { getImg } from '@lib/util';

import { useUpdateState } from '../../../../../lib/redux';

import { Button } from './Button';

export const StoreItem: FC<{ item: Laptop.Bennys.Item }> = props => {
  const updateState = useUpdateState('laptop.bennys');
  const addToCart = () => {
    updateState(state => {
      const cart = { ...state['laptop.bennys'].cart };
      if (!cart[props.item.item]) {
        cart[props.item.item] = 0;
      }
      cart[props.item.item]++;
      return { cart };
    });
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
