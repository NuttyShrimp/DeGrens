// Only natives that dont have a server side equivalent
// (ex: Numberplate native also exists for server)

import { Util } from '@dgx/client';

export const ACTIONS = {
  SetVehicleFuelLevel,
  NetworkExplodeVehicle,
  SetEntityVisible,
  setVehicleOnGround: (vehicle: number) => {
    if (!vehicle || !DoesEntityExist(vehicle)) return;
    const success = SetVehicleOnGroundProperly(vehicle);
    if (success) return;

    // Backup method if setonground failed
    const curPos = Util.getEntityCoords(vehicle);
    const curRot = Util.getEntityRotation(vehicle);
    SetEntityCoords(vehicle, curPos.x, curPos.y, curPos.z + 4, false, false, false, false);
    SetEntityRotation(vehicle, 0, 0, curRot.z, 0, false);
  },
  setVehicleDoorOpen: (vehicle: number, doorId: number, open: boolean) => {
    if (!vehicle || !DoesEntityExist(vehicle)) return;
    if (open) {
      SetVehicleDoorOpen(vehicle, doorId, false, false);
    } else {
      SetVehicleDoorShut(vehicle, doorId, false);
    }
  },
};
