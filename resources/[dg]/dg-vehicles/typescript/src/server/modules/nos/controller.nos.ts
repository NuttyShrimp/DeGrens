import { Config, Events, Inventory, Notifications, RPC, Taskbar, Util } from '@dgx/server';
import { updateVehicleNos } from 'db/repository';
import { getVinForNetId } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { keyManager } from 'modules/keys/classes/keymanager';
import { getPerformance } from 'modules/upgrades/service.upgrades';

import { nosLogger } from './logger.nos';
import { getVehicleNosAmount, setVehicleNosAmount } from './service.nos';

Inventory.registerUseable('nos', async src => {
  const ped = GetPlayerPed(String(src));
  const veh = GetVehiclePedIsIn(ped, false);
  if (veh === 0) {
    Notifications.add(src, 'Je moet in een voertuig zitten', 'error');
    return;
  }

  if (ped !== GetPedInVehicleSeat(veh, -1)) {
    Notifications.add(src, 'Je moet als bestuurder zitten', 'error');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(veh);
  const vin = getVinForNetId(netId);
  if (!vin) return;

  if (!keyManager.hasKey(vin, src)) {
    Notifications.add(src, 'Je hebt geen sleutels van dit voertuig', 'error');
    return;
  }

  const hasTurbo = (await getPerformance(vin))?.turbo ?? false;
  if (!hasTurbo) {
    Notifications.add(src, 'Geen turbo aanwezig op voertuig', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(src, 'vehicles-install-nos', 'wine-bottle', 'Aansluiten', 10000, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      combat: true,
      carMovement: true,
    },
  });
  if (canceled) return;

  const removedItem = await Inventory.removeItemFromPlayer(src, 'nos');
  if (removedItem === false) {
    Notifications.add(src, 'Je hebt dit niet', 'error');
    return;
  }

  const refillAmount = Config.getConfigValue<{ refillAmount: number }>('vehicles.config.nos').refillAmount ?? 0;
  setVehicleNosAmount(veh, refillAmount);
  if (vinManager.isVinFromPlayerVeh(vin)) {
    await updateVehicleNos(vin, refillAmount);
  }
  nosLogger.info(`NOS for ${vin} has been refilled`);
  Util.Log(
    'vehicles:nos:installed',
    {
      src,
      vin,
    },
    `${GetPlayerName(String(src))} has refilled nos for vehicle (${vin})`,
    src
  );
});

RPC.register('vehicles:nos:getConfig', async () => {
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue('vehicles.config.nos');
  return config;
});

Events.onNet('vehicles:nos:save', (src: number, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin || !vinManager.isVinFromPlayerVeh(vin)) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  const nosAmount = getVehicleNosAmount(veh);
  updateVehicleNos(vin, nosAmount);
  nosLogger.info(`NOS for ${vin} has been updated to ${nosAmount}`);
  Util.Log(
    'vehicles:nos:saved',
    {
      src,
      vin,
      nosAmount,
    },
    `NOS for vehicle (${vin}) has been updated to ${nosAmount}`,
    src
  );
});
