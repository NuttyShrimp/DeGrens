import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { TaskBar } from './component/TaskBar';
import store from './store';

import './styles/taskbar.scss';

const Component: AppFunction<TaskBar.State> = props => {
  const showInput = useCallback((data: Partial<TaskBar.State>) => {
    data.duration = Number(data.duration);
    props.updateState({
      visible: true,
      ...data,
    });
  }, []);

  const hideInput = useCallback(() => {
    props.updateState({
      visible: false,
    });
  }, []);

  const handleEvent = useCallback(data => {
    if (data.action === 'cancel') {
      props.updateState({
        duration: 1000,
        label: 'Geannuleerd',
      });
    }
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={showInput} onHide={hideInput} onEvent={handleEvent} full center>
      <TaskBar {...props} />
    </AppWrapper>
  );
};

export default Component;
