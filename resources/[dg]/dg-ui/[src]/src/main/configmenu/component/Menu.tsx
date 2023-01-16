import React from 'react';
import { Divider } from '@mui/material';

import { Button } from '../../../components/button';
import { useConfigmenuStore } from '../stores/useConfigmenuStore';

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
  const [activeMenu, saveConfig, setMenu] = useConfigmenuStore(s => [s.currentMenu, s.saveConfig, s.setMenu]);

  const changeMenu = (menu: ConfigMenu.Menu) => {
    if (activeMenu === menu) return;
    setMenu(menu);
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
  const activeMenu = useConfigmenuStore(s => s.currentMenu);
  return (
    <div className={'configmenu'}>
      <NavBar />
      <Divider />
      <div className={'configmenu-wrapper'}>{MENU_COMPONENTS[activeMenu]}</div>
    </div>
  );
};
