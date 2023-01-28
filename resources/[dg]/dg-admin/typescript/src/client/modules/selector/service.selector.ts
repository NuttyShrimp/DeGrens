import { RayCast, Util, Weapons } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

import { drawText3d } from '../util/service.util';
import { isDevModeEnabled } from 'helpers/devmode';

let isActive = false;
let selectorInterval: NodeJS.Timer | null = null;
let selectorRayInterval: NodeJS.Timer | null = null;

export let selectedEntity: number | null = null;
export let selectedEntityType: number | null = null;

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
      //@ts-ignore
      undefined,
      undefined,
      false
    );
  } else if (selectedEntityType && [2, 3].includes(selectedEntityType)) {
    drawText3d(
      `~r~(${GetEntityHealth(selectedEntity)}/${GetEntityMaxHealth(selectedEntity)})`,
      Vector3.add(selectedEntityCoords, new Vector3(0, 0, 1.4)),
      0.5
    );
  }
  if (selectedEntityType && [1, 2, 3].includes(selectedEntityType)) {
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
  if (!isDevModeEnabled()) return;

  isActive = true;
  handleRayCastChange(undefined);
  Weapons.showReticle(true);
  selectorRayInterval = setInterval(() => {
    if (!isActive) {
      if (selectorRayInterval) {
        clearInterval(selectorRayInterval);
        selectorRayInterval = null;
      }
      return;
    }
    const { entity } = RayCast.doRaycast(100);
    handleRayCastChange(entity);
  }, 250);
};

export const stopSelector = () => {
  isActive = false;
  if (selectorRayInterval) {
    clearInterval(selectorRayInterval);
    selectorRayInterval = null;
  }
  Weapons.showReticle(false);
};

export const handleRayCastChange = (entity?: number) => {
  if (!isActive) return;
  if (selectedEntity && selectedEntityType !== 1) {
    SetEntityDrawOutline(selectedEntity, false);
  }
  if (selectorInterval) {
    clearInterval(selectorInterval);
    selectorInterval = null;
  }
  if (!entity) {
    selectedEntity = null;
    selectedEntityType = null;
    return;
  }
  const entityType = GetEntityType(entity);
  if (entityType !== 1) {
    SetEntityDrawOutline(entity, true);
    SetEntityDrawOutlineColor(0, 255, 0, 255);
  }
  selectedEntity = entity;
  selectedEntityType = entityType;
  selectorInterval = setInterval(() => {
    if (!selectedEntity) {
      if (selectorInterval) {
        clearInterval(selectorInterval);
        selectorInterval = null;
      }
      return;
    }
    showEntityInfo();
  }, 1);
};

const GetEntityName = () => {
  if (!selectedEntity) {
    return 'UNKNOWN';
  }
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
