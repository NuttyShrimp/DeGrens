import { RPC } from '@dgx/client';
import { buildWirecuttingZones } from 'modules/wirecutting/service.wirecutting';
import { initializeRadiotowers } from 'modules/radiotowers/service.radiotowers';
import { buildMoldZone } from 'modules/containers/service.containers';
import { buildMeltingZone } from './services/melting';

import './modules/wirecutting';
import './modules/dumpsters';
import './modules/radiotowers';
import './modules/recycleped';
import './modules/containers';

import './services/melting';
import './services/crafting';

setImmediate(async () => {
  const initData = await RPC.execute<Materials.InitData>('materials:server:requestInitialization');
  if (!initData) return;

  buildWirecuttingZones(initData.wirecuttingLocations);
  initializeRadiotowers(initData.radiotowerLocations);
  buildMeltingZone(initData.meltingZone);
  buildMoldZone(initData.moldZone);
});
