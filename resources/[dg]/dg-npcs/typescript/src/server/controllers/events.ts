import { Auth, Events } from '@dgx/server';
import { awaitNpcConfigLoad } from 'services/config';
import { spawnGuard } from 'services/guards';
import { dispatchAllNpcsToClient } from 'services/npcs';

Auth.onAuth(async plyId => {
  await awaitNpcConfigLoad();
  dispatchAllNpcsToClient(plyId);
});

Events.onNet('npcs:guards:spawn', (_, guardData: NPCs.Guard) => {
  spawnGuard(guardData);
});
