import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppWrapper from '@components/appwrapper';
import { devData } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';
import { nuiAction } from '@src/lib/nui-comms';

import { usePhoneNotiStore } from '../phone/stores/usePhoneNotiStore';
import { usePhoneStore } from '../phone/stores/usePhoneStore';

import { Cash } from './component/Cash';
import { Compass } from './component/Compass';
import { HudBar } from './component/hudBar';
import { SpeedoMeter } from './component/Speedometer';
import { useHudStore } from './stores/useHudStore';
import config from './_config';

import './styles/hud.scss';

// voice, health, armor, food and thirst are hardcoded and
// have their own events. Extra entries can be registered via
// exports

const Component: AppFunction = props => {
  const [cashVisible, setCashVisible] = useState(false);
  const cashFlashTimeout = useRef<NodeJS.Timeout | null>(null);
  const phoneState = usePhoneStore(s => s.animating);
  const [phoneHasOnlyOneNotif, phoneNotifHasAction] = usePhoneNotiStore(s => {
    if (s.list.length !== 1) return [false, false];
    const firstNotif = s.list[0]; // we check length so will never be undefined
    return [true, firstNotif.onAccept || firstNotif.onDecline];
  });
  const [addEntry, deleteEntry, toggleEntry, updateStore, carVisible] = useHudStore(s => [
    s.addEntry,
    s.deleteEntry,
    s.toggleEntry,
    s.updateStore,
    s.car.visible,
  ]);

  const evtHandlers = useMemo(() => {
    return {
      setValues: (evt: any) => {
        updateStore({
          values: evt.values,
          voice: evt.voice,
        });
      },
      addEntry: (evt: any) => {
        addEntry(evt.data);
      },
      deleteEntry: (evt: any) => {
        deleteEntry(evt.data.name);
      },
      toggleEntry: (evt: any) => {
        toggleEntry(evt.data.name, evt.data.enabled);
      },
      setCarValues: (evt: any) => {
        updateStore({
          car: evt.data,
        });
      },
      setCompassValues: (evt: any) => {
        updateStore({
          compass: evt.data,
        });
      },
      flashCash: (evt: any) => {
        flashCash(evt.data as number);
      },
      addCashHistory: (evt: any) => {
        updateStore(state => ({
          cash: {
            ...state.cash,
            history: [evt.amount, ...state.cash.history],
          },
        }));
        flashCash(evt.data as number);
        setTimeout(() => {
          updateStore(state => ({
            cash: {
              ...state.cash,
              history: state.cash.history.slice(1),
            },
          }));
        }, 5000);
      },
    };
  }, [updateStore]);

  const showHud = useCallback(() => {
    props.showApp();
    if (isDevel()) {
      updateStore({
        values: devData.hudValues,
      });
    }
  }, []);

  const hideHud = useCallback(() => {
    props.hideApp();
  }, []);

  const fetchEntries = async () => {
    const entries = await nuiAction('hud/entries/get', {}, devData.hudEntries);
    updateStore({
      entries: entries,
    });
  };

  const flashCash = (cash: number) => {
    if (cashFlashTimeout.current) {
      clearTimeout(cashFlashTimeout.current);
      cashFlashTimeout.current = null;
    }
    setCashVisible(true);
    updateStore(state => ({
      cash: {
        ...state.cash,
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

  const showSpeedoMeter = phoneState === 'closed' || (phoneState === 'peek' && phoneHasOnlyOneNotif);

  return (
    <AppWrapper appName={config.name} onShow={showHud} onHide={hideHud} onEvent={handleEvents} full hideOverflow>
      <HudBar />
      {carVisible && showSpeedoMeter && (
        <SpeedoMeter offset={phoneState === 'closed' ? 0 : 9 + (phoneNotifHasAction ? 3.2 : 0)} />
      )}
      <Compass />
      {cashVisible && <Cash />}
    </AppWrapper>
  );
};

export default Component;
