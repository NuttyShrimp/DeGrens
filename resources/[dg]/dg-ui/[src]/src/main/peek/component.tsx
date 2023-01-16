import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { devData } from '../../lib/devdata';
import { isDevel } from '../../lib/env';
import { useApps } from '../../lib/hooks/useApps';
import { nuiAction } from '../../lib/nui-comms';

import { Eye } from './components/eye';
import { List } from './components/list';
import { usePeekStore } from './stores/usePeekStore';
import config from './_config';

import './styles/peek.scss';

const Component: AppFunction = props => {
  const { getCurrentAppType } = useApps();
  const updateStore = usePeekStore(s => s.updateStore);

  const showPeek = useCallback(() => {
    if (getCurrentAppType() === 'interactive') {
      nuiAction('peek:preventShow');
      return;
    }

    updateStore({
      hasTarget: false,
      showList: isDevel(),
      entries: isDevel() ? devData.peekEntries : [],
    });
    props.showApp();
  }, [getCurrentAppType, props.showApp]);

  const hidePeek = useCallback(() => {
    props.hideApp();
    updateStore({
      hasTarget: false,
      showList: false,
      entries: [],
    });
  }, [props.hideApp]);

  const eventHandler = useCallback((data: { action: string; entries?: Peek.Entry[] }) => {
    switch (data.action) {
      case 'foundTarget':
        updateStore({
          hasTarget: true,
          entries: data.entries,
        });
        break;
      case 'leftTarget':
        updateStore({
          hasTarget: false,
        });
        break;
      case 'showOptions':
        updateStore({
          showList: true,
        });
        break;
      default:
        throw new Error(`Unknown action in peek app: ${data.action}`);
    }
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={showPeek} onHide={hidePeek} onEvent={eventHandler} full>
      <div className={'peek-wrapper'}>
        <Eye />
        <List />
      </div>
    </AppWrapper>
  );
};

export default Component;
