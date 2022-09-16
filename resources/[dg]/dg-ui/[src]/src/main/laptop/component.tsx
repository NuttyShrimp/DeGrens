import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import AppWrapper from '@components/appwrapper';

import { useUpdateState } from '../../lib/redux';

import { useActions } from './hooks/useActions';
import { Laptop } from './os/Laptop';
import store from './store';

import './styles/laptop.scss';

const Component: AppFunction<Laptop.State> = props => {
  const { loadApps } = useActions();

  const showLaptop = () => {
    props.updateState({
      visible: true,
    });
  };

  const hideLaptop = () => {
    props.updateState({
      visible: false,
    });
    return true;
  };

  useEffect(() => {
    loadApps();
  }, []);

  // region Enabled Apps
  const laptopApps = useSelector<RootState, Laptop.Config.Config[]>(state => state['laptop.config'].config);
  const activeJob = useSelector<RootState, string | undefined>(state => state.character.job);
  const hasVPN = useSelector<RootState, boolean>(state => state.character.hasVPN);
  const setLaptopConfig = useUpdateState('laptop.config');

  useEffect(() => {
    // @ts-ignore
    const enabledApps: Laptop.Config[] = [];
    laptopApps.forEach(app => {
      if (app.requiresVPN && !hasVPN) {
        return;
      }
      if (app.requiredJobs && activeJob && !app.requiredJobs.includes(activeJob)) {
        return;
      }
      enabledApps.push(app);
    });
    setLaptopConfig({
      enabledApps: enabledApps,
    });
  }, [activeJob, laptopApps, hasVPN]);
  // endregion

  return (
    <AppWrapper appName={store.key} onShow={showLaptop} onHide={hideLaptop} hideOnEscape full center>
      <Laptop {...props} />
    </AppWrapper>
  );
};

export default Component;
