import { Gangs, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

type CreateGangData = {
  Target?: UI.Player;
  name?: string;
  label?: string;
  cid?: string;
};

export const createGang: CommandData = {
  name: 'createGang',
  log: 'has created a gang',
  isClientCommand: false,
  target: [],
  role: 'developer',
  handler: async (caller, args: CreateGangData) => {
    if (!args.name || !args.label) {
      Notifications.add(caller.source, 'Je moet een name, label opgeven', 'error');
      return;
    }

    const gangName = args.name.toLowerCase();
    if (gangName.split(' ').length > 1) {
      Notifications.add(caller.source, 'Geen spaties toegelaten in gangname', 'error');
      return;
    }

    let ownerCid = args.Target?.cid ?? args.cid;
    if (!ownerCid) {
      Notifications.add(caller.source, 'Je moet een cid meegeven', 'error');
      return;
    }
    ownerCid = +ownerCid;
    if (isNaN(ownerCid)) {
      Notifications.add(caller.source, 'CID is geen nummer', 'error');
      return;
    }

    const success = await Gangs.createGang(gangName, args.label, ownerCid);
    Notifications.add(
      caller.source,
      success ? `Gang ${gangName} aangemaakt` : 'Kon gang niet aanmaken',
      success ? 'success' : 'error'
    );
  },
  UI: {
    title: 'Gang - Create',
    info: {
      inputs: [Inputs.Player],
      overrideFields: ['name', 'label', 'cid'],
    },
  },
};
