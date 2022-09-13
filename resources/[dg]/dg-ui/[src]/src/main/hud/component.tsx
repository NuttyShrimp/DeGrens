import React, { useEffect, useRef, useState } from 'react';
import AppWrapper from '@components/appwrapper';
import { devData } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';
import { nuiAction } from '@src/lib/nui-comms';

import { Cash } from './component/Cash';
import { Compass } from './component/Compass';
import { HudBar } from './component/hudBar';
import { SpeedoMeter } from './component/Speedometer';
import store from './store';

import './styles/hud.scss';

// voice, health, armor, food and thirst are hardcoded and
// have their own events. Extra entries can be registered via
// exports

const Component: AppFunction<Hud.State> = props => {
  const [cashVisible, setCashVisible] = useState(false);
  const cashFlashTimeout = useRef<NodeJS.Timeout | null>(null);

  const showHud = () => {
    props.updateState({
      visible: true,
    });
    if (isDevel()) {
      props.updateState({
        values: devData.hudValues,
      });
    }
  };

  const hideHud = () => {
    props.updateState({
      visible: false,
    });
  };

  const fetchEntries = async () => {
    const entries = await nuiAction('hud/entries/get', {}, devData.hudEntries);
    props.updateState({
      entries: entries,
    });
  };

  const flashCash = (cash: number) => {
    if (cashFlashTimeout.current) {
      clearTimeout(cashFlashTimeout.current);
      cashFlashTimeout.current = null;
    }
    setCashVisible(true);
    props.updateState({
      cash: {
        ...props.cash,
        current: cash,
      },
    });
    cashFlashTimeout.current = setTimeout(() => {
      setCashVisible(false);
    }, 5000);
  };

  const handleEvents = evt => {
    switch (evt.action) {
      case 'setValues':
        props.updateState({
          values: evt.values,
          voice: evt.voice,
        });
        break;
      case 'addEntry':
        props.updateState({
          entries: [...props.entries, evt.data as Hud.Entry].sort((e1, e2) => e1.order - e2.order),
        });
        break;
      case 'deleteEntry':
        props.updateState({
          entries: props.entries.filter(e => e.name !== evt.data.name),
        });
        break;
      case 'toggleEntry':
        props.updateState({
          entries: props.entries.map(e => {
            if (e.name === evt.data.name) {
              e.enabled = evt.data.enabled;
            }
            return e;
          }),
        });
        break;
      case 'setCarValues':
        props.updateState({
          car: evt.data,
        });
        break;
      case 'setCompassValues':
        props.updateState({
          compass: evt.data,
        });
        break;
      case 'flashCash':
        flashCash(evt.data as number);
        break;
      case 'addCashHistory':
        props.updateState({
          cash: {
            ...props.cash,
            history: [...props.cash.history, evt.data],
          },
        });
        flashCash(evt.amount as number);
        setTimeout(() => {
          props.updateState(state => ({
            cash: {
              ...state.hud.cash,
              history: state.hud.cash.history.slice(1),
            },
          }));
        }, 5000);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={showHud} onHide={hideHud} onEvent={handleEvents} full>
      <HudBar voice={props.voice} values={props.values} entries={props.entries} />
      {props.car.visible && <SpeedoMeter car={props.car} />}
      <Compass {...props.compass} />
      {cashVisible && <Cash {...props.cash} />}
    </AppWrapper>
  );
};

export default Component;
