export const setVehicleNosAmount = (veh: number, nos: number) => {
  const vehState = Entity(veh).state;
  if (!vehState) return;
  vehState.nos = nos;
};

export const getVehicleNosAmount = (veh: number): number => Entity(veh).state?.nos ?? 0;
