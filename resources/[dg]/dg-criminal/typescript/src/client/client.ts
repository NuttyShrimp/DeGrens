import { RPC } from '@dgx/client/classes';
import { fetchExistingPlants, startPlantsThread } from 'modules/weed/service.weed';
import { setRequiredCopsForCornersell } from 'modules/cornerselling/service.cornerselling';

import './modules/cornerselling';
import './modules/weed';

setImmediate(async () => {
  const config = await RPC.execute<Criminal.Config>('criminal:getConfig');
  if (!config) {
    console.error('Failed to get config');
    return;
  }

  fetchExistingPlants();
  startPlantsThread();
  setRequiredCopsForCornersell(config.cornerselling.requiredCops);
});
