import { Events } from '@dgx/server';

import { Inputs } from '../../../enums/inputs';

interface BanData {
  Target?: UI.Player;
}

export const penalise: CommandData = {
  name: 'penalise',
  role: 'staff',
  log: 'opened penalise menu',
  target: false,
  isClientCommand: false,
  handler: (caller, args: BanData) => {
    if (!args.Target) return;
    Events.emitNet('admin:penalty:openModel', caller.source, args.Target.steamId);
  },
  UI: {
    title: 'Penalise (ban|kick|warn)',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
