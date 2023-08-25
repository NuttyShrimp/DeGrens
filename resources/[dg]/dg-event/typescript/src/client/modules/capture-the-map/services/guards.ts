import { PolyZone, Util } from '@dgx/client';
import { getNearestZoneAtCoords } from '@shared/data/zones';

const guardIds: Set<number> = new Set();

const ANY_TASK_HASH = GetHashKey('SCRIPT_TASK_ANY');
export const addGuards = (ids: number[]) => {
  guardIds.clear();
  for (const id of ids) {
    if (!NetworkDoesNetworkIdExist(id) || !NetworkDoesEntityExistWithNetworkId(id)) return false;
    const ent = NetworkGetEntityFromNetworkId(id);
    if (!DoesEntityExist(ent)) continue;
    guardIds.add(ent);
  }
  guardIds.forEach(netId => {
    const guard = NetworkGetEntityFromNetworkId(netId);
    if (!guard || !DoesEntityExist(guard)) return;
    if (GetScriptTaskStatus(guard, ANY_TASK_HASH) !== 3) return;
    const guardCoords = Util.getEntityCoords(guard);
    const targetZone = getNearestZoneAtCoords(guardCoords);
    if (!targetZone) return;
    TaskGoToCoordAnyMeans(guard, targetZone.x, targetZone.y, targetZone.z, 6.0, 0, false, 786603, 0);
  });
};

export const startGuardCaptureCheck = () => {
  setInterval(() => {
    guardIds.forEach(ent => {
      if (!DoesEntityExist(ent)) return;
      const pos = Util.getEntityCoords(ent);
      if (PolyZone.isPointInside(pos, 'ctm_capture_zone')) {
        // TODO: add zone capture
      }
    });
  }, 500);
};
