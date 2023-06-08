let policeVehicles: number[] = [];

export const setPoliceVehicles = (vehicles: string[]) => {
  policeVehicles = vehicles.map(m => GetHashKey(m) >>> 0);
};

export const isPoliceVehicle = (vehicle: number) => {
  if (!DoesEntityExist(vehicle)) return false;
  if (!IsDuplicityVersion() && !IsEntityAVehicle(vehicle)) {
    return false;
  }
  const model = GetEntityModel(vehicle) >>> 0;
  return policeVehicles.indexOf(model) !== -1;
};

global.exports('isPoliceVehicle', isPoliceVehicle);
