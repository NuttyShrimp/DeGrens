import { Events } from '@dgx/client';
import { buildWirecuttingZones } from 'modules/wirecutting/service.wirecutting';
import { initializeRadiotowers } from 'modules/radiotowers/service.radiotowers';
import { buildMoldZone, registerContainerProps } from 'modules/containers/service.containers';
import { buildMeltingZone } from 'services/melting';
import { loadPortrobberyInitData } from 'modules/portrobbery/service.portrobbery';
import { loadSearchablePropsInitData } from 'modules/searchableprops/service.searchableprops';

Events.onNet('materials:client:init', (initData: Materials.InitData) => {
  buildWirecuttingZones(initData.wirecuttingLocations);
  initializeRadiotowers(initData.radiotowerLocations);
  buildMeltingZone(initData.meltingZone);
  buildMoldZone(initData.moldZone);
  registerContainerProps(initData.containerProps);
  loadPortrobberyInitData(initData.portrobbery);
  loadSearchablePropsInitData(initData.searchableprops);
});
