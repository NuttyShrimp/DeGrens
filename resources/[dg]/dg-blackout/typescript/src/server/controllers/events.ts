import { Auth, Config, Events, Inventory, Notifications } from '@dgx/server';
import config from '../services/config';
import blackoutManager from 'classes/BlackoutManager';

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  Events.emitNet('blackout:client:init', plyId, config.powerstations, config.safezones);
});

Inventory.registerUseable('big_explosive', plyId => {
  const location = blackoutManager.getLocationPlayerIsAt(plyId);
  if (!location || !('powerstationId' in location)) {
    Notifications.add(plyId, 'Je kan hier niks exploderen', 'error');
    return;
  }

  if (blackoutManager.isPowerStationHit(location.powerstationId)) {
    Notifications.add(plyId, 'Deze powerstation is al geraakt', 'error');
    return;
  }

  if (GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false)) {
    Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig.', 'error');
    return;
  }

  Events.emitNet('blackout:powerstation:useExplosive', plyId, location.powerstationId);
});
