import { Events, Notifications } from '@dgx/server';

export const toggleGridDebug: CommandData = {
  name: 'toggleGridDebug',
  role: 'developer',
  log: 'has toggled grid rendering.',
  target: [],
  isClientCommand: true,
  handler: (caller, args: { chunkSize: number; renderDistance: number; toggle: boolean }) => {
    if (args.toggle && (!args.chunkSize || args.chunkSize < 1)) {
      Notifications.add(caller.source, 'Invalid chunkSize, must be greater than 0', 'error');
      return;
    }
    if (args.toggle && (args.chunkSize & (args.chunkSize - 1)) !== 0) {
      Notifications.add(caller.source, 'Invalid chunkSize, must be power of 2', 'error');
      return;
    }
    if (args.toggle && (!args.renderDistance || args.renderDistance < 1)) {
      Notifications.add(caller.source, 'Invalid renderDistance, must be greater than 0', 'error');
      return;
    }
    Events.emitNet('dg-misc:grid:debug', caller.source, args.toggle, args.chunkSize, args.renderDistance);
  },
  UI: {
    title: 'Toggle Grid render',
    info: {
      checkBoxes: ['toggle'],
      overrideFields: ['chunkSize', 'renderDistance'],
    },
  },
};
