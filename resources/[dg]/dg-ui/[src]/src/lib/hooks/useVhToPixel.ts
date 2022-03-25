import { useState } from 'react';

export const vhToPixel = (vh: number): number => {
  return (vh * window.innerHeight) / 100;
};

export const useVhToPixel = (vh: number): number => {
  const [calcPx, setCalcPx] = useState(vhToPixel(vh));

  const handleResize = () => {
    setCalcPx(vhToPixel(vh));
  };
  window.addEventListener('resize', handleResize);

  return calcPx;
};
