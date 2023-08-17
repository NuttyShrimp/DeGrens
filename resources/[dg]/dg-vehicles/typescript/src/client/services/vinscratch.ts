export const isVehicleVinScratched = (vehicle: number) => {
  return Entity(vehicle).state?.vinscratched ?? false;
};

global.exports('isVehicleVinScratched', isVehicleVinScratched);
