import { Events } from '@dgx/server';

import { SelectorTarget } from '../../../enums/SelectorTargets';

export const attach: CommandData = {
  name: 'attach',
  log: 'Has attached itself to a player.',
  role: 'staff',
  isClientCommand: false,
  target: [SelectorTarget.PLAYER],
  handler: (caller, args: { entity: number }) => {
    if (GetEntityAttachedTo(GetPlayerPed(String(caller.source))) === args.entity) {
      Events.emitNet('admin:command:detach', caller.source);
      return;
    }
    Events.emitNet('admin:command:attach', caller.source, args.entity);
  },
  UI: {
    title: 'Attach',
  },
};
