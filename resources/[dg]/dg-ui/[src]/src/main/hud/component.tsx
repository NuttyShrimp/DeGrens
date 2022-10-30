import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
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
  const phoneOpen = useSelector<RootState, boolean>(state => state.phone.animating !== 'closed');

  const evtHandlers = useMemo(() => {
    return {
      setValues: (evt: any) => {
        props.updateState({
          values: evt.values,
          voice: evt.voice,
        });
      },
      addEntry: (evt: any) => {
        props.updateState(state => ({
          entries: [...state.hud.entries, evt.data as Hud.Entry].sort((e1, e2) => e1.order - e2.order),
        }));
      },
      deleteEntry: (evt: any) => {
        props.updateState(state => ({
          entries: state.hud.entries.filter(e => e.name !== evt.data.name),
        }));
      },
      toggleEntry: (evt: any) => {
        props.updateState(state => ({
          entries: state.hud.entries.map(e => {
            if (e.name === evt.data.name) {
              e.enabled = evt.data.enabled;
            }
            return e;
          }),
        }));
      },
      setCarValues: (evt: any) => {
        props.updateState({
          car: evt.data,
        });
      },
      setCompassValues: (evt: any) => {
        props.updateState({
          compass: evt.data,
        });
      },
      flashCash: (evt: any) => {
        flashCash(evt.data as number);
      },
      addCashHistory: (evt: any) => {
        props.updateState(state => ({
          cash: {
            ...state.hud.cash,
            history: [evt.amount, ...state.hud.cash.history],
          },
        }));
        flashCash(evt.data as number);
        setTimeout(() => {
          props.updateState(state => ({
            cash: {
              ...state.hud.cash,
              history: state.hud.cash.history.slice(1),
            },
          }));
        }, 5000);
      },
    };
  }, [props.updateState]);

  const showHud = useCallback(() => {
    props.updateState({
      visible: true,
    });
    if (isDevel()) {
      props.updateState({
        values: devData.hudValues,
      });
    }
  }, []);

  const hideHud = useCallback(() => {
    props.updateState({
      visible: false,
    });
  }, []);

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
    props.updateState(state => ({
      cash: {
        ...state.hud.cash,
        current: cash,
      },
    }));
    cashFlashTimeout.current = setTimeout(() => {
      setCashVisible(false);
    }, 5000);
  };

  const handleEvents = useCallback(
    evt => {
      if (!evtHandlers[evt.action]) return;
      evtHandlers[evt.action](evt);
    },
    [evtHandlers]
  );

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={showHud} onHide={hideHud} onEvent={handleEvents} full>
      <HudBar voice={props.voice} values={props.values} entries={props.entries} />
      {props.car.visible && !phoneOpen && <SpeedoMeter />}
      <Compass {...props.compass} />
      {cashVisible && <Cash {...props.cash} />}
    </AppWrapper>
  );
};

export default Component;
