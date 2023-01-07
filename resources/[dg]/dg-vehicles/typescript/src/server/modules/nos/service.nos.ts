export const setVehicleNosAmount = (veh: number, nos: number) => {
  const vehState = Entity(veh).state;
  if (!vehState) return;
  vehState.nos = nos;
};
