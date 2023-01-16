import React, { FC, useCallback, useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import useMeasure from 'react-use-measure';
import Logo from '@assets/bennys/bennysmotorwork-logo.png';
import { Typography } from '@mui/material';
import { modulo } from '@src/lib/util';

import { nuiAction } from '../../../../lib/nui-comms';
import { menuTitles } from '../../data/menuTitles';
import { selectableMenuTypeToId } from '../../enum/selectableMenuTypeToId';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { useBennyStore } from '../../stores/useBennyStore';

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

export const MainMenu = () => {
  const [selectedMenu, setSelectedMenu] = useState<Bennys.SelectableMenu>('colors'); // colors for ingame, cart for browser
  const [activeMenus, setActiveMenus] = useState<Bennys.SelectableMenu[]>([]);
  const { useEventRegister } = useKeyEvents();
  const [cart, setPrice, currectCost, setMenu] = useBennyStore(s => [s.cart, s.setBarPrice, s.currentCost, s.setMenu]);

  const fetchActiveMenus = async () => {
    const active = await nuiAction<Bennys.SelectableMenu[]>('bennys:getActiveMenus', {}, [
      'colors',
      'interior',
      'exterior',
      'wheels',
      'extras',
    ]);
    const cartLength = cart.length;
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
    setMenu(selectedMenu as Bennys.Menu);
  }, [selectedMenu, setMenu]);
  useEventRegister('Enter', enterMenu);

  const exitBennys = useCallback(() => {
    const cartLength = cart.length;
    if (cartLength === 0) {
      nuiAction('bennys:exit');
    } else {
      setMenu('cart');
    }
  }, [cart, setMenu]);
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
