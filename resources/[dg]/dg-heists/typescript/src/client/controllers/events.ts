import { Events } from '@dgx/client';
import { buildPaletoActions } from 'modules/paleto/service.paleto';
import { buildLocations, setDoorState } from 'services/locations';
import { buildShopPickupZone } from 'services/shop';

Events.onNet('heists:client:init', (initData: Heists.InitData) => {
  buildShopPickupZone(initData.shopPickupZone);
  buildLocations(initData.locations);
  buildPaletoActions(initData.paletoActions);
});

Events.onNet('heists:location:setDoorState', setDoorState);
