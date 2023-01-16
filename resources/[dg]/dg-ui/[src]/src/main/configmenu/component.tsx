import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { nuiAction } from '../../lib/nui-comms';

import { Menu } from './component/Menu';
import { useConfigmenuStore } from './stores/useConfigmenuStore';
import config from './_config';

import './styles/configmenu.scss';

const Component: AppFunction = props => {
  const [setConfig] = useConfigmenuStore(s => [s.setConfig]);
  const showMenu = useCallback(() => {
    props.showApp();
  }, []);

  const hideMenu = useCallback(() => {
    props.hideApp();
  }, []);

  const handleEvent = useCallback(data => {
    if (!data.action) return;
    switch (data.action) {
      case 'load': {
        nuiAction('configmenu/save', {
          data: setConfig(data.data),
        });
        break;
      }
    }
  }, []);

  return (
    <AppWrapper
      appName={config.name}
      onShow={showMenu}
      onHide={hideMenu}
      onEvent={handleEvent}
      full
      center
      hideOnEscape
    >
      <Menu />
    </AppWrapper>
  );
};

export default Component;
