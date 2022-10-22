import React, { useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useSelector } from 'react-redux';
import AppWrapper from '@components/appwrapper';

import { useUpdateState } from '../../lib/redux';

import { useActions } from './hooks/useActions';
import { Laptop } from './os/Laptop';
import store from './store';

import './styles/laptop.scss';

const Component: AppFunction<Laptop.State> = props => {
  const { loadApps } = useActions();

  const showLaptop = useCallback(() => {
    props.updateState({
      visible: true,
    });
  }, []);

  const hideLaptop = useCallback(() => {
    props.updateState({
      visible: false,
    });
  }, []);

  useEffect(() => {
    loadApps();
  }, []);

  // region Enabled Apps
  const laptopApps = useSelector<RootState, Laptop.Config.Config[]>(state => state['laptop.config'].config);
  const activeJob = useSelector<RootState, string | undefined>(state => state.character.job);
  const hasVPN = useSelector<RootState, boolean>(state => state.character.hasVPN);
  const setLaptopConfig = useUpdateState('laptop.config');

  useEffect(() => {
    const enabledApps: Laptop.Config.Config[] = [];
    laptopApps.forEach(app => {
      if (app.requiresVPN && !hasVPN) return;
      if (app.requiredJobs && activeJob && !app.requiredJobs.includes(activeJob)) return;
      // TODO: Check for all whitelisted jobs, not only on duty
      if (app.blockedJobs && activeJob && app.blockedJobs.includes(activeJob)) return;
      enabledApps.push(app);
    });
    setLaptopConfig({
      enabledApps: enabledApps,
    });
  }, [activeJob, laptopApps, hasVPN]);
  // endregion

  return (
    <AppWrapper appName={store.key} onShow={showLaptop} onHide={hideLaptop} hideOnEscape full center>
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <Laptop {...props} />
      </DndProvider>
    </AppWrapper>
  );
};

export default Component;
