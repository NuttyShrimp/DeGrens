class Vehicles {
  // See dg-vehicles types for upgrades type
  spawnVehicle = (
    model: string,
    position: Vec4,
    owner?: number,
    vin?: string,
    plate?: string,
    upgrades?: any // Partial<Upgrades.All>
  ): Promise<number | undefined> => {
    return global.exports['dg-vehicles'].spawnVehicle(model, position, owner, vin, plate, upgrades);
  };

  deleteVehicle = (vehicle: number) => {
    global.exports['dg-vehicles'].deleteVehicle(vehicle);
  };

  getVinForVeh = (vehicle: number): string | null => {
    return global.exports['dg-vehicles'].deleteVehicle(vehicle);
  };
}

export default {
  Vehicles: new Vehicles(),
};
