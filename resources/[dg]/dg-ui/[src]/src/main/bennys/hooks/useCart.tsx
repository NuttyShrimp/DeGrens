import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { nuiAction } from '@src/lib/nui-comms';
import { useUpdateState } from '@src/lib/redux';

export const useCart = () => {
  const cartState = useSelector<RootState, Bennys.Cart[]>(state => state.bennys.cart);
  const prices = useSelector<RootState, Bennys.State['prices']>(state => state.bennys.prices);
  const updateState = useUpdateState('bennys');

  const getPriceOfComponent = useCallback(
    (component: string) => {
      if (component.startsWith('extra_')) {
        return prices['extras'];
      } else {
        return prices[component];
      }
    },
    [prices]
  );

  const addItemToCart = useCallback(
    (component: string, data: any) => {
      nuiAction('bennys:playSound');
      const price = getPriceOfComponent(component);
      updateState(state => ({
        currentCost: state.bennys.currentCost + price,
        cart: [...state.bennys.cart.filter(item => item.component !== component), { component, data }],
      }));
    },
    [updateState, getPriceOfComponent]
  );

  const removeItemFromCart = useCallback(
    (component: string) => {
      nuiAction('bennys:playSound');
      const price = getPriceOfComponent(component);
      updateState(state => ({
        currentCost: state.bennys.currentCost - price,
        cart: [...state.bennys.cart.filter(item => item.component !== component)],
      }));
    },
    [updateState, prices]
  );

  const getCartItems = useCallback(() => cartState, [cartState]);

  const getCartItemByComponent = useCallback(
    (component: string) => cartState.find(item => item.component === component),
    [cartState]
  );

  const getCartItemById = useCallback(
    (id: number) => {
      return cartState[id];
    },
    [cartState]
  );

  return {
    addItemToCart,
    removeItemFromCart,
    getCartItems,
    getCartItemByComponent,
    getCartItemById,
  };
};
