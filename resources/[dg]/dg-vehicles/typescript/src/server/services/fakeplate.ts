import { Events, Notifications, Taskbar, Util, Inventory } from '@dgx/server';
import { getPlayerVehicleInfo, updateVehicleFakeplate } from 'db/repository';
import { getVinForVeh } from 'helpers/vehicle';
import plateManager from 'modules/identification/classes/platemanager';

Events.onNet('vehicles:fakeplate:install', async (plyId, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const vin = getVinForVeh(vehicle);
  if (!vin) return;

  const [cancelled] = await Taskbar.create(plyId, 'screwdriver', 'Monteren', 7500, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      combat: true,
      carMovement: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 1,
    },
  });
  if (cancelled) return;

  const plateItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'fakeplate');
  if (!plateItem) {
    Notifications.add(plyId, 'Je hebt geen nummerplaat', 'error');
    return;
  }

  const fakePlate = plateItem.metadata.plate;
  if (!fakePlate) return;

  const vehState = Entity(vehicle).state;
  if (vehState.isFakePlate) {
    Notifications.add(plyId, 'Dit voertuig heeft al een valse nummerplaat', 'error');
    return;
  }

  plateManager.setNumberPlate(vehicle, fakePlate, true);
  Inventory.destroyItem(plateItem.id);
  updateVehicleFakeplate(vin, fakePlate);

  Util.Log(
    'vehicles:fakeplate:install',
    {
      vin,
      fakePlate,
    },
    `${Util.getName(plyId)}(${plyId}) installed a fake plate (${fakePlate}) to vehicle ${vin}`
  );
});

Events.onNet('vehicles:fakeplate:remove', async (plyId, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const vin = getVinForVeh(vehicle);
  if (!vin) return;

  const vehicleInfo = await getPlayerVehicleInfo(vin);
  if (!vehicleInfo) return;

  const vehState = Entity(vehicle).state;
  if (!vehState.isFakePlate) {
    Notifications.add(plyId, 'Dit voertuig heeft geen valse nummerplaat', 'error');
    return;
  }

  const oldPlate = vehState.plate;

  const [cancelled] = await Taskbar.create(plyId, 'screwdriver', 'Schroeven losdraaien', 7500, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 1,
    },
  });
  if (cancelled) return;

  plateManager.setNumberPlate(vehicle, vehicleInfo.plate, false);
  Inventory.addItemToPlayer(plyId, 'fakeplate', 1, { plate: oldPlate });
  updateVehicleFakeplate(vin, null);

  Util.Log(
    'vehicles:fakeplate:remove',
    {
      vin,
    },
    `${Util.getName(plyId)}(${plyId}) removed a fake plate from vehicle ${vin}`
  );
});

export const doesVehicleHaveFakePlate = (vehicle: number) => {
  return Entity(vehicle).state?.isFakePlate ?? false;
};
