import { Events, Notifications } from '@dgx/server';

declare interface PlaceObjectData {
  model?: string;
}

export const placeSyncedObject: CommandData = {
  name: 'placeSyncedObject',
  role: 'developer',
  target: false,
  isClientCommand: false,
  log: 'placed a synced object',
  handler: async (caller, data: PlaceObjectData) => {
    if (!data.model || data.model === '') {
      Notifications.add(caller.source, 'Je moet een model meegeven', 'error');
      return;
    }

    Events.emitNet('dg-misc:objectmanager:createSynced', caller.source, data.model);
  },
  UI: {
    title: 'Place Synced Object',
    info: {
      overrideFields: ['model'],
    },
  },
};
