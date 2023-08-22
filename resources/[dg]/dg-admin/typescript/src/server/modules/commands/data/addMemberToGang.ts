import { Gangs, Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

type AddMemberToGangData = {
  Gang?: UI.Gang;
  Target?: UI.Player;
  cid?: string;
};

export const addMemberToGang: CommandData = {
  name: 'addMemberToGang',
  log: 'has added a member to a gang',
  isClientCommand: false,
  target: [],
  role: 'developer',
  handler: async (caller, args: AddMemberToGangData) => {
    const gangName = args?.Gang?.name;
    if (!gangName) {
      Notifications.add(caller.source, 'Je moet een gang meegeven', 'error');
      return;
    }

    let targetCid: number | undefined = undefined;
    if (args?.Target?.cid) {
      targetCid = args.Target.cid;
    } else if (args?.cid) {
      targetCid = +args.cid;
      if (isNaN(targetCid)) {
        Notifications.add(caller.source, 'CID is geen nummer', 'error');
        return;
      }
    } else {
      targetCid = caller.cid;
    }

    if (!targetCid) {
      Notifications.add(caller.source, 'Je moet een target meegeven', 'error');
      return;
    }

    const success = await Gangs.addMemberToGang(caller.source, gangName, targetCid);
    Notifications.add(
      caller.source,
      success ? 'Persoon toegevoegd aan gang' : 'Kon persoon niet toevoegen aan gang',
      success ? 'success' : 'error'
    );
  },
  UI: {
    title: 'Gang - Add Member',
    info: {
      inputs: [Inputs.Gang, Inputs.Player],
      overrideFields: ['cid'],
    },
  },
};
