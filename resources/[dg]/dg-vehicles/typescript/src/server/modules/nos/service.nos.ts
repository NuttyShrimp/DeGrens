export const setVehicleNosAmount = (veh: number, nos: number) => {
  Entity(veh).state?.set('nos', nos, true);
};

export const getVehicleNosAmount = (veh: number) => {
  return Entity(veh).state?.nos ?? 0;
};
