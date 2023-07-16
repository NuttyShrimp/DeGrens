import { BaseEvents, Events } from '@dgx/client';
import { handleJewelryResourceStop, loadJewelryInitData } from 'modules/jewelry/service.jewelry';
import { buildPaletoActions } from 'modules/paleto/service.paleto';
import { buildLocations, setDoorState } from 'services/locations';
import { buildShopPickupZone } from 'services/shop';

Events.onNet('heists:client:init', (initData: Heists.InitData) => {
  buildShopPickupZone(initData.shopPickupZone);
  buildLocations(initData.locations);
  buildPaletoActions(initData.paletoActions);
  loadJewelryInitData(initData.jewelry);
});

Events.onNet('heists:location:setDoorState', setDoorState);

BaseEvents.onResourceStop(() => {
  handleJewelryResourceStop();
});
