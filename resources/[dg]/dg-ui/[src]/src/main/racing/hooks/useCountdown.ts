import { useEffect, useState } from 'react';
import { formatTimeMS } from '@src/lib/util';

const useCountdown = () => {
  const [timer, setTimer] = useState('00:00:000');
  const [stopTime, setStopTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTimer(formatTimeMS(stopTime - now));
    });
    return () => clearInterval(interval);
  }, [isActive, stopTime]);

  const handleStart = (stopTime: number) => {
    if (isActive) return;
    setIsActive(true);
    setStopTime(stopTime);
    setTimer('00:00:000');
  };

  const handleStop = () => {
    if (!isActive) return;
    setIsActive(false);
    setStopTime(0);
    setTimer('00:00:000');
  };

  return { timer, isActive, handleStart, handleStop };
};

export default useCountdown;
