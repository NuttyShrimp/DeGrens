import { BaseEvents, Vehicles } from '@dgx/server';

let vehiclePool: Partial<Record<Vehicles.Class, string[]>> = {};

export const loadPool = async () => {
  await Vehicles.awaitInfoLoaded();
  vehiclePool = Vehicles.getCarboostVehiclePool();
};

BaseEvents.onResourceStart(() => {
  loadPool();
}, 'dg-vehicles');

export const getRandomModelFromPoolForClass = (vehicleClass: Vehicles.Class) => {
  const models = vehiclePool[vehicleClass];
  if (!models || models.length === 0) return;
  return models[Math.floor(Math.random() * models.length)];
};
