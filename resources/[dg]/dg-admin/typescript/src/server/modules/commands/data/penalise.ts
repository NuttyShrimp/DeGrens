import { Events } from '@dgx/server';

import { Inputs } from '../../../enums/inputs';
import { SelectorTarget } from 'enums/SelectorTargets';
import { getIdentifierForPlayer } from 'helpers/identifiers';

interface BanData {
  Target?: UI.Player;
  entity?: number;
}

export const penalise: CommandData = {
  name: 'penalise',
  role: 'support',
  log: 'opened penalise menu',
  target: [SelectorTarget.PLAYER],
  isClientCommand: false,
  handler: (caller, args: BanData) => {
    if (!args) return;

    let targetSteamId: string | undefined = undefined;
    if (args.Target) {
      targetSteamId = args.Target.steamId;
    } else if (args?.entity) {
      const targetServerId = NetworkGetEntityOwner(args.entity);
      targetSteamId = getIdentifierForPlayer(targetServerId, 'steam');
    }
    if (!targetSteamId) return;

    Events.emitNet('admin:penalty:openModel', caller.source, targetSteamId);
  },
  UI: {
    title: 'Penalise (ban|kick|warn)',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
