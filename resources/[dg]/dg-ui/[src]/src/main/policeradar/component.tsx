import React, { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import { Policeradar } from './components/policeradar';
import store from './store';

import './styles/policeradar.scss';

const zeroPad = (n: number) => String(n).padStart(3, '0');

const Component: AppFunction<Policeradar.State> = props => {
  const [currentSpeed, setCurrentSpeed] = useState('000');
  const [topSpeed, setTopSpeed] = useState('000');
  const [plate, setPlate] = useState('--------');
  const [flagged, setFlagged] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleVisibility = (visible: boolean) => {
    props.updateState(() => ({ visible }));
  };

  const eventHandler = useCallback((data: any) => {
    setCurrentSpeed(zeroPad(data.currentSpeed));
    setTopSpeed(zeroPad(data.topSpeed));
    setPlate(data.plate);
    setFlagged(data.flagged);
    setLocked(data.locked);
  }, []);

  const handleShow = useCallback(() => handleVisibility(true), []);
  const handleHide = useCallback(() => handleVisibility(false), []);

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} onEvent={eventHandler} unSelectable>
      <Policeradar currentSpeed={currentSpeed} topSpeed={topSpeed} plate={plate} flagged={flagged} locked={locked} />
    </AppWrapper>
  );
};

export default Component;
