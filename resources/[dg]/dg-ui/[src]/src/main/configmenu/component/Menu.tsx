import React from 'react';
import { useSelector } from 'react-redux';
import { Divider } from '@mui/material';

import { Button } from '../../../components/button';
import { useUpdateState } from '../../../lib/redux';
import { useConfigActions } from '../hooks/useConfigActions';

import { Hud } from './Hud';
import { Phone } from './Phone';
import { Radio } from './Radio';

const MENUS: ConfigMenu.Menu[] = ['radio', 'hud', 'phone'];

const MENU_COMPONENTS: Record<ConfigMenu.Menu, JSX.Element> = {
  radio: <Radio />,
  hud: <Hud />,
  phone: <Phone />,
};

const NavBar = () => {
  const activeMenu = useSelector<RootState, ConfigMenu.Menu>(state => state.configmenu.currentMenu);
  const updateState = useUpdateState('configmenu');
  const { saveConfig } = useConfigActions();

  const changeMenu = (menu: ConfigMenu.Menu) => {
    if (activeMenu === menu) return;
    updateState({
      currentMenu: menu,
    });
  };

  return (
    <div className={'configmenu-navbar'}>
      <div />
      <div className={'configmenu-navbar-center'}>
        {MENUS.map(m => (
          <div
            key={m}
            className={['configmenu-navbar-btn', activeMenu.toLowerCase() === m.toLowerCase() ? 'active' : ''].join(
              ' '
            )}
            onClick={() => changeMenu(m)}
          >
            {m.toUpperCase()}
          </div>
        ))}
      </div>
      <div>
        <Button.Primary onClick={() => saveConfig()}>SAVE</Button.Primary>
      </div>
    </div>
  );
};

export const Menu = () => {
  const activeMenu = useSelector<RootState, ConfigMenu.Menu>(state => state.configmenu.currentMenu);
  return (
    <div className={'configmenu'}>
      <NavBar />
      <Divider />
      <div className={'configmenu-wrapper'}>{MENU_COMPONENTS[activeMenu]}</div>
    </div>
  );
};
