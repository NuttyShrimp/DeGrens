// Keep local cache of current gang to avoid server events in things like doorlock, peek etc
import { Events, RPC } from '@dgx/client';

let currentGang: string | null = null;

const setCurrentGang = (value: typeof currentGang) => {
  currentGang = value;
  console.log(`[Gangs] Current Gang: ${value ?? 'None'}`);
};

export const fetchCurrentGang = async () => {
  const gang = await RPC.execute<typeof currentGang>('gangs:server:getCurrentGang');
  setCurrentGang(gang);
};
on('DGCore:Client:OnPlayerLoaded', fetchCurrentGang);

Events.onNet('gangs:client:updateCurrentGang', (gang: typeof currentGang) => {
  setCurrentGang(gang);
});

global.exports('getCurrentGang', () => {
  return currentGang;
});
