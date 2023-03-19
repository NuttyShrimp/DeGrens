import { Events } from '@dgx/client';
import { buildLocationZones, setDoorState } from 'services/locations';
import { buildShopPickupZone } from 'services/shop';

Events.onNet('heists:client:init', (initData: Heists.InitData) => {
  buildShopPickupZone(initData.shopPickupZone);
  buildLocationZones(initData.zones);
});

Events.onNet('heists:location:setDoorState', setDoorState);
