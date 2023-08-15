import { Auth, Events } from '@dgx/server';
import { awaitNpcConfigLoad } from 'services/config';
import { handleGuardDied, spawnGuard, transferGuardDeathCheck } from 'services/guards';
import { dispatchAllNpcsToClient } from 'services/npcs';

Auth.onAuth(async plyId => {
  await awaitNpcConfigLoad();
  dispatchAllNpcsToClient(plyId);
});

Events.onNet('npcs:guards:spawn', (_, guardData: NPCs.Guard) => {
  spawnGuard(guardData);
});

Events.onNet('npcs:guards:transferDeathCheck', (_, guardId: string) => {
  transferGuardDeathCheck(guardId);
});

Events.onNet('npcs:guards:died', (_, guardId: string) => {
  handleGuardDied(guardId);
});
