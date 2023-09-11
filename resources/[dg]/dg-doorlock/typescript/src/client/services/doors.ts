import {
  Events,
  Keys,
  PolyZone,
  Util,
  UI,
  Minigames,
  Inventory,
  Particles,
  RayCast,
  Sounds,
  Animations,
} from '@dgx/client';
import { doDoorAnimation, getDoorId, isAuthorized } from 'helpers/doors';
import { doThermiteOnDoorAnimScene, findAnimScenePositionForDoor } from 'helpers/scenes';

let doors: Doorlock.ClientData | undefined = undefined;
let currentDoor: { id: number; coords: Vec3; state: boolean } | null = null;
let interactionVisible = false;
let isInPolyZone = false;

let activeDoorRaycast: { entity: number; coords: Vec3 } | undefined = undefined;
let debounceTimeout: NodeJS.Timeout | null = null;
let doorThread: NodeJS.Timer | null = null;

export const loadDoors = (doorData: Doorlock.ClientData) => {
  doors = doorData;

  for (const key of Object.keys(doors)) {
    const id = Number(key);
    const door = doors[id];
    if (IsDoorRegisteredWithSystem(id)) {
      RemoveDoorFromSystem(id);
    }

    AddDoorToSystem(id, door.model, door.coords.x, door.coords.y, door.coords.z, false, false, false);
    const state = door.locked ? 1 : 0;

    if (doors[id].forceOpen) {
      DoorSystemSetDoorState(id, 1, false, true);
      setTimeout(() => {
        DoorSystemSetOpenRatio(id, state ? 0.001 : 1, true, true);
      }, 1000); // need to wait till door state is synced or whatever
    } else {
      // DoorSystemSetAutomaticRate(id, 1, false, false);
      DoorSystemSetDoorState(id, state ? 1 : 0, false, true);
    }

    if (door.polyzone) {
      PolyZone.addBoxZone('doorlock', door.polyzone.center, door.polyzone.length, door.polyzone.width, {
        heading: door.polyzone.heading,
        minZ: door.polyzone.center.z - 4,
        maxZ: door.polyzone.center.z + 10,
        data: {
          id,
        },
      });
    }
  }

  console.log(`[Doorlock] ${Object.keys(doors).length} doors have been loaded`);
};

export const handleToggleKeyPress = () => {
  if (!doors) return;

  let { id: doorId, state: doorState } = currentDoor ?? {};

  // if not in polyzone or currently aiming at door, try to find door that is blocked (garage door in ceiling for example)
  if (!doorId) {
    const raycastHit = RayCast.doRaycast(10, 16); // flag only intersects with entities to allow toggling of garage doors which are fully hidden
    if (raycastHit.entity && GetEntityType(raycastHit.entity) === 3) {
      const id = getDoorId(raycastHit.entity);
      if (id && doors[id]?.allowThroughWalls) {
        doorId = id;
      }
    }
  }

  if (!doorId) return;

  if (doorState === undefined) {
    doorState = getDoorState(doorId);
  }

  const data = doors[doorId];
  if (!isAuthorized(data)) return;

  if (!data.noAnimation) {
    doDoorAnimation();
  }

  Events.emitNet('doorlock:server:changeDoorState', doorId, !doorState);
};

export const changeDoorState = (doorId: number, state: boolean) => {
  if (!doors) return;

  if (!doors[doorId] || !IsDoorRegisteredWithSystem(doorId)) {
    console.error(`[Doorlock] Tried to change state of door that was not registered (${doorId})`);
    return;
  }

  doors[doorId].locked = state;

  if (doors[doorId].forceOpen) {
    DoorSystemSetOpenRatio(doorId, state ? 0.001 : 1, true, true);
  } else {
    DoorSystemSetAutomaticRate(doorId, 1, false, false);
    DoorSystemSetDoorState(doorId, state ? 1 : 0, false, true);
  }

  if (doorId === currentDoor?.id) {
    currentDoor.state = state;
    showInteraction();
  }
};

const showInteraction = () => {
  if (!doors || currentDoor === null) return;

  const data = doors[currentDoor.id];
  if (data.hideInteraction) return;

  interactionVisible = true;
  if (isAuthorized(data)) {
    if (data.locked) {
      UI.showInteraction(`${Keys.getBindedKey('+toggleDoor')} - Locked`, 'error');
    } else {
      UI.showInteraction(`${Keys.getBindedKey('+toggleDoor')} - Unlocked`, 'success');
    }
  } else {
    if (data.locked) {
      UI.showInteraction(`Locked`, 'error');
    } else {
      UI.showInteraction(`Unlocked`, 'success');
    }
  }
};

export const hideInteraction = () => {
  if (!interactionVisible) return;
  UI.hideInteraction();
  interactionVisible = false;
};

export const handleEntityChange = (entity: number | undefined, coords: Vec3 | undefined) => {
  if (isInPolyZone) return;

  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(
    () => {
      hideInteraction();

      const doorId = getDoorId(entity);
      if (!entity || !coords || !doorId || !doors?.[doorId]) {
        activeDoorRaycast = undefined;
        currentDoor = null;
        return;
      }

      const maxDistance = doors[doorId].distance;
      activeDoorRaycast = { entity, coords };

      if (doorThread !== null) {
        clearInterval(doorThread);
      }

      // Distance thread
      doorThread = setInterval(() => {
        if (activeDoorRaycast?.entity !== entity) return;

        const doorCoords = Util.getEntityCoords(entity);
        const distance = Util.getPlyCoords().distance(doorCoords);
        if (distance <= maxDistance) {
          currentDoor = {
            id: doorId,
            coords: doorCoords,
            state: getDoorState(doorId),
          };
          if (!interactionVisible) {
            showInteraction();
          }
        } else {
          currentDoor = null;
          if (interactionVisible) {
            hideInteraction();
          }
        }
      }, 10);
    },
    entity === undefined ? 1500 : 0
  );
};

export const enterDoorPolyZone = (doorId: number, coords: Vec3) => {
  isInPolyZone = true;

  currentDoor = {
    id: doorId,
    coords,
    state: getDoorState(doorId),
  };

  if (!interactionVisible) {
    showInteraction();
  }
};

export const leaveDoorPolyZone = (doorId: number) => {
  isInPolyZone = false;

  if (currentDoor?.id !== doorId) return;
  currentDoor = null;
  hideInteraction();
};

export const tryToLockpickDoor = async () => {
  if (!doors) return;

  const doorEntity = activeDoorRaycast?.entity;
  const doorId = getDoorId(doorEntity);
  if (!doorId) return;

  if (!doors[doorId].lockpickable || !doors[doorId].locked) return;

  const success = await Minigames.keygame(5, 6, 7);
  Events.emitNet('doorlock:server:triedLockpickingDoor', doorId);
  if (success) {
    Events.emitNet('doorlock:server:changeDoorState', doorId, false);
  }
};

export const tryToThermiteDoor = async (itemId: string) => {
  if (!doors) return;

  // we use the normal active door as targetdoor
  if (!activeDoorRaycast) return;

  const { entity: doorEntity, coords: raycastHitCoords } = activeDoorRaycast;
  const doorId = getDoorId(doorEntity);
  if (!doorId) return;

  const thermiteData = doors[doorId].thermiteable;
  if (!thermiteData || !doors[doorId].locked) return;

  const scenePosition = findAnimScenePositionForDoor(doorEntity, raycastHitCoords);
  if (!scenePosition) return;

  const removed = await Inventory.removeItemById(itemId);
  if (!removed) return;

  const thermiteObject = await doThermiteOnDoorAnimScene(scenePosition);
  if (!thermiteObject) return;

  // const success = await Minigames.sequencegame(thermiteData.grid, thermiteData.amount, 5);
  const success = await Minigames.sequencegame(thermiteData.grid, thermiteData.amount, 5);
  if (success) {
    const netId = NetworkGetNetworkIdFromEntity(thermiteObject);
    const particleId = Particles.add({
      dict: 'scr_ornate_heist',
      name: 'scr_heist_ornate_thermal_burn',
      looped: true,
      netId,
      offset: { x: 0, y: 0.65, z: 0 },
      scale: 0.7,
    });
    await Util.Delay(10000);
    if (particleId) {
      Particles.remove(particleId);
    }
    Events.emitNet('doorlock:server:changeDoorState', doorId, false);
  }

  Util.deleteEntity(thermiteObject);
};

export const tryToDetcordDoor = async (itemId: string) => {
  if (!doors) return;

  // we use the normal active door as targetdoor
  if (!activeDoorRaycast) return;

  const { entity: doorEntity, coords: raycastHitCoords } = activeDoorRaycast;
  const doorId = getDoorId(doorEntity);
  if (!doorId) return;

  const scenePosition = findAnimScenePositionForDoor(doorEntity, raycastHitCoords);
  if (!scenePosition) return;

  const removed = await Inventory.removeItemById(itemId);
  if (!removed) return;

  const thermiteObject = await doThermiteOnDoorAnimScene(scenePosition);
  if (!thermiteObject) return;

  const success = await Minigames.sequencegame(4, 5, 5);
  if (!success) return;

  const soundId = `detcord_${Math.round(Date.now() / 1000)}`;
  Sounds.playOnEntity(soundId, 'Explosion_Countdown', 'GTAO_FM_Events_Soundset', thermiteObject);
  await Util.Delay(10000);

  const thermiteObjCoords = Util.getEntityCoords(thermiteObject);
  AddExplosion(thermiteObjCoords.x, thermiteObjCoords.y, thermiteObjCoords.z + 0.5, 2, 1, true, false, 1);
  Sounds.stop(soundId);
  Events.emitNet('doorlock:server:changeDoorState', doorId, false);
  Events.emitNet('doorlock:server:logDetcord');

  Util.deleteEntity(thermiteObject);
};

export const tryToGateUnlockDoor = async (itemId: string) => {
  if (!doors) return;

  // we use the normal active door as targetdoor
  if (!activeDoorRaycast) return;

  const { entity: doorEntity } = activeDoorRaycast;
  const doorId = getDoorId(doorEntity);
  if (!doorId) return;

  if (!doors[doorId].canUseGateUnlock || !doors[doorId].locked) return;

  const success = await Animations.doLaptopHackAnimation(() => Minigames.binarysudoku(6, 90));
  Events.emitNet('doorlock:server:finishGateUnlock', doorId, itemId, success);
};

export const getDoorState = (doorId: number) => {
  if (doors?.[doorId]?.forceOpen) {
    return doors[doorId].locked;
  }

  return DoorSystemGetDoorState(doorId) !== 0;
};

export const getDoorInfo = (doorId: number) => {
  return (doors ?? {})[doorId];
};
