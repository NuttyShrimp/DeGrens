import { Events } from '@dgx/server';

export const placeLocker: CommandData = {
  name: 'placeLocker',
  log: 'has placed a locker',
  isClientCommand: false,
  target: [],
  role: 'developer',
  handler: caller => {
    Events.emitNet('lockers:client:place', caller.source);
    Events.emitNet('admin:menu:forceClose', caller.source);
  },
  UI: {
    title: 'Place Locker',
    oneTime: true,
  },
};
