import { useCallback, useState } from 'react';
import AppWrapper from '@src/components/appwrapper';

import { RaceTimer } from './components/raceTimer';
import { StartCountDown } from './components/startCountDown';
import useCountdown from './hooks/useCountdown';
import useTimer from './hooks/useTimer';
import { useRacingAppStore } from './stores/useRacingAppStore';
import config from './_config';

import './styles/racing.scss';

const Container: AppFunction = props => {
  const [startCD, setStartCD] = useState(0);
  const [showRaceInfo, setShowRaceInfo] = useState(false);
  const { handleReset, handleStop, handleStart, timer } = useTimer();
  const {
    handleReset: handleTotalReset,
    handleStop: handleTotalStop,
    handleStart: handleTotalStart,
    timer: totalTimer,
    isActive: totalActive,
  } = useTimer();
  const {
    timer: dnfTimer,
    isActive: dnfActive,
    handleStart: handleDnfStart,
    handleStop: handleDnfStop,
  } = useCountdown();
  const [setTimerInfo] = useRacingAppStore(s => [s.setInfo]);

  const handleShow = useCallback(() => props.showApp(), [props.showApp]);
  const handleHide = useCallback(() => {
    props.hideApp();
  }, [props.hideApp]);

  const eventHandler = (evt: any) => {
    switch (evt.action) {
      case 'startCountdown': {
        setStartCD(evt?.countDown ?? 0);
        break;
      }
      case 'startTimer': {
        handleTotalReset();
        handleReset();
        handleStart(evt.startTime);
        handleTotalStart(evt.startTime);
        handleDnfStop();
        setShowRaceInfo(true);
        break;
      }
      case 'setTimerInfo': {
        setTimerInfo(evt.data);
        break;
      }
      case 'lapPassed': {
        handleStart();
        break;
      }
      case 'freezeTimer': {
        handleStop();
        handleTotalStop();
        handleDnfStop();
        break;
      }
      case 'setDnfTimer': {
        if (!totalActive) return;
        handleDnfStart(evt?.data?.dnfTimer ?? 0);
        break;
      }
      case 'resetTimer': {
        handleTotalReset();
        handleReset();
        handleDnfStop();
        setShowRaceInfo(false);
        break;
      }
    }
  };

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} onEvent={eventHandler} full>
      {startCD > 0 && <StartCountDown countDown={startCD} setCountDown={setStartCD} />}
      {showRaceInfo && (
        <RaceTimer
          timer={timer}
          totalTimer={totalTimer}
          dnfTimer={dnfActive ? dnfTimer : undefined}
          frozen={!totalActive}
        />
      )}
    </AppWrapper>
  );
};

export default Container;
