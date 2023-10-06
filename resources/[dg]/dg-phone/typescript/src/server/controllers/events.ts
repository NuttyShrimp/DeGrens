import { Events, Inventory } from '@dgx/server';
import { charModule } from 'helpers/core';
import { endCall, getCallIdForPly } from 'modules/calls/service.calls';

Events.onNet('dg-phone:load', async src => {
  const hasPhone = await Inventory.doesPlayerHaveItems(src, 'phone');
  Events.emitNet('phone:client:setState', src, 'hasPhone', hasPhone);
  if (getCallIdForPly(src)) {
    Events.emitNet('phone:client:setState', src, 'inCall', true);
  }
});

Events.onNet('hospital:down:changeState', (src, state: Hospital.State) => {
  if (state == 'alive') return;
  const callId = getCallIdForPly(src);
  if (!callId) return;
  endCall(callId);
});

Inventory.onInventoryUpdate(
  'player',
  async (identifier, action) => {
    let hasPhone = true;
    if (action == 'remove') {
      hasPhone = await Inventory.doesInventoryHaveItems('player', identifier, 'phone');
    }
    const plySource = charModule.getServerIdFromCitizenId(Number(identifier));
    if (!plySource) return;
    Events.emitNet('phone:client:setState', plySource, 'hasPhone', hasPhone);
    Events.emitNet('phone:client:hasPhone', plySource, hasPhone);
  },
  'phone'
);
