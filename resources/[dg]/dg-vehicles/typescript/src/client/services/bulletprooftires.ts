import { Statebags } from '@dgx/client';

Statebags.addEntityStateBagChangeHandler('entity', 'bulletProofTires', (netId, vehicle, enabled) => {
  SetVehicleTyresCanBurst(vehicle, !enabled);
});

export const getVehicleHasBulletProofTires = (vehicle: number) => {
  return Entity(vehicle).state?.bulletProofTires ?? false;
};

global.exports('getVehicleHasBulletProofTires', getVehicleHasBulletProofTires);
