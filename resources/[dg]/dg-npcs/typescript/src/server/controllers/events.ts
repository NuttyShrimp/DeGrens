import { Auth, Events } from '@dgx/server/classes';
import { getNpcConfig } from 'services/config';

Auth.onAuth(async plyId => {
  const config = await getNpcConfig();
  Events.emitNet('npcs:client:loadConfig', plyId, config);
});
