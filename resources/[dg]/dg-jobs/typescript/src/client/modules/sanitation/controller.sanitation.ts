import { Events, Keys, Peek, PolyZone, UI } from '@dgx/client';
import { DUMPSTER_MODELS } from './constants.sanitation';
import {
  buildReturnZone,
  cleanupSanitationJob,
  finishJob,
  hasTargetLocation,
  isHoldingTrashbag,
  setAssignedVehicle,
  setInReturnZone,
  setTargetLocation,
  setWaypointToReturnZone,
  takeBagFromDumpster,
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

Peek.addModelEntry(DUMPSTER_MODELS, {
  options: [
    {
      icon: 'fas fa-sack',
      label: 'Vuiliszak Nemen',
      action: (_, entity) => {
        if (!entity) return;
        takeBagFromDumpster(entity);
      },
      canInteract: () => hasTargetLocation() && !isHoldingTrashbag(),
    },
  ],
  distance: 2.0,
});

Events.onNet('jobs:sanitation:start', (netId: number, returnZone: Vec4) => {
  setAssignedVehicle(netId);
  buildReturnZone(returnZone);
});

Events.onNet('jobs:sanitation:setLocation', (data: { id: number; coords: Vec3; range: number } | null) => {
  if (data === null) {
    setTargetLocation(null, null);
    setWaypointToReturnZone();
    return;
  }

  const { id, ...blip } = data;
  setTargetLocation(id, blip);
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

Keys.onPressDown('GeneralUse', () => {
  finishJob();
});

UI.RegisterUICallback('sanitation/skip', (_: any, cb) => {
  Events.emitNet('jobs:sanitation:skipLocation');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
