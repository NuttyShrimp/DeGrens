import { Events, Keys, RPC } from '@dgx/client';
import { startObjectPlacement } from 'services/objectPlacer';
import {
  addLocalObject,
  addSyncedObject,
  cleanupObjects,
  getEntityForObjectId,
  isCursorEnabled,
  removeObject,
  scheduleChunkCheck,
  setCursorEnabled,
  startObjectGizmo,
  updateSyncedObject,
} from './service.objectmanager';

setImmediate(() => {
  if (LocalPlayer.state.isLoggedIn) {
    scheduleChunkCheck();
  }
});

AddStateBagChangeHandler(
  'isLoggedIn',
  `player:${GetPlayerServerId(PlayerId())}`,
  (_: string, key: string, val: boolean) => {
    if (key !== 'isLoggedIn') return;
    val ? scheduleChunkCheck() : cleanupObjects();
  }
);

global.exports('addLocalObject', addLocalObject);
global.exports('removeObject', removeObject);
global.exports('getEntityForObjectId', getEntityForObjectId);

Events.onNet('dg-misc:objectmanager:createSynced', async (model: string) => {
  const placementInfo = await startObjectPlacement(model);
  if (!placementInfo) return;
  Events.emitNet('dg-misc:objectmanager:placeSyncedObject', model, placementInfo.coords, placementInfo.rot);
});

Events.onNet('dg-misc:objectmanager:addSynced', (data: (Objects.CreateState & { matrix: number[] })[]) => {
  addSyncedObject(data.map(d => ({ ...d, matrix: new Float32Array(d.matrix) })));
});

Events.onNet('dg-misc:objectmanager:removeSynced', (id: string | string[]) => {
  removeObject(id);
});

Events.onNet('dg-misc:objectmanager:startObjectMovement', (id: string) => {
  startObjectGizmo(id);
});

Events.onNet('dg-misc:objectmanager:updateSynced', (id: string, objData: Objects.ServerState) => {
  updateSyncedObject(id, { ...objData, matrix: new Float32Array(objData.matrix) });
});

RPC.register('dg-misc:objectmanager:getObjIdForEntity', (ent: number) => {
  if (!DoesEntityExist(ent)) return '';
  const objId = Entity(ent).state.objId;
  return objId;
});

Keys.onPress('object-gizmo-select', isDown => {
  isDown ? ExecuteCommand(`+gizmoSelect`) : ExecuteCommand(`-gizmoSelect`);
});
Keys.onPress('object-gizmo-local', isDown => {
  isDown ? ExecuteCommand(`+gizmoLocal`) : ExecuteCommand(`-gizmoLocal`);
});
Keys.onPress('object-gizmo-translation', isDown => {
  isDown ? ExecuteCommand(`+gizmoTranslation`) : ExecuteCommand(`-gizmoTranslation`);
});
Keys.onPress('object-gizmo-rotation', isDown => {
  isDown ? ExecuteCommand(`+gizmoRotation`) : ExecuteCommand(`-gizmoRotation`);
});

Keys.register('object-gizmo-select', '(gizmo) Select the gizmo', 'MOUSE_LEFT', 'MOUSE_BUTTON');
Keys.register('object-gizmo-local', '(gizmo) Swicth local/world axes', 'Z');
Keys.register('object-gizmo-translation', '(gizmo) Switch to translation', 'Q');
Keys.register('object-gizmo-rotation', '(gizmo) Switch to rotation', 'E');

RegisterCommand(
  'misc:object:toggleCursor',
  () => {
    if (!isCursorEnabled()) {
      EnterCursorMode();
    } else {
      LeaveCursorMode();
    }
    setCursorEnabled(!isCursorEnabled());
  },
  false
);
