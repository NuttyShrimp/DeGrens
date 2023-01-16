import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { LogList } from './components/Log';
import config from './_config';

import './styles/debuglogs.scss';

const Component: AppFunction = props => {
  const handleShow = useCallback(() => props.showApp(), []);
  const handleHide = useCallback(() => props.hideApp, []);
  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide}>
      <LogList />
    </AppWrapper>
  );
};

export default Component;
