import { useEffect, useState } from 'react';

export const useCountdown = (targetTime: number) => {
  const [countDown, setCountDown] = useState(targetTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(targetTime - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return countDown;
};
