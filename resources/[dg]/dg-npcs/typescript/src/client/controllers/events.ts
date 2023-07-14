import { Events, Sync } from '@dgx/client';
import handler from 'classes/handler';
import { setupGuard, startDeathCheck } from 'services/guards';

Events.onNet('npcs:client:update', (data: { add?: NPCs.NPC | NPCs.NPC[]; remove?: string | string[] }) => {
  if (data.remove) {
    handler.removeNpc(data.remove);
  }
  if (data.add) {
    handler.addNpc(data.add);
  }
});

Sync.registerActionHandler('npcs:guards:setup', setupGuard);

Events.onNet('npcs:guards:startDeathCheck', (netId: number, guardId: string) => {
  const ped = NetworkGetEntityFromNetworkId(netId);
  if (!ped || !DoesEntityExist(ped)) {
    Events.emitNet('npcs:guards:transferDeathCheck', guardId);
    return;
  }
  startDeathCheck(ped, guardId);
});
