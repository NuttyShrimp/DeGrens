import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';
import deepmerge from 'deepmerge';

import { nuiAction } from '../../lib/nui-comms';

import { Menu } from './component/Menu';
import store from './store';

import './styles/configmenu.scss';

const Component: AppFunction<ConfigMenu.State> = props => {
  const showMenu = useCallback(() => {
    props.updateState({
      visible: true,
    });
  }, []);

  const hideMenu = useCallback(() => {
    props.updateState({
      visible: false,
    });
  }, []);

  const handleEvent = useCallback(data => {
    if (!data.action) return;
    switch (data.action) {
      case 'load': {
        const newConfig = deepmerge(
          {
            hud: props.hud,
            phone: props.phone,
            radio: props.radio,
          },
          data.data
        );
        props.updateState(newConfig);
        nuiAction('configmenu/save', {
          data: newConfig,
        });
        break;
      }
    }
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={showMenu} onHide={hideMenu} onEvent={handleEvent} full center hideOnEscape>
      <Menu />
    </AppWrapper>
  );
};

export default Component;
