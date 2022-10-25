import React, { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { nuiAction } from '@src/lib/nui-comms';
import { modulo } from '@src/lib/util';

import { componentTitles } from '../../data/componentTitles';
import { useCart } from '../../hooks/useCart';
import { useGuide, useInformationBar } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { IdSelector } from '../IdSelector';

import '../../styles/cartMenu.scss';

export const CartMenu: FC<{ goToMainMenu: () => void }> = ({ goToMainMenu }) => {
  const { showGuide, hideGuide } = useGuide([
    {
      title: 'Remove From Cart',
      kbdCombo: ['Enter'],
    },
    {
      title: 'Buy Items',
      kbdCombo: ['Space'],
    },
  ]);
  const { setTitle, resetTitle, setPrice } = useInformationBar();
  const { useEventRegister } = useKeyEvents();
  const { getCartItems, removeItemFromCart, getCartItemById } = useCart();

  const currentPrice = useSelector<RootState, number>(state => state.bennys.currentCost);

  const [selectedItem, setSelectedItem] = useState(0);

  useEffect(() => {
    setTitle('Cart');
    showGuide();
    return () => {
      resetTitle();
      hideGuide();
    };
  }, []);

  useEffect(() => {
    setPrice(currentPrice);
  }, [currentPrice]);

  const selectCartItem = useCallback(
    (id: number) => {
      setSelectedItem(id - 1);
    },
    [setSelectedItem]
  );

  const removeCartItem = useCallback(
    (id: number) => {
      id -= 1;
      const item = getCartItemById(id);
      removeItemFromCart(item.component);
      setSelectedItem(modulo(id, getCartItems().length - 1));

      let previewData: { component: string; data?: any };
      if (item.component.startsWith('extra_')) {
        previewData = { component: 'extras', data: item.data.id };
      } else {
        previewData = { component: item.component };
      }
      nuiAction('bennys:previewEquipped', previewData);
    },
    [removeItemFromCart]
  );

  const buyUpgrades = useCallback(() => {
    nuiAction('bennys:buyUpgrades', { upgrades: getCartItems() });
  }, [getCartItems]);
  useEventRegister(' ', buyUpgrades);

  useEffect(() => {
    if (getCartItems().length !== 0) return;
    goToMainMenu();
  }, [getCartItems().length, goToMainMenu]);

  const exit = useCallback(() => {
    goToMainMenu();
  }, [goToMainMenu]);
  useEventRegister('Escape', exit);

  return (
    <div className='bennys-cart-menu'>
      <div className='header'>
        <Box className='title'>
          <Typography variant='subtitle1' fontWeight={600}>
            {componentTitles[getCartItems()[selectedItem]?.component] ?? 'Undefined'}
          </Typography>
        </Box>
      </div>
      <IdSelector
        max={getCartItems().length}
        value={selectedItem + 1}
        onChange={selectCartItem}
        onSelect={removeCartItem}
      />
    </div>
  );
};
