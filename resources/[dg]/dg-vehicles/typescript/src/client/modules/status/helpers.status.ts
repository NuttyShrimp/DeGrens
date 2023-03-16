export const getWindowState = (vehicle: number) => {
  const state: boolean[] = [];
  for (let i = 0; i < 8; i++) {
    const intact = IsVehicleWindowIntact(vehicle, i);
    state.push(!intact);
  }
  return state;
};

export const getDoorState = (vehicle: number) => {
  const state: boolean[] = [];
  for (let i = 0; i < 6; i++) {
    const broken = !!IsVehicleDoorDamaged(vehicle, i);
    state.push(broken);
  }
  return state;
};

export const getTyreState = (vehicle: number) => {
  const state: number[] = [];
  for (let i = 0; i < 10; i++) {
    const isBurst = IsVehicleTyreBurst(vehicle, i, true);
    state.push(isBurst ? -1 : GetTyreHealth(vehicle, i));
  }
  return state;
};
