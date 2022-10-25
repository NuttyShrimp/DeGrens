import { RayCast, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

import { drawText3d } from '../util/service.util';

let isActive = false;
let selectorTick: number;
let selectorRayInterval: NodeJS.Timer;

export let selectedEntity: number;
export let selectedEntityType: number;

const showEntityInfo = () => {
  if (!selectedEntity) return;
  const selectedEntityCoords = Util.getEntityCoords(selectedEntity);
  if (selectedEntityType === 1) {
    drawText3d(
      `~r~(${GetEntityHealth(selectedEntity)}/${GetPedMaxHealth(selectedEntity)}) ~b~(${GetPedArmour(
        selectedEntity
      )}/${GetPlayerMaxArmour(selectedEntity)})`,
      Vector3.add(selectedEntityCoords, new Vector3(0, 0, 1.4)),
      0.5
    );
    DrawMarker(
      1,
      selectedEntityCoords.x,
      selectedEntityCoords.y,
      selectedEntityCoords.z - 1,
      0,
      0,
      0,
      0,
      0,
      0,
      0.7,
      0.7,
      0.7,
      0,
      255,
      0,
      150,
      false,
      true,
      2,
      false,
      undefined,
      undefined,
      false
    );
  } else if ([2, 3].includes(selectedEntityType)) {
    drawText3d(
      `~r~(${GetEntityHealth(selectedEntity)}/${GetEntityMaxHealth(selectedEntity)})`,
      Vector3.add(selectedEntityCoords, new Vector3(0, 0, 1.4)),
      0.5
    );
  }
  if ([1, 2, 3].includes(selectedEntityType)) {
    drawText3d(
      `~q~${selectedEntity} ~o~${GetEntityArchetypeName(selectedEntity)} ~g~${selectedEntityCoords.x.toFixed(
        2
      )}, ${selectedEntityCoords.y.toFixed(2)}, ${selectedEntityCoords.z.toFixed(2)}`,
      Vector3.add(selectedEntityCoords, new Vector3(0, 0, 1.2)),
      0.5
    );
  }
};

export const activateSelector = async () => {
  isActive = true;
  handleRayCastChange(undefined);
  global.exports['dg-weapons'].showReticle(true);
  selectorRayInterval = setInterval(() => {
    if (!isActive) {
      clearInterval(selectorRayInterval);
      selectorRayInterval = undefined;
    }
    const [entity, entityType] = RayCast.getEntityPlayerLookingAt(100);
    handleRayCastChange(entity, entityType);
  }, 250);
};

export const stopSelector = () => {
  isActive = false;
  if (selectorRayInterval) {
    clearInterval(selectorRayInterval);
    selectorRayInterval = undefined;
  }
  global.exports['dg-weapons'].showReticle(false);
};

export const handleRayCastChange = (entity: number, type?: 0 | 1 | 2 | 3) => {
  if (!isActive) return;
  if (selectedEntity && selectedEntityType !== 1) {
    SetEntityDrawOutline(selectedEntity, false);
  }
  if (selectorTick) {
    clearTick(selectorTick);
    selectorTick = undefined;
  }
  if (entity === 0) {
    selectedEntity = undefined;
    selectedEntityType = undefined;
    return;
  }
  if (type !== 1) {
    SetEntityDrawOutline(entity, true);
    SetEntityDrawOutlineColor(0, 255, 0, 255);
  }
  selectedEntity = entity;
  selectedEntityType = type;
  selectorTick = setTick(() => {
    if (!selectedEntity) {
      clearTick(selectorTick);
      selectorTick = undefined;
      return;
    }
    showEntityInfo();
  });
};

const GetEntityName = () => {
  if (selectedEntityType === 1 && IsPedAPlayer(selectedEntity)) {
    return GetPlayerName(NetworkGetPlayerIndexFromPed(selectedEntity));
  }
  return GetEntityArchetypeName(selectedEntity);
};

export const openSelectorMenu = async () => {
  if (!selectedEntity) return;
  const reqEntity = Number(selectedEntity);
  const reqEntityType = selectedEntityType === 1 ? (IsPedAPlayer(selectedEntity) ? 0 : 1) : Number(selectedEntityType);
  if (reqEntity !== selectedEntity) return;
  SendNUIMessage({
    action: 'showSelector',
    data: {
      name: GetEntityName(),
      type: reqEntityType,
    },
  });
  SetNuiFocus(true, true);
};
