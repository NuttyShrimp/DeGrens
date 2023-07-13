class Vehicles {
  onLockpick = (handler: (plyId: number, vehicle: number, type: 'door' | 'hotwire') => void) => {
    on('vehicles:lockpick', handler);
  };

  spawnVehicle: Vehicles.SpawnVehicleFunction = data => {
    return global.exports['dg-vehicles'].spawnVehicle(data);
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

  getVehicleOfVin = (vin: string): number | null => {
    return global.exports['dg-vehicles'].getVehicleOfVin(vin);
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

  getConfigByModel = (model: string | number): NVehicles.Config | undefined => {
    return global.exports['dg-vehicles'].getConfigByModel(model);
  };

  setEngineState = (vehicle: number, state: boolean, instantly?: boolean) => {
    global.exports['dg-vehicles'].setEngineState(vehicle, state, instantly);
  };

  cleanVehicle = (vehicle: number) => {
    global.exports['dg-vehicles'].cleanVehicle(vehicle);
  };

  popTyre = (vehicle: number) => {
    global.exports['dg-vehicles'].popTyre(vehicle);
  };

  doAdminFix = (vehicle: number) => {
    global.exports['dg-vehicles'].doAdminFix(vehicle);
  };

  getVehicleDoorsLocked = (vehicle: number) => {
    return GetVehicleDoorLockStatus(vehicle) === 2;
  };

  setVehicleDoorsLocked = (vehicle: number, locked: boolean) => {
    let triesRemaining = 3;

    const t = setInterval(() => {
      if (triesRemaining === 0) {
        clearInterval(t);
        return;
      }

      const currentlyLocked = this.getVehicleDoorsLocked(vehicle);
      if (currentlyLocked === locked) {
        clearInterval(t);
        return;
      }

      SetVehicleDoorsLocked(vehicle, locked ? 2 : 1);
      triesRemaining--;
    }, 250);
  };

  blockVinInBennys = (vin: string) => {
    global.exports['dg-vehicles'].blockVinInBennys(vin);
  };
}

export default {
  Vehicles: new Vehicles(),
};
