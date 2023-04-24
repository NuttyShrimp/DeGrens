class Vehicles {
  onLockpick = (handler: (plyId: number, vehicle: number, type: 'door' | 'hotwire') => void) => {
    on('vehicles:lockpick', handler);
  };

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
    return global.exports['dg-vehicles'].getVinForVeh(vehicle);
  };

  getVinForNetId = (netId: number): string | null => {
    return global.exports['dg-vehicles'].getVinForNetId(netId);
  };

  giveKeysToPlayer = (plyId: number, vehNetId: number) => {
    global.exports['dg-vehicles'].giveKeysToPlayer(plyId, vehNetId);
  };

  setFuelLevel = (vehicle: number, fuelLevel: number) => {
    global.exports['dg-vehicles'].setFuelLevel(vehicle, fuelLevel);
  };

  public generateVin = () => {
    return global.exports['dg-vehicles'].generateVin();
  };

  public generatePlate = () => {
    return global.exports['dg-vehicles'].generatePlate();
  };

  isPlayerPlate = (plate: string): boolean => {
    return global.exports['dg-vehicles'].isPlayerPlate(plate);
  };

  isVinFromPlayerVeh = (vin: string): boolean => {
    return global.exports['dg-vehicles'].isVinFromPlayerVeh(vin);
  };

  getNetIdOfVin = (vin: string): number | null => {
    return global.exports['dg-vehicles'].getNetIdOfVin(vin);
  };

  getCidFromVin = (vin: string): Promise<number | undefined> => {
    return global.exports['dg-vehicles'].getCidFromVin(vin);
  };

  /**
   * Get legal plate associated with VIN
   */
  getPlateForVin = (vin: string): Promise<string | undefined> => {
    return global.exports['dg-vehicles'].getPlateForVin(vin);
  };

  getConfigByEntity = (vehicle: number): NVehicles.Config | undefined => {
    return global.exports['dg-vehicles'].getConfigByEntity(vehicle);
  };

  getConfigByHash = (hash: number): NVehicles.Config | undefined => {
    return global.exports['dg-vehicles'].getConfigByHash(hash);
  };

  getConfigByModel = (model: string): NVehicles.Config | undefined => {
    return global.exports['dg-vehicles'].getConfigByModel(model);
  };

  setEngineState = (vehicle: number, state: boolean, instantly?: boolean) => {
    global.exports['dg-vehicles'].setEngineState(vehicle, state, instantly);
  };

  cleanVehicle = (netId: number) => {
    global.exports['dg-vehicles'].cleanVehicle(netId);
  };

  popTyre = (vehicle: number) => {
    global.exports['dg-vehicles'].popTyre(vehicle);
  };

  doAdminFix = (vehicle: number) => {
    global.exports['dg-vehicles'].doAdminFix(vehicle);
  };

  // When setting num plate at spawn it will not work otherwise
  // A player needs to be inscope for this to resolve!
  setVehicleNumberPlate = (vehicle: number, plate: string) => {
    return new Promise<void>(res => {
      const plateInterval = setInterval(() => {
        if (!DoesEntityExist(vehicle)) {
          clearInterval(plateInterval);
          res();
          return;
        }

        const plateText = GetVehicleNumberPlateText(vehicle).trim();
        if (plateText === plate) {
          clearInterval(plateInterval);
          res();
          return;
        }

        SetVehicleNumberPlateText(vehicle, plate);
      }, 50);
    });
  };

  setVehicleDoorsLocked = (vehicle: number, locked: boolean) => {
    SetVehicleDoorsLocked(vehicle, locked ? 2 : 1);
  };
}

export default {
  Vehicles: new Vehicles(),
};
