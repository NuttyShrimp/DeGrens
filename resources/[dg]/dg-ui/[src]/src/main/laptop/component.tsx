import React, { useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import AppWrapper from '@components/appwrapper';
import { useMainStore } from '@src/lib/stores/useMainStore';

import { useActions } from './hooks/useActions';
import { Laptop } from './os/Laptop';
import { useLaptopConfigStore } from './stores/useLaptopConfigStore';
import config from './_config';

import './styles/laptop.scss';

const Component: AppFunction = props => {
  const { loadApps } = useActions();

  const showLaptop = useCallback(() => {
    props.showApp();
  }, []);

  const hideLaptop = useCallback(() => {
    props.hideApp();
  }, []);

  useEffect(() => {
    loadApps();
  }, []);

  // region Enabled Apps
  const laptopApps = useLaptopConfigStore(s => s.config);
  const [activeJob, hasVPN, whitelistedJobs] = useMainStore(s => [s.character.job, s.character.hasVPN, s.jobs]);
  const setLaptopConfig = useLaptopConfigStore(s => s.updateStore);

  useEffect(() => {
    const enabledApps: Laptop.Config.Config[] = [];
    laptopApps.forEach(app => {
      if (app.requiresVPN && !hasVPN) return;
      if (app.requiredJobs && activeJob && !app.requiredJobs.includes(activeJob)) return;
      if (app.blockedJobs && app.blockedJobs.some(j => whitelistedJobs.includes(j))) return;
      enabledApps.push(app);
    });
    setLaptopConfig({
      enabledApps: enabledApps,
    });
  }, [activeJob, laptopApps, hasVPN, whitelistedJobs]);
  // endregion

  return (
    <AppWrapper appName={config.name} onShow={showLaptop} onHide={hideLaptop} hideOnEscape full center>
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <Laptop {...props} />
      </DndProvider>
    </AppWrapper>
  );
};

export default Component;
