import { Notifications, Taskbar, Util, Sync, Events, Business } from '@dgx/client';
import { getVehHalfLength } from '@helpers/vehicle';
import { getVehicleVinWithoutValidation } from 'modules/identification/service.identification';

let towVehicle: number;
let jobBlip: number;
let jobVin: string | null = null;

export const canTow = (veh: number) => {
  if (!towVehicle || towVehicle === veh) return false;
  if (!Business.isSignedInAtAnyOfType('mechanic')) return false;
  if (!DoesEntityExist(towVehicle)) {
    towVehicle = 0;
    return false;
  }

  // Vehicle should be in half circle of a const radius behind towVehicle
  const towVehLength = getVehHalfLength(towVehicle);
  const towVehBackPos = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(towVehicle, 0, -towVehLength, 0));
  // front/back of veh should be in radius of 3 from towVehBackPos
  const vehToTowLength = getVehHalfLength(veh);
  const vehToTowFront = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 0, vehToTowLength, 0));
  const vehToTowBack = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 0, -vehToTowLength, 0));
  const distToFront = towVehBackPos.distance(vehToTowFront);
  const distToBack = towVehBackPos.distance(vehToTowBack);
  return distToFront < 4 || distToBack < 4;
};

export const takeHook = (veh: number) => {
  towVehicle = veh;
  Notifications.add('Sleephaak genomen', 'success');
};

export const attachHook = async (vehToTow: number) => {
  if (!canTow(vehToTow)) {
    Notifications.add('Je kan dit voertuig niet takelen', 'error');
    return;
  }

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
  if (cancelled) return;

  const vin = Entity(vehToTow).state?.vin;
  if (vin && vin === jobVin) {
    finishJob();
  }

  Events.emitNet(
    'vehicles:towing:tow',
    NetworkGetNetworkIdFromEntity(towVehicle),
    NetworkGetNetworkIdFromEntity(vehToTow)
  );
  towVehicle = 0;
};

export const hasVehicleAttached = (towVeh: number) => {
  return !!Entity(towVeh).state.attachedVehicle;
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
  if (cancelled) return;

  Events.emitNet('vehicles:towing:remove', NetworkGetNetworkIdFromEntity(towVeh));
};

export const attachVehicleToTowVehicle = (towVehicleNetId: number, attachVehicleNetId: number, offset: Vec3) => {
  const towVehicle = NetworkGetEntityFromNetworkId(towVehicleNetId);
  const attachVehicle = NetworkGetEntityFromNetworkId(attachVehicleNetId);
  if (!DoesEntityExist(towVehicle) || !DoesEntityExist(attachVehicle)) return;

  const [vehToTowDimMin, vehToTowDimMax] = GetModelDimensions(GetEntityModel(attachVehicle));
  const zOffset = (vehToTowDimMax[2] - vehToTowDimMin[2]) / 2;
  AttachEntityToEntity(
    attachVehicle,
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
    false,
    0,
    true
  );
  FreezeEntityPosition(attachVehicle, true);
};

export const unattachVehicleFromTowVehicle = async (towVehicleNetId: number, attachVehicleNetId: number) => {
  const towVehicle = NetworkGetEntityFromNetworkId(towVehicleNetId);
  const attachVehicle = NetworkGetEntityFromNetworkId(attachVehicleNetId);
  if (!DoesEntityExist(towVehicle) || !DoesEntityExist(attachVehicle)) return;

  FreezeEntityPosition(attachVehicle, false);

  const [towVehicleDimensionMin, towVehicleDimensionMax] = GetModelDimensions(GetEntityModel(towVehicle));
  const towHalfLength = (towVehicleDimensionMax[1] - towVehicleDimensionMin[1]) / 2;
  const [attachVehicleDimensionMin, attachVehicleDimensionMax] = GetModelDimensions(GetEntityModel(attachVehicle));
  const attachVehicleHalfLength = (attachVehicleDimensionMax[1] - attachVehicleDimensionMin[1]) / 2;
  const dropYPos = (towHalfLength + attachVehicleHalfLength + 1) * -1;

  await Util.Delay(10);

  AttachEntityToEntity(
    attachVehicle,
    towVehicle,
    GetEntityBoneIndexByName(towVehicle, 'bodyshell'),
    0.0,
    dropYPos,
    0.0,
    0.0,
    0.0,
    0.0,
    true,
    true,
    false,
    false,
    0,
    true
  );
  DetachEntity(attachVehicle, true, true);
  Sync.executeAction('setVehicleOnGround', attachVehicle);
  Notifications.add('Voertuig losgelaten');
};
