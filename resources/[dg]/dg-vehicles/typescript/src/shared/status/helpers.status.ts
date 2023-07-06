export const generatePerfectNativeStatus = (): Omit<Vehicle.VehicleStatus, 'fuel'> => {
  return {
    engine: 1000,
    body: 1000,
    wheels: [...new Array(10)].fill(1000),
    windows: [...new Array(8)].fill(false),
    doors: [...new Array(6)].fill(false),
  };
};
