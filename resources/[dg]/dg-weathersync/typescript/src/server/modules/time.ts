import { secondsPerDay, secondsPerMinute } from '../../common/time';

let time = 0;
const setTime = (_time: number) => {
  time = _time;
  emitNet('dg-weathersync:client:time', -1, time);
};

// makes sure time is consistent by real time on script start
setImmediate(() => {
  const date = new Date();
  const seconds = (date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds()) % secondsPerDay;

  const progression = seconds / secondsPerDay;

  setTime(Math.floor(progression * (24 * 60)));
});

setInterval(() => {
  time++;
  if (time >= 24 * 60) {
    time = 0;
  }
}, secondsPerMinute * 1000);

onNet('dg-weathersync:client:time:request', () => {
  emitNet('dg-weathersync:client:time', global.source, time);
});

export const currentTime = (): number => {
  return time;
};
export const currentHour = (): number => {
  return Math.floor(time / 60);
};
export const currentMinute = (): number => {
  return time % 60;
};
export const currentTimeFormatted = (): string => {
  return `${currentHour().toString().padStart(2, '0')}:${currentMinute().toString().padStart(2, '0')}`;
};

global.exports('currentTime', currentTime);
global.exports('currentHour', currentHour);
global.exports('currentMinute', currentMinute);
global.exports('currentTimeFormatted', currentTimeFormatted);
global.exports('setTime', setTime);
