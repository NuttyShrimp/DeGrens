import { Events, Sync } from '@dgx/client';
import handler from 'classes/handler';
import { setupGuard } from 'services/guards';

Events.onNet('npcs:client:update', (data: { add?: NPCs.NPC | NPCs.NPC[]; remove?: string | string[] }) => {
  if (data.remove) {
    handler.removeNpc(data.remove);
  }
  if (data.add) {
    handler.addNpc(data.add);
  }
});

Sync.registerActionHandler('npcs:guards:setup', setupGuard);
