import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { useApps } from '../../base-app.config';
import { devData } from '../../lib/devdata';
import { isDevel } from '../../lib/env';
import { nuiAction } from '../../lib/nui-comms';

import { Eye } from './components/eye';
import { List } from './components/list';
import store from './store';

import './styles/peek.scss';

const Component: AppFunction<Peek.State> = props => {
  const { getCurrentAppType } = useApps();

  const showPeek = useCallback(() => {
    if (getCurrentAppType() === 'interactive') return;

    props.updateState({
      visible: true,
      hasTarget: false,
      showList: isDevel(),
      entries: isDevel() ? devData.peekEntries : [],
    });
  }, [getCurrentAppType]);

  const hidePeek = () => {
    props.updateState({
      visible: false,
      hasTarget: false,
      showList: false,
      entries: [],
    });
  };

  const handleEscape = () => {
    if (!props.showList) return;
    nuiAction('peek:hide');
  };

  const eventHandler = (data: { action: string; entries?: Peek.Entry[] }) => {
    switch (data.action) {
      case 'foundTarget':
        props.updateState({
          hasTarget: true,
          entries: data.entries,
        });
        break;
      case 'leftTarget':
        props.updateState({
          hasTarget: false,
        });
        break;
      case 'showOptions':
        props.updateState({
          showList: true,
        });
        break;
      default:
        throw new Error(`Unknown action in peek app: ${data.action}`);
    }
  };

  return (
    <AppWrapper
      appName={store.key}
      onShow={showPeek}
      onHide={hidePeek}
      onEvent={eventHandler}
      onEscape={handleEscape}
      full
    >
      <div className={'peek-wrapper'}>
        <Eye hasTarget={props.hasTarget} />
        <List entries={props.entries} show={props.showList} />
      </div>
    </AppWrapper>
  );
};

export default Component;
