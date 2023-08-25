import { ctmLogger } from '../logger';

// CID to XP mapping
const xpStore: Record<number, number> = {};

export const gainXP = (cid: number, amount = 1) => {
  if (!xpStore[cid]) xpStore[cid] = 0;
  xpStore[cid] += amount;
  ctmLogger.info(`${cid} has gained ${amount} xp`);
};

export const getXP = (cid: number) => {
  return xpStore[cid] || 0;
};
