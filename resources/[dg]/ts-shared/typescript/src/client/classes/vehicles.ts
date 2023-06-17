import { Events, Util } from './index';

class Vehicles {
  public getVehicleVin = (vehicle?: number): Promise<string | null> => {
    return global.exports['dg-vehicles'].getVehicleVin(vehicle);
  };

  public getVehicleVinWithoutValidation = (vehicle?: number): string | null => {
    return global.exports['dg-vehicles'].getVehicleVinWithoutValidation(vehicle);
  };

  public getVehicleSpeed = (veh: number) => {
    return Math.ceil(GetEntitySpeed(veh) * 3.6);
  };

  public getSeatPedIsIn = (vehicle: number, ped?: number) => {
    if (!ped) {
      ped = PlayerPedId();
    }
    const model = GetEntityModel(vehicle);
    const numSeats = GetVehicleModelNumberOfSeats(model);
    let seat = -1;
    for (let i = -1; i < numSeats - 1; i++) {
      if (GetPedInVehicleSeat(vehicle, i) !== ped) continue;
      seat = i;
      break;
    }
    return seat;
  };

  public getCurrentVehicleInfo = () => {
    const ped = PlayerPedId();
    const vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle === 0 || !DoesEntityExist(vehicle)) return;
    const seat = this.getSeatPedIsIn(vehicle, ped);
    return {
      vehicle,
      seat,
      class: GetVehicleClass(vehicle),
    };
  };

  public setVehicleDoorsLocked = (vehicle: number, locked: boolean) => {
    Events.emitNet('dgx:vehicles:setLock', NetworkGetNetworkIdFromEntity(vehicle), locked);
  };

  public applyUpgrades = (vehicle: number, upgrades: Partial<Vehicles.Upgrades.Upgrades>) => {
    global.exports['dg-vehicles'].applyUpgrades(vehicle, upgrades);
  };

  public getCosmeticUpgrades = (vehicle: number): Vehicles.Upgrades.Cosmetic.Upgrades | undefined => {
    return global.exports['dg-vehicles'].getCosmeticUpgrades(vehicle);
  };
  isRearEngineVehicle = (vehicle: number) => {
    let boneIndex = GetEntityBoneIndexByName(vehicle, 'bonnet');

    let usingBoot = false;
    if (boneIndex === -1) {
      // if no bonnet bone, we check boot bone and inverse the result
      boneIndex = GetEntityBoneIndexByName(vehicle, 'boot');
      if (boneIndex === -1) return false; // no boot or bonnet bone, we assume its not a rear engine vehicle
      usingBoot = true;
    }

    const [x, y, z] = GetWorldPositionOfEntityBone(vehicle, boneIndex);
    const boneYOffset = GetOffsetFromEntityGivenWorldCoords(vehicle, x, y, z)[1] * (usingBoot ? -1 : 1);
    return boneYOffset < 0;
  };

  isNearVehiclePlace = (
    vehicle: number,
    place: 'bonnet' | 'boot' | 'front' | 'back',
    distance: number,
    mustBeOpen = false
  ) => {
    const useBone = place === 'bonnet' || place === 'boot';

    // mustBeOpen only applies to bonnet/boot
    if (useBone && mustBeOpen) {
      const boneIndex = GetEntityBoneIndexByName(vehicle, place);
      const doorId = place === 'bonnet' ? 4 : 5;
      const isValidDoor = GetIsDoorValid(vehicle, doorId);

      if (isValidDoor && boneIndex !== -1) {
        const isClosed = GetVehicleDoorAngleRatio(vehicle, doorId) === 0;
        const isBrokenOff = IsVehicleDoorDamaged(vehicle, doorId);
        if (!isBrokenOff && isClosed) return false;
      }
    }

    const [min, max] = GetModelDimensions(GetEntityModel(vehicle));
    let yOffset = ((max[1] - min[1]) / 2) * (place === 'bonnet' || place === 'front' ? 1 : -1);

    if (useBone && this.isRearEngineVehicle(vehicle)) {
      yOffset *= -1;
    }

    const targetCoords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(vehicle, 0, yOffset, 0));
    return Util.getPlyCoords().distance(targetCoords) < distance;
  };

  isVehicleUpsideDown = (vehicle: number) => {
    const vehRoll = GetEntityRoll(vehicle);
    return vehRoll > 65 || vehRoll < -65;
  };
}

export default {
  Vehicles: new Vehicles(),
};
