import { Events, Notifications, RPC } from '@dgx/server';
import { SelectorTarget } from 'enums/SelectorTargets';

export const moveEntity: CommandData = {
  name: 'moveEntity',
  log: 'started moving an entity',
  role: 'developer',
  target: [SelectorTarget.ENTITY],
  isClientCommand: false,
  handler: async (caller, data: { entity?: number }) => {
    if (!data.entity) return;
    const objId = await RPC.execute('dg-misc:objectmanager:getObjIdForEntity', caller.source, data.entity);
    if (!objId) {
      Notifications.add(caller.source, `Unable to move selected entity`, 'error');
      return;
    }
    Events.emitNet('dg-misc:objectmanager:startObjectMovement', caller.source, objId);
  },
  isEnabled: (data: { objId?: number }) => {
    return !!data.objId;
  },
  UI: {
    title: 'Move Entity',
  },
};
