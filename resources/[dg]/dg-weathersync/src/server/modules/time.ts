import { secondsPerDay, secondsPerMinute } from '../../common/time';

let time = 0;

// makes sure time is consistent by real time on script start
setImmediate(() => {
  const date = new Date();
  const seconds = (date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds()) % secondsPerDay;

  const progression = seconds / secondsPerDay;

  time = Math.floor(progression * (24 * 60));

  emitNet('dg-weathersync:client:time', -1, time);
});

setInterval(() => {
  time++;
  if (time >= 24 * 60) {
    time = 0;
  }
}, secondsPerMinute * 1000);

RegisterCommand(
  'time',
  (source: string, args: string[]) => {
    if (Number(source) > 1 && !DGCore.Functions.HasPermission(Number(source), 'admin')) {
      return emitNet('DGCore:Notify', source, 'You do not have permissions to use this command.', 'error');
    }

    if (args.length === 0) {
      return emitNet('DGCore:Notify', source, 'Format: /time [0-1440]', 'error');
    }

    const _time = parseInt(args[0]);

    if (_time < 0 || _time > 1440) {
      return emitNet('DGCore:Notify', source, 'Format: /time [0-1440]', 'error');
    }

    time = _time;
    emitNet('dg-weathersync:client:time', -1, time);
    emitNet('DGCore:Notify', source, 'Time changed', 'success');
  },
  false
);

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
