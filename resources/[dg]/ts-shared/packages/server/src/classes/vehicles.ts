import { Util, Sync } from './index';

class Vehicles {
  onLockpick = (handler: (plyId: number, vehicle: number, type: Vehicles.LockpickType) => void) => {
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

  giveKeysToPlayer = (plyId: number, vehicle: number) => {
    global.exports['dg-vehicles'].giveKeysToPlayer(plyId, vehicle);
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

  getVehicleDoorsLocked = (vehicle: number): boolean => {
    return global.exports['dg-vehicles'].getVehicleDoorsLocked(vehicle);
  };

  setVehicleDoorsLocked = (vehicle: number, locked: boolean) => {
    global.exports['dg-vehicles'].setVehicleDoorsLocked(vehicle, locked);
  };

  blockVinInBennys = (vin: string) => {
    global.exports['dg-vehicles'].blockVinInBennys(vin);
  };

  setVehicleCannotBeLockpicked = (vin: string, cannotBeLockpicked: boolean, rejectMessage?: string) => {
    global.exports['dg-vehicles'].setVehicleCannotBeLockpicked(vin, cannotBeLockpicked, rejectMessage);
  };

  skipDispatchOnLockpickForVin = (vin: string, skipDispatch: boolean) => {
    global.exports['dg-vehicles'].skipDispatchOnLockpickForVin(vin, skipDispatch);
  };

  openEngineSoundMenu = (plyId: number) => {
    global.exports['dg-vehicles'].openEngineSoundMenu(plyId);
  };

  setVehicleHasBulletProofTires = (vehicle: number, toggled: boolean) => {
    global.exports['dg-vehicles'].setVehicleHasBulletProofTires(vehicle, toggled);
  };

  getVehicleHasBulletProofTires = (vehicle: number): boolean => {
    return global.exports['dg-vehicles'].getVehicleHasBulletProofTires(vehicle);
  };

  registerGarage = (garage: Omit<Vehicles.Garages.Garage, 'runtime'>) => {
    global.exports['dg-vehicles'].registerGarage(garage);
  };

  unregisterGarage = (garageId: string) => {
    global.exports['dg-vehicles'].unregisterGarage(garageId);
  };

  openGarage = (plyId: number, garageId: string, shared = false): Promise<void> => {
    return global.exports['dg-vehicles'].openGarage(plyId, garageId, shared);
  };

  public isVehicleVinScratched = (vehicle: number) => {
    return global.exports['dg-vehicles'].isVehicleVinScratched(vehicle);
  };

  public doesPlayerHaveVinscratchedVehicleOfClass = (cid: number, vehicleClass: Vehicles.Class): Promise<boolean> => {
    return global.exports['dg-vehicles'].doesPlayerHaveVinscratchedVehicleOfClass(cid, vehicleClass);
  };

  public awaitInfoLoaded = () => {
    return Util.awaitCondition(
      () => GetResourceState('dg-vehicles') === 'started' && global.exports['dg-vehicles']?.isInfoLoaded?.(),
      false
    );
  };

  public getCarboostVehiclePool = (): Partial<Record<Vehicles.Class, string[]>> => {
    return global.exports['dg-vehicles'].getCarboostVehiclePool();
  };

  public addMaxPerformanceTunesForVin = (vin: string, vehicleClass: Vehicles.Class) => {
    global.exports['dg-vehicles'].addMaxPerformanceTunesForVin(vin, vehicleClass);
  };

  public setExistingVehicleAsPlayerOwned = (
    vehicle: number,
    ownerCid: number,
    vinscratched?: boolean
  ): Promise<boolean> => {
    return global.exports['dg-vehicles'].setExistingVehicleAsPlayerOwned(vehicle, ownerCid, vinscratched);
  };

  public setVehicleDoorOpen = (vehicle: number, doorId: number, open: boolean) => {
    Sync.executeAction('setVehicleDoorOpen', vehicle, doorId, open);
  };
}

export default {
  Vehicles: new Vehicles(),
};
