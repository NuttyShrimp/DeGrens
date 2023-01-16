import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { Scenes } from './components/scenes';
import config from './_config';

import './styles/scenes.scss';

const Component: AppFunction = props => {
  const handleShow = useCallback(() => props.showApp(), [props.showApp]);
  const handleHide = useCallback(() => props.hideApp(), [props.hideApp]);

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} hideOnEscape full center>
      <Scenes />
    </AppWrapper>
  );
};
export default Component;
