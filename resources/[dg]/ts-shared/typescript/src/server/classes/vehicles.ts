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
    return global.exports['dg-vehicles'].deleteVehicle(vehicle);
  };

  giveKeysToPlayer = (plyId: number, vehNetId: number) => {
    global.exports['dg-vehicles'].giveKeysToPlayer(plyId, vehNetId);
  };

  setFuelLevel = (vin: string, amount: number) => {
    global.exports['dg-vehicles'].setFuelLevel(vin, amount);
  };
}

export default {
  Vehicles: new Vehicles(),
};
