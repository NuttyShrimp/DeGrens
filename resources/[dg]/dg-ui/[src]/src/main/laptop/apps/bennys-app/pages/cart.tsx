import React, { FC, useState } from 'react';
import { flushSync } from 'react-dom';
import { useSelector } from 'react-redux';

import { Icon } from '../../../../../components/icon';
import { nuiAction } from '../../../../../lib/nui-comms';
import { useUpdateState } from '../../../../../lib/redux';
import { getImg } from '../../../../../lib/util';
import { useActions } from '../../../hooks/useActions';
import { Button } from '../components/Button';

const CartItem: FC<{ itemName: string; amount: number }> = props => {
  const updateState = useUpdateState('laptop.bennys');
  const itemInfo = useSelector<RootState, Laptop.Bennys.Item | undefined>(state =>
    state['laptop.bennys'].items.find(i => i.item === props.itemName)
  );
  if (itemInfo === undefined) return null;
  return (
    <div className={'laptop-bennys-cart-entry'}>
      <div className={'label'}>
        <div className={'image'}>
          <img
            src={getImg(itemInfo.image)}
            onError={() => console.log(`No image found with filename '${itemInfo.image}'`)}
          />
        </div>
        {props.itemName} ({props.amount}x) - {props.amount * itemInfo.price} Suliro
      </div>
      <Button
        label={'Remove from Cart'}
        color={'#ff3845'}
        size={'1.4vh'}
        onClick={() =>
          updateState(state => {
            const newCart = {
              ...state['laptop.bennys'].cart,
            };
            delete newCart[props.itemName];
            return {
              cart: newCart,
            };
          })
        }
      />
    </div>
  );
};

export const Cart: FC = () => {
  const { addNotification } = useActions();
  const [purchasing, setPurchasing] = useState(false);
  const updateState = useUpdateState('laptop.bennys');
  const cartItems = useSelector<RootState, Laptop.Bennys.State['cart']>(state => state['laptop.bennys'].cart);
  const totalPrice = useSelector<RootState, number>(state =>
    Object.entries(state['laptop.bennys'].cart).reduce<number>((total, [itemName, amount]) => {
      return total + (state['laptop.bennys'].items.find(i => i.item === itemName)?.price ?? 0) * amount;
    }, 0)
  );

  const finishPurchase = async () => {
    if (purchasing) return;
    flushSync(() => setPurchasing(true));
    const success = await nuiAction('laptop/bennys/purchase', {
      items: cartItems,
    });
    addNotification(
      'bennys',
      success ? 'Order successful, go to the marked location' : 'Order failed, Do you have enough funds?'
    );
    updateState({
      cart: {},
    });
    setPurchasing(false);
  };

  if (Object.keys(cartItems).length === 0) {
    return (
      <div className={'center'}>
        <Icon name={'face-frown'} size={'3rem'} />
        <p>No items in cart</p>
      </div>
    );
  }

  return (
    <div className={'laptop-bennys-cart'}>
      <div className={'laptop-bennys-cart-list'}>
        {Object.keys(cartItems).map(itemName => (
          <CartItem key={itemName} itemName={itemName} amount={cartItems[itemName]} />
        ))}
      </div>
      <div className={'laptop-bennys-cart-total'}>
        <p>{totalPrice} Suliro</p>
        <Button label={'Beeindig aankoop'} size={'1.6vh'} onClick={finishPurchase} />
      </div>
    </div>
  );
};
