import { Events } from '@dgx/server';

export const setArenaInterior: CommandData = {
  name: 'setArenaInterior',
  log: 'has opened arena interior selector',
  role: 'support',
  target: false,
  isClientCommand: false,
  handler: caller => {
    Events.emitNet('admin:menu:forceClose', caller.source);
    global.exports['dg-misc'].openArenaInteriorTypeSelector(caller.source);
  },
  UI: {
    title: 'Set Arena Interior',
    oneTime: true,
  },
};
