import { Config, Events, Inventory, Notifications, RPC, Taskbar, Util } from '@dgx/server';
import { getVinForNetId } from 'helpers/vehicle';

import { seatbeltLogger } from './logger.seatbelts';
import { getVehicleHarnessUses, setVehicleHarnessUses } from './service.seatbelts';
import { updateVehicleHarness } from 'db/repository';
import vinManager from 'modules/identification/classes/vinmanager';

Inventory.registerUseable('harness', async src => {
  const ped = GetPlayerPed(String(src));
  const veh = GetVehiclePedIsIn(ped, false);
  const netId = NetworkGetNetworkIdFromEntity(veh);

  if (veh === 0 || !DoesEntityExist(veh) || !netId) {
    Notifications.add(src, 'Je zit niet in een voertuig', 'error');
    return;
  }
  if (GetPedInVehicleSeat(veh, -1) !== ped) {
    Notifications.add(src, 'Je kan dit enkel als driver', 'error');
    return;
  }
  const vehClass = await RPC.execute<number>('vehicle:getClass', src, netId);
  if (!vehClass || [8, 13, 14].includes(vehClass)) {
    Notifications.add(src, 'In dit voertuig kan geen harness', 'error');
    return;
  }

  const vin = getVinForNetId(netId);
  if (!vin) return;

  const uses: number = Entity(veh).state.harnessUses ?? 0;
  if (uses > 0) {
    Notifications.add(src, 'In dit voertuig zit al een harness', 'info');
    return;
  }

  const [canceled] = await Taskbar.create(src, 'screwdriver', 'Installeren', 20000, {
    canCancel: true,
    cancelOnDeath: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      carMovement: true,
      movement: true,
      combat: true,
    },
  });
  if (canceled) return;

  const removedItem = await Inventory.removeItemByNameFromPlayer(src, 'harness');
  if (removedItem === false) {
    Notifications.add(src, 'Je hebt geen harness', 'error');
    return;
  }

  const config = Config.getConfigValue<{ harnessUses: number }>('vehicles.config');
  setVehicleHarnessUses(veh, config.harnessUses);
  if (vinManager.isVinFromPlayerVeh(vin)) {
    updateVehicleHarness(vin, config.harnessUses);
  }

  seatbeltLogger.info(`Harness has been added to vehicle (${vin})`);
  Util.Log(
    'vehicles:installedHarness',
    {
      src,
      vin,
    },
    `${GetPlayerName(String(src))} has installed a harness in a vehicle`,
    src
  );
});

Events.onNet('vehicles:seatbelts:decreaseHarness', async (plyId: number, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!DoesEntityExist(vehicle)) return;

  const uses = getVehicleHarnessUses(vehicle);
  if (!uses) return;

  setVehicleHarnessUses(vehicle, uses - 1);
  if (vinManager.isVinFromPlayerVeh(vin)) {
    updateVehicleHarness(vin, uses - 1);
  }
});
