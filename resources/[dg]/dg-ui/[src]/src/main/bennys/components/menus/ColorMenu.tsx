import React, { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { devData } from '../../../../lib/devdata';
import { useDebounce } from '../../../../lib/hooks/useDebounce';
import { nuiAction } from '../../../../lib/nui-comms';
import { componentTitles } from '../../data/componentTitles';
import { getDataOfGTAColorById, getDataOfGTAColorByRGB, getRGBOfColor } from '../../data/gtacolors';
import { useCart } from '../../hooks/useCart';
import { useGuide, useInformationBar } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { compareRGB } from '../../utils/rgbComparator';
import { CategorySlider } from '../CategorySlider';
import { GTAColorPicker } from '../ColorPickers/GTAColorPicker';
import { ColorSelector } from '../selectors/ColorSelector';

const isSameColor = (a: RGB | number, b: RGB | number) => {
  const typeA = typeof a;
  if (typeA !== typeof b) return false;
  if (typeA === 'number') {
    return a === b;
  } else {
    return compareRGB(a as RGB, b as RGB);
  }
};

export const ColorMenu: FC<{ goToMainMenu: () => void }> = ({ goToMainMenu }) => {
  const { setTitle, resetTitle, setEquipped, setIsInCart, setPrice } = useInformationBar();
  const { showGuide, hideGuide } = useGuide({
    title: 'Add to cart',
    kbdCombo: ['Enter'],
  });
  const { addItemToCart, getCartItemByComponent, removeItemFromCart } = useCart();
  const { useEventRegister } = useKeyEvents();

  const pricesPerColor = useSelector<RootState, Bennys.State['prices']>(state => state.bennys.prices);

  const [categories, setCategories] = useState<Bennys.Components.Color[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0);
  const [currentColor, setCurrentColor] = useState<RGB | number>(0);

  // Fetch data and update current equipped to cart item
  const getData = async () => {
    const data = await nuiAction<Bennys.Components.Color[]>(
      'bennys:getGenericData',
      { type: 'colors' },
      devData.genericData['colors']
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

  const debouncedColor = useDebounce(currentColor, 300);
  useEffect(() => {
    if (debouncedColor === undefined) return;
    if (!categories[currentCategoryId]) return;
    nuiAction('bennys:preview', {
      name: categories[currentCategoryId].name,
      data: debouncedColor,
    });
  }, [debouncedColor]);

  const setSelectedColor = (type: Bennys.ColorSelector.Type, rgb: RGB) => {
    const color = type === 'gta' ? getDataOfGTAColorByRGB(rgb)?.id ?? rgb : rgb;
    setCurrentColor(color);
  };

  useEffect(() => {
    const cat = categories[currentCategoryId];
    if (!cat) return;
    if (typeof currentColor === 'number') {
      setTitle(getDataOfGTAColorById(currentColor)?.name ?? 'Color');
    } else {
      setTitle('Color');
    }

    setEquipped(isSameColor(currentColor, cat.equipped));
    const cartItem = getCartItemByComponent(cat.name)?.data as number | RGB;
    setIsInCart(isSameColor(currentColor, cartItem));
    setPrice(pricesPerColor[cat.name]);
  }, [currentCategoryId, categories, currentColor, getCartItemByComponent]);

  const changeCategory = (newCat: number) => {
    previewPreviousOnChange();
    setCurrentCategoryId(newCat);
    startOnCartOrEquipped(categories, newCat);
  };

  const addToCart = useCallback(
    (type: Bennys.ColorSelector.Type, rgb: RGB) => {
      const cat = categories[currentCategoryId];
      const color = type === 'gta' ? getDataOfGTAColorByRGB(rgb)?.id ?? rgb : rgb;

      // If an item in cart remove it if you on the cartitem or equipped item
      // if no item in cart and you on equipped then do nothing
      // Else add to cart
      const cartItem = getCartItemByComponent(cat.name)?.data as RGB | number;
      if (cartItem !== undefined) {
        if (isSameColor(cartItem, color) || isSameColor(cat.equipped, color)) {
          removeItemFromCart(cat.name);
          return;
        }
      } else {
        if (isSameColor(cat.equipped, color)) return;
      }
      addItemToCart(cat.name, color);
    },
    [currentCategoryId, categories, getCartItemByComponent]
  );

  // Reset previewed item to cartitem else equipped on leave
  const previewPreviousOnChange = useCallback(() => {
    const previousCategory = categories[currentCategoryId];
    const color = (getCartItemByComponent(previousCategory.name)?.data as number | RGB) ?? previousCategory.equipped;
    nuiAction('bennys:preview', {
      name: previousCategory.name,
      data: color,
    });
  }, [categories, currentCategoryId, getCartItemByComponent]);

  const exit = useCallback(() => {
    previewPreviousOnChange();
    goToMainMenu();
  }, [previewPreviousOnChange, goToMainMenu]);
  useEventRegister('Escape', exit);

  const startOnCartOrEquipped = useCallback(
    (data: Bennys.Components.Color[], categoryId: number) => {
      const color = (getCartItemByComponent(data[categoryId].name)?.data as number | RGB) ?? data[categoryId].equipped;
      setCurrentColor(color);
    },
    [getCartItemByComponent]
  );

  return (
    <>
      {categories.length !== 0 && (
        <CategorySlider
          options={categories.map(c => componentTitles[c.name])}
          value={currentCategoryId}
          onChange={changeCategory}
        >
          {[0, 1].includes(currentCategoryId) ? (
            <ColorSelector
              value={currentColor}
              onChange={setSelectedColor}
              onSelect={addToCart}
              category={categories[currentCategoryId]}
            />
          ) : (
            <GTAColorPicker value={getRGBOfColor(currentColor)} onChange={setSelectedColor} onSelect={addToCart} />
          )}
        </CategorySlider>
      )}
    </>
  );
};
