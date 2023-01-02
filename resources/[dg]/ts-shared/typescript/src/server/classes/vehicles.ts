type LockpickEvtHandler = (plyId: number, vehicle: number, type: 'door' | 'hotwire') => void;

class Vehicles {
  private lockpickEvtHandlers: Set<LockpickEvtHandler>;

  constructor() {
    this.lockpickEvtHandlers = new Set();
    const handler: LockpickEvtHandler = (plyId, vehicle, type) => {
      this.lockpickEvtHandlers.forEach(handler => handler(plyId, vehicle, type));
    };
    on('vehicles:lockpick', handler);
  }

  onLockpick = (handler: LockpickEvtHandler) => {
    this.lockpickEvtHandlers.add(handler);
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

  setFuelLevel = (vin: string, amount: number) => {
    global.exports['dg-vehicles'].setFuelLevel(vin, amount);
  };

  isPlayerPlate = (plate: string): boolean => {
    return global.exports['dg-vehicles'].isPlayerPlate(plate);
  };

  isVinFromPlayerVeh = (vin: string): boolean => {
    return global.exports['dg-vehicles'].isVinFromPlayerVeh(vin);
  };

  getNetIdOfVin = (vin: string): number => {
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
}

export default {
  Vehicles: new Vehicles(),
};
