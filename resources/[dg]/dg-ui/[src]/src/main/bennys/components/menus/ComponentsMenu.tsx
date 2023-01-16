import React, { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardKey } from '@src/lib/hooks/useKeyboardKey';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { componentTitles } from '../../data/componentTitles';
import { useGuide } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { useBennyStore } from '../../stores/useBennyStore';
import { CategorySlider } from '../CategorySlider';
import { IdSelector } from '../IdSelector';

export const ComponentsMenu: FC<{ menuType: 'interior' | 'exterior'; goToMainMenu: () => void }> = ({
  menuType,
  goToMainMenu,
}) => {
  const { key: leftKey } = useKeyboardKey('q');
  const { key: rightKey } = useKeyboardKey('e');
  const { showGuide, hideGuide } = useGuide([
    {
      title: 'Add to cart',
      kbdCombo: ['Enter'],
    },
    {
      title: 'Previous Category',
      kbdCombo: [leftKey.toLocaleUpperCase()],
    },
    {
      title: 'Next Category',
      kbdCombo: [rightKey.toLocaleUpperCase()],
    },
  ]);
  const [
    addItemToCart,
    getCartItemByComponent,
    removeItemFromCart,
    setTitle,
    resetTitle,
    setEquipped,
    setIsInCart,
    setPrice,
    pricePerComponent,
    cart,
  ] = useBennyStore(s => [
    s.addToCart,
    s.getCartItemForComp,
    s.removeFromCart,
    s.setBarTitle,
    s.resetTitleBar,
    s.setEquipped,
    s.setInCart,
    s.setBarPrice,
    s.prices,
    s.cart,
  ]);
  const { useEventRegister } = useKeyEvents();

  const [categories, setCategories] = useState<Bennys.Components.Generic[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0);
  const [currentComponentId, setCurrentComponentId] = useState<number>(-1);

  // Fetch data and update current equipped to cart item
  const getData = async () => {
    const data = await nuiAction<Bennys.Components.Generic[]>(
      'bennys:getGenericData',
      { type: menuType },
      devData.genericData[menuType]
    );
    setCategories(data);
    startOnCartOrEquipped(data, currentCategoryId);
  };

  useEffect(() => {
    getData();
    showGuide();
    return () => {
      resetTitle();
      hideGuide();
    };
  }, []);

  const changeCategory = (newCat: number) => {
    previewPreviousOnChange();
    setCurrentCategoryId(newCat);
    startOnCartOrEquipped(categories, newCat);
  };

  useEffect(() => {
    const cat = categories[currentCategoryId];
    if (!cat) return;
    setTitle(cat.componentNames[currentComponentId + 1]);
    setIsInCart((getCartItemByComponent(cat.name)?.data as number) === currentComponentId);
    setEquipped(cat.equipped === currentComponentId);
    setPrice(pricePerComponent[cat.name]);
    nuiAction('bennys:preview', {
      name: cat.name,
      data: currentComponentId,
    });
  }, [currentCategoryId, currentComponentId, categories, cart]);

  const addToCart = useCallback(
    (componentId: number) => {
      componentId -= 2;
      const cat = categories[currentCategoryId];

      // If an item in cart remove it if you on the cartitem or equipped item
      // if no item in cart and you on equipped then do nothing
      // Else add to cart
      const cartItem = getCartItemByComponent(cat.name)?.data as number;
      if (cartItem !== undefined) {
        if (cartItem === componentId || cat.equipped === componentId) {
          removeItemFromCart(cat.name);
          return;
        }
      } else {
        if (cat.equipped === componentId) return;
      }
      addItemToCart(cat.name, componentId);
    },
    [currentCategoryId, categories]
  );

  // Reset previewed item to cartitem else equipped on leave
  const previewPreviousOnChange = useCallback(() => {
    const previousCategory = categories[currentCategoryId];
    const cartItem = getCartItemByComponent(previousCategory.name)?.data as number;
    nuiAction('bennys:preview', {
      name: previousCategory.name,
      data: cartItem ?? previousCategory.equipped,
    });
  }, [categories, currentCategoryId]);

  const exit = useCallback(() => {
    previewPreviousOnChange();
    goToMainMenu();
  }, [previewPreviousOnChange, goToMainMenu]);
  useEventRegister('Escape', exit);

  const startOnCartOrEquipped = (data: Bennys.Components.Generic[], categoryId: number) => {
    const cartItem = getCartItemByComponent(data[categoryId].name)?.data as number;
    setCurrentComponentId(cartItem ?? data[categoryId].equipped);
  };
  return (
    <>
      {categories.length !== 0 && (
        <CategorySlider
          value={currentCategoryId}
          options={categories.map(c => componentTitles[c.name])}
          onChange={changeCategory}
        >
          <IdSelector
            max={categories[currentCategoryId].componentNames.length}
            value={currentComponentId + 2}
            onChange={id => setCurrentComponentId(id - 2)}
            onSelect={addToCart}
          />
        </CategorySlider>
      )}
    </>
  );
};
