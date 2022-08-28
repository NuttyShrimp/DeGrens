import { Notifications } from '@dgx/server';

export const setTime: CommandData = {
  name: 'setTime',
  log: 'has changed the time',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, data: { time: string }) => {
    try {
      const time = parseInt(data.time ?? '0');
      if (time < 0 || time > 1440) {
        return Notifications.add(source, 'Time should be between 0 and 1440', 'error');
      }
      global.exports['dg-weathersync'].setTime(time);
    } catch (e) {
      console.error(e);
      Notifications.add(caller.source, 'Time should be a number', 'error');
    }
  },
  UI: {
    title: 'Set Time [0-1440]',
    info: {
      overrideFields: ['time'],
    },
  },
};
