import { Events, Keys, Peek, PolyZone, RPC, Util } from '@dgx/client';
import { DUMPSTER_MODELS, RANGE } from './constants.sanitation';
import {
  addTargetInfo,
  buildReturnZone,
  cleanupSanitationJob,
  finishJob,
  setAssignedVehicle,
  setInReturnZone,
  setTargetLocation,
} from './servive.sanitation';

Peek.addFlagEntry('isSanitationManager', {
  options: [
    {
      label: 'Aanmelden',
      icon: 'fas fa-pen-clip',
      action: () => {
        Events.emitNet('jobs:sanitation:signIn');
      },
    },
  ],
  distance: 2.0,
});

Events.onNet('jobs:sanitation:addLocation', (netId: number, returnZone: Vec4, targetLocation: Vec3) => {
  setAssignedVehicle(netId);
  buildReturnZone(returnZone);
  setTargetLocation(targetLocation);
});

Events.onNet('jobs:sanitation:cleanup', () => {
  cleanupSanitationJob();
});

PolyZone.onEnter('jobs_sanitation_return', () => {
  setInReturnZone(true);
});
PolyZone.onLeave('jobs_sanitation_return', () => {
  setInReturnZone(false);
});

PolyZone.onEnter('jobs_sanitation_target', () => {
  Events.emitNet('jobs:sanitation:enteredTarget');
});

Keys.onPressDown('GeneralUse', () => {
  finishJob();
});

RPC.register('jobs:sanitation:getDumpsterLocations', () => {
  const plyCoords = Util.getPlyCoords();
  const objects: number[] = GetGamePool('CObject');
  const dumpsterCoords = objects.reduce<Vec3[]>((acc, ent) => {
    if (!DUMPSTER_MODELS.includes(GetEntityModel(ent))) return acc;
    const [x, y, z] = GetEntityCoords(ent, false);
    const entityCoords = { x, y, z };
    if (plyCoords.distance(entityCoords) > RANGE) return acc;
    acc.push(entityCoords);
    return acc;
  }, []);
  return dumpsterCoords;
});

Events.onNet('jobs:sanitation:addTargetInfo', (total: number) => {
  addTargetInfo(total);
});
