import { Thread } from '@dgx/shared';
import { getVehicleConfig, getCurrentVehicle } from '@helpers/vehicle';

export const driverThread = new Thread(async function () {
  this.data.health = GetVehicleEngineHealth(this.data.vehicle);
  this.data.bodyHealth = GetVehicleBodyHealth(this.data.vehicle);
  this.data.speed = GetEntitySpeed(this.data.vehicle);

  // TODO: disabling engine state to here
}, 1000);

DecorRegister('PLAYER_VEHICLE', 3);
driverThread.addHook('preStart', async ref => {
  // NOTE: We can replace this with the basic getter when we introduce a passenger thread
  const vehicle = getCurrentVehicle();
  if (!vehicle) {
    throw new Error('No vehicle found');
  }

  // https://cookbook.fivem.net/2022/01/06/marking-a-vehicle-as-player-vehicle-for-game-code/
  DecorSetInt(vehicle, 'PLAYER_VEHICLE', 1);

  ref.data.vehicle = vehicle;
  ref.data.netId = NetworkGetNetworkIdFromEntity(vehicle);

  ref.data.config = await getVehicleConfig(vehicle);
});

driverThread.addHook('afterStop', async ref => {
  ref.data.vehicle = null;
  ref.data.netId = null;
  ref.data.config = null;
  ref.data.health = null;
  ref.data.bodyHealth = null;
  ref.data.speed = null;
});
