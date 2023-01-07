export const setVehicleHarnessUses = (vehicle: number, uses: number) => {
  const vehState = Entity(vehicle).state;
  if (!vehState) return;
  vehState.harnessUses = uses;
};

export const getVehicleHarnessUses = (vehicle: number): number | undefined => {
  const vehState = Entity(vehicle).state;
  if (!vehState) return;
  return vehState.harnessUses;
};
