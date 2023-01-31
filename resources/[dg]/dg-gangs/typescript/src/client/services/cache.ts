// Keep local cache of current gang to avoid server events in things like doorlock, peek etc
import { Events } from '@dgx/client';

let currentGang: string | null = null;

const setCurrentGang = (value: typeof currentGang) => {
  currentGang = value;
  // console.log(`[Gangs] Current Gang: ${value ?? 'None'}`);
};

Events.onNet('gangs:client:updateCurrentGang', (gang: typeof currentGang) => {
  setCurrentGang(gang);
});

global.exports('getCurrentGang', () => {
  return currentGang;
});
