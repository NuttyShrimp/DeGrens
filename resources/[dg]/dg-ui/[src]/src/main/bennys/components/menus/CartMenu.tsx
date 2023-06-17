import { FC, useCallback, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { nuiAction } from '@src/lib/nui-comms';
import { modulo } from '@src/lib/util';

import { componentTitles } from '../../data/componentTitles';
import { useGuide } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { useBennyStore } from '../../stores/useBennyStore';
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
  const [setTitle, resetTitle, setPrice] = useBennyStore(s => [s.setBarTitle, s.resetTitleBar, s.setBarPrice]);
  const { useEventRegister } = useKeyEvents();
  const [cart, removeItemFromCart, currentPrice] = useBennyStore(s => [s.cart, s.removeFromCart, s.currentCost]);

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
      const item = cart[id];
      removeItemFromCart(item.component);
      setSelectedItem(modulo(id, cart.length - 1));

      let previewData: { component: string; data?: number };
      if (item.component.startsWith('extra_')) {
        previewData = { component: 'extras', data: item.data.id };
      } else {
        previewData = { component: item.component };
      }
      nuiAction('bennys:previewEquipped', previewData);
    },
    [cart]
  );

  const buyUpgrades = useCallback(() => {
    nuiAction('bennys:buyUpgrades', { upgrades: cart });
  }, [cart]);
  useEventRegister(' ', buyUpgrades);

  useEffect(() => {
    if (cart.length !== 0) return;
    goToMainMenu();
  }, [cart.length, goToMainMenu]);

  const exit = useCallback(() => {
    goToMainMenu();
  }, [goToMainMenu]);
  useEventRegister('Escape', exit);

  return (
    <div className='bennys-cart-menu'>
      <div className='header'>
        <Box className='title'>
          <Typography variant='subtitle1' fontWeight={600}>
            {componentTitles[cart[selectedItem]?.component] ?? 'Undefined'}
          </Typography>
        </Box>
      </div>
      <IdSelector max={cart.length} value={selectedItem + 1} onChange={selectCartItem} onSelect={removeCartItem} />
    </div>
  );
};
