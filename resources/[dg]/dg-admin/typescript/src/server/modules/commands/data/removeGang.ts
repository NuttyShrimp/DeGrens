import { Gangs, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

type RemoveGangData = {
  Gang?: UI.Gang;
};

export const removeGang: CommandData = {
  name: 'removeGang',
  log: 'has removed a gang',
  isClientCommand: false,
  target: [],
  role: 'developer',
  handler: async (caller, args: RemoveGangData) => {
    const gangName = args?.Gang?.name;
    if (!gangName) {
      Notifications.add(caller.source, 'Je moet een gang meegeven', 'error');
      return;
    }

    const success = await Gangs.removeGang(gangName);
    Notifications.add(
      caller.source,
      success ? 'Gang verwijderd' : 'Kon gang niet verwijderen',
      success ? 'success' : 'error'
    );
  },
  UI: {
    title: 'Gang - Remove',
    info: {
      inputs: [Inputs.Gang],
    },
  },
};
