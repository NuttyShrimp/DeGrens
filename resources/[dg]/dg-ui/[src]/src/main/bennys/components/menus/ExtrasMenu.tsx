import React, { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { useCart } from '../../hooks/useCart';
import { useGuide, useInformationBar } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { CategorySlider } from '../CategorySlider';
import { IdSelector } from '../IdSelector';

const getExtraId = (id: number) => `extra_${id}`;

export const ExtrasMenu: FC<{ goToMainMenu: () => void }> = ({ goToMainMenu }) => {
  const { setTitle, setEquipped, resetTitle, setIsInCart, setPrice } = useInformationBar();
  const { showGuide, hideGuide } = useGuide({
    title: 'Add to cart',
    kbdCombo: ['Enter'],
  });
  const { addItemToCart, getCartItemByComponent, removeItemFromCart } = useCart();
  const { useEventRegister } = useKeyEvents();

  const pricePerExtra = useSelector<RootState, number>(state => state.bennys.prices['extras']);

  const [extrasData, setExtrasData] = useState<Bennys.Components.Extra[]>([]);
  const [currentExtraId, setCurrentExtraId] = useState<number>(0);
  const [onEnableOption, setOnEnableOption] = useState(false);

  // Fetch data and update current equipped to cart item
  const getData = async () => {
    const data = await nuiAction<Bennys.Components.Extra[]>('bennys:getExtraData', {}, devData.extraData);
    setExtrasData(data);
    startOnCartOrEquipped(data, currentExtraId);
  };

  useEffect(() => {
    getData();
    showGuide();
    setPrice(pricePerExtra);
    return () => {
      resetTitle();
      hideGuide();
    };
  }, []);

  const changeExtraId = (newId: number) => {
    previewPreviousOnChange();
    setCurrentExtraId(newId);
    startOnCartOrEquipped(extrasData, newId);
  };

  useEffect(() => {
    const extra = extrasData[currentExtraId];
    if (!extra) return;
    setTitle(onEnableOption ? 'Enable' : 'Disable');
    setEquipped(extra.enabled === onEnableOption);
    const cartItem = getCartItemByComponent(getExtraId(extra.id))?.data as Bennys.Components.Extra;
    setIsInCart(cartItem?.enabled === onEnableOption);
    nuiAction('bennys:preview', {
      name: 'extras',
      data: { id: extra.id, enabled: onEnableOption },
    });
  }, [currentExtraId, onEnableOption, extrasData, getCartItemByComponent]);

  const addToCart = useCallback(
    (optionId: number) => {
      const onEnable = optionId === 2;
      const itemId = getExtraId(extrasData[currentExtraId].id);

      // If an item in cart remove it if you on the cartitem or equipped item
      // if no item in cart and you on equipped then do nothing
      // Else add to cart
      const cartItem = getCartItemByComponent(itemId)?.data?.enabled as boolean;
      if (cartItem !== undefined) {
        if (cartItem === onEnable || extrasData[currentExtraId].enabled === onEnable) {
          removeItemFromCart(itemId);
          return;
        }
      } else {
        if (extrasData[currentExtraId].enabled === onEnable) return;
      }
      addItemToCart(itemId, { id: extrasData[currentExtraId].id, enabled: onEnable });
    },
    [currentExtraId, extrasData, getCartItemByComponent]
  );

  // Reset previewed item to cartitem else equipped on leave
  const previewPreviousOnChange = useCallback(() => {
    const extraId = extrasData[currentExtraId].id;
    const cartItem = (getCartItemByComponent(getExtraId(extraId))?.data as Bennys.Components.Extra)?.enabled;
    const enabled = cartItem ?? extrasData[currentExtraId].enabled;
    nuiAction('bennys:preview', {
      name: 'extras',
      data: {
        id: extraId,
        enabled,
      },
    });
  }, [extrasData, currentExtraId, getCartItemByComponent]);

  const exit = useCallback(() => {
    previewPreviousOnChange();
    goToMainMenu();
  }, [previewPreviousOnChange, goToMainMenu]);
  useEventRegister('Escape', exit);

  const startOnCartOrEquipped = useCallback(
    (data: Bennys.Components.Extra[], extraId: number) => {
      const startId = getExtraId(data[extraId].id);
      const cartItem = (getCartItemByComponent(startId)?.data as Bennys.Components.Extra)?.enabled;
      setOnEnableOption(cartItem ?? data[extraId].enabled);
    },
    [getCartItemByComponent]
  );

  return (
    <>
      {extrasData.length !== 0 && (
        <CategorySlider value={currentExtraId} options={extrasData.map(c => `Extra #${c.id}`)} onChange={changeExtraId}>
          <IdSelector
            max={2}
            value={onEnableOption ? 2 : 1}
            onChange={id => setOnEnableOption(id === 2)}
            onSelect={addToCart}
          />
        </CategorySlider>
      )}
    </>
  );
};
