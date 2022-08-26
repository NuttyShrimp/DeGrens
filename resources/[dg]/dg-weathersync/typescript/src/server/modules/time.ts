import { secondsPerDay, secondsPerMinute } from '../../common/time';
import { Admin, Chat, Notifications } from '@dgx/server';

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

Chat.registerCommand(
  'time',
  'Change the time of day.',
  [{ name: 'time', description: 'number between 0 and 1440' }],
  'admin',
  (source, _, args) => {
    if (source > 1 && !Admin.hasPermission(source, 'staff')) {
      return Notifications.add(source, 'You do not have permissions to use this command.', 'error');
    }

    if (args.length === 0) {
      return Notifications.add(source, 'Format: /time [0-1440]', 'error');
    }

    const _time = parseInt(args[0]);

    if (_time < 0 || _time > 1440) {
      return Notifications.add(source, 'Format: /time [0-1440]', 'error');
    }

    time = _time;
    emitNet('dg-weathersync:client:time', -1, time);
    return Notifications.add(source, 'Time changed', 'success');
  }
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
