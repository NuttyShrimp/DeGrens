import { Auth, Events } from '@dgx/server';
import {
  addSyncedObject,
  loadDBObjects,
  removeSyncedObject,
  seedObjectsToPlayer,
  updateSyncedObject,
} from './service.objectmanager';

setImmediate(() => {
  loadDBObjects();
});

Auth.onAuth(src => {
  seedObjectsToPlayer(src);
});

Events.onNet('dg-misc:objectmanager:deleteSynced', (src, objId: string) => {
  removeSyncedObject(objId, src);
});

Events.onNet('dg-misc:objectmanager:placeSyncedObject', (src, model: string, coords: Vec3, rot: Vec3) => {
  addSyncedObject(
    [
      {
        coords,
        model,
        rotation: rot,
      },
    ],
    src
  );
});

Events.onNet('dg-misc:objectmanager:updateSyncedObject', (src, objId: string, matrix: number[]) => {
  updateSyncedObject(objId, matrix, src);
});

asyncExports('addSyncedObject', addSyncedObject);
asyncExports('removeSyncedObject', removeSyncedObject);
