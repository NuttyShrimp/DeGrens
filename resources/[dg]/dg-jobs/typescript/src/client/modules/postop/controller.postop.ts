import { Events, Keys, PolyZone, UI } from '@dgx/client';
import {
  buildReturnZone,
  cleanupPostOPJob,
  finishJob,
  setAssignedVehicle,
  setAtDropoff,
  setInReturnZone,
  setTargetLocation,
  setWaypointToReturn,
  tryDropoff,
} from './service.postop';

Events.onNet('jobs:postop:start', (netId: number, returnZone: Vec4) => {
  setAssignedVehicle(netId);
  buildReturnZone(returnZone);
});

Events.onNet('jobs:postop:setLocation', (location: PostOP.TargetLocation | null) => {
  setTargetLocation(location);

  if (!location) {
    setWaypointToReturn();
  }
});

Events.onNet('jobs:postop:cleanup', () => {
  cleanupPostOPJob();
});

PolyZone.onEnter('jobs_postop_return', () => {
  setInReturnZone(true);
});
PolyZone.onLeave('jobs_postop_return', () => {
  setInReturnZone(false);
});

Keys.onPressDown('GeneralUse', () => {
  finishJob();
  tryDropoff();
});

PolyZone.onEnter<{ id: number }>('jobs_postop_dropoff', (_: unknown, { id }) => {
  setAtDropoff(id);
});

PolyZone.onLeave('jobs_postop_dropoff', () => {
  setAtDropoff(null);
});

UI.RegisterUICallback('postop/skip', (_: any, cb) => {
  Events.emitNet('jobs:postop:skipLocation');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
