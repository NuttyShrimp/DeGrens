import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardKey } from '@src/lib/hooks/useKeyboardKey';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { useGuide } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { useBennyStore } from '../../stores/useBennyStore';
import { CategorySlider } from '../CategorySlider';
import { IdSelector } from '../IdSelector';

const isSameWheel = (
  a: Bennys.Components.Wheels['equipped'] | undefined,
  b: Bennys.Components.Wheels['equipped'] | undefined
) => {
  if (!a || !b) return false;
  return a.type === b.type && a.id === b.id;
};

export const WheelsMenu: FC<{ goToMainMenu: () => void }> = ({ goToMainMenu }) => {
  const [
    addItemToCart,
    getCartItemByComponent,
    removeItemFromCart,
    setTitle,
    setEquipped,
    resetTitle,
    setIsInCart,
    setPrice,
    priceForWheels,
    cart,
  ] = useBennyStore(s => [
    s.addToCart,
    s.getCartItemForComp,
    s.removeFromCart,
    s.setBarTitle,
    s.setEquipped,
    s.resetTitleBar,
    s.setInCart,
    s.setBarPrice,
    s.prices.wheels ?? 0,
    s.cart,
  ]);
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
  const { useEventRegister } = useKeyEvents();

  const [categories, setCategories] = useState<Bennys.Components.Wheels['categories']>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0);
  const [currentComponentId, setCurrentComponentId] = useState<number>(-1);
  const [equippedWheel, setEquippedWheel] = useState<{ type: number; id: number }>();

  // Fetch data and update current equipped to cart item
  const getData = async () => {
    const data = await nuiAction<Bennys.Components.Wheels>('bennys:getWheelData', {}, devData.wheelData);
    setCategories(data.categories);
    setEquippedWheel(data.equipped);

    // Start on cartitem else equipped
    const startWheel =
      (getCartItemByComponent('wheels')?.data as Bennys.Components.Wheels['equipped']) ?? data.equipped;
    const startCategoryId = data.categories.findIndex(cat => cat.id === startWheel.type);
    setCurrentCategoryId(startCategoryId === -1 ? 0 : startCategoryId);
    setCurrentComponentId(startWheel.id);
  };

  useEffect(() => {
    getData();
    showGuide();
    setPrice(priceForWheels);
    return () => {
      resetTitle();
      hideGuide();
    };
  }, []);

  const addToCart = useCallback(
    (componentId: number) => {
      const added = { type: categories[currentCategoryId].id, id: componentId - 2 };

      // If an item in cart remove it if you on the cartitem or equipped item
      // if no item in cart and you on equipped then do nothing
      // Else add to cart
      const cartItem = getCartItemByComponent('wheels')?.data as { type: number; id: number };
      if (cartItem !== undefined) {
        if (isSameWheel(added, cartItem) || isSameWheel(added, equippedWheel)) {
          removeItemFromCart('wheels');
          return;
        }
      } else {
        if (isSameWheel(added, equippedWheel)) return;
      }
      addItemToCart('wheels', added);
    },
    [currentCategoryId, categories, equippedWheel]
  );

  const changeCategory = (newCat: number) => {
    setCurrentCategoryId(newCat);
    const cartItem = getCartItemByComponent('wheels')?.data as Bennys.Components.Wheels['equipped'];
    const startId =
      cartItem?.type === categories[newCat].id
        ? cartItem?.id
        : equippedWheel?.type === categories[newCat].id
        ? equippedWheel.id
        : -1;
    setCurrentComponentId(startId);
  };

  useEffect(() => {
    if (!categories[currentCategoryId]) return;
    const currentWheel = { type: categories[currentCategoryId].id, id: currentComponentId };
    setTitle(categories[currentCategoryId].componentNames[currentComponentId + 1]);
    const cartItem = getCartItemByComponent('wheels')?.data as { type: number; id: number };
    setIsInCart(isSameWheel(cartItem, currentWheel));
    setEquipped(isSameWheel(equippedWheel, currentWheel));
    nuiAction('bennys:preview', {
      name: 'wheels',
      data: {
        type: categories[currentCategoryId].id,
        id: currentComponentId,
      },
    });
  }, [currentCategoryId, currentComponentId, categories, equippedWheel, cart]);

  // Reset previewed item to cartitem else equipped on leave
  const previewPreviousOnChange = useCallback(() => {
    const previewWheel = getCartItemByComponent('wheels')?.data ?? equippedWheel;
    nuiAction('bennys:preview', {
      name: 'wheels',
      data: previewWheel,
    });
  }, [equippedWheel]);

  const exit = useCallback(() => {
    previewPreviousOnChange();
    goToMainMenu();
  }, [goToMainMenu, previewPreviousOnChange]);
  useEventRegister('Escape', exit);

  if (categories.length === 0) return null;

  return (
    <CategorySlider value={currentCategoryId} options={categories.map(c => c.label)} onChange={changeCategory}>
      <IdSelector
        max={categories[currentCategoryId]?.componentNames.length ?? 0}
        value={currentComponentId + 2}
        onChange={id => setCurrentComponentId(id - 2)}
        onSelect={addToCart}
      />
    </CategorySlider>
  );
};
