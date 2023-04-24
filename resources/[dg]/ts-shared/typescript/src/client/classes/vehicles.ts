import { Events } from './index';

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
}

export default {
  Vehicles: new Vehicles(),
};
