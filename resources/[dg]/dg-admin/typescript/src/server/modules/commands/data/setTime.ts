import { Notifications, Weather } from '@dgx/server';

export const setTime: CommandData = {
  name: 'setTime',
  log: 'has changed the time',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, data: { time?: string; freeze?: boolean }) => {
    let time: number | undefined = data.time !== undefined ? parseInt(data.time) : undefined;
    time = time !== undefined && isNaN(time) ? undefined : time;

    if (Weather.isTimeFrozen() !== !!data.freeze) {
      Weather.freezeTime(!!data.freeze, time);
      Notifications.add(caller.source, `Time is now ${data.freeze ? 'frozen' : 'unfrozen'}`, 'error');
      return;
    }

    if (time == undefined) {
      Notifications.add(caller.source, 'Time should be a number', 'error');
      return;
    }
    if (time < 0 || time > 1440) {
      Notifications.add(caller.source, 'Time should be between 0 and 1440', 'error');
      return;
    }

    Weather.setCurrentTime(time);
    Notifications.add(caller.source, `Time has been set to ${time}`, 'success');
  },
  UI: {
    title: 'Set Time [0-1440]',
    info: {
      overrideFields: ['time'],
      checkBoxes: ['freeze'],
    },
  },
};
