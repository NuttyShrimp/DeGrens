import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { Bar } from './components/bar';
import config from './_config';

import './styles/cli.scss';

const Component: AppFunction = props => {
  const handleShow = useCallback(() => props.showApp(), [props.showApp]);
  const handleHide = useCallback(() => props.hideApp(), [props.hideApp]);
  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} center>
      <Bar />
    </AppWrapper>
  );
};

export default Component;
