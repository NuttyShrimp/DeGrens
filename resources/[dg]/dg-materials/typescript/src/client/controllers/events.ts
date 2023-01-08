import { Events } from '@dgx/client';
import { buildWirecuttingZones } from 'modules/wirecutting/service.wirecutting';
import { initializeRadiotowers } from 'modules/radiotowers/service.radiotowers';
import { buildMoldZone, registerContainerProps } from 'modules/containers/service.containers';
import { buildMeltingZone } from 'services/melting';

Events.onNet('materials:client:init', (initData: Materials.InitData) => {
  buildWirecuttingZones(initData.wirecuttingLocations);
  initializeRadiotowers(initData.radiotowerLocations);
  buildMeltingZone(initData.meltingZone);
  buildMoldZone(initData.moldZone);
  registerContainerProps(initData.containerProps);
});
