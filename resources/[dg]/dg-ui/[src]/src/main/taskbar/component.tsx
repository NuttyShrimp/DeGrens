import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { TaskBar } from './component/TaskBar';
import { useTaskbarStore } from './stores/useTaskbarStore';
import config from './_config';

import './styles/taskbar.scss';

const Component: AppFunction = props => {
  const updateStore = useTaskbarStore(s => s.updateStore);
  const showInput = useCallback(
    (data: Partial<TaskBar.State>) => {
      data.duration = Number(data.duration);
      props.showApp();
      updateStore({
        ...data,
      });
    },
    [props.showApp, updateStore]
  );

  const hideInput = useCallback(() => {
    props.hideApp();
  }, [props.hideApp]);

  const handleEvent = useCallback(data => {
    if (data.action === 'cancel') {
      updateStore({
        duration: 1000,
        label: 'Geannuleerd',
      });
    }
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={showInput} onHide={hideInput} onEvent={handleEvent} full center>
      <TaskBar />
    </AppWrapper>
  );
};

export default Component;
