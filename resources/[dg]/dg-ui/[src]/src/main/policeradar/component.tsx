import React, { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import { Policeradar } from './components/policeradar';
import config from './_config';

import './styles/policeradar.scss';

const zeroPad = (n: number) => String(n).padStart(3, '0');

const Component: AppFunction = props => {
  const [currentSpeed, setCurrentSpeed] = useState('000');
  const [topSpeed, setTopSpeed] = useState('000');
  const [plate, setPlate] = useState('--------');
  const [flagged, setFlagged] = useState(false);
  const [locked, setLocked] = useState(false);

  const eventHandler = useCallback((data: any) => {
    setCurrentSpeed(zeroPad(data.currentSpeed));
    setTopSpeed(zeroPad(data.topSpeed));
    setPlate(data.plate);
    setFlagged(data.flagged);
    setLocked(data.locked);
  }, []);

  const handleShow = useCallback(() => props.showApp(), [props.showApp]);
  const handleHide = useCallback(() => props.hideApp(), [props.hideApp]);

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} onEvent={eventHandler} unSelectable>
      <Policeradar currentSpeed={currentSpeed} topSpeed={topSpeed} plate={plate} flagged={flagged} locked={locked} />
    </AppWrapper>
  );
};

export default Component;
