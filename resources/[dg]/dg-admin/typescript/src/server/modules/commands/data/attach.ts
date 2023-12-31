import { Events } from '@dgx/server';

import { SelectorTarget } from '../../../enums/SelectorTargets';

export const attach: CommandData = {
  name: 'attach',
  log: 'Has attached itself to a player.',
  role: 'support',
  isClientCommand: false,
  target: [SelectorTarget.PLAYER, SelectorTarget.VEHICLE],
  handler: (caller, args: { entity?: number }) => {
    if (!args.entity) return;

    // always detach when already attached
    if (GetEntityAttachedTo(GetPlayerPed(String(caller.source)))) {
      Events.emitNet('admin:command:detach', caller.source);
      return;
    }

    // we can also use netid for player peds instead of getting serverid here, and getting playerid on client
    const netId = NetworkGetNetworkIdFromEntity(args.entity);
    Events.emitNet('admin:command:attach', caller.source, netId);
  },
  UI: {
    title: 'Attach',
  },
};
