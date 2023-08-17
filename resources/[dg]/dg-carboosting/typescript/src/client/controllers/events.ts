import { BaseEvents, Core, Events } from '@dgx/client';
import {
  cleanupAllBoosts,
  cleanupBoost,
  destroyDropoffZone,
  destroyVehicleZone,
  doClientAction,
  removeRadiusBlip,
} from 'services/boost';

Events.onNet('carboosting:boost:cleanup', cleanupBoost);
Events.onNet('carboosting:boost:clientAction', doClientAction);
Events.onNet('carboosting:boost:destroyVehicleZone', destroyVehicleZone);
Events.onNet('carboosting:boost:removeRadiusBlip', removeRadiusBlip);
Events.onNet('carboosting:boost:destroyDropoffZone', destroyDropoffZone);

BaseEvents.onResourceStop(() => {
  cleanupAllBoosts();
});

Core.onPlayerUnloaded(() => {
  cleanupAllBoosts();
});
