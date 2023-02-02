import { Auth } from '@dgx/server';
import { seedExistingPlantsForClient } from 'modules/weed/service.weed';
import { awaitConfig } from 'services/config';

Auth.onAuth(async plyId => {
  await awaitConfig();
  seedExistingPlantsForClient(plyId);
});
