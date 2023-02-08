import { Events } from '@dgx/server';

import { SelectorTarget } from '../../../enums/SelectorTargets';

export const attach: CommandData = {
  name: 'attach',
  log: 'Has attached itself to a player.',
  role: 'staff',
  isClientCommand: false,
  target: [SelectorTarget.PLAYER],
  handler: (caller, args: { entity?: number }) => {
    if (!args.entity) return;

    if (GetEntityAttachedTo(GetPlayerPed(String(caller.source))) === args.entity) {
      Events.emitNet('admin:command:detach', caller.source);
      return;
    }

    const targetPly = NetworkGetEntityOwner(args.entity);
    Events.emitNet('admin:command:attach', caller.source, targetPly);
  },
  UI: {
    title: 'Attach',
  },
};
