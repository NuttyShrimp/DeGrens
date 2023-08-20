import { Util } from '@dgx/server';

export const getRandomWindDirection = () => {
  const rng = Util.getRndDecimal(0, 2);
  return rng * Math.PI; // Wind dir is in radians
};
