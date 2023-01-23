import { Auth } from '@dgx/server';
import { dispatchRequiredCopsToClient } from 'modules/cornerselling/service.cornerselling';
import { seedExistingPlantsForClient } from 'modules/weed/service.weed';
import { awaitConfig } from 'services/config';

Auth.onAuth(async plyId => {
  await awaitConfig();
  dispatchRequiredCopsToClient(plyId);
  seedExistingPlantsForClient(plyId);
});
