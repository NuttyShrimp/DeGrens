import React, { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { animated, useSpring } from 'react-spring';
import useMeasure from 'react-use-measure';
import Logo from '@assets/bennys/bennysmotorwork-logo.png';
import { Typography } from '@mui/material';
import { modulo } from '@src/lib/util';

import { nuiAction } from '../../../../lib/nui-comms';
import { menuTitles } from '../../data/menuTitles';
import { selectableMenuTypeToId } from '../../enum/selectableMenuTypeToId';
import { useCart } from '../../hooks/useCart';
import { useInformationBar } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';

import '../../styles/mainMenu.scss';

export const MainMenuEntry: FC<{ title: string; selected: boolean }> = ({ title, selected }) => {
  const [ref, { height }] = useMeasure();
  const styles = useSpring({
    from: {
      height: 0,
      opacity: 0,
    },
    to: {
      height: selected ? height / 2 : 0,
      opacity: selected ? 1 : 0,
    },
    reverse: !selected,
  });
  return (
    <div className={`bennys-main-menu-entry`} ref={ref}>
      <Typography variant='h6'>{title}</Typography>
      <animated.div className={`bennys-main-menu-entry-selected`} style={styles}>
        {selected && (
          <Typography variant='h6' fontWeight={700}>
            Selected
          </Typography>
        )}
      </animated.div>
    </div>
  );
};

const findSelectableMenu = (
  active: Bennys.SelectableMenu[],
  current: Bennys.SelectableMenu,
  offset: -1 | 1
): Bennys.SelectableMenu => {
  const data: { id: number; name: Bennys.SelectableMenu }[] = active.map(name => ({
    id: selectableMenuTypeToId[name],
    name,
  }));
  if (data.length < 2) return current;
  const maxId = data[data.length - 1].id + 1;
  let newId = modulo(selectableMenuTypeToId[current] + offset, maxId);
  let found: Bennys.SelectableMenu | null = null;
  while (!found) {
    const menuForId = data.find(d => d.id === newId);
    if (menuForId) {
      found = menuForId.name;
    } else {
      newId = modulo(newId + offset, maxId);
    }
  }
  return found;
};

export const MainMenu: FC<{ updateState: UpdateState<Bennys.State> }> = ({ updateState }) => {
  const [selectedMenu, setSelectedMenu] = useState<Bennys.SelectableMenu>('colors'); // colors for ingame, cart for browser
  const [activeMenus, setActiveMenus] = useState<Bennys.SelectableMenu[]>([]);
  const { useEventRegister } = useKeyEvents();
  const { getCartItems } = useCart();
  const { setPrice } = useInformationBar();
  const currectCost = useSelector<RootState, number>(state => state.bennys.currentCost);

  const fetchActiveMenus = async () => {
    const active = await nuiAction<Bennys.SelectableMenu[]>('bennys:getActiveMenus', {}, [
      'colors',
      'interior',
      'exterior',
      'wheels',
      'extras',
    ]);
    const cartLength = getCartItems().length;
    if (cartLength !== 0) {
      active.push('cart');
    }
    active.sort((a, b) => (selectableMenuTypeToId[a] < selectableMenuTypeToId[b] ? -1 : 1));
    setActiveMenus(active);
  };

  useEffect(() => {
    fetchActiveMenus();
  }, []);

  useEffect(() => {
    setPrice(currectCost);
  }, [currectCost]);

  const moveLeft = useCallback(() => {
    setSelectedMenu(oldMenu => findSelectableMenu(activeMenus, oldMenu, -1));
  }, [activeMenus]);
  const moveRight = useCallback(() => {
    setSelectedMenu(oldMenu => findSelectableMenu(activeMenus, oldMenu, 1));
  }, [activeMenus]);
  useEventRegister('ArrowLeft', moveLeft);
  useEventRegister('ArrowRight', moveRight);

  const enterMenu = useCallback(() => {
    updateState({
      currentMenu: selectedMenu as Bennys.Menu,
    });
  }, [selectedMenu, updateState]);
  useEventRegister('Enter', enterMenu);

  const exitBennys = useCallback(() => {
    const cartLength = getCartItems().length;
    if (cartLength === 0) {
      nuiAction('bennys:exit');
    } else {
      updateState({
        currentMenu: 'cart' as Bennys.Menu,
      });
    }
  }, [getCartItems, updateState]);
  useEventRegister('Escape', exitBennys);

  return (
    <>
      <div className={'bennys-main-menu'}>
        <div className={'bennys-main-menu-entry img'}>
          <img src={Logo} alt={"Benny's motorwork logo"} />
        </div>
        {activeMenus.map((menu, key) => (
          <MainMenuEntry key={`menu_entry_${key}`} title={menuTitles[menu]} selected={selectedMenu === menu} />
        ))}
      </div>
    </>
  );
};
