export const setVehicleHasBulletProofTires = (vehicle: number, toggled: boolean) => {
  if (!DoesEntityExist(vehicle)) return;
  Entity(vehicle).state.set('bulletProofTires', toggled, true);
};

export const getVehicleHasBulletProofTires = (vehicle: number) => {
  return Entity(vehicle).state?.bulletProofTires ?? false;
};

global.exports('setVehicleHasBulletProofTires', setVehicleHasBulletProofTires);
global.exports('getVehicleHasBulletProofTires', getVehicleHasBulletProofTires);
