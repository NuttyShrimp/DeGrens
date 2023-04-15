import { Events, Util } from '@dgx/server';

export const addEventBlip: CommandData = {
  name: 'addEventBlip',
  log: 'has added an event blip',
  isClientCommand: false,
  target: [],
  role: 'support',
  handler: (caller, args: { removeTimeInMinutes?: string }) => {
    let removeTime = 60; // default to 60
    if (args.removeTimeInMinutes) {
      const parsed = parseInt(args.removeTimeInMinutes, 10);
      if (!isNaN(parsed)) {
        removeTime = parsed;
      }
    }

    const plyCoords = Util.getPlyCoords(caller.source);
    Events.emitNet('admin:commands:addEventBlip', -1, plyCoords, removeTime);
  },
  UI: {
    title: 'Add Event Blip',
    info: {
      overrideFields: ['removeTimeInMinutes'],
    },
  },
};
