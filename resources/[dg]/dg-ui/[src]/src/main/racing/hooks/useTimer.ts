import { useEffect, useState } from 'react';
import { formatTimeMS } from '@src/lib/util';

const useTimer = () => {
  const [timer, setTimer] = useState('--:--:---');
  const [startTime, setStartTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      if (!isActive) return;
      const now = Date.now();
      setTimer(formatTimeMS(now - startTime));
    });
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleStart = (start = Date.now()) => {
    setIsActive(true);
    setStartTime(start);
    setTimer('--:--:---');
  };

  const handleStop = () => {
    if (!isActive) return;
    setIsActive(false);
    setTimer(formatTimeMS(Date.now() - startTime));
  };

  const handleReset = () => {
    if (!isActive) return;
    setIsActive(false);
    setTimer('--:--:---');
  };

  return { timer, isActive, handleStart, handleStop, handleReset };
};

export default useTimer;
