import { Notifications, Taskbar, Util, Sync } from '@dgx/client';
import { getVehHalfLength } from '@helpers/vehicle';
import { getVehicleVinWithoutValidation } from 'modules/identification/service.identification';
import { isClockedIn } from '../service.mechanic';

let towVehicle: number;
let modelOffsets: Record<string, Vec3> = {};
let jobBlip: number;
let jobVin: string | null = null;

const getOffset = (veh: number) => {
  for (const model in modelOffsets) {
    if (GetEntityModel(veh) == GetHashKey(model)) {
      return modelOffsets[model];
    }
  }
};

export const setTowOffsets = (offset: Record<string, Vec3>) => {
  modelOffsets = offset;
};

export const canTow = (veh: number) => {
  if (!towVehicle || towVehicle === veh) return false;
  if (!isClockedIn()) return false;
  // Vehicle should be in half circle of a const radius behind towVehicle
  const towVehLength = getVehHalfLength(towVehicle);
  const towVehBackPos = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(towVehicle, 0, -towVehLength, 0));
  // front/back of veh should be in radius of 3 from towVehBackPos
  const vehToTowLength = getVehHalfLength(veh);
  const vehToTowFront = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 0, vehToTowLength, 0));
  const vehToTowBack = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 0, -vehToTowLength, 0));
  const distToFront = towVehBackPos.distance(vehToTowFront);
  const distToBack = towVehBackPos.distance(vehToTowBack);
  return distToFront < 3 || distToBack < 3;
};

export const takeHook = (veh: number) => {
  towVehicle = veh;
  Notifications.add('Sleephaak vastgepakt');
};

export const attachHook = async (vehToTow: number) => {
  if (!canTow(vehToTow)) {
    Notifications.add('Ge hebt gene haak vast', 'error');
    return;
  }
  if (vehToTow === towVehicle) {
    Notifications.add('Ge kunt nie u eigen voertuig takelen...', 'error');
    return;
  }
  const offset = getOffset(towVehicle);
  if (!offset) return;
  const [cancelled] = await Taskbar.create('truck-tow', 'Voertuig vasthangen', 15000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
    },
    animation: {
      animDict: 'missexile3',
      anim: 'ex03_dingy_search_case_a_michael',
      flags: 1,
    },
  });
  if (cancelled) {
    Notifications.add('Geannulleerd...', 'error');
    return;
  }
  const vin = Entity(vehToTow).state?.vin;
  if (vin && vin != jobVin) {
    finishJob();
  }
  Entity(towVehicle).state.set('vehicleAttached', NetworkGetNetworkIdFromEntity(vehToTow), true);
  const [vehToTowDimMin, vehToTowDimMax] = GetModelDimensions(GetEntityModel(vehToTow));
  const zOffset = (vehToTowDimMax[2] - vehToTowDimMin[2]) / 2;
  AttachEntityToEntity(
    vehToTow,
    towVehicle,
    GetEntityBoneIndexByName(towVehicle, 'bodyshell'),
    offset.x,
    offset.y,
    offset.z + zOffset,
    0,
    0,
    0,
    true,
    true,
    false,
    true,
    0,
    true
  );
  FreezeEntityPosition(vehToTow, true);
  towVehicle = 0;
};

export const hasVehicleAttached = (towVeh: number) => {
  return !!Entity(towVeh).state.vehicleAttached;
};

export const assignJob = (vin: string, coords: Vec3) => {
  jobVin = vin;
  jobBlip = AddBlipForCoord(coords.x, coords.y, coords.z);
  SetBlipColour(jobBlip, 3);
  SetBlipRoute(jobBlip, true);
  SetBlipRouteColour(jobBlip, 3);
};

export const isDoingAJob = (ent: number) => {
  const vin = getVehicleVinWithoutValidation(ent);
  if (!vin) return false;
  return vin === jobVin;
};

export const finishJob = () => {
  if (DoesBlipExist(jobBlip)) {
    RemoveBlip(jobBlip);
    jobBlip = 0;
    jobVin = null;
  }
};

export const releaseVehicle = async (towVeh: number) => {
  if (!hasVehicleAttached(towVeh)) return;
  const [cancelled] = await Taskbar.create('truck-tow', 'Voertuig loslaten', 15000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
    },
    animation: {
      animDict: 'missexile3',
      anim: 'ex03_dingy_search_case_a_michael',
      flags: 1,
    },
  });
  if (cancelled) {
    Notifications.add('Geannuleerd...', 'error');
    return;
  }
  const attachedVehNetId = Entity(towVeh).state.vehicleAttached;
  const attachedVeh = NetworkGetEntityFromNetworkId(attachedVehNetId);
  FreezeEntityPosition(attachedVeh, false);
  // Do some math magic
  const [towDimMin, towDimMax] = GetModelDimensions(GetEntityModel(towVeh));
  const [targetDimMin, targetDimMax] = GetModelDimensions(GetEntityModel(towVeh));
  await Util.Delay(10);
  const dropYPos = ((towDimMax[1] - towDimMin[1]) / 2 + (targetDimMax[1] - targetDimMin[1]) / 2 + 1) * -1;
  AttachEntityToEntity(
    attachedVeh,
    towVeh,
    GetEntityBoneIndexByName(attachedVeh, 'bodyshell'),
    0.0,
    dropYPos,
    0.0,
    0.0,
    0.0,
    0.0,
    false,
    false,
    false,
    false,
    20,
    true
  );
  DetachEntity(attachedVeh, true, true);
  Sync.executeNative('setVehicleOnGround', attachedVeh);
  Notifications.add('Voertuig is losgelaten');
  Entity(towVeh).state.set('vehicleAttached', null, true);
};
